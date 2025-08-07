// src/api/templates.js
// Service for interacting with the backend templates API

const API_BASE = '/api/templates';

// Fetch all templates
export async function getAllTemplates() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

// Fetch a template by ID
export async function getTemplateById(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch template');
  return res.json();
}

// Create a new template
export async function createTemplate(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}

// Update an existing template
export async function updateTemplate(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}

// Delete a template
export async function deleteTemplate(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete template');
  return res.json();
}

// Create a copy of a template for the current user
export async function copyTemplate(template) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.id) {
    throw new Error('User not authenticated');
  }
  
  // Create a copy with a new name
  const copyData = {
    name: `Copy of ${template.name}`,
    description: template.description,
    content: template.content,
    category: template.category,
    public: false, // Make the copy private by default
    userId: user.id
  };
  
  return createTemplate(copyData);
}

// JSON Resume specific functions

// Fetch all JSON Resume templates
export async function getJsonResumeTemplates() {
  const res = await fetch(`${API_BASE}/json-resume/all`);
  if (!res.ok) throw new Error('Failed to fetch JSON Resume templates');
  return res.json();
}

// Fetch a JSON Resume template by ID
export async function getJsonResumeTemplateById(id) {
  const res = await fetch(`${API_BASE}/json-resume/${id}`);
  if (!res.ok) throw new Error('Failed to fetch JSON Resume template');
  return res.json();
}

// Create a new JSON Resume template
export async function createJsonResumeTemplate(data) {
  const res = await fetch(`${API_BASE}/json-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create JSON Resume template');
  return res.json();
}

// Upload template with media files
export async function uploadTemplateWithMedia(formData) {
  const res = await fetch(`${API_BASE}/upload-with-media`, {
    method: 'POST',
    body: formData, // FormData object with files and template data
  });
  if (!res.ok) throw new Error('Failed to upload template with media');
  return res.json();
}