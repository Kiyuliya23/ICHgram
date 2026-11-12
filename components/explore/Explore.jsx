
import styles from "./styles.module.css";

import post1 from "../../client/src/assets/image/post-1.jpg";
import post2 from "../../client/src/assets/image/post-2.jpg";




const Explore = ({ posts = [] }) => {
  return (
    <div className={styles.explore}>
      {posts.map((post) => {
        let imageAlt = "Фотография публикации";

        if (post.description) {
          imageAlt = post.description;
        }

        return (
          <button
            key={post.id}
            type="button"
            className={styles.postItem}
            aria-label="Открыть публикацию"
          >
            <img
              src={post.imageUrl}
              className={styles.postImage}
              alt={imageAlt}
              loading="lazy"
            />
          </button>
        );
      })}
    </div>
    
  );
};

export default Explore;