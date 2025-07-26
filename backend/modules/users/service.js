import bcrypt from "bcrypt";
import  User  from './user.entity.js';

export const createUser = async (data) => {
  const hashed = await bcrypt.hash(data.motDePasse, 10);
  return await User.create({ ...data, motDePasse: hashed });
};

export const authenticate = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(password, user.motDePasse);
  if (!match) throw new Error('Invalid password');

  // TODO: Replace with JWT logic
  return 'fake-jwt-token';
};

export const getAllUsers = () => User.findAll();

export const getUserById = (id) => User.findByPk(id);

export const updateUser = async (id, updates) => {
  await User.update(updates, { where: { id } });
  return await User.findByPk(id);
};

export const archiveUser = async (id) => {
  await User.update({ archive: true }, { where: { id } });
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);
  const match = await bcrypt.compare(oldPassword, user.motDePasse);
  if (!match) throw new Error('Incorrect current password');

  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ motDePasse: hashed });
};

export const resetPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const newPassword = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ motDePasse: hashed });

  
  return newPassword;
};


