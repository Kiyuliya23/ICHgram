import { Router } from "express";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { q = "" } = req.query;

    if (typeof q !== "string") {
      return res.status(400).json({
        message: "Search query must be a string",
      });
    }

    const query = q.trim();

    if (!query) {
      return res.status(200).json({
        users: [],
      });
    }

    if (query.length > 100) {
      return res.status(400).json({
        message: "Search query must not exceed 100 characters",
      });
    }

    const specialChars = ".*+?^${}()|[]" + String.fromCharCode(92);

const escapedQuery = Array.from(query)
  .map((char) =>
    specialChars.includes(char)
      ? String.fromCharCode(92) + char
      : char
  )
  .join("");

    const db = getDb();

    const users = await db
      .collection("users")
      .find(
        {
          $or: [
            {
              username: {
                $regex: escapedQuery,
                $options: "i",
              },
            },
            {
              fullName: {
                $regex: escapedQuery,
                $options: "i",
              },
            },
          ],
        },
        {
          projection: {
            username: 1,
            fullName: 1,
            avatarUrl: 1,
          },
        }
      )
      .sort({ username: 1 })
      .limit(20)
      .toArray();

    return res.status(200).json({
      users: users.map((user) => ({
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl ?? "",
      })),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to search users",
    });
  }
});

export default router;