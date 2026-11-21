import styles from "./styles.module.css";
import { Avatar, Button, message } from "antd";
import {
  UserOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { useState } from "react";
import axios from "axios";
import PostModal from "../postModal/PostModal";
import messageIcon from "../../client/src/assets/icon/message.svg";

const PostCard = ({ post, currentUserId, onDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const author = post.author;
  const isOwner = currentUserId === author.id;

  const publishedLabel = new Date(
    post.createdAt
  ).toLocaleDateString("ru-RU");

  const handleLike = async () => {
    if (liking) return;

    const token = localStorage.getItem("token");

    if (!token) {
      messageApi.error("Сначала войди в аккаунт.");
      return;
    }

    setLiking(true);

    try {
      const response = await axios.post(
        `http://localhost:3333/posts/${post.id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      messageApi.error(
        error.response?.data?.message ||
          "Не удалось изменить лайк."
      );
    } finally {
      setLiking(false);
    }
  };

  const handleClosePost = () => {
    setIsOpen(false);

    const token = localStorage.getItem("token");

    if (!token) return;

    axios
      .get(`http://localhost:3333/posts/${post.id}/like`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
      })
      .catch(() => {
        messageApi.error("Не удалось обновить лайки.");
      });
  };

  return (
    <div className={styles.PostCard}>
      {contextHolder}

      <div className={styles.postHeader}>
        <Avatar
          className={styles.postAvatar}
          src={author.avatarUrl || undefined}
          icon={<UserOutlined />}
        />

        <span className={styles.username}>
          {author.username}
        </span>

        <span className={styles.postDate}>
          {" "}· {publishedLabel}
        </span>

        {!isOwner && (
          <Button
            type="link"
            className={styles.followButton}
            disabled
          >
            Follow
          </Button>
        )}
      </div>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.description || "Фото публикации"}
          className={styles.postImage}
        />
      )}

      <div className={styles.postActions}>
        <Button
          type="text"
          icon={
            isLiked ? (
              <HeartFilled style={{ color: "#ed4956" }} />
            ) : (
              <HeartOutlined />
            )
          }
          aria-label={isLiked ? "Убрать лайк" : "Поставить лайк"}
          aria-pressed={isLiked}
          disabled={liking}
          onClick={handleLike}
        />

        <Button
          type="text"
          icon={
            <img
              src={messageIcon}
              className={styles.messageIcon}
              alt=""
            />
          }
          aria-label="Открыть комментарии"
          onClick={() => setIsOpen(true)}
        />
      </div>

      <div className={styles.postInfo}>
        <p className={styles.likes}>
          {likesCount.toLocaleString("ru-RU")} likes
        </p>

        {post.description && (
          <p className={styles.description}>
            <span className={styles.username}>
              {author.username}
            </span>{" "}
            <span className={styles.descriptionText}>
              {post.description}
            </span>
          </p>
        )}

        <button
          type="button"
          className={styles.viewComments}
          onClick={() => setIsOpen(true)}
        >
          View all comments
        </button>
      </div>

      {isOpen && (
        <PostModal
          post={post}
          currentUserId={currentUserId}
          onClose={handleClosePost}
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
};

export default PostCard;