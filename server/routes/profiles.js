import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";

const router = Router();
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const profileId = req.params.id;

    if (
      typeof currentUserId !== "string" ||
      !ObjectId.isValid(currentUserId)
    ) {
      return res.status(401).json({
        message: "Invalid user ID in token",
      });
    }

    if (!ObjectId.isValid(profileId)) {
      return res.status(400).json({
        message: "Invalid profile ID",
      });
    }

    const db = getDb();
    const profileObjectId = new ObjectId(profileId);

    const user = await db.collection("users").findOne(
      { _id: profileObjectId },
      {
        projection: {
          username: 1,
          fullName: 1,
          bio: 1,
          website: 1,
          avatarUrl: 1,
          followers: 1,
          following: 1,
        },
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await db
      .collection("posts")
      .find({ authorId: profileObjectId })
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const followers = user.followers ?? [];
    const following = user.following ?? [];

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        bio: user.bio ?? "",
        website: user.website ?? "",
        avatarUrl: user.avatarUrl ?? "",
        postsCount: posts.length,
        followersCount: followers.length,
        followingCount: following.length,
        isFollowing: followers.some(
          (id) => id.toString() === currentUserId
        ),
      },
      posts: posts.map((post) => ({
        id: post._id.toString(),
        authorId: user._id.toString(),
        description: post.description,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        likesCount: (post.likes ?? []).length,
        isLiked: (post.likes ?? []).some(
          (id) => id.toString() === currentUserId
        ),
        author: {
          id: user._id.toString(),
          username: user.username,
          avatarUrl: user.avatarUrl ?? "",
        },
      })),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get profile",
    });
  }
});
router.patch("/:id/follow", authenticateJWT, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const profileId = req.params.id;
    const { following } = req.body ?? {};

    if (
      typeof currentUserId !== "string" ||
      !ObjectId.isValid(currentUserId)
    ) {
      return res.status(401).json({
        message: "Invalid user ID in token",
      });
    }

    if (!ObjectId.isValid(profileId)) {
      return res.status(400).json({
        message: "Invalid profile ID",
      });
    }

    if (typeof following !== "boolean") {
      return res.status(400).json({
        message: "Following must be a boolean",
      });
    }

    const currentObjectId = new ObjectId(currentUserId);
    const profileObjectId = new ObjectId(profileId);

    if (currentObjectId.equals(profileObjectId)) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const db = getDb();
    const users = db.collection("users");

    const [currentUser, profile] = await Promise.all([
      users.findOne(
        { _id: currentObjectId },
        { projection: { _id: 1 } }
      ),
      users.findOne(
        { _id: profileObjectId },
        { projection: { _id: 1 } }
      ),
    ]);

    if (!currentUser || !profile) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Обновляем список подписок текущего пользователя.
    await users.updateOne(
      { _id: currentObjectId },
      following
        ? { $addToSet: { following: profileObjectId } }
        : { $pull: { following: profileObjectId } }
    );

    // Обновляем список подписчиков выбранного профиля.
    const updatedProfile = await users.findOneAndUpdate(
      { _id: profileObjectId },
      following
        ? { $addToSet: { followers: currentObjectId } }
        : { $pull: { followers: currentObjectId } },
      {
        returnDocument: "after",
        includeResultMetadata: false,
        projection: { followers: 1 },
      }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followers = updatedProfile.followers ?? [];

    return res.status(200).json({
      isFollowing: followers.some(
        (id) => id.equals(currentObjectId)
      ),
      followersCount: followers.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update following",
    });
  }
});

export default router;