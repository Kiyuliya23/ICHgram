import { useState } from "react";
import { Layout } from "antd";
import styles from "./styles.module.css";
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import Notifications from "../../components/notifications/Notifications.jsx";
import Search from "../../components/search/Search.jsx";
import Footer from "../../components/footer/Footer.jsx";

import feedEnd from "../../client/src/assets/icon/feedEnd.png";

const { Content } = Layout;

const Home = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleMenuClick = ({ key }) => {
    if (key === "notifications") {
      setNotificationsOpen((prev) => !prev);
      setSearchOpen(false);
    } else if (key === "search") {
      setSearchOpen((prev) => !prev);
      setNotificationsOpen(false);
    } else {
      setNotificationsOpen(false);
      setSearchOpen(false);
    }
  };

  return (
    <div>
      <Layout className={styles.home}>
        <Sidebar onMenuClick={handleMenuClick} />

        {notificationsOpen && <Notifications />}
        {searchOpen && <Search />}

        <Content className={styles.content}>
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
        </Content>
      </Layout>
     

      <Footer />
    </div>
  );
};

export default Home;