import prisma from '../lib/prisma.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/helpers.js';

export const getCategories = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const categories = await prisma.category.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { faqs: true } } },
  });
  sendSuccess(res, categories);
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: Number(req.params.id) },
    include: { faqs: { where: { isActive: true }, orderBy: { priority: 'desc' } } },
  });
  if (!category) return sendError(res, 404, 'Category not found');
  sendSuccess(res, category);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, sortOrder, isActive } = req.body;
  if (!name) return sendError(res, 400, 'Name is required');

  const category = await prisma.category.create({
    data: { name, description, icon, sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
  });
  sendSuccess(res, category, 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, sortOrder, isActive } = req.body;
  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { name, description, icon, sortOrder, isActive },
  });
  sendSuccess(res, category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  sendSuccess(res, { message: 'Category deleted' });
});
