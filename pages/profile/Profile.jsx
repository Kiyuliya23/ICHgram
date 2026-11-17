import { Button } from "antd";
import { useState } from "react";
import styles from "./styles.module.css";
import ich from "../../client/src/assets/icon/ich.png";
import PostModal from "../../components/postModal/PostModal";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);

  const handleFollow = () => {
    // Позже подключим запрос на подписку.
  };

  const handleMessage = () => {
    // Позже подключим открытие переписки.
  };

  const user = {
    id: "1",
    username: "itcareerhub",
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    bio: "• Гарантия помощи с трудоустройством в ведущие IT-компании\n• Выпускники зарабатывают от 45к евро\nБЕСПЛАТНАЯ",
    website: "https://bit.ly/3rpilbh",
  };
  const posts = [
      {
  id: "1",
  imageUrl: ich,
  description: "Длинное описание ",
  author: {
    id: user.id,
    username: user.username,
    avatarUrl: ich,
  },
  comments: [
    {
      id: "comment-1",
      text: "Очень красивая фотография!",
      author: {
        id: "2",
        username: "anna",
        avatarUrl: ich,
      },
    },
  ],
},
  ];
    const currentUserId = "1";
    const isOwnProfile = currentUserId === user.id;
    


  
  return (
    <div className={styles.profile}>
      <div className={styles.profileBox}>
        <div className={styles.profileIcon}>
          <img
            src={ich}
            className={styles.profileAvatar}
            alt="IT Career Hub"
          />
        </div>

        <div className={styles.profileInfo}>

          <div className={styles.profileActions}>
            <h2 className={styles.username}>
              {user.username}
            </h2>
            {isOwnProfile ? (
    <Button className={styles.editButton}
    onClick={()=> navigate("/edit-profile")}
    >
      Edit profile
    </Button>
  ) : (  
    <>
      <Button
        type="primary"
        className={styles.followButton}
        onClick={handleFollow}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>

      <Button
        className={styles.messageButton}
        onClick={handleMessage}
      >
        Message
      </Button>
    </>
  )}
</div>

            

          <div className={styles.profileStats}>
            <span>
              <strong>{user.postsCount}</strong> posts
            </span>

            <span>
              <strong>{user.followersCount}</strong> followers
            </span>

            <span>
              <strong>{user.followingCount}</strong> following
            </span>
          </div>

          <div className={styles.info}>
            <p className={styles.bio}>{user.bio}</p>

            {user.website && (
              <a
                className={styles.website}
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.postsGrid}>
  {posts.map((post) => (
    <button
      key={post.id}
      type="button"
      className={styles.postCard}
      aria-label="Открыть публикацию"
      onClick={() => setSelectedPost(post)}
    >
            <img
              src={post.imageUrl}
              alt={post.description || "Фотография публикации"}
              className={styles.postImage}
            />
          </button>
        ))}
      </div>
        {selectedPost && (
  <PostModal
    key={selectedPost.id}
    post={selectedPost}
    currentUserId={currentUserId.id}
    onClose={() => setSelectedPost(null)}
      />
        )}
    </div>
  );
};

export default Profile;
