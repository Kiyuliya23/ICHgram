
import { Link } from "react-router-dom";
import { Form, Input, Button } from "antd";
import loginImage from "../../client/src/assets/image/login_imag.png";
import styles from "./styles.module.css"; 
import logo from "../../client/src/assets/logo/logo.png"



// onFinish- функция которая выполниться после отправки формы ,если все поля прошли валидацию 
const Login = () => {
  const onFinish = (values) => {
    const { login, password } = values;



    // Здесь позже подключим запрос на вход.
  };

  return (
  <div className={styles.login}>
    {/* Контейнер располагает картинку и правую колонку рядом. */}
    <div className={styles.loginContainer}>
      <img
        src={loginImage}
        className={styles.loginImage}
        alt="Приложение ICHgramm"
      />

      
      <div className={styles.loginContent}>
        <Form
          name="login"
          className={styles.loginForm}
          onFinish={onFinish}
        >
        
          <img src={logo} className={styles.logo} alt="ICHGRAM" />

          
          <div className={styles.formContent}>
            <Form.Item
              className={styles.loginEmail}
              name="login"
              rules={[
                {
                 required: true, // Требуем заполнить поле.
                  whitespace: true, // Запрещаем значение только из пробелов.
                  message: "Please enter your username or email!", // Текст ошибки.
                },
              ]}
            >
              <Input placeholder="Username, or email"  classNames={styles.loginInput}/>
            </Form.Item>

            <Form.Item
              className={styles.loginPassword}
              name="password"
              rules={[
                {
                  required: true, 
                  message: "Please enter your password!", 
                },
              ]}
            >
              <Input.Password
                className={styles.passwordInput}
                placeholder="Password"
              />
            </Form.Item>

            
            <Form.Item>
              <Button
                type="primary"
                className={styles.btn}
                htmlType="submit"
              >
                Log in
              </Button>

              <div className={styles.divider}>
              
                <span>OR</span>
              </div>

              <Link
                className={styles.forgotPassword}
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            </Form.Item>
          </div>
        </Form>

        <div className={styles.blockSinUp}>
          <p className={styles.SinUp}>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;