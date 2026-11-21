import styles from "./styles.module.css";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3333/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setNotifications(response.data.notifications);
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

        setError("Не удалось загрузить уведомления.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className={styles.Notifications}>
      <h2 className={styles.title}>Notifications</h2>

      {loading ? (
        <p>Загрузка уведомлений...</p>
      ) : error ? (
        <p>{error}</p>
      ) : notifications.length === 0 ? (
        <p>Уведомлений пока нет.</p>
      ) : (
        <>
          <h3 className={styles.subtitle}>Recent</h3>

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={styles.notificationsItem}
            >
              <Avatar
                src={notification.actor.avatarUrl || undefined}
                icon={<UserOutlined />}
                className={styles.avatar}
              />

              <p className={styles.notificationsText}>
                <span className={styles.username}>
                  {notification.actor.username}
                </span>{" "}
                {notification.type === "like"
                  ? "liked your post."
                  : "commented on your post."}{" "}
                <span className={styles.time}>
                  {new Date(
                    notification.createdAt
                  ).toLocaleDateString("ru-RU")}
                </span>
              </p>

              {notification.post?.imageUrl && (
                <img
                  src={notification.post.imageUrl}
                  className={styles.postThumbnail}
                  alt="Публикация"
                />
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Notifications;