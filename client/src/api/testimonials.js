// src/api/testimonials.js
// Service for fetching testimonials from the backend

const API_BASE = '/api/testimonials';

// Fetch testimonials for public display
export async function getTestimonials() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch testimonials');
  return res.json();
}

// Create a new testimonial
export async function createTestimonial(testimonialData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testimonialData),
  });
  if (!res.ok) throw new Error('Failed to create testimonial');
  return res.json();
}

// Fetch all testimonials (for admin use)
export async function getAllTestimonials() {
  const res = await fetch(`${API_BASE}/all`);
  if (!res.ok) throw new Error('Failed to fetch all testimonials');
  return res.json();
}

// Update testimonial approval status
export async function updateTestimonialApproval(id, isApproved) {
  const res = await fetch(`${API_BASE}/${id}/approval`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isApproved }),
  });
  if (!res.ok) throw new Error('Failed to update testimonial approval');
  return res.json();
}

// Delete testimonials with null userId
export async function deleteTestimonialsWithNullUserId() {
  const res = await fetch(`${API_BASE}/null-users`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete testimonials with null userId');
  return res.json();
}