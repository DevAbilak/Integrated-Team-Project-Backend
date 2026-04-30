const User = require("../models/User-model.js");
const { formatResponse } = require("../utils/common.js");

const getAllUsers = async (req, res) => {
  try {
    const { role = "traveler", page = 1, limit = 10 } = req.query;
    const allowedRoles = ["traveler", "operator", "admin"];
    if (role && !allowedRoles.includes(role)) {
      res.status(400).json({ success: false, message: "Incorrect role" });
    }
    const query = {};
    if (role) query.role = role;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count of matching documents
    const total = await User.countDocuments(query);

    // Get paginated users
    const userDocs = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const users = userDocs.map((doc) => formatResponse(doc));

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const verifyOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await User.findById(id).select("-password");

    if (!operator) {
      return res
        .status(404)
        .json({ success: false, message: "Operator not found" });
    }

    if (operator.role !== "operator") {
      return res
        .status(400)
        .json({ success: false, message: "User is not an operator" });
    }

    operator.operatorDetails.verified = true;
    await operator.save();

    res.status(200).json({
      success: true,
      message: "Operator verified successfully",
      operator,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getAllUsers, verifyOperator };
