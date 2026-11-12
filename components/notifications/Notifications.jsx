import styles from "./styles.module.css";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import postImage from "../../client/src/assets/image/post-1.jpg";


const Notifications = () => {
  const user = {
    id: "1",
    name: "sashaa"
}

    return(
        <div className={styles.Notifications}>
            <h2 className={styles.title}>Notifications</h2>
            <h3 className={styles.subtitle}>New</h3>

            <div className={styles.notificationsItem}>
              <Avatar icon={<UserOutlined />} className={styles.avatar}/>
              <p className={styles.notificationsText}>
                <span className={styles.username}>{user.username}</span>{" "}
                liked your photo.{" "}
                <span className={styles.time}>2 d</span>
              </p>

              <img src={postImage} className={styles.postThumbnail} alt="Публикация" />
            </div>

        </div>
    );
}

export default Notifications;