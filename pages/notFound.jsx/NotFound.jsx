import styles from "./styles.module.css";
import loginImage from "../../client/src/assets/image/login_imag.png";



const NotFound = () => {
    return( 
        <div className={styles.notFound}>
             <div className={styles.loginContainer}>
                  <img
                    src={loginImage}
                    className={styles.loginImage}
                    alt="Приложение ICHgramm"
                  />
                  </div>

                  <div className={styles.oopsError}>
                    <h1 className={styles.pageNotFound}>
                        Oops! Page Not Found (404 Error)
                    </h1>

                    <p className={styles.textError}>
                        We're sorry, but the page you're looking for doesn't seem to exist.
  <br />
  If you typed the URL manually, please double-check the spelling.
  <br />
  If you clicked on a link, it may be outdated or broken.
                    </p>
                  </div>
        </div>
    );
}

export default NotFound;