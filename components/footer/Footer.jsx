
import styles from "./styles.module.css";



const Footer = () => {
    return(
        
            <footer className={styles.footer}>
               <div className={styles.footerNav}>
                <span>Home</span>
                <span>Search</span>
                <span>Explore</span>
                <span>Messeges</span>
                <span>Notifications</span>
                <span>Create</span>
               </div>
               <p className={styles.copiright}>© 2024 ICHgram</p>
              </footer>
    
    );
}

export default Footer;