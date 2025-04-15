import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("https://youquote.adilaitelhoucine.me/api/login", {
        email,
        password,
      });
      
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Check user role and redirect accordingly
        const userRole = response.data.user.role;
        if (userRole === 'admin') {
          navigate("/admin/dashboard");
        
        } else {
          // Default for regular users
          navigate("/user/dashboard");
        }
      } else {
        // If no user data, navigate to default dashboard
        navigate("/Login");
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-purple-100 rounded-full opacity-50"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-pink-100 rounded-full opacity-50"></div>
        
        {/* Logo and title */}
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-1">Welcome Back</h1>
          <div className="text-6xl text-purple-300 leading-none mb-2">❝</div>
          <p className="text-gray-600">Sign in to access your quotes</p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 relative z-10">
            {error}
          </div>
        )}
        
        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="bg-purple-600 text-white py-3 px-6 rounded-full font-semibold text-center w-full hover:bg-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-md"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        {/* Options */}
        <div className="mt-6 text-center text-gray-600 relative z-10">
          <p>Don't have an account? <Link to="/register" className="text-purple-600 font-medium hover:underline">Sign up</Link></p>
          <p className="mt-2">
            <Link to="/" className="text-purple-600 font-medium hover:underline flex items-center justify-center mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </p>
        </div>
        
        {/* Decorative dots */}
        <div className="absolute bottom-4 right-4 flex space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-300"></div>
          <div className="w-2 h-2 rounded-full bg-purple-200"></div>
          <div className="w-2 h-2 rounded-full bg-purple-100"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;