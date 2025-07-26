import express from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { createUser, loginUser, getUserById, getAllUsers, updateUser, deleteUser, uploadProfilePhoto, resetPassword, changePassword, updateProfile } from './user.controller.js';
import multer from 'multer';

const router = express.Router();
const userRepo = () => AppDataSource.getRepository('user');

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

router.post('/register', (req, res) => createUser(req, res, userRepo()));
router.post('/login', (req, res) => loginUser(req, res, userRepo()));

router.get('/', (req, res) => getAllUsers(req, res, userRepo()));
router.get('/:id', (req, res) => getUserById(req, res, userRepo()));
router.put('/:id', (req, res) => updateUser(req, res, userRepo()));
router.delete('/:id', (req, res) => deleteUser(req, res, userRepo()));

router.post('/:id/photo', upload.single('photo'), (req, res) => uploadProfilePhoto(req, res, userRepo()));
router.post('/reset-password', (req, res) => resetPassword(req, res, userRepo()));
router.post('/:id/change-password', (req, res) => changePassword(req, res, userRepo()));
router.put('/:id/profile', upload.single('photo'), (req, res) => updateProfile(req, res, userRepo()));

export default router;