import { Button, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./styles.module.css";
import ich from "../../client/src/assets/icon/ich.png";
import PostModal from "../../components/postModal/PostModal";

const UserProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      setSelectedPost(null);

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

        const [profileResponse, currentUserResponse] =
          await Promise.all([
            axios.get(
              `http://localhost:3333/profiles/${id}`,
              config
            ),
            axios.get(
              "http://localhost:3333/users/me",
              config
            ),
          ]);

        if (active) {
          setUser(profileResponse.data.user);
          setPosts(profileResponse.data.posts);
          setCurrentUserId(currentUserResponse.data.user.id);
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

        setError(
          error.response?.status === 404
            ? "Пользователь не найден."
            : "Не удалось загрузить профиль."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const handleFollow = async () => {
    if (!user || following) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setFollowing(true);

    try {
      const response = await axios.patch(
        `http://localhost:3333/profiles/${user.id}/follow`,
        {
          following: !user.isFollowing,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((previousUser) => ({
        ...previousUser,
        isFollowing: response.data.isFollowing,
        followersCount: response.data.followersCount,
      }));
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      messageApi.error(
        error.response?.data?.message ||
          "Не удалось изменить подписку."
      );
    } finally {
      setFollowing(false);
    }
  };

  const handleMessage = () => {
    navigate("/messages", {
      state: {
        recipient: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  };

  if (loading) {
    return <p>Загрузка профиля...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return null;
  }

  const isOwnProfile = currentUserId === user.id;

  return (
    <div className={styles.profile}>
      {contextHolder}

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

            {isOwnProfile ? (
              <Button
                className={styles.editButton}
                onClick={() => navigate("/edit-profile")}
              >
                Edit profile
              </Button>
            ) : (
              <>
                <Button
                  type={user.isFollowing ? "default" : "primary"}
                  className={styles.followButton}
                  loading={following}
                  onClick={handleFollow}
                >
                  {user.isFollowing ? "Following" : "Follow"}
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
              <strong>{posts.length}</strong> posts
            </span>

            <span>
              <strong>{user.followersCount ?? 0}</strong> followers
            </span>

            <span>
              <strong>{user.followingCount ?? 0}</strong> following
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
          currentUserId={currentUserId}
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

export default UserProfile;