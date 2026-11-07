import { Link } from "react-router-dom";
import { Form, Input, Button } from "antd";
import logo from "../../client/src/assets/logo/logo.png";
import styles from "./styles.module.css";



const Register = () => {
  const onFinish = (values) => {
    const { email, fullName, username, password } = values;

    // Здесь позже подключим запрос на регистрацию.
  };

  return (
    
    <div className={styles.register}>
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
            <Input placeholder="Email"  classNames={styles.registerInput}/>
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
            <Input placeholder="Full Name"  classNames={styles.registerInput}/>
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
            <Input placeholder="Username" classNames={styles.registerInput}/>
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
            <Input.Password placeholder="Password" classNames={styles.registerInput}/>
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