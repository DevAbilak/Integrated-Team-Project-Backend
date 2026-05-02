const axios = require("axios");
require("dotenv").config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;

/**
 * Sends an email using the Brevo API.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - HTML content of the email.
 */
const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.EMAIL_FROM, name: "Tour Ethiopia" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`Email sent successfully to ${to}: ${response.data.messageId}`);
    return true;
  } catch (error) {
    console.error(
      `Failed to send email to ${to}:`,
      error.response?.data || error.message,
    );
    return false;
  }
};

module.exports = { sendEmail };
