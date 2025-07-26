import express from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { createUser,loginUser,getUserById,getAllUsers,updateUser,deleteUser,uploadProfilePhoto,resetPassword,changePassword } from './user.controller.js';

const router = express.Router();
const userRepo = () => AppDataSource.getRepository('user');

router.post('/register',(req, res) => createUser(req, res, userRepo()));
router.post('/login', (req, res) => loginUser(req, res, userRepo()));

router.get('/', (req, res) => getAllUsers(req, res, userRepo()));
router.get('/:id',(req, res) => getUserById(req, res, userRepo()));
router.put('/:id', (req, res) => updateUser(req, res, userRepo()));
router.delete('/:id', (req, res) => deleteUser(req, res, userRepo()));

router.post('/:id/photo',(req, res) => uploadProfilePhoto(req, res, userRepo()));
router.post('/reset-password', (req, res) => resetPassword(req, res, userRepo()));
router.post('/:id/change-password', (req, res) => changePassword(req, res, userRepo())); 

export default router;
