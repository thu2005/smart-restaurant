const authService = require("../services/auth.service");
const { validationResult } = require("express-validator");

const { generateToken } = require("../utils/token");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.message === "Email already registered") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      token,
    });
  } catch (error) {
    if (
      error.message === "Invalid credentials" ||
      error.message === "Account is deactivated" ||
      error.message === "Please verify your email address."
    ) {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.params.token);
    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    // Don't reveal valid emails? usually we say 'If email exists, sent'
    // But for dev debugging let's return error if invalid for now or standard msg
    res.status(200).json({ success: true, message: "Email sent" });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.googleCallback = (req, res) => {
  // Generate token
  const token = generateToken(req.user.id, req.user.role);
  // Redirect to frontend
  res.redirect(
    `${process.env.FRONTEND_URL || "http://localhost:5173"}/oauth/callback?token=${token}`,
  );
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user avatar
// @route   PUT /api/auth/avatar
// @access  Private
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Get Cloudinary URL from uploaded file
    const avatarUrl = req.file.path;
    const user = await authService.updateAvatar(req.user.id, avatarUrl);

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    await authService.updatePassword(req.user.id, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error.message === "Invalid old password") {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Create user avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.createAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Get Cloudinary URL from uploaded file
    const avatarUrl = req.file.path;
    const user = await authService.createAvatar(req.user.id, avatarUrl);

    res.status(201).json({
      success: true,
      message: "Avatar created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
