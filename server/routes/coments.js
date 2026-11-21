
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";


const router = Router();


router.post("/:id/comments", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { text } = req.body ?? {};

    if (
      typeof userId !== "string" ||
      !ObjectId.isValid(userId)
    ) {
      return res.status(401).json({
        message: "Invalid user ID in token",
      });
    }

    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const trimmedText = text.trim();

    if (trimmedText.length > 1000) {
      return res.status(400).json({
        message: "Comment must not exceed 1000 characters",
      });
    }

    const db = getDb();
    const post = await db.collection("posts").findOne(
  { _id: new ObjectId(postId) },
  { projection: { authorId: 1 } }
);

if (!post) {
  return res.status(404).json({
    message: "Post not found",
  });
}

    const author = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { username: 1, avatarUrl: 1 } }
    );

    if (!author) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const comment = {
      _id: new ObjectId(),
      authorId: new ObjectId(userId),
      text: trimmedText,
      createdAt: new Date(),
    };

    const result = await db.collection("posts").updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: comment } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    if (post.authorId.toString() !== userId) {
  try {
    await db.collection("notifications").insertOne({
      recipientId: post.authorId,
      actorId: new ObjectId(userId),
      postId: new ObjectId(postId),
      commentId: comment._id,
      type: "comment",
      createdAt: new Date(),
    });
  } catch (notificationError) {
    console.error(
      "Failed to create comment notification:",
      notificationError
    );
  }
}

    return res.status(201).json({
      message: "Comment added successfully",
      comment: {
        id: comment._id.toString(),
        text: comment.text,
        createdAt: comment.createdAt,
        author: {
          id: userId,
          username: author.username,
          avatarUrl: author.avatarUrl ?? "",
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to add comment",
    });
  }
});

router.get("/:id/comments", authenticateJWT, async (req, res) => {
  try {
    const postId = req.params.id;

    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const db = getDb();

    const post = await db.collection("posts").findOne(
      { _id: new ObjectId(postId) },
      { projection: { comments: 1 } }
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comments = post.comments ?? [];

    const authorIds = comments.map((comment) => comment.authorId);

    const authors = await db
      .collection("users")
      .find(
        { _id: { $in: authorIds } },
        { projection: { username: 1, avatarUrl: 1 } }
      )
      .toArray();

    const authorsById = new Map(
      authors.map((author) => [author._id.toString(), author])
    );

    return res.status(200).json({
      comments: comments.map((comment) => {
        const authorId = comment.authorId.toString();
        const author = authorsById.get(authorId);

        return {
          id: comment._id.toString(),
          text: comment.text,
          createdAt: comment.createdAt,
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
      message: "Failed to get comments",
    });
  }
});



export default router;