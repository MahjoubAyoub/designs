import * as contactService from './contact.service.js';

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await contactService.sendContactEmail({ name, email, message });
    res.status(200).json({ message: 'Contact message sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send contact message' });
  }
};

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = contactService.getTestimonials();
    res.status(200).json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const feedback = contactService.getAllFeedback();
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};