import styles from "./styles.module.css";
import PostCard from "../../components/PostCard/PostCard.jsx";
import feedEnd from "../../client/src/assets/icon/feedEnd.png";

const Home = () => {
  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <div className={styles.posts}>
          <PostCard />
        </div>

        <div className={styles.feedEnd}>
          <img
            src={feedEnd}
            className={styles.feedEndIcon}
            alt=""
          />

          <p className={styles.feedEndTitle}>
            You've seen all the updates
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