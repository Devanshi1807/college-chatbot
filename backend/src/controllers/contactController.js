import prisma from '../lib/prisma.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/helpers.js';

export const getContacts = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true';
  const contacts = await prisma.contact.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { department: 'asc' },
  });
  sendSuccess(res, contacts);
});

export const createContact = asyncHandler(async (req, res) => {
  const { department, phone, email, officeHours, location, isActive } = req.body;
  if (!department) return sendError(res, 400, 'Department is required');

  const contact = await prisma.contact.create({
    data: { department, phone, email, officeHours, location, isActive: isActive ?? true },
  });
  sendSuccess(res, contact, 201);
});

export const updateContact = asyncHandler(async (req, res) => {
  const contact = await prisma.contact.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  sendSuccess(res, contact);
});

export const deleteContact = asyncHandler(async (req, res) => {
  await prisma.contact.delete({ where: { id: Number(req.params.id) } });
  sendSuccess(res, { message: 'Contact deleted' });
});
