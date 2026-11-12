
import { useState } from "react";
import { Avatar } from "antd";
import styles from "./styles.module.css";
import { UserOutlined, SendOutlined } from "@ant-design/icons";

const Messages = ({currentUserId  }) => {
    {/* Храним список переписок  */}
  const [dialogs, setDialogs] = useState([]);

  {/*Храним выбранную переписку  */}
  const [selectedDialog, setSelectedDialog] = useState(null);
  
  {/* Хранит сообщения открытой переписки  */}
  const [messages, setMessages] = useState([]);

  {/*Хранит текст ,который пользователь сейчас набирает  */}
  const [messageText, setMessageText] = useState("");



  const handleSendMessage = () => {
    const text = messageText.trim();

    if (!text || !selectedDialog) {
      return;
    }

    // Здесь позже будет запрос на бэкенд.
  };

  return (
    <div className={styles.messages}>
      <div className={styles.dialogs}>

        <div className={styles.dialogsHeader}>
          <h2 className={styles.accountName}>itcareerhub</h2>
        </div>

        {/* ПОКАЗЫВАЕТ СПИСОК ПЕРЕПИСОК  */}
        <div className={styles.dialogsList}>
          {dialogs.length === 0 ? (
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
                onClick={() => setSelectedDialog(dialog)}
              >
                <Avatar
                  size={56}
                  src={dialog.user.avatarUrl}
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

    {/* Открытая переписка правый блок  */}
      <section className={styles.chat}>
        {selectedDialog ? (
          <>
            <div className={styles.chatHeader}>
                <Avatar 
                size={44}
                src={selectedDialog.user.avatarUrl}
                icon={<UserOutlined />} 
                className={styles.chatAvatar}
                />
              <h2 className={styles.chatName}>
                {selectedDialog.user.name}
              </h2>
            </div>
            <div className={styles.chatBody}>


                {/*Блок профиля собеседника  */}
                <div className={styles.chatProfile}>
  <Avatar
  size={96}
    src={selectedDialog.user.avatarUrl}
    icon={<UserOutlined />}
    className={styles.profileAvatar}
  />

  <h3 className={styles.profileName}>
    {selectedDialog.user.name}
  </h3>
  
  <p className={styles.profileSubtitle}>
  {selectedDialog.user.name} · ICHgram
</p>
 
  <button
    type="button"
    className={styles.viewProfileButton}
  >
    View profile
  </button>
</div>

<div className={styles.messageList}>
  {messages.map((message) => {
    const isOwn =
      currentUserId != null &&
      message.senderId === currentUserId;

    return (
      <div
        key={message.id}
        className={`${styles.messageRow} ${
          isOwn ? styles.messageRowOwn : ""
        }`}
      >
        {!isOwn && (
          <Avatar
            size={28}
            src={selectedDialog.user.avatarUrl}
            icon={<UserOutlined />}
            className={styles.messageAvatar}
          />
        )}

        <p
          className={`${styles.messageItem} ${
            isOwn ? styles.messageItemOwn : ""
          }`}
        >
          {message.text}
        </p>
      </div>
    );
  })}
</div>

<div className={styles.messageComposer}>
  <input
    className={styles.messageInput}
    type="text"
    placeholder="Напишите сообщение..."
    value={messageText}
    onChange={(event) => setMessageText(event.target.value)}
    onKeyDown={(event) => {
      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
        event.preventDefault();
        handleSendMessage();
      }
    }}
  />

  <button
    type="button"
    className={styles.sendButton}
    disabled={!messageText.trim()}
    onClick={handleSendMessage}
    aria-label="Отправить сообщение"
  >
    <SendOutlined />
  </button>
</div>
</div>
</>
) : (
  <p>Выберите переписку</p>
)}
      </section>
    </div>
  );
};

export default Messages;