import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AppDataSource } from './data-source.js';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository('User');

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await userRepository.findOne({ where: { googleId: profile.id } });

        if (user) {
          // User exists, return the user
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await userRepository.findOne({ where: { email: profile.emails[0].value } });

        if (user) {
          // User exists with same email, link Google account
          user.googleId = profile.id;
          await userRepository.save(user);
          return done(null, user);
        }

        // Create new user
        const newUser = userRepository.create({
          googleId: profile.id,
          nom: profile.displayName,
          email: profile.emails[0].value,
          photoProfil: profile.photos[0]?.value || null,
          password: null, // No password for OAuth users
        });
        await userRepository.save(newUser);

        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepository.findOne({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;