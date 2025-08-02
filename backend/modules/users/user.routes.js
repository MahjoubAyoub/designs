// modules/users/user.routes.js
import express from 'express';
import { createUser, loginUser, getUserById, getAllUsers, updateUser, deleteUser, uploadProfilePhoto, resetPassword, changePassword, updateProfile } from './user.controller.js';
import { authMiddleware } from './service.js';
import { loggingMiddleware } from './middleware.js'; // Import the new middleware
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Apply loggingMiddleware to all routes
router.use(loggingMiddleware);

router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes with authMiddleware
router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);
router.post('/:id/photo', authMiddleware, upload.single('photo'), uploadProfilePhoto);
router.post('/:id/change-password', authMiddleware, changePassword);
router.put('/:id/profile', authMiddleware, upload.single('photo'), updateProfile);

// Public route
router.post('/reset-password', resetPassword);

export default router;