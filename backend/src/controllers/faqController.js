import prisma from '../lib/prisma.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/helpers.js';

export const getFaqs = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

  const faqs = await prisma.faq.findMany({
    where: {
      ...(activeOnly && { isActive: true }),
      ...(categoryId && { categoryId }),
    },
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
  });
  sendSuccess(res, faqs);
});

export const getFaq = asyncHandler(async (req, res) => {
  const faq = await prisma.faq.findUnique({
    where: { id: Number(req.params.id) },
    include: { category: true },
  });
  if (!faq) return sendError(res, 404, 'FAQ not found');
  sendSuccess(res, faq);
});

export const createFaq = asyncHandler(async (req, res) => {
  const { categoryId, question, answer, keywords, priority, isActive } = req.body;
  if (!categoryId || !question || !answer) {
    return sendError(res, 400, 'Category, question, and answer are required');
  }

  const faq = await prisma.faq.create({
    data: {
      categoryId: Number(categoryId),
      question,
      answer,
      keywords,
      priority: priority ?? 0,
      isActive: isActive ?? true,
    },
    include: { category: { select: { id: true, name: true } } },
  });
  sendSuccess(res, faq, 201);
});

export const updateFaq = asyncHandler(async (req, res) => {
  const { categoryId, question, answer, keywords, priority, isActive } = req.body;
  const faq = await prisma.faq.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
      question,
      answer,
      keywords,
      priority,
      isActive,
    },
    include: { category: { select: { id: true, name: true } } },
  });
  sendSuccess(res, faq);
});

export const deleteFaq = asyncHandler(async (req, res) => {
  await prisma.faq.delete({ where: { id: Number(req.params.id) } });
  sendSuccess(res, { message: 'FAQ deleted' });
});
