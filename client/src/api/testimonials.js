// src/api/testimonials.js
// Service for fetching testimonials from the backend

const API_BASE = '/api/contact';

// Fetch testimonials for public display
export async function getTestimonials() {
  const res = await fetch(`${API_BASE}/testimonials`);
  if (!res.ok) throw new Error('Failed to fetch testimonials');
  return res.json();
}

// Fetch all feedback (for admin use)
export async function getAllFeedback() {
  const res = await fetch(`${API_BASE}/feedback`);
  if (!res.ok) throw new Error('Failed to fetch feedback');
  return res.json();
}