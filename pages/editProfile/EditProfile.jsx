import styles from "./styles.module.css";
import { Form, Input, Button } from "antd";
import ich from "../../client/src/assets/icon/ich.png";
import { useRef } from "react";




const EditProfile = () => {
    const photoInputRef = useRef(null);

    
const user = {
  username: "itcareerhub",
  website: "https://bit.ly/3rpilbh",
  bio: "• Гарантия помощи с трудоустройством в ведущие IT-компании\n• Выпускники зарабатывают от 45к евро\nБЕСПЛАТНАЯ",
};
      return (
    <div className={styles.editProfile}>
      <h1 className={styles.title}>Edit profile</h1>

      <div className={styles.photoBox}>
        <img
          src={ich}
          alt="Аватар профиля"
          className={styles.avatar}
        />

        <div className={styles.userInfo}>
          <p className={styles.username}>{user.username}</p>
          <p className={styles.bio}>{user.bio}</p>
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          hidden
        />

        <Button
          type="primary"
          className={styles.photoButton}
          onClick={() => photoInputRef.current?.click()}
        >
          New photo
        </Button>
      </div>

      <Form layout="vertical" initialValues={user}>
        <Form.Item label="Username"
         name="username"
         className={styles.usernameItem}
         >
          <Input className={styles.textInput}/>
        </Form.Item>

        <Form.Item label="Website"
         name="website"
         className={styles.websiteItem}
         >
          <Input  className={styles.textInput}/>
        </Form.Item>

        <Form.Item label="About"
         name="bio"
         className={styles.aboutItem}
         >
          <Input.TextArea
            rows={3}
            maxLength={150}
            showCount
            className={styles.aboutInput}

          />
        </Form.Item>

        <Button type="primary" 
        htmlType="submit"
        className={styles.saveButton}
        >
          Save
        </Button>
      </Form>
    </div>
  );
};

export default EditProfile;