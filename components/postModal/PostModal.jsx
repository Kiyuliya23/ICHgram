
import styles from "./styles.module.css";
import { Modal } from "antd";
import { HeartOutlined,MessageOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useState,useRef } from "react";



const PostModal = ({post, onClose, currentUserId}) => {
const [commentText, setCommentText] = useState("");
const commentInputRef = useRef(null);
const [actionsOpen, setActionsOpen] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [editedDescription, setEditedDescription] = useState("");



const handleSendComment = () => {
    const text = commentText.trim();
    if(!text || !post)
        return;
};

const handleLike = () => {
    if (!post) return;
}
const confirmDelete = () => {
  // Позже здесь напишем запрос удаления на бэкенд.
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

    
 const isOwner =
  Boolean(currentUserId) && currentUserId === post?.author?.id;



  const handleEditPost = () => {
  if (!post || !isOwner) return;

  setEditedDescription(post.description ?? "");
  setIsEditing(true);
  setActionsOpen(false);
};

const handleSavePost = () => {
  if(!post || !isOwner) return;
};


      return (
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
            <img
              src={post.imageUrl}
              alt={post.description || "Фотография публикации"}
              className={styles.image}
            />
          </div>

          <div className={styles.details}>
            <div className={styles.author}>
              <img
                src={post.author.avatarUrl}
                alt={`Аватар ${post.author.username}`}
                className={styles.authorAvatar}
              />

              <div className={styles.authorActions}>
                <span className={styles.authorName}>
                  {post.author.username}
                </span>

                <span aria-hidden="true">·</span>

                <button
                  type="button"
                  className={styles.followButton}
                >
                  Подписаться
                </button>
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
                    src={post.author.avatarUrl}
                    alt={`Аватар ${post.author.username}`}
                    className={styles.authorAvatar}
                  />

                  <p className={styles.description}>
                    <strong>{post.author.username}</strong>{" "}
                    {post.description}
                  </p>
                </div>
              )}

              <div className={styles.comments}>
                {(post.comments ?? []).map((comment) => (
                  <div
                    key={comment.id}
                    className={styles.comment}
                  >
                    <img
                      src={comment.author.avatarUrl}
                      alt={`Аватар ${comment.author.username}`}
                      className={styles.commentAvatar}
                    />

                    <p className={styles.commentText}>
                      <strong>{comment.author.username}</strong>{" "}
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
                  aria-label="Поставить лайк"
                  onClick={handleLike}
                >
                  <HeartOutlined />
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
                {post.likesCount ?? 0} likes
              </p>

              <div className={styles.commentForm}>
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Добавить комментарий..."
                  aria-label="Текст комментария"
                  className={styles.commentInput}
                  value={commentText}
                  onChange={(event) =>
                    setCommentText(event.target.value)
                  }
                />

                <button
                  type="button"
                  className={styles.sendButton}
                  disabled={!commentText.trim()}
                  onClick={handleSendComment}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        className={styles.actionsModal}
        closable={false}
        open={actionsOpen}
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
    </Modal>
  );
};

export default PostModal;