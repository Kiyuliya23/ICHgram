import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import logo from "../../client/src/assets/logo/logo.png";
import styles from "./styles.module.css";
import axios from "axios";




const Register = () => {

  const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    
  const onFinish = async(values) => {
   try {
     const { email, fullName, username, password } = values;

     await axios.post("http://localhost:3333/auth/register", {
  email,
  fullName,
  username,
  password,

     });
     navigate("/")
   } catch (error) {
    messageApi.error(
      error.response?.data?.message ||
       "Не удалось зарегистрироваться. Проверь подключение к серверу."
    );
   }
  };

  return (
    
    <div className={styles.register}>
      {contextHolder}
      <Form
        name="register"
        className={styles.registerForm}
        onFinish={onFinish}
      >
          <img src={logo} className={styles.logo} alt="ICHGRAM" />

         <div className={styles.registerHeader}>
          <p className={styles.registerTitle}>Sign up to see photos and videos from your friends.</p>
        </div>

        <div className={styles.registerFields}>
          <Form.Item
            className={styles.Email}
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email!",
              },
              {
                type: "email",
                message: "Please enter a valid email!",
              },
            ]}
          >
            <Input placeholder="Email"  className={styles.registerInput}/>
          </Form.Item>

          <Form.Item
            className={styles.FullName}
            name="fullName"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Please enter your full name!",
              },
            ]}
          >
            <Input placeholder="Full Name"  className={styles.registerInput}/>
          </Form.Item>

          <Form.Item
            className={styles.UserName}
            name="username"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Please enter your username!",
              },
            ]}
          >
            <Input placeholder="Username" className={styles.registerInput}/>
          </Form.Item>

          <Form.Item
            className={styles.password}
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password!",
              },
            ]}
          >
            <Input.Password placeholder="Password" className={styles.registerInput}/>
          </Form.Item>
        </div>

        
        <div className={styles.registerInfo}>
  <p>
    People who use our service may have uploaded your contact
    information to Instagram.{" "}
    <a href="/learn-more">Learn More</a>
  </p>

  <p>
    By signing up, you agree to our{" "}
    <a href="/terms">Terms</a>,{" "}
    <a href="/privacy-policy">Privacy Policy</a>
    {" and "}
    <a href="/cookies-policy">Cookies Policy</a>.
  </p>
</div>

        
        <Button type="primary" htmlType="submit" className={styles.btn}>
          Sign up
        </Button>
      </Form>

      
      <div className={styles.loginBlock}>
        <p>
          Have an account? <Link to="/">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;