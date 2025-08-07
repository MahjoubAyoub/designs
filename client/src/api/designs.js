// Fetch all public designs
export async function getPublicDesigns() {
  const res = await fetch('/api/designs?public=true');
  if (!res.ok) throw new Error('Failed to fetch public designs');
  return res.json();
}
// Set design public/private
export async function setDesignPublic(id, isPublic) {
  const res = await fetch(`/api/designs/${id}/public`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public: isPublic }),
  });
  if (!res.ok) throw new Error('Failed to update public status');
  return res.json();
}
// Fetch a design by ID
export async function getDesignById(id) {
  const res = await fetch(`/api/designs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch design by id');
  return res.json();
}
// Save (create or update) design using the unified backend route
export async function saveDesign(data) {
  const res = await fetch('/api/designs/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save design');
  return res.json();
}
// src/api/designs.js
// Service for interacting with the backend designs API

const API_BASE = '/api/designs'; // Adjust if your backend is served from a different base path

export async function getAllDesigns(userId) {
  let url = API_BASE;
  if (userId) {
    url += `?userId=${userId}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch designs');
  return res.json();
}

export async function createDesign(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create design');
  return res.json();
}

export async function updateDesign(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update design');
  return res.json();
}

export async function deleteDesign(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete design');
  return res.json();
}

// Export design as JSON
export async function exportDesignAsJson(id) {
  const res = await fetch(`${API_BASE}/${id}/export`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to export design');
  return res.json();
}

// Import design from JSON
export async function importDesignFromJson(jsonData) {
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData),
  });
  if (!res.ok) throw new Error('Failed to import design');
  return res.json();
}
