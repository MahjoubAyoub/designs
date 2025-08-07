import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import designRoutes from './modules/designs/design.routes.js';
import userRoutes from './modules/users/user.routes.js'
import templateRouter from './modules/templates/template.routes.js';
import contactRouter from './modules/contact/contact.routes.js';
import cors from 'cors';

const app = express();

// Needed to replicate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(logger('dev'));
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: false, limit: '3mb' }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));
app.use('/uploads', express.static(join(__dirname, 'uploads')));
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use('/api/designs', designRoutes);
app.use('/api/users',userRoutes)
app.use('/api/contact', contactRouter);
app.use('/api/templates', templateRouter);

export default app;
