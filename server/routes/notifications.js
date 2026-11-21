import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateJWT, async (req, res) => {
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

    const notifications = await db
      .collection("notifications")
      .find({ recipientId: new ObjectId(userId) })
      .sort({ createdAt: -1, _id: -1 })
      .limit(50)
      .toArray();

    const actorIds = notifications.map(
      (notification) => notification.actorId
    );

    const postIds = notifications.map(
      (notification) => notification.postId
    );

    const [actors, posts] = await Promise.all([
      db
        .collection("users")
        .find(
          { _id: { $in: actorIds } },
          { projection: { username: 1, avatarUrl: 1 } }
        )
        .toArray(),

      db
        .collection("posts")
        .find(
          { _id: { $in: postIds } },
          { projection: { imageUrl: 1 } }
        )
        .toArray(),
    ]);

    const actorsById = new Map(
      actors.map((actor) => [
        actor._id.toString(),
        actor,
      ])
    );

    const postsById = new Map(
      posts.map((post) => [
        post._id.toString(),
        post,
      ])
    );

    return res.status(200).json({
      notifications: notifications.map((notification) => {
        const actorId = notification.actorId.toString();
        const postId = notification.postId.toString();

        const actor = actorsById.get(actorId);
        const post = postsById.get(postId);

        return {
          id: notification._id.toString(),
          type: notification.type,
          createdAt: notification.createdAt,
          actor: {
            id: actorId,
            username: actor?.username ?? "Пользователь",
            avatarUrl: actor?.avatarUrl ?? "",
          },
          post: post
            ? {
                id: postId,
                imageUrl: post.imageUrl ?? "",
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get notifications",
    });
  }
});

export default router;