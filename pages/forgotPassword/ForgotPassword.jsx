import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import Trouble from "../../client/src/assets/icon/Trouble.png";
import { message } from "antd";
import { Form, Input, Button } from "antd";
import { Header } from "antd/es/layout/layout";
import logo from "../../client/src/assets/logo/logo.png";



const ForgotPassword = () => {
    const onFinish = (values) => {
        const { password } = values;

// Здесь позже подключим запрос на восстановление пароля.
    }


    return(
        <div>
        <Header className={styles.headerLogo}>
            <img src={logo} alt="ICHgram"/>
        </Header>
        
         <div className={styles.forgotPassword}>
            <div className={styles.fogotPasswordCard}>

            <div className={styles.lockImage}>
                <img src={Trouble} alt="Замок"/>
            </div>

             <div className={styles.Title}>
                <h2>Trouble loggin in?</h2>
             </div>

             <div className={styles.discription}>
                <p>Enter your email, phone, or username and we'll send you a link to get back into your account. </p>
             </div>
             <Form className={styles.restForm}
             name="forgotPassword"
             onFinish={onFinish}
             >
             <Form.Item 
             className={styles.loginField}
             name="Login"
             rules={[{
                required: true,
                whitespace: true,
                message: "Please enter your username or email!",
            },]}>
                <input placeholder="Email or UserName" className={styles.input} />
             </Form.Item>
             
             <Button className={styles.resetButton}
             type="primary"
             htmlType="submit"
             >Reset your password</Button>
             </Form>

             <div className={styles.divider}>
                <span>OR</span>
             </div>
             
             <Link to="/register" className={styles.registerLink}>
             Create new account
             </Link>
             <div className={styles.backToLogin}>
                <Link to="/">Back to login</Link>
             </div>
            </div>
         </div></div>
    
    );
}

export default ForgotPassword; 