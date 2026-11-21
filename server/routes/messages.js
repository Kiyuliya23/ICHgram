import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../.db/config.js";
import authenticateJWT from "../middleware/authMiddleware.js";

const router = Router();

// Отправка сообщения пользователю
router.post("/:userId", authenticateJWT, async (req, res) => {
  try {
    const senderId = req.user.id;
    const recipientId = req.params.userId;
    const { text } = req.body ?? {};

    if (
      typeof senderId !== "string" ||
      !ObjectId.isValid(senderId)
    ) {
      return res.status(401).json({
        message: "Invalid user ID in token",
      });
    }

    if (!ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        message: "Invalid recipient ID",
      });
    }

    const senderObjectId = new ObjectId(senderId);
    const recipientObjectId = new ObjectId(recipientId);

    if (senderObjectId.equals(recipientObjectId)) {
      return res.status(400).json({
        message: "You cannot send messages to yourself",
      });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Message text is required",
      });
    }

    const trimmedText = text.trim();

    if (trimmedText.length > 2000) {
      return res.status(400).json({
        message: "Message must not exceed 2000 characters",
      });
    }

    const db = getDb();

    const [sender, recipient] = await Promise.all([
      db.collection("users").findOne(
        { _id: senderObjectId },
        { projection: { _id: 1 } }
      ),
      db.collection("users").findOne(
        { _id: recipientObjectId },
        { projection: { _id: 1 } }
      ),
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const newMessage = {
      senderId: senderObjectId,
      recipientId: recipientObjectId,
      text: trimmedText,
      createdAt: new Date(),
    };

    const result = await db
      .collection("messages")
      .insertOne(newMessage);

    return res.status(201).json({
      message: {
        id: result.insertedId.toString(),
        senderId: senderObjectId.toString(),
        recipientId: recipientObjectId.toString(),
        text: newMessage.text,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to send message",
    });
  }
});
router.get("/:userId", authenticateJWT, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    if (
      typeof currentUserId !== "string" ||
      !ObjectId.isValid(currentUserId)
    ) {
      return res.status(401).json({
        message: "Invalid user ID in token",
      });
    }

    if (!ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        message: "Invalid recipient ID",
      });
    }

    const db = getDb();

    const currentObjectId = new ObjectId(currentUserId);
    const otherObjectId = new ObjectId(otherUserId);

    const otherUser = await db.collection("users").findOne(
      { _id: otherObjectId },
      { projection: { username: 1, fullName: 1, avatarUrl: 1 } }
    );

    if (!otherUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const messages = await db
      .collection("messages")
      .find({
        $or: [
          {
            senderId: currentObjectId,
            recipientId: otherObjectId,
          },
          {
            senderId: otherObjectId,
            recipientId: currentObjectId,
          },
        ],
      })
      .sort({ createdAt: 1, _id: 1 })
      .toArray();

    return res.status(200).json({
      user: {
        id: otherUser._id.toString(),
        username: otherUser.username,
        fullName: otherUser.fullName,
        avatarUrl: otherUser.avatarUrl ?? "",
      },
      messages: messages.map((item) => ({
        id: item._id.toString(),
        senderId: item.senderId.toString(),
        recipientId: item.recipientId.toString(),
        text: item.text,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get messages",
    });
  }
});
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
    const currentObjectId = new ObjectId(userId);

    const conversations = await db
      .collection("messages")
      .aggregate([
        {
          $match: {
            $or: [
              { senderId: currentObjectId },
              { recipientId: currentObjectId },
            ],
          },
        },
        {
          $sort: {
            createdAt: -1,
            _id: -1,
          },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$senderId", currentObjectId] },
                "$recipientId",
                "$senderId",
              ],
            },
            lastMessage: { $first: "$$ROOT" },
          },
        },
        {
          $sort: {
            "lastMessage.createdAt": -1,
            "lastMessage._id": -1,
          },
        },
      ])
      .toArray();

    const otherUserIds = conversations.map(
      (conversation) => conversation._id
    );

    const users = await db
      .collection("users")
      .find(
        { _id: { $in: otherUserIds } },
        {
          projection: {
            username: 1,
            fullName: 1,
            avatarUrl: 1,
          },
        }
      )
      .toArray();

    const usersById = new Map(
      users.map((user) => [
        user._id.toString(),
        user,
      ])
    );

    const dialogs = conversations
      .map((conversation) => {
        const otherUserId = conversation._id.toString();
        const user = usersById.get(otherUserId);

        if (!user) return null;

        return {
          id: otherUserId,
          user: {
            id: otherUserId,
            username: user.username,
            name: user.fullName || user.username,
            avatarUrl: user.avatarUrl ?? "",
          },
          lastMessage: {
            id: conversation.lastMessage._id.toString(),
            text: conversation.lastMessage.text,
            createdAt: conversation.lastMessage.createdAt,
          },
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      dialogs,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get dialogs",
    });
  }
});

export default router;