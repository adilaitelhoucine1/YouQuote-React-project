import './App.css';
import Login from './Auth/Login';
import Register from './Auth/Register'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import AdminDashboard from './Components/AdminDashboard';
import UserDashboard from './Components/UserDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
