import { AppDataSource } from '../../config/data-source.js';
import Testimonial from './testimonial.entity.js';

/**
 * Get all approved testimonials for public display
 */
export const getApprovedTestimonials = async () => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonials = await testimonialRepo.find({
      where: { isApproved: true },
      order: { dateCreation: 'DESC' },
      relations: ['user']
    });
    return testimonials;
  } catch (error) {
    console.error('Error fetching approved testimonials:', error);
    throw error;
  }
};

/**
 * Get all testimonials (for admin use)
 */
export const getAllTestimonials = async () => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonials = await testimonialRepo.find({
      order: { dateCreation: 'DESC' },
      relations: ['user']
    });
    return testimonials;
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    throw error;
  }
};

/**
 * Create a new testimonial
 */
export const createTestimonial = async (testimonialData) => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonial = testimonialRepo.create(testimonialData);
    return await testimonialRepo.save(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

/**
 * Update testimonial approval status
 */
export const updateTestimonialApproval = async (id, isApproved) => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const testimonial = await testimonialRepo.findOneBy({ id });
    if (!testimonial) {
      throw new Error('Testimonial not found');
    }
    testimonial.isApproved = isApproved;
    return await testimonialRepo.save(testimonial);
  } catch (error) {
    console.error('Error updating testimonial approval:', error);
    throw error;
  }
};

/**
 * Delete testimonials with null userId
 */
export const deleteTestimonialsWithNullUserId = async () => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const result = await testimonialRepo.delete({ user: null });
    console.log(`Deleted ${result.affected} testimonials with null userId`);
    return result;
  } catch (error) {
    console.error('Error deleting testimonials with null userId:', error);
    throw error;
  }
};

/**
 * Initialize sample testimonials if none exist
 */
export const initializeSampleTestimonials = async () => {
  try {
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const existingTestimonials = await testimonialRepo.count();
    
    if (existingTestimonials === 0) {
      console.log('🎭 Creating sample testimonials...');
      
      const sampleTestimonials = [
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@techcorp.com',
          message: 'The design tools are incredibly intuitive and have streamlined our entire creative workflow. Our team productivity has increased by 40% since we started using this platform.',
          jobTitle: 'Creative Director',
          company: 'TechCorp Solutions',
          isApproved: true
        },
        {
          name: 'Michael Chen',
          email: 'michael.chen@designstudio.com',
          message: 'Outstanding platform! The collaborative features and real-time editing capabilities have revolutionized how our design team works together on projects.',
          jobTitle: 'Lead Designer',
          company: 'Creative Design Studio',
          isApproved: true
        },
        {
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@startup.io',
          message: 'As a startup, we needed professional design tools that wouldn\'t break the bank. This platform delivers enterprise-level features at an affordable price point.',
          jobTitle: 'Marketing Manager',
          company: 'InnovateTech Startup',
          isApproved: true
        }
      ];
      
      for (const testimonialData of sampleTestimonials) {
        await createTestimonial(testimonialData);
      }
      
      console.log('✅ Sample testimonials created successfully');
    }
  } catch (error) {
    console.error('❌ Error initializing sample testimonials:', error);
  }
};