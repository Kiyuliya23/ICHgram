import styles from "./styles.module.css";
import { Modal, Button, message } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import ich from "../../client/src/assets/icon/ich.png";
import axios from "axios";

const CreatePost = ({ open, onClose }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  const fileInputRef = useRef(null);
  const publishingRef = useRef(false);

  // Загружаем пользователя при открытии окна.
  useEffect(() => {
    if (!open) return;

    let active = true;

    const loadUser = async () => {
      setLoadingUser(true);
      setUserError("");
      setUser(null);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          if (active) {
            setUserError("Сначала войди в аккаунт.");
          }
          return;
        }

        const response = await axios.get(
          "http://localhost:3333/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setUser(response.data.user);
        }
      } catch (error) {
        if (active) {
          setUserError(
            error.response?.status === 401 ||
            error.response?.status === 403
              ? "Сессия истекла. Войди в аккаунт заново."
              : "Не удалось загрузить данные пользователя."
          );
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [open]);

  // Создаём предпросмотр выбранной фотографии.
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      messageApi.error("Выбери фотографию JPEG, PNG или WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      messageApi.error("Фотография должна быть не больше 2 МБ.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const handlePublish = async () => {
    if (
      publishingRef.current ||
      loadingUser ||
      !user ||
      (!description.trim() && !imageFile)
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      messageApi.error("Сначала войди в аккаунт.");
      return;
    }

    const formData = new FormData();

    formData.append("description", description.trim());

    if (imageFile) {
      formData.append("image", imageFile);
    }

    publishingRef.current = true;
    setPublishing(true);

    try {
      await axios.post(
        "http://localhost:3333/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setImageFile(null);
      setDescription("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onClose();
      messageApi.success("Пост опубликован.");
    } catch (error) {
      messageApi.error(
        error.response?.status === 401 ||
        error.response?.status === 403
          ? "Сессия истекла. Войди в аккаунт заново."
          : error.response?.data?.message ||
              "Не удалось опубликовать пост."
      );
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  return (
    <>
      {contextHolder}

      <Modal
        className={styles.createModal}
        width={900}
        open={open}
        onCancel={() => {
          if (!publishingRef.current) {
            onClose();
          }
        }}
        footer={null}
        closable={false}
        centered
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Create new post</h2>

          <Button
            type="text"
            onClick={handlePublish}
            disabled={
              loadingUser ||
              !user ||
              (!description.trim() && !imageFile)
            }
            loading={publishing}
            className={styles.publishButton}
          >
            Share
          </Button>
        </div>

        <div className={styles.body}>
          <label className={styles.fileField}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Выбрать фотографию"
              disabled={publishing}
              onChange={handleImageChange}
              hidden
            />

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Предпросмотр публикации"
                className={styles.imagePreview}
              />
            ) : (
              <CloudUploadOutlined
                className={styles.uploadIcon}
              />
            )}
          </label>

          <div className={styles.details}>
            <div className={styles.author}>
              <img
                src={user?.avatarUrl || ich}
                alt={user ? `Аватар ${user.username}` : "Аватар"}
                className={styles.avatar}
              />

              <p className={styles.username}>
                {loadingUser ? "Загрузка..." : user?.username}
              </p>
            </div>

            {userError && (
              <p role="alert">{userError}</p>
            )}

            <textarea
              className={styles.description}
              aria-label="Описание публикации"
              disabled={publishing}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              maxLength={2200}
            />

            <p className={styles.characterCount}>
              {description.length}/2 200
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreatePost;