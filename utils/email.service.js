const nodemailer = require("nodemailer");
const {
  WELCOME_EMAIL_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  RESET_PASSWORD_TEMPLATE,
  RESET_SUCCESSFUL_TEMPLATE,
} = require("./emailTemplates");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendVerificationEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `"Touropia" < ${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Email verification - Touropia",
      html: VERIFY_EMAIL_TEMPLATE.replace("{{username}}", user.name).replace(
        "{{verificationToken}}",
        user.verificationToken,
      ),
    };
    const info = await transporter.sendMail(message);
    console.log("Verification email sent successfully", info.messageId);
  } catch (error) {
    console.log("Verification Email service error:", error.message);
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `"Touropia" < ${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Touropia ",
      html: WELCOME_EMAIL_TEMPLATE.replace("{{username}}", name),
    };

    const info = await transporter.sendMail(message);
    console.log("Welcome email sent successfully", info.messageId);
  } catch (error) {
    console.log("Welcome email service error:", error.message);
  }
};

const sendResetPasswordEmail = async (email, name, resetLink) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `"Touropia" < ${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - Touropia",
      html: RESET_PASSWORD_TEMPLATE.replace("{{username}}", name).replaceAll(
        "{{resetLink}}",
        resetLink,
      ),
    };

    const info = await transporter.sendMail(message);
    console.log("Reset Password email sent successfully", info.messageId);
  } catch (error) {
    console.log("Reset password email service error:", error.message);
  }
};

const sendResetSuccessEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `"Touropia" < ${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Successful - Touropia",
      html: RESET_SUCCESSFUL_TEMPLATE.replace("{{username}}", name).replaceAll(
        "{{loginLink}}",
        `${process.env.CLIENT_URL}/login`,
      ),
    };

    const info = await transporter.sendMail(message);
    console.log(
      "Password reset successful email sent successfully",
      info.messageId,
    );
  } catch (error) {
    console.log(
      "Password reset successful email service error:",
      error.message,
    );
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetSuccessEmail,
};
