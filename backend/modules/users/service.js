import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../config/data-source.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1d';

const userRepository = AppDataSource.getRepository('User');

export const createUser = async (data) => {
  const hashed = await bcrypt.hash(data.motDePasse || data.password, 10);
  const user = userRepository.create({
    ...data,
    password: hashed,
  });
  return await userRepository.save(user);
};

export const authenticate = async (email, password) => {
  const user = await userRepository.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid password');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token, user: { id: user.id, email: user.email, nom: user.nom, photoProfil: user.photoProfil, role: user.role } };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid token');
  }
};

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const user = await userRepository.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const getAllUsers = async () => {
  return await userRepository.find();
};

export const getUserById = async (id) => {
  return await userRepository.findOne({ where: { id } });
};

export const updateUser = async (id, updates) => {
  await userRepository.update(id, updates);
  return await userRepository.findOne({ where: { id } });
};

export const archiveUser = async (id) => {
  await userRepository.update(id, { archive: true });
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) throw new Error('Incorrect current password');

  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepository.update(userId, { password: hashed });
};

export const resetPassword = async (email) => {
  const user = await userRepository.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const newPassword = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepository.update(user.id, { password: hashed });

  return newPassword;
};