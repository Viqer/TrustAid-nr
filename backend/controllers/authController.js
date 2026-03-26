/**
 * Authentication Controller
 * Handles user registration, login, and token refresh
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { AppError } = require('../middleware/errorHandler');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry }
  );
};

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email.', 400);
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'DONOR',
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedData;

    // Find user and select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Token is required.', 400);
    }

    // Verify old token (ignore expiry)
    const decoded = jwt.verify(token, config.jwtSecret, { ignoreExpiration: true });

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // Generate new token
    const newToken = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
};
