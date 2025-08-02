import * as authService from './auth.service';

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
    const {token , user } = await authService.authenticate(req.body.email, req.body.password);
    res.status(200).json({ success: true, token, user })
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const newPassword = await aythService.resetPassword(email); 
    res.json({ message: 'Password reset successfully', newPassword });
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