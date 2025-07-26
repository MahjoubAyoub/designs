import bcrypt from 'bcrypt';
import { User } from '../users/user.entity.js';
import jwt from 'jsonwebtoken';

export const createUser = async (data) => {
  const hashed = await bcrypt.hash(data.motDePasse, 10);
  return await User.create({ ...data, motDePasse: hashed });
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(password, user.motDePasse);
  if (!match) throw new Error('Invalid password');

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { token, user };
};