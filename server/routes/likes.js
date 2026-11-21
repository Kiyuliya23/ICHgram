import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";

const router = Router();

router.post("/:id/like", authenticateJWT, async (req, res) => {
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
    const userObjectId = new ObjectId(userId);

    const user = await db.collection("users").findOne(
      { _id: userObjectId },
      { projection: { _id: 1 } }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const post = await db.collection("posts").findOneAndUpdate(
      { _id: new ObjectId(postId) },
      [
        {
          $set: {
            likes: {
              $let: {
                vars: {
                  currentLikes: { $ifNull: ["$likes", []] },
                },
                in: {
                  $cond: [
                    { $in: [userObjectId, "$$currentLikes"] },
                    {
                      $setDifference: [
                        "$$currentLikes",
                        [userObjectId],
                      ],
                    },
                    {
                      $setUnion: [
                        "$$currentLikes",
                        [userObjectId],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      ],
      {
        returnDocument: "after",
        includeResultMetadata: false,
      }
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

   
    const isLiked = post.likes.some(
  (id) => id.toString() === userId
);

if (post.authorId.toString() !== userId) {
  try {
    const notificationFilter = {
      recipientId: post.authorId,
      actorId: new ObjectId(userId),
      postId: new ObjectId(postId),
      type: "like",
    };

    if (isLiked) {
      await db.collection("notifications").updateOne(
        notificationFilter,
        {
          $setOnInsert: {
            ...notificationFilter,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    } else {
      await db.collection("notifications").deleteMany(
        notificationFilter
      );
    }
  } catch (notificationError) {
    console.error(
      "Failed to update like notification:",
      notificationError
    );
  }
}

return res.status(200).json({
  likesCount: post.likes.length,
  isLiked,
});
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update like",
    });
  }
});
router.get("/:id/like", authenticateJWT, async (req, res) => {
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

    const post = await db.collection("posts").findOne(
      { _id: new ObjectId(postId) },
      { projection: { likes: 1 } }
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const likes = post.likes ?? [];

    return res.status(200).json({
      likesCount: likes.length,
      isLiked: likes.some((id) => id.toString() === userId),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get likes",
    });
  }
});



export default router;