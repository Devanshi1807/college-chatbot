import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { asyncHandler, sendError, sendSuccess } from '../utils/helpers.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required');
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return sendError(res, 401, 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return sendError(res, 401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  sendSuccess(res, {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const admin = await prisma.adminUser.findUnique({
    where: { id: req.admin.id },
    select: { id: true, name: true, email: true, role: true },
  });
  sendSuccess(res, admin);
});
