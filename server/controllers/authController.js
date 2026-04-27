import User from "../models/User.js";
import Gym from "../models/Gym.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
  try {

    const { name, email, password, gymName } = req.body;

    if (!name || !email || !password || !gymName) {
    return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
     return res.status(400).json({ message: "Invalid email format" });
    }

    // 🔴 CHECK EXISTING USER
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    const gym = await Gym.create({
      name: gymName,
      ownerId: user._id
    });

    user.gymId = gym._id;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, gymId: gym._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token,
      hasGym: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: gym._id
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
     return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    // ❌ USER NOT FOUND
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const valid = await bcrypt.compare(password, user.password);

    // ❌ WRONG PASSWORD
    if (!valid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id, gymId: user.gymId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token,
      hasGym: !!user.gymId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: user.gymId
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // 🔐 Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const { email, name, sub, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email not verified" });
    }

    let user = await User.findOne({ email });

    // ✅ Existing user → LINK account
    if (user) {
      if (!user.googleId) {
        user.googleId = sub;
        user.provider = "google";
        await user.save();
      }
    } else {
      // 🆕 New user (NO gym yet)
      user = await User.create({
        name,
        email,
        googleId: sub,
        provider: "google"
      });
    }

    const tokenJWT = jwt.sign(
      { userId: user._id, gymId: user.gymId || null },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: tokenJWT,
      hasGym: !!user.gymId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        gymId: user.gymId
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 GOOGLE REGISTRATION (for Register page)
export const googleRegister = async (req, res) => {
  try {
    const { token, gymName } = req.body;

    if (!gymName || !gymName.trim()) {
      return res.status(400).json({ message: "Gym name is required" });
    }

    // 🔐 Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email not verified" });
    }

    // ❌ CHECK IF USER ALREADY EXISTS
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🆕 Create new user with gym
    const user = await User.create({
      name,
      email,
      googleId: sub,
      provider: "google"
    });

    // 🏋️ Create gym
    const gym = await Gym.create({
      name: gymName.trim(),
      ownerId: user._id
    });

    // 🔗 Link gym to user
    user.gymId = gym._id;
    await user.save();

    // 🔐 Generate token with gymId
    const tokenJWT = jwt.sign(
      { userId: user._id, gymId: gym._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: tokenJWT,
      hasGym: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        gymId: gym._id
      },
      message: "Registration successful"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};