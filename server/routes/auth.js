// маршрут регистрации 

import { Router } from "express";
import bcrypt from "bcrypt";
import { getDb } from "../.db/config.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, fullName, username, password } = req.body ?? {};

    if (!email || !fullName || !username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (
      typeof email !== "string" ||
      typeof fullName !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "All fields must be strings",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedFullName = fullName.trim();
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedEmail || !trimmedFullName || !normalizedUsername) {
      return res.status(400).json({
        message:"Fields cannot contain only spaces",
      });
    }

   
if (
  normalizedEmail.length > 254 ||
  !/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(normalizedEmail)
) {
  return res.status(400).json({
    message: "Please enter a valid email",
  });
}

    if (trimmedFullName.length > 100) {
      return res.status(400).json({
        message: "Full name must not exceed 100 characters",
      });
    }

    if (!/^[a-z0-9._]{3,30}$/.test(normalizedUsername)) {
      return res.status(400).json({
        message:
          "Username must contain 3–30 characters: letters, numbers, dots or underscores",
      });
    }

    if (password.length < 8 || !password.trim()) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        message: "Password must not exceed 72 bytes",
      });
    }

    const db = getDb();
    const users = db.collection("users");

    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ username: 1 }, { unique: true });

    const existingUser = await users.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or username is already taken",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = {
      email: normalizedEmail,
      fullName: trimmedFullName,
      username: normalizedUsername,
      passwordHash,
      bio: "",
      website: "",
      avatarUrl: "",
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        fullName: newUser.fullName,
        username: newUser.username,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or username is already taken",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

export default router;