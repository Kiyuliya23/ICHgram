
import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from "../../pages/login/Login.jsx";
import Register from '../../pages/register/Register.jsx';

function App() {
 

  return (
    <div>
       <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
    </div>
  );
}

export default App;
