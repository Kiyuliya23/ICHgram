import { Router } from "express";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    if (typeof userId !== "string") {
      return res.status(401).json({
        message: "Invalid user ID in token",
      });
    }

    const db = getDb();

    const posts = await db
      .collection("posts")
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const authorIds = posts.map((post) => post.authorId);

    const authors = await db
      .collection("users")
      .find(
        { _id: { $in: authorIds } },
        { projection: { username: 1, avatarUrl: 1 } }
      )
      .toArray();

    const authorsById = new Map(
      authors.map((author) => [
        author._id.toString(),
        author,
      ])
    );

    return res.status(200).json({
      posts: posts.map((post) => {
        const authorId = post.authorId.toString();
        const author = authorsById.get(authorId);
        const likes = post.likes ?? [];

        return {
          id: post._id.toString(),
          authorId,
          description: post.description,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt,
          likesCount: likes.length,
          isLiked: likes.some(
            (id) => id.toString() === userId
          ),
          commentsCount: (post.comments ?? []).length,
          author: {
            id: authorId,
            username: author?.username ?? "Пользователь",
            avatarUrl: author?.avatarUrl ?? "",
          },
        };
      }),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get feed",
    });
  }
});

export default router;