const nodemailer = require('nodemailer');
const User = require('../models/user'); // Import User model to fetch admins

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});   

// Function to send a generic email
const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: `"xPosed Team" <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

// Base email template with consistent styling
const baseEmailTemplate = (header, content) => `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #000000;
                color: #FFD700;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #1c1c1c;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0px 0px 20px rgba(255, 215, 0, 0.5);
            }
            .header {
                background-color: #FFD700;
                color: black;
                padding: 20px;
                text-align: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            .header h2 {
                margin: 0;
            }
            .content {
                padding: 20px;
                text-align: left;
                color: #FFFFFF;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>${header}</h2>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>Best regards,</p>
                <p>The xPosed Team</p>
            </div>
        </div>
    </body>
    </html>
`;

// Send verification email to user
const verificationMail = async (user, verificationCode) => {
    const subject = 'Verify Your xPosed Account';
    const content = `
        <p>Dear ${user.name},</p>
        <p>Thank you for signing up with xPosed! Please use the verification code below to verify your account:</p>
        <div style="
            background-color: #FFD700;
            color: black;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            border: 2px solid #000000;
        ">
            ${verificationCode}
        </div>
        <p>Once verified, you'll be able to access your account and all features of xPosed.</p>
        <p><strong>Please note:</strong> This verification code will expire in 30 minutes. If you don't verify your account within that time, you will need to request a new code.</p>
    `;
    const html = baseEmailTemplate('Verify Your xPosed Account', content);
    await sendEmail(user.email, subject, html);
};

// Send re-verification email to user
const reVerificationMail = async (user, verificationCode) => {
    const subject = 'Your xPosed Verification Code (Reverification)';
    const content = `
        <p>Dear ${user.name},</p>
        <p>We noticed that your previous verification code either expired or was not used. We have generated a new verification code for you to verify your xPosed account:</p>
        <div style="
            background-color: #FFD700;
            color: black;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            border: 2px solid #000000;
        ">
            ${verificationCode}
        </div>
        <p>Please use this code to complete your account verification.</p>
        <p><strong>Important:</strong> This new verification code will expire in 30 minutes. If you don't verify your account within that time, you'll need to request a new code.</p>
        <p>Once verified, you'll be able to access your account and all features of xPosed.</p>
    `;
    const html = baseEmailTemplate('Your xPosed Verification Code (Reverification)', content);
    await sendEmail(user.email, subject, html);
};

// Notify user when their account is verified
const emailVerified = async (user) => {
    const subject = 'Your xPosed Account Has Been Successfully Verified';
    const content = `
        <p>Dear ${user.name},</p>
        <p>Congratulations! Your email has been successfully verified, and your xPosed account is now active.</p>
        <p>You can now fully access your account and explore all the features available to you.</p>
        <p><a href="${process.env.APP_URL}/account" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #FFD700;
            color: black;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            margin-top: 20px;
        ">Go to My Account</a></p>
        <p>Thank you for being part of the xPosed community!</p>
    `;
    const html = baseEmailTemplate('Your xPosed Account Has Been Successfully Verified', content);
    await sendEmail(user.email, subject, html);
};

// Notify user when they successfully report an instrument
const reportMail = async (user, instrument, isNewThreat) => {
    const subject = 'Your Report Has Been Successfully Submitted';

    let message;
    if (isNewThreat) {
        message = `<p>This appears to be a newly identified threat. We encourage you to share this with others who may have been affected so they can also submit a report. This will help increase its visibility and strengthen our community database.</p>`;
    } else {
        message = `<p>Thank you for contributing to the safety of our community. This threat has already been reported by other members and is part of our database. Your report adds valuable confirmation and helps us maintain accurate records.</p>`;
    }

    const content = `
        <p>Dear ${user.name},</p>
        <p>Your report regarding the threat <strong>${instrument}</strong> has been successfully submitted.</p>
        ${message}
        <p>Please note that submitting false reports intentionally is against the law and may result in legal action.</p>
        <p>We appreciate your effort in keeping our community safe and informed.</p>
    `;

    const html = baseEmailTemplate('Report Submitted Successfully', content);
    await sendEmail(user.email, subject, html);
};


// Notify user when they submit an appeal
const appealMail = async (user, instrument) => {
    const subject = 'Your Appeal Has Been Received';
    const content = `
        <p>Dear ${user.name},</p>
        <p>Your appeal for the instrument <strong>${instrument}</strong> has been received and is being reviewed.</p>
        <p>Please note that it usually takes between 24 hours to 1 week to review an appeal.</p>
        <p>Thank you for your patience!</p>
    `;
    const html = baseEmailTemplate('Appeal Received', content);
    await sendEmail(user.email, subject, html);
};

// Notify admins when a new appeal is submitted
const adminAppeal = async (instrument, user) => {
    const admins = await User.find({ role: 'admin' }); // Fetch all admins
    const subject = 'New Appeal Submitted';
    const content = `
        <p>Dear Admin,</p>
        <p>A new appeal has been submitted for the instrument <strong>${instrument}</strong> by user <strong>${user.name}</strong>.</p>
        <p>Please review the appeal at your earliest convenience.</p>
    `;
    const html = baseEmailTemplate('New Appeal Submitted', content);

    // Send email to all admins
    for (const admin of admins) {
        await sendEmail(admin.email, subject, html);
    }
};

// Notify user when their appeal is resolved
const appealResolutionMail = async (user, instrument, status) => {
    const subject = `Your Appeal Has Been ${status === 'approved' ? 'Approved' : 'Rejected'}`;
    const content = `
        <p>Dear ${user.name},</p>
        <p>Your appeal for the instrument <strong>${instrument}</strong> has been <strong>${status}</strong>.</p>
        <p>If you have any questions, please contact our support team.</p>
    `;
    const html = baseEmailTemplate(`Appeal ${status === 'approved' ? 'Approved' : 'Rejected'}`, content);
    await sendEmail(user.email, subject, html);
};

// Send password reset email
const forgotPasswordMail = async (user, resetToken) => {
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;
    const content = `
        <p>Dear ${user.name},</p>
        <p>You have requested to reset your password. Please click the link below to reset it:</p>
        <a href="${resetUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #FFD700;
            color: black;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            margin-top: 20px;
        ">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
    `;
    const html = baseEmailTemplate('Password Reset Request', content);
    await sendEmail(user.email, subject, html);
};

// Notify user when their password has been reset
const resetPasswordMail = async (user) => {
    const subject = 'Your Password Has Been Reset';
    const content = `
        <p>Dear ${user.name},</p>
        <p>Your password has been successfully reset. If you did not make this change, please contact our support team immediately.</p>
    `;
    const html = baseEmailTemplate('Password Reset Successful', content);
    await sendEmail(user.email, subject, html);
};

const sendRealTimeAlert = async (user, report) => {
    const subject = `New Threat Alert: ${report.type}`;
    const content = `
        <p>Dear ${user.name},</p>
        <p>A new threat has been reported in a category you are watching: <strong>${report.type}</strong>.</p>
        <p>Instrument: <strong>${report.instrument}</strong></p>
        <p>Risk Level: <strong>${report.riskLevel}</strong></p>
        <p>You can view the report here: <a href="${process.env.APP_URL}/report/${report._id}">View Report</a></p>
    `;
    const html = baseEmailTemplate(subject, content);
    await sendEmail(user.email, subject, html);
};

module.exports = {
    verificationMail,
    reVerificationMail,
    emailVerified,
    reportMail,
    appealMail,
    adminAppeal,
    appealResolutionMail,
    forgotPasswordMail,
    resetPasswordMail,
    sendRealTimeAlert,
};
