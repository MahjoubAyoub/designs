import * as userService from './service.js';

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { token, user } = await userService.authenticate(req.body.email, req.body.password);
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.archiveUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error archiving user' });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.id;
    const photo = req.file?.filename;
    if (!photo) return res.status(400).json({ error: 'No file uploaded' });

    const updated = await userService.updateUser(userId, { photoProfil: photo });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const newPassword = await userService.resetPassword(email);
    res.json({ message: 'Password reset successfully', newPassword });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id;

    await userService.changePassword(userId, oldPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    if (req.file?.filename) {
      updates.photoProfil = req.file.filename;
    }
    const updated = await userService.updateUser(userId, updates);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};