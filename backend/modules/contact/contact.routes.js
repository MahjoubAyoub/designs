import express from 'express';
import { sendContactMessage, getTestimonials, getAllFeedback } from './contact.controller.js';

const router = express.Router();

router.post('/', sendContactMessage);
router.get('/testimonials', getTestimonials);
router.get('/feedback', getAllFeedback);

export default router;