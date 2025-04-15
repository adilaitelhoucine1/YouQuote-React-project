import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('quotes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [navigate]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch quotes, tags, categories in parallel
      const [quotesRes, tagsRes, categoriesRes, favoritesRes] = await Promise.all([
        axios.get('https://youquote.adilaitelhoucine.me/api/quotes', { headers }),
        axios.get('https://youquote.adilaitelhoucine.me/api/tags', { headers }),
        axios.get('https://youquote.adilaitelhoucine.me/api/categories', { headers }),
        axios.get('https://youquote.adilaitelhoucine.me/api/favorites', { headers })
      ]);
      
      setQuotes(quotesRes.data);
      setTags(tagsRes.data);
      setCategories(categoriesRes.data);
      setFavorites(favoritesRes.data);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async (quoteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://youquote.adilaitelhoucine.me/api/quotes/${quoteId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update quotes after liking
      setQuotes(quotes.map(quote => 
        quote.id === quoteId 
          ? { ...quote, likes_count: quote.likes_count + 1, is_liked: true } 
          : quote
      ));
      
    } catch (err) {
      console.error('Error liking quote:', err);
    }
  };
  
  const handleFavorite = async (quoteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://youquote.adilaitelhoucine.me/api/quotes/${quoteId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update quotes after favoriting
      setQuotes(quotes.map(quote => 
        quote.id === quoteId 
          ? { ...quote, is_favorited: !quote.is_favorited } 
          : quote
      ));
      
      // Refresh favorites
      const favRes = await axios.get('https://youquote.adilaitelhoucine.me/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favRes.data);
      
    } catch (err) {
      console.error('Error favoriting quote:', err);
    }
  };
  
  const openModal = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setModalData({});
  };
  
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://youquote.adilaitelhoucine.me/api/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update state after deletion
      if (type === 'quotes') {
        setQuotes(quotes.filter(quote => quote.id !== id));
      } else if (type === 'tags') {
        setTags(tags.filter(tag => tag.id !== id));
      } else if (type === 'categories') {
        setCategories(categories.filter(category => category.id !== id));
      }
      
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (modalType === 'newQuote' || modalType === 'editQuote') {
        const method = modalType === 'newQuote' ? 'post' : 'put';
        const url = modalType === 'newQuote' 
          ? 'https://youquote.adilaitelhoucine.me/api/quotes' 
          : `https://youquote.adilaitelhoucine.me/api/quotes/${modalData.id}`;
        
        await axios[method](url, modalData, { headers });
      } else if (modalType === 'newTag' || modalType === 'editTag') {
        const method = modalType === 'newTag' ? 'post' : 'put';
        const url = modalType === 'newTag'
          ? 'https://youquote.adilaitelhoucine.me/api/tags'
          : `https://youquote.adilaitelhoucine.me/api/tags/${modalData.id}`;
          
        await axios[method](url, { name: modalData.name }, { headers });
      } else if (modalType === 'newCategory' || modalType === 'editCategory') {
        const method = modalType === 'newCategory' ? 'post' : 'put';
        const url = modalType === 'newCategory'
          ? 'https://youquote.adilaitelhoucine.me/api/categories'
          : `https://youquote.adilaitelhoucine.me/api/categories/${modalData.id}`;
          
        await axios[method](url, { name: modalData.name }, { headers });
      }
      
      // Refresh data after changes
      await fetchData();
      closeModal();
      
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-purple-600">YouQuote</h1>
            <div className="text-3xl text-purple-300 leading-none ml-2">❝</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button className="p-2 rounded-full hover:bg-purple-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
            
            <button onClick={handleLogout} className="flex items-center text-purple-600 hover:text-purple-800 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-full shadow-md p-1">
          <button 
            onClick={() => setActiveTab('quotes')} 
            className={`flex-1 py-3 px-5 rounded-full font-medium text-sm transition ${
              activeTab === 'quotes' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-purple-50'
            }`}
          >
            Quotes
          </button>
          <button 
            onClick={() => setActiveTab('favorites')} 
            className={`flex-1 py-3 px-5 rounded-full font-medium text-sm transition ${
              activeTab === 'favorites' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-purple-50'
            }`}
          >
            Favorites
          </button>
          <button 
            onClick={() => setActiveTab('tags')} 
            className={`flex-1 py-3 px-5 rounded-full font-medium text-sm transition ${
              activeTab === 'tags' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-purple-50'
            }`}
          >
            Tags
          </button>
          <button 
            onClick={() => setActiveTab('categories')} 
            className={`flex-1 py-3 px-5 rounded-full font-medium text-sm transition ${
              activeTab === 'categories' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-purple-50'
            }`}
          >
            Categories
          </button>
        </div>
        
        {/* Tab Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          
          {activeTab !== 'favorites' && (
            <button 
              onClick={() => openModal(`new${activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}`)}
              className="bg-purple-600 text-white py-2 px-4 rounded-full font-medium flex items-center hover:bg-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New
            </button>
          )}
        </div>
        
        {/* Content based on active tab */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}
        
        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.length > 0 ? (
              quotes.map(quote => (
                <div key={quote.id} className="bg-white rounded-xl shadow-md overflow-hidden relative group">
                  <div className="p-6">
                    <div className="text-4xl text-purple-300 mb-2">❝</div>
                    <blockquote className="text-gray-700 text-lg mb-3">{quote.content}</blockquote>
                    <p className="text-gray-500 italic">— {quote.author}</p>
                    
                    {quote.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quote.tags.map(tag => (
                          <span key={tag.id} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleLike(quote.id)}
                          className={`flex items-center space-x-1 ${quote.is_liked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={quote.is_liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={quote.is_liked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{quote.likes_count || 0}</span>
                        </button>
                        
                        <button 
                          onClick={() => handleFavorite(quote.id)}
                          className={`flex items-center ${quote.is_favorited ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={quote.is_favorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={quote.is_favorited ? 0 : 2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal('editQuote', quote)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete('quotes', quote.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-5xl text-purple-300 mb-3">❝</div>
                <p className="text-gray-500 mb-4">You haven't created any quotes yet.</p>
                <button 
                  onClick={() => openModal('newQuote')}
                  className="bg-purple-600 text-white py-2 px-4 rounded-full font-medium hover:bg-purple-700 transition"
                >
                  Add Your First Quote
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.length > 0 ? (
              favorites.map(quote => (
                <div key={quote.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="text-4xl text-purple-300 mb-2">❝</div>
                    <blockquote className="text-gray-700 text-lg mb-3">{quote.content}</blockquote>
                    <p className="text-gray-500 italic">— {quote.author}</p>
                    
                    {quote.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quote.tags.map(tag => (
                          <span key={tag.id} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <button 
                        onClick={() => handleLike(quote.id)}
                        className={`flex items-center space-x-1 ${quote.is_liked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={quote.is_liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={quote.is_liked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{quote.likes_count || 0}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleFavorite(quote.id)}
                        className="text-yellow-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-5xl text-yellow-400 mb-3">★</div>
                <p className="text-gray-500">You haven't favorited any quotes yet.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {tags.length > 0 ? (
                tags.map(tag => (
                  <li key={tag.id} className="p-4 flex justify-between items-center">
                    <span className="text-gray-700">{tag.name}</span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openModal('editTag', tag)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete('tags', tag.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-12 text-center">
                  <p className="text-gray-500 mb-4">You haven't created any tags yet.</p>
                  <button 
                    onClick={() => openModal('newTag')}
                    className="bg-purple-600 text-white py-2 px-4 rounded-full font-medium hover:bg-purple-700 transition"
                  >
                    Add Your First Tag
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
        
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {categories.length > 0 ? (
                categories.map(category => (
                  <li key={category.id} className="p-4 flex justify-between items-center">
                    <span className="text-gray-700">{category.name}</span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openModal('editCategory', category)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete('categories', category.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-12 text-center">
                  <p className="text-gray-500 mb-4">You haven't created any categories yet.</p>
                  <button 
                    onClick={() => openModal('newCategory')}
                    className="bg-purple-600 text-white py-2 px-4 rounded-full font-medium hover:bg-purple-700 transition"
                  >
                    Add Your First Category
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </main>
      
      {/* Modal for creating/editing items */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              {modalType.includes('new') ? 'Create New' : 'Edit'} {modalType.replace('new', '').replace('edit', '')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quote Form */}
              {(modalType === 'newQuote' || modalType === 'editQuote') && (
                <>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Quote Content</label>
                    <textarea
                      name="content"
                      placeholder="Enter quote text..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      value={modalData.content || ''}
                      onChange={handleInputChange}
                      rows={4}
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Author</label>
                    <input
                      type="text"
                      name="author"
                      placeholder="Who said this?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      value={modalData.author || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Source (Optional)</label>
                    <input
                      type="text"
                      name="source"
                      placeholder="Book, movie, etc."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      value={modalData.source || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Category</label>
                    <select
                      name="category_id"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      value={modalData.category_id || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {/* Tag Form */}
              {(modalType === 'newTag' || modalType === 'editTag') && (
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Tag Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter tag name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
                    value={modalData.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              
              {/* Category Form */}
              {(modalType === 'newCategory' || modalType === 'editCategory') && (
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter category name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
                    value={modalData.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              
              <button 
                type="submit"
                className="bg-purple-600 text-white py-3 px-6 rounded-full font-semibold text-center w-full hover:bg-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-md"
              >
                {modalType.includes('new') ? 'Create' : 'Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}