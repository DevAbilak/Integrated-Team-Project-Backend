const User = require("../models/User-model.js");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const {
  generateVerificationCode,
} = require("../utils/generateVerificationCode.js");
const {
  generateTokenAndSetCookie,
} = require("../utils/generateTokenAndSetCookie.js");
const { sendEmail } = require("../utils/email.service.js");
const { formatResponse } = require("../utils/common.js");
const {
  WELCOME_EMAIL_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  RESET_PASSWORD_TEMPLATE,
  RESET_SUCCESSFUL_TEMPLATE,
} = require("../utils/emailTemplates.js");
const { uploadMedia } = require("../utils/media.service.js");

const signup = async (req, res) => {
  try {
    const { name, email, password, role = "traveler" } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    let licenseNumberRes;
    let businessNameRes;
    if (role === "operator") {
      const { licenseNumber, businessName } = req.body;

      if (!businessName || !licenseNumber) {
        return res.status(400).json({
          success: false,
          message: "Business detail is required for operators",
        });
      }
      licenseNumberRes = licenseNumber;
      businessNameRes = businessName;
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Business certificate file is required for operators",
        });
      }
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please log in",
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const verificationToken = generateVerificationCode();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours
      role,
      operatorDetails:
        role === "operator"
          ? {
              businessName: businessNameRes || "",
              licenseNumber: licenseNumberRes || "",
              verified: false, // not verified until admin checks certificate
              certificateId: null, // will be set after upload
              certificateUrl: null,
            }
          : undefined,
    });
    await user.save();

    // If operator and file exists, upload certificate to Cloudinary
    if (role === "operator" && req.file) {
      try {
        const mediaResult = await uploadMedia(req.file, user._id);
        // Update operatorDetails with certificate reference
        user.operatorDetails.certificateId = mediaResult.mediaId;
        user.operatorDetails.certificateUrl = mediaResult.url;
        await user.save();
      } catch (uploadError) {
        console.error("Certificate upload failed:", uploadError);
        // Optional: delete the user because certificate is mandatory
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          success: false,
          message: "Failed to upload certificate. Registration cancelled.",
        });
      }
    }

    // jwt
    generateTokenAndSetCookie(res, user._id);

    try {
      const html = VERIFY_EMAIL_TEMPLATE.replace(
        "{{username}}",
        user.name,
      ).replace("{{verificationToken}}", user.verificationToken);
      await sendEmail(user.email, "Email verification - Touropia", html);
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "email could not be sent" });
    }

    if (user) {
      return res.status(201).json({
        success: true,
        message:
          "User created successfully. Check your email to verify your account",
        user: {
          ...user._doc,
          password: undefined, // won't be sent in response
          verificationToken: undefined, // won't be sent in response
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to create a user. Please try again",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "verificationToken is required!" });
    }

    const user = await User.findOne({
      verificationToken: code,
      verificationExpiresAt: { $gt: Date.now() },
      emailVerified: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiresAt = undefined;

    await user.save();

    const html = WELCOME_EMAIL_TEMPLATE.replace("{{username}}", user.name);
    await sendEmail(user.email, "Welcome to Tour Ethiopia", html);

    res
      .status(200)
      .json({ success: true, message: "Welcome email sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Can't find user with that email" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Can't find user with that email" });
    }

    // generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // send reset password email
    const html = RESET_PASSWORD_TEMPLATE.replace(
      "{{username}}",
      user.name,
    ).replaceAll(
      "{{resetLink}}",
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    );

    sendEmail(user.email, "Reset Your Password - Touropia", html);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;
    if (!newPassword || !token) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    const html = RESET_SUCCESSFUL_TEMPLATE.replace(
      "{{username}}",
      user.name,
    ).replaceAll("{{loginLink}}", `${process.env.CLIENT_URL}/login`);
    await sendEmail(user.email, "Password Reset Successful - Touropia", html);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Can't find user with given email",
      });
    } else if (user.emailVerified === true) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const html = VERIFY_EMAIL_TEMPLATE.replace(
      "{{username}}",
      user.name,
    ).replace("{{verificationToken}}", user.verificationToken);
    await sendEmail(user.email, "Email verification - Touropia", html);

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    console.log("Resend verification email error ", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  signup,
  verifyEmail,
  logout,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
};
