import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";

const Search = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = searchValue.trim();

    setUsers([]);
    setError("");

    if (!query) {
      setLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();

    setLoading(true);

    const timer = setTimeout(async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3333/search",
          {
            params: { q: query },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (active) {
          setUsers(response.data.users);
        }
      } catch (error) {
        if (!active || axios.isCancel(error)) return;

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setError("Не удалось выполнить поиск.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchValue, navigate]);

  return (
    <div className={styles.search}>
      <h2 className={styles.title}>Search</h2>

      <Input
        className={styles.searchInput}
        placeholder="Search"
        aria-label="Поиск пользователей"
        allowClear
        maxLength={100}
        value={searchValue}
        onChange={(event) =>
          setSearchValue(event.target.value)
        }
      />

      <h3 className={styles.subtitle}>Results</h3>

{searchValue.trim() === "" && (
  <p>Введи имя или username пользователя.</p>
)}

{searchValue.trim() !== "" && loading && (
  <p>Поиск...</p>
)}

{searchValue.trim() !== "" && !loading && error && (
  <p>{error}</p>
)}

{searchValue.trim() !== "" &&
  !loading &&
  !error &&
  users.length === 0 && (
    <p>Пользователи не найдены.</p>
  )}

{searchValue.trim() !== "" && !loading && !error && (
  users.map((user) => (
    <button
      key={user.id}
      type="button"
      className={styles.recentItem}
      onClick={() => navigate(`/profile/${user.id}`)}
    >
      <Avatar
        size={38}
        src={user.avatarUrl || undefined}
        icon={<UserOutlined />}
        className={styles.avatar}
      />

      <span className={styles.username}>
        {user.username}
      </span>
    </button>
  ))
)}
    </div>
  );
};

export default Search;