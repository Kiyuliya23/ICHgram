
import styles from "./styles.module.css";
import { Modal, message } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { useState, useRef,useEffect } from "react";
import axios from "axios";
import ich from "../../client/src/assets/icon/ich.png";



const PostModal = ({
  post,
  onClose,
  currentUserId,
  onDeleted,
}) => {
  const [commentText, setCommentText] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [comments, setComments] = useState(post?.comments ?? []);
const [sendingComment, setSendingComment] = useState(false);
const [loadingComments, setLoadingComments] = useState(false);
const [isLiked, setIsLiked] = useState(post?.isLiked ?? false);
const [likesCount, setLikesCount] = useState(post?.likesCount ?? 0);
const [liking, setLiking] = useState(false);
const [loadingLikes, setLoadingLikes] = useState(true);


  const commentInputRef = useRef(null);

  useEffect(() => {
  if (!post?.id) return;

  let active = true;

  const loadComments = async () => {
    setLoadingComments(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) {
          messageApi.error("Сначала войди в аккаунт.");
        }
        return;
      }

      const response = await axios.get(
        `http://localhost:3333/posts/${post.id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (active) {
        setComments(response.data.comments);
      }
    } catch (error) {
      if (active) {
        messageApi.error(
          error.response?.data?.message ||
            "Не удалось загрузить комментарии."
        );
      }
    } finally {
      if (active) {
        setLoadingComments(false);
      }
    }
  };

  loadComments();

  return () => {
    active = false;
  };
}, [post?.id, messageApi]);

useEffect(() => {
  if (!post?.id) return;

  let active = true;

  const loadLikes = async () => {
    setLoadingLikes(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) {
          messageApi.error("Сначала войди в аккаунт.");
        }
        return;
      }

      const response = await axios.get(
        `http://localhost:3333/posts/${post.id}/like`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (active) {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      if (active) {
        messageApi.error(
          error.response?.data?.message ||
            "Не удалось загрузить лайки."
        );
      }
    } finally {
      if (active) {
        setLoadingLikes(false);
      }
    }
  };

  loadLikes();

  return () => {
    active = false;
  };
}, [post?.id, messageApi]);

const isOwner =
  Boolean(currentUserId) &&
  currentUserId === (post?.authorId ?? post?.author?.id);

const handleSendComment = async () => {
  const text = commentText.trim();

  if (
    !text ||
    !post ||
    sendingComment ||
    loadingComments
  ) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    messageApi.error("Сначала войди в аккаунт.");
    return;
  }

  setSendingComment(true);

  try {
    const response = await axios.post(
      `http://localhost:3333/posts/${post.id}/comments`,
      { text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setComments((previousComments) => [
      ...previousComments,
      response.data.comment,
    ]);

    setCommentText("");
  } catch (error) {
    messageApi.error(
      error.response?.status === 401 ||
      error.response?.status === 403
        ? "Сессия истекла. Войди в аккаунт заново."
        : error.response?.data?.message ||
            "Не удалось отправить комментарий."
    );
  } finally {
    setSendingComment(false);
  }
};

const handleLike = async () => {
  if (!post || liking || loadingLikes) return;

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
      error.response?.status === 401 ||
      error.response?.status === 403
        ? "Сессия истекла. Войди в аккаунт заново."
        : error.response?.data?.message ||
            "Не удалось изменить лайк."
    );
  } finally {
    setLiking(false);
  }
};

