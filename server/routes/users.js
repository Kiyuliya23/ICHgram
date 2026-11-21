import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";
import uploadAvatar from "../middleware/uploadAvatar.js";


const router = Router();

router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
      return res.status(401).json({
        message: "Invalid user ID in token",
      });
    }

    const db = getDb();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { _id, ...profile } = user;

    return res.status(200).json({
      user: {
        id: _id.toString(),
        ...profile,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get profile",
    });
  }
});

router.patch("/me", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, website, bio } = req.body ?? {};

    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
  return res.status(401).json({
    message: "Invalid user ID in token",
  });
}

if (
  (username !== undefined && typeof username !== "string") ||
  (website !== undefined && typeof website !== "string") ||
  (bio !== undefined && typeof bio !== "string")
) {
  return res.status(400).json({
    message: "Profile fields must be strings",
  });
}
const updates = {};
if (username !== undefined) {
  const normalizedUsername = username.trim().toLowerCase();

  if (!/^[a-z0-9._]{3,30}$/.test(normalizedUsername)) {
    return res.status(400).json({
      message:
        "Username must contain 3–30 characters: letters, numbers, dots or underscores",
    });
  }

  updates.username = normalizedUsername;
}

if (bio !== undefined) {
  if (bio.length > 150) {
    return res.status(400).json({
      message: "About must not exceed 150 characters",
    });
  }

  updates.bio = bio;
}
if (website !== undefined) {
  const trimmedWebsite = website.trim();

  if (trimmedWebsite.length > 2048) {
    return res.status(400).json({
      message: "Website is too long",
    });
  }

  if (trimmedWebsite !== "") {
    try {
      const url = new URL(trimmedWebsite);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return res.status(400).json({
          message: "Website must start with http:// or https://",
        });
      }
    } catch {
      return res.status(400).json({
        message: "Please enter a valid website URL",
      });
    }
  }

  updates.website = trimmedWebsite;
}
if (Object.keys(updates).length === 0) {
  return res.status(400).json({
    message: "No profile fields provided",
  });
}

const db = getDb();

const result = await db.collection("users").updateOne(
  { _id: new ObjectId(userId) },
  { $set: updates }
);

if (result.matchedCount === 0) {
  return res.status(404).json({
    message: "User not found",
  });
}

return res.status(200).json({
  message: "Profile updated successfully",
});



  } catch (error) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Username is already taken",
    });
  }
  console.error(error);
  return res.status(500).json({
    message: "Failed to update profile",
  });
}
});

router.patch("/me/avatar", authenticateJWT, (req, res) => {
  uploadAvatar.single("avatar")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        message:
          uploadError.code === "LIMIT_FILE_SIZE"
            ? "Image must not exceed 2 MB"
            : uploadError.message,
      });
    }

    try {
      const userId = req.user.id;

      if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
        return res.status(401).json({
          message: "Invalid user ID in token",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image",
        });
      }

      const base64Image = req.file.buffer.toString("base64");

      const avatarUrl =
        `data:${req.file.mimetype};base64,${base64Image}`;

      const db = getDb();

      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { avatarUrl } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        message: "Avatar updated successfully",
        avatarUrl,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to update avatar",
      });
    }
  });
});



export default router;