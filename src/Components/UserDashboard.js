import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QuoteCard from './QuoteCard';
import QuoteForm from './QuoteForm';
import FilterPanel from './FilterPanel';
import TabNavigation from './TabNavigation';

const API_BASE = 'https://youquote.adilaitelhoucine.me/api';

// Category modal component
const CategoryModal = ({ show, onClose, onSubmit }) => {
  const [categoryName, setCategoryName] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(categoryName);
    setCategoryName(''); // Reset the form
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 className="text-xl font-bold text-gray-700 mb-4">
          Create New Category
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="bg-purple-600 text-white py-3 px-6 rounded-full font-semibold text-center w-full hover:bg-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-md"
          >
            Create Category
          </button>
        </form>
      </div>
    </div>
  );
};

export default function UserDashboard() {
  // Main data state
  const [quotes, setQuotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [randomQuote, setRandomQuote] = useState(null);
  const [popularQuotes, setPopularQuotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    id: null,
    content: '',
    author: '',
    category_id: '',
    tags: []
  });
  
  // Filters state
  const [filters, setFilters] = useState({
    length: 'all',
    category: '',
    tag: '',
    search: ''
  });
  
  const navigate = useNavigate();
  
  // ===== Authentication Helpers =====
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    return { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  };
  
  const validateToken = () => {
    const headers = getAuthHeaders();
    if (!headers) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // ===== Data Loading =====
  useEffect(() => {
    if (!validateToken()) return;
    fetchData();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'random') fetchRandomQuote();
    if (activeTab === 'popular') fetchPopularQuotes();
  }, [activeTab]);
  
  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error('No authentication token found');
      }
      
      // First try to get quotes
      let quotesData = [];
      try {
        const quotesRes = await axios.get(`${API_BASE}/quotes`, { headers });
        quotesData = quotesRes.data;
        setQuotes(quotesData);
      } catch (err) {
        console.error('Error fetching quotes:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        setQuotes([]);
      }
      
      // Fetch categories
      try {
        const categoriesRes = await axios.get(`${API_BASE}/categories`, { headers });
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
      
      // Fetch tags
      try {
        const tagsRes = await axios.get(`${API_BASE}/tags`, { headers });
        setTags(tagsRes.data);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setTags([]);
      }
      
      // Fetch favorites
      try {
        const favoritesRes = await axios.get(`${API_BASE}/quotes/Favorie`, { headers });
        setFavorites(favoritesRes.data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        const userFavorites = quotesData.filter(quote => quote.is_favorited);
        setFavorites(userFavorites);
      }
      
      setError(''); // Clear errors on success
    } catch (err) {
      console.error('Error fetching data:', err);
      
      if (err.message === 'No authentication token found') {
        setError('You need to log in to access this page');
        navigate('/login');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== Tab-specific data loading =====
  const fetchRandomQuote = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${API_BASE}/quotes/random`, { headers });
      setRandomQuote(response.data);
    } catch (err) {
      console.error('Error fetching random quote:', err);
      
      // Fallback: pick a random quote from existing quotes
      if (quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setRandomQuote(quotes[randomIndex]);
      } else {
        setError('Could not load a random quote. Please try again later.');
      }
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  const fetchPopularQuotes = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${API_BASE}/quotes/popular`, { headers });
      setPopularQuotes(response.data);
    } catch (err) {
      console.error('Error fetching popular quotes:', err);
      
      // Fallback: sort by likes
      const sorted = [...quotes].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      setPopularQuotes(sorted.slice(0, 5));
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  // ===== CRUD Operations =====
  const handleCreate = async (formData) => {
    try {
      setError('');
      
      // Basic validation
      if (!formData.content?.trim()) {
        setError('Quote content is required');
        return false;
      }
      
      if (!formData.author?.trim()) {
        setError('Author name is required');
        return false;
      }
      
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return false;
      }
      
      // Prepare payload
      const payload = {
        content: formData.content.trim(),
        author: formData.author.trim()
      };
      
      if (formData.category_id) payload.category_id = formData.category_id;
      if (formData.tags?.length > 0) payload.tags = formData.tags;
      
      const response = await axios.post(`${API_BASE}/quotes`, payload, { headers });
      
      setQuotes(prev => [response.data, ...prev]);
      setActiveTab('all');
      return true;
    } catch (err) {
      console.error('Error creating quote:', err);
      
      if (err.response?.status === 422) {
        // Handle validation errors
        const validationErrors = err.response?.data?.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        
        setError(errorMessages.length ? 
          `Validation error: ${errorMessages.join(', ')}` : 
          'Please check your form data and try again'
        );
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Your session has expired. Please log in again');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to create quote. Please try again.');
      }
      
      return false;
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      // Same validation as create
      if (!formData.content?.trim() || !formData.author?.trim()) {
        setError('Content and author are required');
        return false;
      }
      
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return false;
      }
      
      // Prepare payload - same as create
      const payload = {
        content: formData.content.trim(),
        author: formData.author.trim()
      };
      
      if (formData.category_id) payload.category_id = formData.category_id;
      if (formData.tags?.length > 0) payload.tags = formData.tags;
      
      const response = await axios.put(`${API_BASE}/quotes/${id}`, payload, { headers });
      
      // Update in both quotes and favorites
      setQuotes(prev => prev.map(q => q.id === id ? response.data : q));
      setFavorites(prev => prev.map(q => q.id === id ? response.data : q));
      
      setActiveTab('all');
      setError('');
      return true;
    } catch (err) {
      console.error('Error updating quote:', err);
      setError('Failed to update quote');
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return;
      }
      
      await axios.delete(`${API_BASE}/quotes/${id}`, { headers });
      
      // Remove from both quotes and favorites
      setQuotes(prev => prev.filter(q => q.id !== id));
      setFavorites(prev => prev.filter(q => q.id !== id));
      
      setError('');
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError('Failed to delete quote');
    }
  };

  // Add this new function for creating categories
  const handleCreateCategory = async (categoryName) => {
    try {
      if (!categoryName || categoryName.trim() === '') {
        setError('Category name is required');
        return null;
      }
      
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return null;
      }
      
      const response = await axios.post(
        `${API_BASE}/categories`, 
        { name: categoryName.trim() }, 
        { headers }
      );
      
      // Add the new category to the state
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      setError('');
      
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      
      if (err.response?.status === 422) {
        // Handle validation errors
        const validationErrors = err.response?.data?.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        
        setError(errorMessages.length ? 
          `Validation error: ${errorMessages.join(', ')}` : 
          'Please check your category name and try again'
        );
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Your session has expired. Please log in again');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to create category. Please try again.');
      }
      
      return null;
    }
  };

  // ===== Actions =====
  const handleLike = async (id) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return;
      }
      
      await axios.post(`${API_BASE}/quotes/${id}/like`, {}, { headers });
      
      // Update quotes with new like count
      const updateQuote = q => {
        if (q.id === id) {
          return { ...q, likes_count: (q.likes_count || 0) + 1, is_liked: true };
        }
        return q;
      };
      
      setQuotes(prev => prev.map(updateQuote));
      setFavorites(prev => prev.map(updateQuote));
      if (randomQuote?.id === id) setRandomQuote(updateQuote(randomQuote));
      setPopularQuotes(prev => prev.map(updateQuote));
    } catch (err) {
      console.error('Error liking quote:', err);
    }
  };

  const handleFavorite = async (id) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return;
      }
      
      try {
        await axios.post(`${API_BASE}/quotes/${id}/favorite`, {}, { headers });
      } catch (err) {
        // Continue even if endpoint doesn't exist
      }
      
      // Find the quote to toggle
      const quoteToToggle = quotes.find(q => q.id === id);
      if (!quoteToToggle) return;
      
      const newFavoritedState = !quoteToToggle.is_favorited;
      
      // Update quote in all relevant states
      const updateQuote = q => {
        if (q.id === id) {
          return { ...q, is_favorited: newFavoritedState };
        }
        return q;
      };
      
      setQuotes(prev => prev.map(updateQuote));
      if (randomQuote?.id === id) setRandomQuote(updateQuote(randomQuote));
      setPopularQuotes(prev => prev.map(updateQuote));
      
      // Update favorites list
      if (newFavoritedState) {
        const updatedQuote = { ...quoteToToggle, is_favorited: true };
        setFavorites(prev => [...prev, updatedQuote]);
      } else {
        setFavorites(prev => prev.filter(q => q.id !== id));
      }
    } catch (err) {
      console.error('Error favoriting quote:', err);
    }
  };

  const handleEdit = (quote) => {
    setFormData({
      id: quote.id,
      content: quote.content,
      author: quote.author,
      category_id: quote.category_id || quote.category?.id || '',
      tags: quote.tags?.map(tag => tag.id) || []
    });
    setActiveTab('add');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ===== Render Loading State =====
  if (loading && !quotes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading your quotes...</p>
        </div>
      </div>
    );
  }

  // ===== Main Render =====
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">YouQuote Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Tabs */}
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isEditing={!!formData.id}
          onAddNew={() => {
            setFormData({
              id: null,
              content: '',
              author: '',
              category_id: '',
              tags: []
            });
            setActiveTab('add');
          }}
        />
        
        {/* Tab Content */}
        <div className="mt-6">
          {/* All Quotes Tab */}
          {activeTab === 'all' && (
            <div>
              <FilterPanel 
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                tags={tags}
                onReset={() => {
                  setFilters({
                    length: 'all',
                    category: '',
                    tag: '',
                    search: ''
                  });
                  fetchData();
                }}
              />
              
              {/* Quote list */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Quotes</h2>
                
                {loading ? (
                  <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-lg">
                    <p className="text-gray-600">No quotes found. Try adjusting your filters or add a new quote.</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                    >
                      Add Your First Quote
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quotes.map(quote => (
                      <QuoteCard 
                        key={quote.id} 
                        quote={quote}
                        categories={categories}
                        onLike={handleLike}
                        onFavorite={handleFavorite}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Favorite Quotes</h2>
              
              {favorites.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg">
                  <p className="text-gray-600">You haven't favorited any quotes yet.</p>
                  <p className="text-gray-500 mt-2">Find quotes you love and mark them as favorites.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(quote => (
                    <QuoteCard 
                      key={quote.id} 
                      quote={quote}
                      categories={categories}
                      onLike={handleLike}
                      onFavorite={handleFavorite}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Random Quote Tab */}
          {activeTab === 'random' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Random Quote</h2>
                <button
                  onClick={fetchRandomQuote}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              {!randomQuote ? (
                <div className="text-center py-10 bg-white rounded-lg">
                  <p className="text-gray-600">Click the refresh button to get a random quote.</p>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <QuoteCard 
                    quote={randomQuote}
                    categories={categories}
                    onLike={handleLike}
                    onFavorite={handleFavorite}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Popular Quotes Tab */}
          {activeTab === 'popular' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Popular Quotes</h2>
              
              {popularQuotes.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg">
                  <p className="text-gray-600">No popular quotes available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularQuotes.map(quote => (
                    <QuoteCard 
                      key={quote.id} 
                      quote={quote}
                      categories={categories}
                      onLike={handleLike}
                      onFavorite={handleFavorite}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Add/Edit Quote Tab */}
          {activeTab === 'add' && (
            <QuoteForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              tags={tags}
              onSubmit={formData.id ? 
                () => handleUpdate(formData.id, formData) : 
                () => handleCreate(formData)
              }
              onCancel={() => setActiveTab('all')}
              onNewCategory={() => setShowCategoryModal(true)}
            />
          )}
        </div>
      </main>

      {/* Category Modal */}
      <CategoryModal 
        show={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)} 
        onSubmit={handleCreateCategory} 
      />
    </div>
  );
}
