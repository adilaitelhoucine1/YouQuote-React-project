import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-purple-100 rounded-full opacity-50"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-pink-100 rounded-full opacity-50"></div>
        
        {/* Logo and title */}
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-1">YouQuote</h1>
          <div className="text-6xl text-purple-300 leading-none mb-2">❝</div>
          <p className="text-gray-600">Where your favorite quotes live forever</p>
        </div>
        
        {/* Features */}
        <div className="space-y-4 mb-8 relative z-10">
          <div className="bg-purple-50 rounded-xl p-4 flex items-center">
            <span className="text-2xl mr-4">📚</span>
            <p className="text-gray-700">Save quotes from books, movies, and more</p>
          </div>
          <div className="bg-pink-50 rounded-xl p-4 flex items-center">
            <span className="text-2xl mr-4">🔍</span>
            <p className="text-gray-700">Find inspiration whenever you need it</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 flex items-center">
            <span className="text-2xl mr-4">🌟</span>
            <p className="text-gray-700">Share your favorite quotes with friends</p>
          </div>
        </div>
        
        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <Link 
            to="/login" 
            className="bg-purple-600 text-white py-3 px-6 rounded-full font-semibold text-center hover:bg-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-md"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-white text-purple-600 py-3 px-6 rounded-full font-semibold text-center border-2 border-purple-600 hover:bg-purple-50 transform hover:-translate-y-1 transition-all duration-200"
          >
            Sign Up
          </Link>
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
}
