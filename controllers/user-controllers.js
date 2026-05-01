const User = require("../models/User-model");
const bcryptjs = require("bcryptjs");
const { formatResponse } = require("../utils/common");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: formatResponse(user) });
  } catch (error) {
    console.log("Error in getting profile", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const updateData = req.body;
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (updateData.name) {
      user.name = updateData.name;
    }
    if (updateData.newPassword && updateData.oldPassword) {
      const isPasswordValid = await bcryptjs.compare(
        updateData.oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect password" });
      }
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(updateData.newPassword, salt);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: formatResponse(user),
    });
  } catch (error) {
    console.log("Error in update profile", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { updateProfile, getUserProfile };
