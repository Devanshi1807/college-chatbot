import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import {
  getFaqs,
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../controllers/faqController.js';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import {
  getDates,
  createDate,
  updateDate,
  deleteDate,
} from '../controllers/dateController.js';
import {
  chat,
  getQuickReplies,
  getChatStats,
  getQuickRepliesAdmin,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
} from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public
router.post('/auth/login', login);
router.post('/chat', chat);
router.get('/chat/quick-replies', getQuickReplies);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.get('/faqs', getFaqs);
router.get('/contacts', getContacts);
router.get('/dates', getDates);

// Protected admin
router.get('/auth/me', authMiddleware, getMe);
router.get('/admin/stats', authMiddleware, getChatStats);

router.post('/categories', authMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);

router.get('/faqs/:id', authMiddleware, getFaq);
router.post('/faqs', authMiddleware, createFaq);
router.put('/faqs/:id', authMiddleware, updateFaq);
router.delete('/faqs/:id', authMiddleware, deleteFaq);

router.post('/contacts', authMiddleware, createContact);
router.put('/contacts/:id', authMiddleware, updateContact);
router.delete('/contacts/:id', authMiddleware, deleteContact);

router.post('/dates', authMiddleware, createDate);
router.put('/dates/:id', authMiddleware, updateDate);
router.delete('/dates/:id', authMiddleware, deleteDate);

router.get('/admin/quick-replies', authMiddleware, getQuickRepliesAdmin);
router.post('/admin/quick-replies', authMiddleware, createQuickReply);
router.put('/admin/quick-replies/:id', authMiddleware, updateQuickReply);
router.delete('/admin/quick-replies/:id', authMiddleware, deleteQuickReply);

export default router;
