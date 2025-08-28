import * as authService from './auth.service.js'; // Add .js extension

export const createUser = async (req, res) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { token, user } = await authService.loginUser(req.body.email, req.body.password);
    res.status(200).json({ success: true, token, user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    const { email } = req.body;
    console.log('Extracted email:', email); // Debug log
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    await authService.requestPasswordReset(email);
    res.json({ message: 'Reset code sent to email' });
  } catch (err) {
    console.error('Password reset error:', err); // Debug log
    res.status(400).json({ error: err.message });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    console.log('Verify request body:', req.body); // Debug log
    const { email, code } = req.body;
    console.log('Extracted email:', email, 'code:', code); // Debug log
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }
    
    const token = await authService.verifyResetCode(email, code);
    console.log('Generated token:', token); // Debug log
    res.json({ token });
  } catch (err) {
    console.error('Verify code error:', err); // Debug log
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    await authService.changePassword(userId, oldPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};