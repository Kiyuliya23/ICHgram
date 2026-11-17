import styles from "./styles.module.css";
import { Modal, Button } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import ich from "../../client/src/assets/icon/ich.png";

const CreatePost = ({ open, onClose }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [description, setDescription] = useState("");

  const user = {
    username: "itcareerhub",
    avatarUrl: ich,
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    setImageFile(file ?? null);
  };

  const handlePublish = () => {
    if (!imageFile) return;

    // Позже подключим отправку публикации на сервер.
  };

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

  return (
    <Modal
      className={styles.createModal}
      width={900}
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Create new post</h2>

        <Button
          type="text"
          onClick={handlePublish}
          disabled={!imageFile}
          className={styles.publishButton}
        >
          Share
        </Button>
      </div>

      <div className={styles.body}>
        <label className={styles.fileField}>
          <input
            type="file"
            accept="image/*"
            aria-label="Выбрать фотографию"
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
              src={user.avatarUrl}
              alt={`Аватар ${user.username}`}
              className={styles.avatar}
            />

            <p className={styles.username}>
              {user.username}
            </p>
          </div>

          <textarea
            className={styles.description}
            aria-label="Описание публикации"
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
  );
};

export default CreatePost;