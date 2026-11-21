import { Avatar, Input, message } from "antd";
import { UserOutlined, SendOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./styles.module.css";

const Messages = () => {
  const navigate = useNavigate();

  {/**получает информацию о текущем адресе страницы */}
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogs, setDialogs] = useState([]);
  const [selectedDialog, setSelectedDialog] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatError, setChatError] = useState("");
  const [sending, setSending] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const selectedUserRef = useRef(null);
  const sendingRef = useRef(false);
  const messagesEndRef = useRef(null);

  const currentUserId = currentUser?.id;
  const selectedUserId = selectedDialog?.user.id;

  // Загрузка аккаунта и списка переписок.
  useEffect(() => {
    let active = true;

    const loadDialogs = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [profileResponse, dialogsResponse] = await Promise.all([
          axios.get("http://localhost:3333/users/me", config),
          axios.get("http://localhost:3333/messages", config),
        ]);

        if (active) {
          setCurrentUser(profileResponse.data.user);
          setDialogs(dialogsResponse.data.dialogs);
        }
      } catch (error) {
        if (!active) return;

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setError("Не удалось загрузить переписки.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDialogs();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Поиск собеседника.
  useEffect(() => {
    const query = searchValue.trim();

    setSearchUsers([]);
    setSearchError("");

    if (!query || !currentUserId) {
      setSearchLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();

    setSearchLoading(true);

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
          setSearchUsers(
            response.data.users.filter(
              (user) => user.id !== currentUserId
            )
          );
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

        setSearchError("Не удалось найти пользователя.");
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchValue, currentUserId, navigate]);

  // Загрузка сообщений выбранной переписки.
  useEffect(() => {
    if (!selectedUserId) return;

    let active = true;
    const controller = new AbortController();

    const loadMessages = async () => {
      setLoadingMessages(true);
      setChatError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3333/messages/${selectedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (
          active &&
          selectedUserRef.current === selectedUserId
        ) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        if (
          !active ||
          axios.isCancel(error) ||
          selectedUserRef.current !== selectedUserId
        ) {
          return;
        }

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setChatError("Не удалось загрузить сообщения.");
      } finally {
        if (
          active &&
          selectedUserRef.current === selectedUserId
        ) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedUserId, navigate]);

  // Прокрутка к последнему сообщению.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: "nearest",
    });
  }, [messages]);

  const handleSelectDialog = (dialog) => {
    if (selectedUserRef.current === dialog.user.id) return;

    selectedUserRef.current = dialog.user.id;

    setSelectedDialog(dialog);
    setMessages([]);
    setMessageText("");
    setChatError("");
    setLoadingMessages(true);
  };

  const handleSelectUser = (user) => {
    const existingDialog = dialogs.find(
      (dialog) => dialog.user.id === user.id
    );

    const dialog = existingDialog ?? {
      id: user.id,
      user: {
        id: user.id,
        username: user.username,
        name: user.fullName || user.username,
        avatarUrl: user.avatarUrl ?? "",
      },
      lastMessage: null,
    };

    if (!existingDialog) {
      setDialogs((previousDialogs) => [
        dialog,
        ...previousDialogs,
      ]);
    }

    handleSelectDialog(dialog);
    setSearchValue("");
  };

  useEffect(() => {
  const recipient = location.state?.recipient;

  if (loading || !currentUser || !recipient) return;
  if (recipient.id === currentUser.id) return;

  const dialog = {
    id: recipient.id,
    user: {
      id: recipient.id,
      username: recipient.username,
      name: recipient.fullName || recipient.username,
      avatarUrl: recipient.avatarUrl ?? "",
    },
    lastMessage: null,
  };

  setDialogs((previousDialogs) => {
    const exists = previousDialogs.some(
      (item) => item.user.id === recipient.id
    );

    if (exists) return previousDialogs;

    return [dialog, ...previousDialogs];
  });

  selectedUserRef.current = recipient.id;
  setSelectedDialog(dialog);
  setMessages([]);
  setMessageText("");
  setChatError("");
  setLoadingMessages(true);

  navigate(location.pathname, {
    replace: true,
    state: null,
  });
}, [loading, currentUser, location.state, location.pathname, navigate]);

  const handleSendMessage = async () => {
    const text = messageText.trim();

    if (
      !text ||
      !selectedDialog ||
      sendingRef.current ||
      loadingMessages ||
      chatError
    ) {
      return;
    }

    if (text.length > 2000) {
      messageApi.error("Сообщение не должно превышать 2000 символов.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const recipientId = selectedDialog.user.id;
    const dialogForSend = selectedDialog;

    sendingRef.current = true;
    setSending(true);

    try {
      const response = await axios.post(
        `http://localhost:3333/messages/${recipientId}`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newMessage = response.data.message;

      if (selectedUserRef.current === recipientId) {
        setMessages((previousMessages) => [
          ...previousMessages,
          newMessage,
        ]);

        setMessageText("");
      }

      setDialogs((previousDialogs) => {
        const existingDialog = previousDialogs.find(
          (dialog) => dialog.user.id === recipientId
        );

        const updatedDialog = {
          ...(existingDialog ?? dialogForSend),
          lastMessage: newMessage,
        };

        return [
          updatedDialog,
          ...previousDialogs.filter(
            (dialog) => dialog.user.id !== recipientId
          ),
        ];
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

      messageApi.error(
        error.response?.data?.message ||
          "Не удалось отправить сообщение."
      );
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  if (loading) {
    return <p>Загрузка переписок...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.messages}>
      {contextHolder}

      <div className={styles.dialogs}>
        <div className={styles.dialogsHeader}>
          <h2 className={styles.accountName}>
            {currentUser?.username}
          </h2>
        </div>

        <Input
          placeholder="Найти собеседника"
          aria-label="Поиск собеседника"
          allowClear
          maxLength={100}
          value={searchValue}
          onChange={(event) =>
            setSearchValue(event.target.value)
          }
        />

        <div className={styles.dialogsList}>
          {searchValue.trim() ? (
            searchLoading ? (
              <p>Поиск...</p>
            ) : searchError ? (
              <p>{searchError}</p>
            ) : searchUsers.length === 0 ? (
              <p>Пользователи не найдены.</p>
            ) : (
              searchUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={styles.dialogItem}
                  onClick={() => handleSelectUser(user)}
                >
                  <Avatar
                    size={56}
                    src={user.avatarUrl || undefined}
                    icon={<UserOutlined />}
                    className={styles.dialogAvatar}
                  />

                  <span className={styles.dialogName}>
                    {user.username}
                  </span>
                </button>
              ))
            )
          ) : dialogs.length === 0 ? (
            <p>Пока нет переписок</p>
          ) : (
            dialogs.map((dialog) => (
              <button
                key={dialog.id}
                type="button"
                className={`${styles.dialogItem} ${
                  selectedDialog?.id === dialog.id
                    ? styles.dialogItemActive
                    : ""
                }`}
                onClick={() => handleSelectDialog(dialog)}
              >
                <Avatar
                  size={56}
                  src={dialog.user.avatarUrl || undefined}
                  icon={<UserOutlined />}
                  className={styles.dialogAvatar}
                />

                <span className={styles.dialogInfo}>
                  <span className={styles.dialogName}>
                    {dialog.user.name}
                  </span>

                  <span className={styles.dialogPreview}>
                    {dialog.lastMessage?.text}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <section className={styles.chat}>
        {selectedDialog ? (
          <>
            <div className={styles.chatHeader}>
              <Avatar
                size={44}
                src={selectedDialog.user.avatarUrl || undefined}
                icon={<UserOutlined />}
                className={styles.chatAvatar}
              />

              <h2 className={styles.chatName}>
                {selectedDialog.user.name}
              </h2>
            </div>

            <div className={styles.chatBody}>
              <div className={styles.chatProfile}>
                <Avatar
                  size={96}
                  src={selectedDialog.user.avatarUrl || undefined}
                  icon={<UserOutlined />}
                  className={styles.profileAvatar}
                />

                <h3 className={styles.profileName}>
                  {selectedDialog.user.name}
                </h3>

                <p className={styles.profileSubtitle}>
                  {selectedDialog.user.username} · ICHgram
                </p>

                <button
  type="button"
  className={styles.viewProfileButton}
  onClick={() =>
    navigate(`/profile/${selectedDialog.user.id}`)
  }
>
  View profile
</button>
              </div>

              <div className={styles.messageList}>
                {loadingMessages ? (
                  <p>Загрузка сообщений...</p>
                ) : chatError ? (
                  <p>{chatError}</p>
                ) : messages.length === 0 ? (
                  <p>Напиши первое сообщение.</p>
                ) : (
                  messages.map((item) => {
                    const isOwn = item.senderId === currentUserId;

                    return (
                      <div
                        key={item.id}
                        className={`${styles.messageRow} ${
                          isOwn ? styles.messageRowOwn : ""
                        }`}
                      >
                        {!isOwn && (
                          <Avatar
                            size={28}
                            src={
                              selectedDialog.user.avatarUrl ||
                              undefined
                            }
                            icon={<UserOutlined />}
                            className={styles.messageAvatar}
                          />
                        )}

                        <p
                          className={`${styles.messageItem} ${
                            isOwn ? styles.messageItemOwn : ""
                          }`}
                        >
                          {item.text}
                        </p>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className={styles.messageComposer}>
                <input
                  className={styles.messageInput}
                  type="text"
                  placeholder="Напишите сообщение..."
                  aria-label="Текст сообщения"
                  maxLength={2000}
                  value={messageText}
                  disabled={
                    sending ||
                    loadingMessages ||
                    Boolean(chatError)
                  }
                  onChange={(event) =>
                    setMessageText(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <button
                  type="button"
                  className={styles.sendButton}
                  disabled={
                    !messageText.trim() ||
                    sending ||
                    loadingMessages ||
                    Boolean(chatError)
                  }
                  onClick={handleSendMessage}
                  aria-label="Отправить сообщение"
                >
                  <SendOutlined />
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Выберите переписку или найдите собеседника.</p>
        )}
      </section>
    </div>
  );
};

export default Messages;