import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import designRoutes from './modules/designs/design.routes.js';
import userRoutes from './modules/users/user.routes.js'
const app = express();

// Needed to replicate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

app.use('/api/designs', designRoutes);
app.use('/api/users',userRoutes)

export default app;
