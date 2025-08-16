import express from 'express';
import passport from '../../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email, 
          role: req.user.role || 'user' 
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Redirect to frontend with token and user data
      const userData = {
        id: req.user.id,
        nom: req.user.nom,
        email: req.user.email,
        photoProfil: req.user.photoProfil,
        role: req.user.role || 'user'
      };

      // Encode user data and token for URL
      const encodedToken = encodeURIComponent(token);
      const encodedUser = encodeURIComponent(JSON.stringify(userData));

      // Redirect to frontend with success data
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodedToken}&user=${encodedUser}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=oauth_callback_failed`);
    }
  }
);

// OAuth logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;