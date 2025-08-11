import * as testimonialService from './testimonial.service.js';

/**
 * Get approved testimonials for public display
 */
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await testimonialService.getApprovedTestimonials();
    res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

/**
 * Get all testimonials (for admin use)
 */
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await testimonialService.getAllTestimonials();
    res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch all testimonials' });
  }
};

/**
 * Create a new testimonial
 */
export const createTestimonial = async (req, res) => {
  try {
    const testimonial = await testimonialService.createTestimonial(req.body);
    res.status(201).json({
      data: testimonial,
      message: 'Testimonial created successfully'
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
};

/**
 * Update testimonial approval status
 */
export const updateTestimonialApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const testimonial = await testimonialService.updateTestimonialApproval(Number(id), isApproved);
    res.status(200).json({
      data: testimonial,
      message: 'Testimonial approval status updated successfully'
    });
  } catch (error) {
    console.error('Error updating testimonial approval:', error);
    res.status(500).json({ error: 'Failed to update testimonial approval' });
  }
};

/**
 * Delete testimonials with null userId
 */
export const deleteTestimonialsWithNullUserId = async (req, res) => {
  try {
    const result = await testimonialService.deleteTestimonialsWithNullUserId();
    res.status(200).json({
      message: `Successfully deleted ${result.affected} testimonials with null userId`,
      deletedCount: result.affected
    });
  } catch (error) {
    console.error('Error deleting testimonials with null userId:', error);
    res.status(500).json({ error: 'Failed to delete testimonials with null userId' });
  }
};