import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout } from "antd";

import styles from "./styles.module.css";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import Footer from "../../components/footer/Footer.jsx";
import Search from "../../components/search/Search.jsx";
import Notifications from "../../components/notifications/Notifications.jsx";
import CreatePost from "../../components/createPost/CreatePosr.jsx";

const { Content } = Layout;

const MainLayout = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {

    if(key === "create") {
      setCreateOpen(true);
      setSearchOpen(false);
      setNotificationsOpen(false);

    }
  
    if (key === "notifications") {
      setNotificationsOpen((prev) => !prev);
      setSearchOpen(false);
    } else if (key === "search") {
      setSearchOpen((prev) => !prev);
      setNotificationsOpen(false);
    } else {
      setNotificationsOpen(false);
      setSearchOpen(false);

      if (key === "home") {
        navigate("/home");
      } else if (key === "explore") {
        navigate("/explore");
      }else if (key === "messages") {
        navigate("/messages");
      }else if (key === "profile"){
        navigate("/profile")
      }
    }
  };

  return (
    <div className={styles.mainLayout}>
      <Layout className={styles.layout}>
        <Sidebar onMenuClick={handleMenuClick} />

        {notificationsOpen && <Notifications />}
        {searchOpen && <Search />}
        <CreatePost open={createOpen}
        onClose={() => setCreateOpen(false)}
        />

        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>

      <Footer />
    </div>
  );
};

export default MainLayout;