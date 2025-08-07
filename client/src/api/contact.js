// Contact API service
export async function sendContactMessage(data) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error('Failed to send contact message');
  }
  
  return res.json();
}
