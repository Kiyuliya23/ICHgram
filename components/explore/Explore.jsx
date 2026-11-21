
import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostModal from "../postModal/PostModal";

const Explore = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPosts = async () => {
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

        const [feedResponse, profileResponse] = await Promise.all([
          axios.get("http://localhost:3333/feed", config),
          axios.get("http://localhost:3333/users/me", config),
        ]);

        if (active) {
          setPosts(
            feedResponse.data.posts.filter(
              (post) => Boolean(post.imageUrl)
            )
          );

          setCurrentUserId(profileResponse.data.user.id);
        }
      } catch (error) {
        if (!active) return;

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setError("Не удалось загрузить публикации.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handlePostDeleted = (deletedId) => {
    setPosts((previousPosts) =>
      previousPosts.filter((post) => post.id !== deletedId)
    );

    setSelectedPost(null);
  };

  if (loading) {
    return <p>Загрузка публикаций...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (posts.length === 0) {
    return <p>Публикаций с фотографиями пока нет.</p>;
  }

  return (
    <>
      <div className={styles.explore}>
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            className={styles.postItem}
            aria-label="Открыть публикацию"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={post.imageUrl}
              className={styles.postImage}
              alt={post.description || "Фотография публикации"}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {selectedPost && (
        <PostModal
          key={selectedPost.id}
          post={selectedPost}
          currentUserId={currentUserId}
          onDeleted={handlePostDeleted}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
};

export default Explore;