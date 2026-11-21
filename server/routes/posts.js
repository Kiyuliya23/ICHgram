// маршруты публикаций 
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";
import uploadAvatar from "../middleware/uploadAvatar.js";


const router = Router();

// Создание поста
router.post(
  "/",
  authenticateJWT,
  uploadAvatar.single("image"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { description = "" } = req.body ?? {};

      if (
        typeof userId !== "string" ||
        !ObjectId.isValid(userId)
      ) {
        return res.status(401).json({
          message: "Invalid user ID in token",
        });
      }

      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
        });
      }

      if (description.length > 2200) {
        return res.status(400).json({
          message: "Description must not exceed 2200 characters",
        });
      }

      if (!description.trim() && !req.file) {
        return res.status(400).json({
          message: "Add a description or an image",
        });
      }

      const db = getDb();

      const author = await db.collection("users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { username: 1, avatarUrl: 1 } }
      );

      if (!author) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      let imageUrl = "";

      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      }

      const newPost = {
        authorId: new ObjectId(userId),
        description: description.trim(),
        imageUrl,
        createdAt: new Date(),
      };

      const result = await db.collection("posts").insertOne(newPost);

      return res.status(201).json({
        message: "Post created successfully",
        post: {
          id: result.insertedId.toString(),
          authorId: userId,
          description: newPost.description,
          imageUrl: newPost.imageUrl,
          createdAt: newPost.createdAt,
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
        message: "Failed to create post",
      });
    }
  }
);

// Получение своих постов
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    if (
      typeof userId !== "string" ||
      !ObjectId.isValid(userId)
    ) {
      return res.status(401).json({
        message: "Invalid user ID in token",
      });
    }

    const db = getDb();

    const author = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { username: 1, avatarUrl: 1 } }
    );

    if (!author) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await db
      .collection("posts")
      .find({ authorId: new ObjectId(userId) })
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    return res.status(200).json({
      posts: posts.map((post) => ({
        id: post._id.toString(),
        authorId: post.authorId.toString(),
        description: post.description,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: {
          id: userId,
          username: author.username,
          avatarUrl: author.avatarUrl ?? "",
        },
      })),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get posts",
    });
  }
});
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

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

    const db = getDb();

    const result = await db.collection("posts").deleteOne({
      _id: new ObjectId(postId),
      authorId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Post not found or you are not its author",
      });
    }

    return res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete post",
    });
  }
});


// Обработка ошибок загрузки фотографии
router.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Image must not exceed 2 MB",
    });
  }

  console.error(error);

  return res.status(400).json({
    message: error.message || "Failed to upload image",
  });
});

export default router;