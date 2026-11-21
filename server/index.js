import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth.js";
import postRouter from "./routes/posts.js";
import { connectToDatabase} from "./.db/config.js";
import authLoginRouter from "./routes/authLogin.js";
import usersRouter from "./routes/users.js";
import commentsRouter from "./routes/coments.js";
import likesRouter from "./routes/likes.js";
import feedRouter from "./routes/feed.js";
import notificationsRouter from "./routes/notifications.js";
import searchRouter from "./routes/search.js";
import messagesRouter from "./routes/messages.js";
import profilesRouter from "./routes/profiles.js";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());


app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/auth", authLoginRouter);
app.use("/users", usersRouter);
app.use("/posts", commentsRouter);
app.use("/posts", likesRouter);
app.use("/feed", feedRouter);
app.use("/notifications", notificationsRouter);
app.use("/search", searchRouter);
app.use("/messages", messagesRouter);
app.use("/profiles", profilesRouter );


app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
 });