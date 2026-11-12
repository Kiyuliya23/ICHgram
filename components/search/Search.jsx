import styles from "./styles.module.css";
import { useState } from "react";
import { Input, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";



const Search = () => {
  const [searchValue, setSearchValue] = useState("");

  const user = {
    id: "1",
    username: "sashaaa"
  }


    return(
        <div className={styles.search}>
            <h2 className={styles.title}>Search</h2>


            {/* Добавляем крестик для очистки поля */}
         <Input
         className={styles.searchInput}
         placeholder="Search"
         allowClear
         value={searchValue}
         onChange={(event) => setSearchValue(event.target.value)}
/>
        <h3 className={styles.subtitle}>Recent</h3>

        <div className={styles.recentItem}>
            <Avatar size={38} icon={<UserOutlined />} className={styles.avatar}/>
            <span className={styles.username}>{user.username}</span>
        </div>
        </div>
    );
}

export default Search;