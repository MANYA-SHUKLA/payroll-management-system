import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Your Gmail app password
    }
  });
};

// Send email notification
export const sendEmailNotification = async (subject, message, htmlContent = null) => {
  try {
    const transporter = createTransporter();
    const recipientEmail = 'shuklamanya99@gmail.com';

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@payrollsystem.com',
      to: recipientEmail,
      subject: subject,
      text: message,
      html: htmlContent || message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error - email failure shouldn't break the main flow
    return { success: false, error: error.message };
  }
};

// Send login notification
export const sendLoginNotification = async (userName, userEmail, userRole) => {
  const subject = `🔐 ${userRole === 'admin' ? 'Admin' : 'User'} Login - Payroll Management System`;
  const message = `
A ${userRole === 'admin' ? 'Admin' : 'User'} has logged into the Payroll Management System.

Details:
- Name: ${userName}
- Email: ${userEmail}
- Role: ${userRole}
- Time: ${new Date().toLocaleString()}
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">🔐 ${userRole === 'admin' ? 'Admin' : 'User'} Login Notification</h2>
      <p>A ${userRole === 'admin' ? 'Admin' : 'User'} has logged into the Payroll Management System.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Role:</strong> ${userRole}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  return await sendEmailNotification(subject, message, htmlContent);
};

// Send registration notification
export const sendRegistrationNotification = async (userName, userEmail, userRole) => {
  const subject = `👤 New User Registration - Payroll Management System`;
  const message = `
A new user has registered in the Payroll Management System.

Details:
- Name: ${userName}
- Email: ${userEmail}
- Role: ${userRole}
- Registration Time: ${new Date().toLocaleString()}
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">👤 New User Registration</h2>
      <p>A new user has registered in the Payroll Management System.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Role:</strong> ${userRole}</p>
        <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  return await sendEmailNotification(subject, message, htmlContent);
};

// Send update notification
export const sendUpdateNotification = async (updateType, userName, userEmail, updateDetails) => {
  const subject = `📝 Update Notification - Payroll Management System`;
  const message = `
An update has been made in the Payroll Management System.

Update Type: ${updateType}
User: ${userName} (${userEmail})
Details: ${updateDetails}
Time: ${new Date().toLocaleString()}
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">📝 Update Notification</h2>
      <p>An update has been made in the Payroll Management System.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Update Type:</strong> ${updateType}</p>
        <p><strong>User:</strong> ${userName} (${userEmail})</p>
        <p><strong>Details:</strong> ${updateDetails}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  return await sendEmailNotification(subject, message, htmlContent);
};

