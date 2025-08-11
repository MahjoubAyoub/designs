import nodemailer from 'nodemailer';

// In-memory storage for feedback (in production, use a database)
let feedbackStorage = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    message: 'The design tools are incredibly intuitive and have streamlined our entire creative workflow. Our team productivity has increased by 40% since we started using this platform.',
    isTestimonial: true,
    createdAt: new Date('2024-01-15'),
    jobTitle: 'Creative Director',
    company: 'TechCorp Solutions'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@designstudio.com',
    message: 'Outstanding platform! The collaborative features and real-time editing capabilities have revolutionized how our design team works together on projects.',
    isTestimonial: true,
    createdAt: new Date('2024-01-10'),
    jobTitle: 'Lead Designer',
    company: 'Creative Design Studio'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@startup.io',
    message: 'As a startup, we needed professional design tools that wouldn\'t break the bank. This platform delivers enterprise-level features at an affordable price point.',
    isTestimonial: true,
    createdAt: new Date('2024-01-05'),
    jobTitle: 'Marketing Manager',
    company: 'InnovateTech Startup'
  }
];

export const sendContactEmail = async ({ name, email, message }) => {
  // Store feedback in memory (extract job title and company if it's dashboard feedback)
  const isFromDashboard = message.includes('Dashboard Feedback:');
  const cleanMessage = isFromDashboard ? message.replace('Dashboard Feedback:\n\n', '') : message;
  
  const feedback = {
    id: feedbackStorage.length + 1,
    name,
    email,
    message: cleanMessage,
    isTestimonial: false, // Admin can later mark as testimonial
    createdAt: new Date(),
    jobTitle: '',
    company: ''
  };
  
  feedbackStorage.push(feedback);

  // Check if email credentials are properly configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
      process.env.EMAIL_USER === 'your-email@gmail.com' || 
      process.env.EMAIL_PASS === 'your-app-password') {
    // Mock email sending for development
    console.log('=== MOCK EMAIL SENT ===');
    console.log('From:', email);
    console.log('Name:', name);
    console.log('Message:', message);
    console.log('Stored feedback ID:', feedback.id);
    console.log('=====================');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email options
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Contact Form Message from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

// Get testimonials for public display
export const getTestimonials = () => {
  // Get marked testimonials
  const markedTestimonials = feedbackStorage.filter(feedback => feedback.isTestimonial);
  
  // Get recent quality feedback (longer than 20 characters) as potential testimonials
  const qualityFeedback = feedbackStorage
    .filter(feedback => !feedback.isTestimonial && feedback.message.length > 20)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3); // Take up to 3 recent quality feedback
  
  // Combine and sort all testimonials
  const allTestimonials = [...markedTestimonials, ...qualityFeedback]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10); // Return latest 10 testimonials
  
  return allTestimonials;
};

// Get all feedback (for admin use)
export const getAllFeedback = () => {
  return feedbackStorage
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};