
import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from "../../pages/login/Login.jsx";
import Register from '../../pages/register/Register.jsx';
import ForgotPassword from '../../pages/forgotPassword/ForgotPassword.jsx';
import Home from "../../pages/home/Home.jsx";
import MainLayout from "../../layouts/mainLayout/MainLayout.jsx";
import Messages from "../../pages/messages/messages.jsx";
import Explore from '../../components/explore/Explore.jsx';




function App() {
 

  return (
    <div>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/forgot-password"
      element={<ForgotPassword />}
    />

    <Route element={<MainLayout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/messages" element={<Messages/>} />
       <Route path="/explore" element={<Explore />} />
    </Route>
  </Routes>

    </div>
  );
}

export default App;
