import express from 'express';
import { 
  getTestimonials, 
  getAllTestimonials, 
  createTestimonial, 
  updateTestimonialApproval,
  deleteTestimonialsWithNullUserId
} from './testimonial.controller.js';
import { authMiddleware } from '../users/service.js';

const router = express.Router();

// Public routes
router.get('/', getTestimonials); // Get approved testimonials for public display
router.post('/', createTestimonial); // Create new testimonial

// Admin routes (require authentication)
router.get('/all', authMiddleware, getAllTestimonials); // Get all testimonials
router.put('/:id/approval', authMiddleware, updateTestimonialApproval); // Update approval status
router.delete('/null-users', authMiddleware, deleteTestimonialsWithNullUserId); // Delete testimonials with null userId

export default router;