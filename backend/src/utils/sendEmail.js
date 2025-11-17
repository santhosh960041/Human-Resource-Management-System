// utils/sendEmail.js

import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // your gmail
        pass: process.env.EMAIL_PASS   // your gmail app password
      }
    });

    // Email options
    const mailOptions = {
      from: `"HR Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent to ${to}`);

    return true;

  } catch (error) {
    console.error("Email Error:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
