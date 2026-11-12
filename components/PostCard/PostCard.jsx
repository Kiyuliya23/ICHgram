import styles from "./styles.module.css";
import { Avatar, Button } from 'antd';
import { UserOutlined } from "@ant-design/icons";
import postImage from "../../client/src/assets/image/post-1.jpg";
import likeIcon from "../../client/src/assets/icon/like.svg";
import messageIcon from "../../client/src/assets/icon/message.svg";



const PostCard = () => {
  const user = {
    id: "1",
    username: "sashaa",
  };

  const post = {
    id: "1",
    description: "It’s golden, Ponyboy!",
    image: postImage,
    likesCount: 101824,
    commentsCount: 732,
    publishedLabel: "2 wek",
  };

  const comment = {
    id: "1",
    author: {
      id: "2",
      username: "heyyyyy",
    },
    text: "I M...",
  };

  return (
    <div className={styles.PostCard}>
      <div className={styles.postHeader}>
        <Avatar
          className={styles.postAvatar}
          icon={<UserOutlined />}
        />

        <span className={styles.username}>{user.username}</span>
        <span className={styles.postDate}>
          · {post.publishedLabel} ·
        </span>

        <Button type="link" className={styles.followButton}>
          Follow
        </Button>
      </div>

      <img
        src={post.image}
        alt="Фото публикации"
        className={styles.postImage}
      />

      <div className={styles.postActions}>
        <Button
          type="text"
          icon={
            <img
              src={likeIcon}
              className={styles.likeIcon}
              alt=""
            />
          }
          aria-label="Поставить лайк"
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
        />
      </div>

      <div className={styles.postInfo}>
        <p className={styles.likes}>
          {post.likesCount.toLocaleString("ru-RU")} likes
        </p>

        <p className={styles.description}>
          <span className={styles.username}>{user.username}</span>{" "}
          <span className={styles.descriptionText}>
            {post.description}
          </span>
        </p>

        <p className={styles.comment}>
          <span className={styles.username}>
            {comment.author.username}
          </span>{" "}
          {comment.text}
        </p>

        <button type="button" className={styles.viewComments}>
          View all comments ({post.commentsCount})
        </button>
      </div>
    </div>
  );
};

export default PostCard;