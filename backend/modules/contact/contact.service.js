import nodemailer from 'nodemailer';

// Configure your email transport (update with your email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, SendGrid)
  auth: {
    user: process.env.EMAIL_USER, // Your email address (e.g., 'your.email@gmail.com')
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

export const sendContactEmail = async ({ name, email, message }) => {
  const mailOptions = {
    from: email, // Sender's email (from the form)
    to: process.env.EMAIL_USER, // Your email address to receive the message
    subject: `Contact Us Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(email);
    return true;
  } catch (error) {
    throw new Error('Failed to send email: ' + error.message);
  }
};