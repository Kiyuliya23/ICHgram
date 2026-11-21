import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./styles.module.css";
import PostCard from "../../components/PostCard/PostCard.jsx";
import feedEnd from "../../client/src/assets/icon/feedEnd.png";

const Home = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadFeed = async () => {
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
          setPosts(feedResponse.data.posts);
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

        setError("Не удалось загрузить ленту.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handlePostDeleted = (deletedId) => {
    setPosts((previousPosts) =>
      previousPosts.filter((post) => post.id !== deletedId)
    );
  };

  if (loading) {
    return <p>Загрузка публикаций...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDeleted={handlePostDeleted}
            />
          ))}
        </div>

        <div className={styles.feedEnd}>
          <img
            src={feedEnd}
            className={styles.feedEndIcon}
            alt=""
          />

          <p className={styles.feedEndTitle}>
            {posts.length === 0
              ? "Публикаций пока нет"
              : "You've seen all the updates"}
          </p>

          <p className={styles.feedEndText}>
            You have viewed all new publications
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;