import styles from "./styles.module.css";
import { Form, Input, Button, message } from "antd";
import ich from "../../client/src/assets/icon/ich.png";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const photoInputRef = useRef(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3333/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profile = response.data.user;

        setUser(profile);

        form.setFieldsValue({
          username: profile.username,
          website: profile.website ?? "",
          bio: profile.bio ?? "",
        });
      } catch (error) {
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setError("Не удалось загрузить профиль.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [form, navigate]);

  const handleSave = async (values) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setSaving(true);

    try {
      await axios.patch(
        "http://localhost:3333/users/me",
        {
          username: values.username,
          website: values.website ?? "",
          bio: values.bio ?? "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/profile");
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
          "Не удалось сохранить профиль."
      );
    } finally {
      setSaving(false);
    }
  };
  const handlePhotoChange = async (event) => {
  const input = event.target;
  const file = input.files?.[0];

  if (!file) return;
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/");
    return;
  }
  const formData = new FormData();
  formData.append("avatar", file);
  setSaving(true);
  try {
    const response = await axios.patch(
      "http://localhost:3333/users/me/avatar",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser((previousUser) => ({
      ...previousUser,
      avatarUrl: response.data.avatarUrl,
    }));

    messageApi.success("Фотография сохранена");
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
        "Не удалось загрузить фотографию."
    );
  } finally {
    setSaving(false);
    input.value = "";
  }
};

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.editProfile}>
      {contextHolder}

      <h1 className={styles.title}>Edit profile</h1>

      <div className={styles.photoBox}>
        <img
          src={user?.avatarUrl || ich}
          alt="Аватар профиля"
          className={styles.avatar}
        />

        <div className={styles.userInfo}>
          <p className={styles.username}>{user?.username}</p>
          <p className={styles.bio}>{user?.bio}</p>
        </div>

        <input
           ref={photoInputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp"
  aria-label="Выбрать фотографию профиля"
  onChange={handlePhotoChange}
  hidden
        />

        <Button
          type="primary"
          className={styles.photoButton}
          disabled={loading || saving}
          onClick={() => photoInputRef.current?.click()}
        >
          New photo
        </Button>
      </div>

      <Form
        layout="vertical"
        form={form}
        disabled={loading || saving}
        onFinish={handleSave}
      >
        <Form.Item
          label="Username"
          name="username"
          className={styles.usernameItem}
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Please enter your username",
            },
            {
              pattern: /^[a-zA-Z0-9._]{3,30}$/,
              message:
                "Use 3–30 letters, numbers, dots or underscores",
            },
          ]}
        >
          <Input className={styles.textInput} />
        </Form.Item>

        <Form.Item
          label="Website"
          name="website"
          className={styles.websiteItem}
        >
          <Input className={styles.textInput} />
        </Form.Item>

        <Form.Item
          label="About"
          name="bio"
          className={styles.aboutItem}
          rules={[
            {
              max: 150,
              message: "About must not exceed 150 characters",
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            maxLength={150}
            showCount
            className={styles.aboutInput}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          className={styles.saveButton}
          loading={saving}
        >
          Save
        </Button>
      </Form>
    </div>
  );
};

export default EditProfile;