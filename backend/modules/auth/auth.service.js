import bcrypt from 'bcrypt';
import { AppDataSource } from '../../config/data-source.js'; // Use your existing data source
import userModel from '../users/user.entity.js'; // Use your existing user entity
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const resetCodes = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    console.log('Attempting to send email to:', to);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const createUser = async (data) => {
  const userRepository = AppDataSource.getRepository(userModel);
  const hashed = await bcrypt.hash(data.password, 10);
  return await userRepository.save({ ...data, password: hashed });
};

export const loginUser = async (email, password) => {
  const userRepository = AppDataSource.getRepository(userModel);
  const user = await userRepository.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid password');

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { token, user };
};

export const requestPasswordReset = async (email) => {
  console.log('Service: requestPasswordReset called with email:', email);
  
  const userRepository = AppDataSource.getRepository(userModel);
  const user = await userRepository.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  resetCodes.set(email, { code, expiry });

  console.log('Generated code:', code, 'for email:', email);

  // Send email with reset code
  try {
    await sendEmail(
      email, 
      'Password Reset Code - Your App Name', 
      `Your 6-digit reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    );
    console.log('Reset email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send reset email:', error);
    throw new Error('Failed to send reset code email');
  }
};

export const verifyResetCode = async (email, code) => {
  console.log('Service: verifyResetCode called with email:', email, 'code:', code);
  console.log('Available reset codes:', Array.from(resetCodes.keys()));
  
  const data = resetCodes.get(email);
  console.log('Found data for email:', data);
  
  if (!data) {
    throw new Error('No reset code found for this email');
  }
  
  if (data.code !== code.toString()) {
    console.log('Code mismatch. Expected:', data.code, 'Received:', code);
    throw new Error('Invalid code');
  }
  
  if (data.expiry < new Date()) {
    console.log('Code expired. Expiry:', data.expiry, 'Now:', new Date());
    throw new Error('Code expired');
  }

  const userRepository = AppDataSource.getRepository(userModel);
  const user = await userRepository.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  resetCodes.delete(email);
  console.log('Reset code validated and deleted for:', email);

  const resetToken = jwt.sign({ id: user.id, type: 'reset', email }, process.env.JWT_SECRET, { expiresIn: '10m' });
  console.log('Generated reset token for user ID:', user.id);
  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'reset') throw new Error('Invalid token');
  } catch (err) {
    throw new Error('Invalid or expired token');
  }

  const userRepository = AppDataSource.getRepository(userModel);
  const user = await userRepository.findOne({ where: { id: decoded.id } });
  if (!user) throw new Error('User not found');

  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepository.update(decoded.id, { password: hashed });
  
  console.log('Password updated successfully for user ID:', decoded.id);
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const userRepository = AppDataSource.getRepository(userModel);
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) throw new Error('Invalid old password');

  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepository.update(userId, { password: hashed });
};