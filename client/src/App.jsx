
import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from "../../pages/login/Login.jsx";
import Register from '../../pages/register/Register.jsx';
import ForgotPassword from '../../pages/forgotPassword/ForgotPassword.jsx';

function App() {
 

  return (
    <div>
       <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
    </Routes>
    </div>
  );
}

export default App;
