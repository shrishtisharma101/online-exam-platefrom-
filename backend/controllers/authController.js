const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
function createToken(userId) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing from the backend .env file"
    );
  }

  return jwt.sign(
    { userId: userId.toString() },
    secret,
    { expiresIn: "7d" }
  );
}

// Return public user information
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Register a new student
async function register(req, res) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("Registration failed: JWT_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured",
      });
    }

    const { name, email, password } = req.body || {};

    // Validate input
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter your name, valid email and password of at least 6 characters",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate name length
    if (normalizedName.length < 2 || normalizedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 60 characters",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered. Please log in.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create student account
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
    });

    // Generate token
    const token = createToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered. Please log in.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "User validation failed",
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
}

// Log in an existing user
async function login(req, res) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("Login failed: JWT_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured",
      });
    }

    
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase(); 

    // Password is excluded by default in the User schema
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
}

// Get currently authenticated user
function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  return res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
}

module.exports = {
  register,
  login,
  getMe,
};