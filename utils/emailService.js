const nodemailer = require('nodemailer');

// For development, we'll use a simple console-based approach
// For production, you would use your actual email service
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    // In development, just log the reset URL to console
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n=== PASSWORD RESET EMAIL ===');
      console.log('To:', email);
      console.log('Subject: Password Reset Request - Recipedia');
      console.log('Reset URL:', resetUrl);
      console.log('Token:', resetToken);
      console.log('===============================\n');
      
      // Return a mock success response
      return { messageId: 'dev-mock-message-id' };
    }

    // For production, use actual email service
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Recipedia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #dc3545; margin: 0;">Recipedia</h1>
            <p style="color: #6c757d; margin: 10px 0;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your Recipedia account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            
            <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; color: #007bff;">
              ${resetUrl}
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This is an automated email from Recipedia. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
}; 