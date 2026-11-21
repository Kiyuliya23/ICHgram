
import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from "../../pages/login/Login.jsx";
import Register from '../../pages/register/Register.jsx';
import ForgotPassword from '../../pages/forgotPassword/ForgotPassword.jsx';
import Home from "../../pages/home/Home.jsx";
import MainLayout from "../../layouts/mainLayout/MainLayout.jsx";
import Messages from "../../pages/messages/messages.jsx";
import Explore from '../../components/explore/Explore.jsx';
import Profile from '../../pages/profile/Profile.jsx';
import EditProfile from '../../pages/editProfile/EditProfile.jsx';
import NotFound from '../../pages/notFound.jsx/NotFound.jsx';
import UserProfile from "../../pages/userProfile/UserProfile.jsx";




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
       <Route path="/profile" element={<Profile />} />
       <Route path="/profile/:id" element={<UserProfile />} />
       <Route path="/edit-profile" element={<EditProfile/>} />
       <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>

    </div>
  );
}

export default App;
