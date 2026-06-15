import prisma from '../lib/prisma.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/helpers.js';

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
  return normalize(text).split(' ').filter((w) => w.length > 2);
}

function scoreFaq(faq, queryTokens, normalizedQuery) {
  const questionNorm = normalize(faq.question);
  const answerNorm = normalize(faq.answer);
  const keywordsNorm = normalize(faq.keywords || '');
  const categoryNorm = normalize(faq.category?.name || '');

  let score = 0;

  if (questionNorm.includes(normalizedQuery)) score += 50;
  if (keywordsNorm.includes(normalizedQuery)) score += 40;

  for (const token of queryTokens) {
    if (questionNorm.includes(token)) score += 10;
    if (keywordsNorm.includes(token)) score += 8;
    if (answerNorm.includes(token)) score += 3;
    if (categoryNorm.includes(token)) score += 5;
  }

  score += faq.priority * 0.5;
  return score;
}

async function findBestFaq(message) {
  const normalizedQuery = normalize(message);
  const queryTokens = tokenize(message);

  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    include: { category: { select: { id: true, name: true } } },
  });

  let best = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const score = scoreFaq(faq, queryTokens, normalizedQuery);
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  if (!best || bestScore < 8) return { faq: null, confidence: 0 };
  const confidence = Math.min(bestScore / 60, 1);
  return { faq: best, confidence };
}

async function getFallbackResponse(message) {
  const normalized = normalize(message);

  if (normalized.includes('contact') || normalized.includes('phone') || normalized.includes('email')) {
    const contacts = await prisma.contact.findMany({ where: { isActive: true } });
    if (contacts.length === 0) {
      return {
        response:
          'For admission queries, contact BIET at 08414-252313 or info@biet.ac.in. Visit https://biet.ac.in for official information.',
        matchedFaqId: null,
        confidence: 0.3,
        source: 'default_contact',
      };
    }
    const lines = contacts.map(
      (c) => `**${c.department}**: ${c.phone || 'N/A'} | ${c.email || 'N/A'}${c.officeHours ? ` (${c.officeHours})` : ''}`
    );
    return {
      response: `Here are the contact details:\n\n${lines.join('\n')}`,
      matchedFaqId: null,
      confidence: 0.5,
      source: 'contacts',
    };
  }

  if (normalized.includes('date') || normalized.includes('when') || normalized.includes('deadline')) {
    const dates = await prisma.importantDate.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' },
      take: 5,
    });
    if (dates.length > 0) {
      const lines = dates.map(
        (d) => `• **${d.title}** — ${d.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${d.description ? `: ${d.description}` : ''}`
      );
      return {
        response: `Important dates:\n\n${lines.join('\n')}`,
        matchedFaqId: null,
        confidence: 0.5,
        source: 'dates',
      };
    }
  }

  return {
    response:
      "I couldn't find a specific answer for that. Please try rephrasing, use the quick buttons below, or contact the admission office at **08414-252313** or **info@biet.ac.in**.",
    matchedFaqId: null,
    confidence: 0,
    source: 'fallback',
  };
}

export const chat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message?.trim()) return sendError(res, 400, 'Message is required');

  const session = sessionId || `session-${Date.now()}`;
  const { faq, confidence } = await findBestFaq(message.trim());

  let result;
  if (faq) {
    result = {
      response: faq.answer,
      matchedFaqId: faq.id,
      confidence,
      source: 'faq',
      category: faq.category?.name,
      relatedQuestion: faq.question,
    };
  } else {
    result = await getFallbackResponse(message.trim());
  }

  await prisma.chatLog.create({
    data: {
      sessionId: session,
      userMessage: message.trim(),
      botResponse: result.response,
      matchedFaqId: result.matchedFaqId,
      confidence: result.confidence,
    },
  });

  sendSuccess(res, { sessionId: session, ...result });
});

export const getQuickReplies = asyncHandler(async (req, res) => {
  const replies = await prisma.quickReply.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  sendSuccess(res, replies);
});

export const getChatStats = asyncHandler(async (req, res) => {
  const [totalChats, matchedChats, recentLogs] = await Promise.all([
    prisma.chatLog.count(),
    prisma.chatLog.count({ where: { matchedFaqId: { not: null } } }),
    prisma.chatLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        userMessage: true,
        botResponse: true,
        confidence: true,
        createdAt: true,
      },
    }),
  ]);

  sendSuccess(res, {
    totalChats,
    matchedChats,
    matchRate: totalChats ? Math.round((matchedChats / totalChats) * 100) : 0,
    recentLogs,
  });
});

export const getQuickRepliesAdmin = asyncHandler(async (req, res) => {
  const replies = await prisma.quickReply.findMany({ orderBy: { sortOrder: 'asc' } });
  sendSuccess(res, replies);
});

export const createQuickReply = asyncHandler(async (req, res) => {
  const { label, message, sortOrder, isActive } = req.body;
  if (!label || !message) return sendError(res, 400, 'Label and message are required');
  const reply = await prisma.quickReply.create({
    data: { label, message, sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
  });
  sendSuccess(res, reply, 201);
});

export const updateQuickReply = asyncHandler(async (req, res) => {
  const reply = await prisma.quickReply.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  sendSuccess(res, reply);
});

export const deleteQuickReply = asyncHandler(async (req, res) => {
  await prisma.quickReply.delete({ where: { id: Number(req.params.id) } });
  sendSuccess(res, { message: 'Quick reply deleted' });
});
