// User API service
export async function getUserById(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await fetch(`/api/users/${id}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      // Token is expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Authentication token expired. Please log in again.');
    }
    throw new Error('Failed to fetch user profile');
  }
  
  return res.json();
}

export async function updateProfile(id, data) {
  const res = await fetch(`/api/users/${id}/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error('Failed to update profile');
  }
  
  return res.json();
}

export async function updateProfileWithPhoto(id, formData) {
  const res = await fetch(`/api/users/${id}/profile`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData, // FormData for file upload
  });
  
  if (!res.ok) {
    throw new Error('Failed to update profile');
  }
  
  return res.json();
}

export async function changePassword(id, oldPassword, newPassword) {
  const res = await fetch(`/api/users/${id}/change-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  
  if (!res.ok) {
    throw new Error('Failed to change password');
  }
  
  return res.json();
}

export async function uploadProfilePhoto(id, file) {
  const formData = new FormData();
  formData.append('photo', file);
  
  const res = await fetch(`/api/users/${id}/photo`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error('Failed to upload photo');
  }
  
  return res.json();
}