const confirmDelete = async () => {
  if (!post || !isOwner) return;

  const token = localStorage.getItem("token");

  if (!token) {
    messageApi.error("Сначала войди в аккаунт.");
    throw new Error("No token");
  }

  try {
    await axios.delete(
      `http://localhost:3333/posts/${post.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    messageApi.error(
      error.response?.status === 401 ||
      error.response?.status === 403
        ? "Сессия истекла. Войди в аккаунт заново."
        : error.response?.data?.message ||
            "Не удалось удалить публикацию."
    );

    throw error;
  }

  setActionsOpen(false);
  onDeleted?.(post.id);
  onClose();
};

const handleDeletePost = () => {
  if (!post || !isOwner) return;

  Modal.confirm({
    title: "Удалить публикацию?",
    content: "После удаления восстановить её будет нельзя.",
    okText: "Удалить",
    cancelText: "Отмена",
    onOk: confirmDelete,
  });
};

const authorName = post?.author?.username ?? "Пользователь";
const authorAvatar = post?.author?.avatarUrl || ich;

  
  return (
    <>
      {contextHolder}

      <Modal
        className={styles.modal}
        open={Boolean(post)}
        onCancel={onClose}
        footer={null}
        width={1001.31}
        centered
      >
        {post && (
          <div className={styles.post}>
            <div className={styles.imageBox}>
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.description || "Фотография публикации"}
                  className={styles.image}
                />
              ) : (
                <p>{post.description}</p>
              )}
            </div>

            <div className={styles.details}>
              <div className={styles.author}>
                <img
                  src={authorAvatar}
                  alt={`Аватар ${authorName}`}
                  className={styles.authorAvatar}
                />

                <div className={styles.authorActions}>
                  <span className={styles.authorName}>
                    {authorName}
                  </span>

                  {!isOwner && (
                    <>
                      <span aria-hidden="true">·</span>

                      <button
                        type="button"
                        className={styles.followButton}
                      >
                        Подписаться
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.moreButton}
                  aria-label="Действия с публикацией"
                  onClick={() => setActionsOpen(true)}
                >
                  <EllipsisOutlined />
                </button>
              </div>

              <div className={styles.postBody}>
                {post.description && (
                  <div className={styles.caption}>
                    <img
                      src={authorAvatar}
                      alt={`Аватар ${authorName}`}
                      className={styles.authorAvatar}
                    />

                    <p className={styles.description}>
                      <strong>{authorName}</strong>{" "}
                      {post.description}
                    </p>
                  </div>
                )}

                <div className={styles.comments}>
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={styles.comment}
                    >
                      <img
                        src={comment.author?.avatarUrl || ich}
                        alt={`Аватар ${
                          comment.author?.username ?? "пользователя"
                        }`}
                        className={styles.commentAvatar}
                      />

                      <p className={styles.commentText}>
                        <strong>
                          {comment.author?.username ?? "Пользователь"}
                        </strong>{" "}
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.postFooter}>
                <div className={styles.postActions}>
                  <button
  type="button"
  className={styles.likeButton}
  aria-label={isLiked ? "Убрать лайк" : "Поставить лайк"}
  aria-pressed={isLiked}
  disabled={liking}
  onClick={handleLike}
>
  {isLiked ? (
    <HeartFilled style={{ color: "#ed4956" }} />
  ) : (
    <HeartOutlined />
  )}
</button>

                  <button
                    type="button"
                    className={styles.commentButton}
                    aria-label="Написать комментарий"
                    onClick={() => commentInputRef.current?.focus()}
                  >
                    <MessageOutlined />
                  </button>
                </div>

                <p className={styles.likesCount}>
  {likesCount} likes
</p>

                <div className={styles.commentForm}>
                  <input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Добавить комментарий..."
                    aria-label="Текст комментария"
                    className={styles.commentInput}
                    value={commentText}
                    maxLength={1000}
                    disabled={sendingComment}
                    onChange={(event) =>
                      setCommentText(event.target.value)
                    }
                  />

                  <button
  type="button"
  className={styles.sendButton}
  disabled={
    !commentText.trim() ||
    sendingComment ||
    loadingComments
  }
  onClick={handleSendComment}
>
  {sendingComment ? "Отправка..." : "Send"}
</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        className={styles.actionsModal}
        closable={false}
        open={Boolean(post) && actionsOpen}
        onCancel={() => setActionsOpen(false)}
        footer={null}
        width={400}
        centered
      >
        {isOwner && (
          <>
            <button
              type="button"
              className={`${styles.actionItem} ${styles.deleteAction}`}
              onClick={handleDeletePost}
            >
              Delete
            </button>

            <button
              type="button"
              className={styles.actionItem}
              disabled
            >
              Edit
            </button>
          </>
        )}

        <button
          type="button"
          className={styles.actionItem}
          disabled
        >
          Go to post
        </button>

        <button
          type="button"
          className={styles.actionItem}
          disabled
        >
          Copy link
        </button>

        <button
          type="button"
          className={styles.actionItem}
          onClick={() => setActionsOpen(false)}
        >
          Cancel
        </button>
      </Modal>
    </>
  );
};

export default PostModal;