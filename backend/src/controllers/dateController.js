import prisma from '../lib/prisma.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/helpers.js';

export const getDates = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const dates = await prisma.importantDate.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { date: 'asc' },
  });
  sendSuccess(res, dates);
});

export const createDate = asyncHandler(async (req, res) => {
  const { title, date, description, category, isActive } = req.body;
  if (!title || !date) return sendError(res, 400, 'Title and date are required');

  const entry = await prisma.importantDate.create({
    data: {
      title,
      date: new Date(date),
      description,
      category: category ?? 'admission',
      isActive: isActive ?? true,
    },
  });
  sendSuccess(res, entry, 201);
});

export const updateDate = asyncHandler(async (req, res) => {
  const { title, date, description, category, isActive } = req.body;
  const entry = await prisma.importantDate.update({
    where: { id: Number(req.params.id) },
    data: {
      title,
      ...(date && { date: new Date(date) }),
      description,
      category,
      isActive,
    },
  });
  sendSuccess(res, entry);
});

export const deleteDate = asyncHandler(async (req, res) => {
  await prisma.importantDate.delete({ where: { id: Number(req.params.id) } });
  sendSuccess(res, { message: 'Date deleted' });
});
