const nodemailer = require('nodemailer');
require('dotenv').config();

const sendTestEmail = async () => {
    console.log('Testing email with credentials:');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass:', process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Couresa',
            text: 'If you see this, email sending is working!',
        });
        console.log('✅ Test Email Sent Successfully!');
    } catch (error) {
        console.error('❌ Email Test Failed:', error);
    }
};

sendTestEmail();
