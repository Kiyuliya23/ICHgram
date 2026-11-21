import { Button } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./styles.module.css";
import ich from "../../client/src/assets/icon/ich.png";
import PostModal from "../../components/postModal/PostModal";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [profileResponse, postsResponse] = await Promise.all([
          axios.get("http://localhost:3333/users/me", config),
          axios.get("http://localhost:3333/posts/me", config),
        ]);

        setUser(profileResponse.data.user);
        setPosts(postsResponse.data.posts);
      } catch (error) {
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setError("Не удалось загрузить профиль и публикации.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return <p>Загрузка профиля...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.profile}>
      <div className={styles.profileBox}>
        <div className={styles.profileIcon}>
          <img
            src={user.avatarUrl || ich}
            className={styles.profileAvatar}
            alt={`Аватар ${user.username}`}
          />
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.profileActions}>
            <h2 className={styles.username}>
              {user.username}
            </h2>

            <Button
              className={styles.editButton}
              onClick={() => navigate("/edit-profile")}
            >
              Edit profile
            </Button>
          </div>

          <div className={styles.profileStats}>
  <span>
    <strong>{posts.length}</strong> posts
  </span>

  <span>
    <strong>{user.followers?.length ?? 0}</strong> followers
  </span>

  <span>
    <strong>{user.following?.length ?? 0}</strong> following
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
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.description || "Фотография публикации"}
                className={styles.postImage}
              />
            ) : (
              <p>{post.description}</p>
            )}
          </button>
        ))}
      </div>

     
      {selectedPost && (
  <PostModal
    key={selectedPost.id}
    post={selectedPost}
    currentUserId={user.id}
    onDeleted={(deletedId) => {
      setPosts((previousPosts) =>
        previousPosts.filter((post) => post.id !== deletedId)
      );
    }}
    onClose={() => setSelectedPost(null)}
  />
)}
    </div>
  );
};

export default Profile;