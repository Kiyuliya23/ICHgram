import styles from "./styles.module.css";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  CompassOutlined,
  MessageOutlined,
  HeartOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";

import logo from "../../client/src/assets/logo/logo.png";
import profileIcon from "../../client/src/assets/icon/Link.png";

const { Sider } = Layout;

const items = [
  {
    key: "home",
    icon: <HomeOutlined />,
    label: "Home",
  },
  {
    key: "search",
    icon: <SearchOutlined />,
    label: "Search",
  },
  {
    key: "explore",
    icon: <CompassOutlined />,
    label: "Explore",
  },
  {
    key: "messages",
    icon: <MessageOutlined />,
    label: "Messages",
  },
  {
    key: "notifications",
    icon: <HeartOutlined />,
    label: "Notifications",
    className: styles.notificationsItem,
  },
  {
    key: "create",
    icon: <PlusSquareOutlined />,
    label: "Create",
    className: styles.createItem,
  },
  {
    key: "profile",
    icon: (
      <img
        src={profileIcon}
        className={styles.profileIcon}
        alt=""
      />
    ),
    label: "Profile",
    className: styles.profileItem,
  },
];

const Sidebar = ({ onMenuClick }) => {
  return (
    <Sider className={styles.sidebar} theme="light" width={245}>
      <img src={logo} className={styles.logo} alt="ICHGRAM" />

      <Menu
        className={styles.menu}
        mode="inline"
        theme="light"
        defaultSelectedKeys={["home"]}
        items={items}
        onClick={onMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;