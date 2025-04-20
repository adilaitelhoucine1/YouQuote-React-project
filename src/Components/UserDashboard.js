import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://youquote.adilaitelhoucine.me/api';

// QuoteCard Component
const QuoteCard = ({ quote, categories, onLike, onFavorite, onEdit, onDelete, showActions = true }) => {
  // Defensive programming - make sure we have a valid quote object
  if (!quote) {
    console.error("QuoteCard received undefined quote");
    return <div className="bg-white p-5 rounded-lg shadow-md">Missing quote data</div>;
  }

  // Get category name safely
  const getCategoryName = () => {
    if (!categories) return 'Uncategorized';
    
    if (quote.category && quote.category.name) {
      return quote.category.name;
    }
    
    if (quote.category_id && categories) {
      const category = categories.find(c => c.id === Number(quote.category_id));
      return category ? category.name : 'Uncategorized';
    }
    
    return 'Uncategorized';
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-4 relative">
      <div className="text-3xl text-purple-300 absolute left-3 top-2">❝</div>
      <div className="pt-4">
        <p className="text-gray-800 text-lg mb-2">{quote.content || "No content available"}</p>
        <p className="text-right text-gray-600 italic">— {quote.author || "Unknown author"}</p>
        
        {(quote.category || quote.category_id) && (
          <div className="mt-3">
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {getCategoryName()}
            </span>
          </div>
        )}
        
        {quote.tags && quote.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {quote.tags.map(tag => (
              <span 
                key={tag.id || `tag-${Math.random()}`} 
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        
        {showActions && (
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button 
                onClick={() => onLike(quote.id)}
                className={`flex items-center text-sm ${quote.is_liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill={quote.is_liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {quote.likes_count || 0}
              </button>
              
              <button 
                onClick={() => onFavorite(quote.id)}
                className={`flex items-center text-sm ${quote.is_favorited ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-500`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill={quote.is_favorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {quote.is_favorited ? 'Favorited' : 'Favorite'}
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit(quote)}
                className="text-blue-500 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button 
                onClick={() => onDelete(quote.id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Category modal component for QuoteForm
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
            className="bg-purple-600 text-white py-3 px-6 rounded-full font-semibold text-center w-full hover:bg-purple-700 transition-all duration-200 shadow-md"
          >
            Create Category
          </button>
        </form>
      </div>
    </div>
  );
};

// QuoteForm Component
const QuoteForm = ({ formData, setFormData, categories, tags, onSubmit, onCancel, onNewCategory }) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({ ...prev, tags: selectedOptions }));
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {formData.id ? 'Edit Quote' : 'Add New Quote'}
      </h2>
      
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Quote Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Enter your quote text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
            rows={4}
            required
          ></textarea>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            placeholder="Who said this quote?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Source (Optional)</label>
          <input
            type="text"
            name="source"
            value={formData.source || ''}
            onChange={handleInputChange}
            placeholder="Book, movie, speech, etc."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-medium">Category</label>
            {onNewCategory && (
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                + Add New Category
              </button>
            )}
          </div>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Tags</label>
          <select
            multiple
            name="tags"
            value={formData.tags || []}
            onChange={handleTagSelect}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
            size={4}
          >
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <p className="text-gray-500 text-sm mt-1">Hold Ctrl (or Cmd) to select multiple tags</p>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {formData.id ? 'Update Quote' : 'Create Quote'}
          </button>
        </div>
      </form>
      
      {/* Category Modal */}
      {onNewCategory && (
        <CategoryModal 
          show={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={(name) => {
            onNewCategory(name);
            setShowCategoryModal(false);
          }}
        />
      )}
    </div>
  );
};

// TabNavigation Component
const TabNavigation = ({ activeTab, setActiveTab, isEditing, onAddNew }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'all'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          All Quotes
        </button>
        
        <button
          onClick={() => setActiveTab('favorites')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'favorites'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Favorites
        </button>
        
        <button
          onClick={() => setActiveTab('random')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'random'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Random Quote
        </button>
        
        <button
          onClick={() => setActiveTab('longest')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'longest'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Longest Quotes
        </button>
        
        <button
          onClick={onAddNew}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'add'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {isEditing ? 'Edit Quote' : 'Add Quote'}
        </button>
      </nav>
    </div>
  );
};

// FilterPanel Component
const FilterPanel = ({ filters, setFilters, categories, tags, onReset }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Filters</h3>
        <button
          onClick={onReset}
          className="text-purple-600 text-sm hover:text-purple-800"
        >
          Reset Filters
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Quote Length
          </label>
          <select
            name="length"
            value={filters.length}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Lengths</option>
            <option value="short">Short (&lt;100 chars)</option>
            <option value="medium">Medium (100-300 chars)</option>
            <option value="long">Long (&gt;300 chars)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Tag
          </label>
          <select
            name="tag"
            value={filters.tag}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Search
          </label>
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search quotes..."
              className="flex-1 border border-gray-300 rounded-l-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-3 py-2 rounded-r-md hover:bg-purple-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main UserDashboard Component
export default function UserDashboard() {
  // State variables
  const [quotes, setQuotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [randomQuote, setRandomQuote] = useState(null);
  const [longestQuotes, setLongestQuotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    content: '',
    author: '',
    category_id: '',
    tags: []
  });
  
  const [filters, setFilters] = useState({
    length: 'all',
    category: '',
    tag: '',
    search: ''
  });
  
  const navigate = useNavigate();
  
  // Authentication helpers
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
    const token = localStorage.getItem('token');
    console.log("Current token:", token ? "exists" : "missing");
    
    if (!token) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // Effect for initial data loading
  useEffect(() => {
    console.log("UserDashboard component mounted");
    if (!validateToken()) return;
    
    // Actually fetch the data
    fetchData();
  }, []);
  
  // Effect for tab changes
  useEffect(() => {
    if (activeTab === 'random') fetchRandomQuote();
    if (activeTab === 'longest') fetchLongestQuotes();
  }, [activeTab]);
  
  // For debugging - to help identify state changes
  const prevQuotesRef = useRef();
  useEffect(() => {
    // Log when quotes state changes
    if (prevQuotesRef.current !== quotes) {
      console.log("Quotes state changed:", quotes.length);
      prevQuotesRef.current = quotes;
    }
  }, [quotes]);
  
  // Main data fetching function
  const fetchData = async () => {
    console.log("Fetching data...");
    setLoading(true);
    
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        throw new Error('No authentication token found');
      }
      
      console.log("Making API request...");
      
      // Make sure to use the full URL
      const quotesRes = await axios.get('https://youquote.adilaitelhoucine.me/api/quotes', { headers });
      console.log("*****API response for quotes:", quotesRes.data);
      
      // Extract the data regardless of format
      let processedQuotes = [];
      
      // Handle different API response structures
      if (quotesRes && quotesRes.data) {
        if (Array.isArray(quotesRes.data)) {
          processedQuotes = quotesRes.data[0];
          console.log("Quote data is a direct array");
        } 
        else if (quotesRes.data.data && Array.isArray(quotesRes.data.data)) {
          processedQuotes = quotesRes.data.data;
          console.log("Quote data is in data property");
        }
        else if (quotesRes.data.quotes && Array.isArray(quotesRes.data.quotes)) {
          processedQuotes = quotesRes.data.quotes;
          console.log("Quote data is in quotes property");
        }
        else if (typeof quotesRes.data === 'object') {
          // Handle single quote object or unknown structure
          if (quotesRes.data.content && quotesRes.data.author) {
            processedQuotes = [quotesRes.data];
            console.log("Quote data is a single quote object");
          } else {
            console.warn("Unknown quote data structure:", quotesRes.data);
            processedQuotes = [];
          }
        }
      }
      
      console.log("Processed quotes:", processedQuotes[0].length);
      
      // Add a guaranteed test quote if no quotes are found
      if (!processedQuotes.length) {
        console.log("No quotes found, adding test quote");
        processedQuotes = [{
          id: 999,
          content: "This is a test quote. If you're seeing this, the API didn't return any quotes or there was an issue processing them.",
          author: "Test System",
          source: "System",
          category_id: null,
          tags: [],
          likes_count: 0,
          is_liked: false,
          is_favorited: false
        }];
      }
      
      // Update state with quotes
      setQuotes(processedQuotes);
      console.log("Quotes state set with", processedQuotes.length, "quotes");
      
      // Fetch categories and tags
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          axios.get(`${API_BASE}/categories`, { headers }),
          axios.get(`${API_BASE}/tags`, { headers })
        ]);
        
        console.log("Categories/tags responses:", categoriesRes, tagsRes);
        
        // Process categories
        let processedCategories = [];
        if (categoriesRes && categoriesRes.data) {
          if (Array.isArray(categoriesRes.data)) {
            processedCategories = categoriesRes.data;
          } else if (categoriesRes.data.data && Array.isArray(categoriesRes.data.data)) {
            processedCategories = categoriesRes.data.data;
          }
        }
        
        // Process tags
        let processedTags = [];
        if (tagsRes && tagsRes.data) {
          if (Array.isArray(tagsRes.data)) {
            processedTags = tagsRes.data;
          } else if (tagsRes.data.data && Array.isArray(tagsRes.data.data)) {
            processedTags = tagsRes.data.data;
          }
        }
        
        setCategories(processedCategories);
        setTags(processedTags);
        
      } catch (err) {
        console.error("Error fetching categories/tags:", err);
        setCategories([]);
        setTags([]);
      }
      
      // Try to fetch favorites
      try {
        const favoritesRes = await axios.get(`${API_BASE}/quotes/Favorie`, { headers });
        
        // Process favorites data
        let processedFavorites = [];
        if (favoritesRes && favoritesRes.data) {
          if (Array.isArray(favoritesRes.data)) {
            processedFavorites = favoritesRes.data;
          } else if (favoritesRes.data.data && Array.isArray(favoritesRes.data.data)) {
            processedFavorites = favoritesRes.data.data;
          }
        }
        
        setFavorites(processedFavorites);
      } catch (err) {
        console.warn('Error fetching favorites, using client-side fallback:', err);
        
        // Fall back to filtering quotes with is_favorited flag
        const userFavorites = processedQuotes.filter(quote => quote.is_favorited);
        setFavorites(userFavorites);
      }
      
      // Force a refresh to ensure UI updates
      setTimeout(() => {
        setError(''); // Clear any previous errors
        setLoading(false);
      }, 300);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Detailed error logging
      if (err.response) {
        console.error('Error response:', err.response.status, err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      // Handle auth errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load data. Please try again later.');
      }
      
      // Add a test quote even on error to show something
      setQuotes([{
        id: 999,
        content: "There was an error fetching quotes. Please try refreshing the page.",
        author: "System Error",
        source: "Error",
        category_id: null,
        tags: [],
        likes_count: 0,
        is_liked: false,
        is_favorited: false
      }]);
      
      setLoading(false);
    }
  };

  // Fetch a random quote
  const fetchRandomQuote = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
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
    }
  };

  // Calculate longest quotes
  const fetchLongestQuotes = () => {
    // Sort quotes by content length (descending)
    const sorted = [...quotes].sort((a, b) => {
      const aLength = a.content ? a.content.length : 0;
      const bLength = b.content ? b.content.length : 0;
      return bLength - aLength;
    });
    
    // Take the top 5 longest quotes
    setLongestQuotes(sorted.slice(0, 5));
  };

  // Quote CRUD operations
  const handleCreate = async () => {
    try {
      setError(''); // Clear previous errors
      
      // Form validation
      if (!formData.content || formData.content.trim() === '') {
        setError('Quote content is required');
        return false;
      }
      
      if (!formData.author || formData.author.trim() === '') {
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
        author: formData.author.trim(),
        source: formData.source || '',
        category_id: formData.category_id || null,
        tags: formData.tags || []
      };
      
      console.log("Creating quote with payload:", payload);
      
      // Submit to API
      const response = await axios.post(`${API_BASE}/quotes`, payload, { headers });
      
      console.log("API create response:", response);
      
      // Update state and return to quotes list
      setQuotes(prev => [response.data, ...prev]);
      setActiveTab('all');
      return true;
    } catch (err) {
      console.error('Error creating quote:', err);
      
      if (err.response?.status === 422) {
        // Extract validation errors from the response
        const validationErrors = err.response?.data?.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        
        if (errorMessages.length > 0) {
          setError(`Validation error: ${errorMessages.join(', ')}`);
        } else {
          setError('Please check your form data and try again');
        }
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

  const handleUpdate = async (id) => {
    try {
      // Form validation
      if (!formData.content || !formData.author) {
        setError('Content and author are required');
        return false;
      }
      
      const headers = getAuthHeaders();
      if (!headers) return false;
      
      // Prepare payload
      const payload = {
        content: formData.content.trim(),
        author: formData.author.trim(),
        source: formData.source || '',
        category_id: formData.category_id || null,
        tags: formData.tags || []
      };
      
      // Submit to API
      const response = await axios.put(`${API_BASE}/quotes/${id}`, payload, { headers });
      
      // Update quotes list
      setQuotes(prev => prev.map(q => q.id === id ? response.data : q));
      
      // Update favorites if the quote is there
      if (favorites.some(q => q.id === id)) {
        setFavorites(prev => prev.map(q => q.id === id ? response.data : q));
      }
      
      // Update random quote if it's the same
      if (randomQuote && randomQuote.id === id) {
        setRandomQuote(response.data);
      }
      
      // Update longest quotes if needed
      setLongestQuotes(prev => prev.map(q => q.id === id ? response.data : q));
      
      setActiveTab('all');
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
      await axios.delete(`${API_BASE}/quotes/${id}`, { headers });
      
      // Remove from all quote lists
      setQuotes(prev => prev.filter(q => q.id !== id));
      setFavorites(prev => prev.filter(q => q.id !== id));
      
      // Clear random quote if it's the same
      if (randomQuote && randomQuote.id === id) {
        setRandomQuote(null);
      }
      
      // Update longest quotes
      setLongestQuotes(prev => prev.filter(q => q.id !== id));
      
    } catch (err) {
      console.error('Error deleting quote:', err);
      setError('Failed to delete quote');
    }
  };

  // Like a quote
  const handleLike = async (id) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      await axios.post(`${API_BASE}/quotes/${id}/like`, {}, { headers });
      
      // Update like count in all quote lists
      const updateQuoteInList = (list, setList) => {
        setList(prev => prev.map(q => {
          if (q.id === id) {
            return { ...q, likes_count: (q.likes_count || 0) + 1, is_liked: true };
          }
          return q;
        }));
      };
      
      updateQuoteInList(quotes, setQuotes);
      updateQuoteInList(favorites, setFavorites);
      if (randomQuote && randomQuote.id === id) {
        setRandomQuote({
          ...randomQuote,
          likes_count: (randomQuote.likes_count || 0) + 1,
          is_liked: true
        });
      }
      updateQuoteInList(longestQuotes, setLongestQuotes);
      
    } catch (err) {
      console.error('Error liking quote:', err);
    }
  };

  // Add/remove quote from favorites
  const handleFavorite = async (id) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      // Find the quote to toggle favorite status
      const quote = quotes.find(q => q.id === id);
      if (!quote) {
        console.error("Quote not found:", id);
        return;
      }
      
      // Current favorited state
      const isFavorited = quote.is_favorited;
      
      // Toggle favorite status on API
      try {
        await axios.post(`${API_BASE}/quotes/${id}/favorite`, {}, { headers });
      } catch (err) {
        console.warn('Favorite endpoint may not be available, using client-side fallback', err);
      }
      
      // Create updated quote object
      const updatedQuote = { ...quote, is_favorited: !isFavorited };
      
      // Update quotes list
      setQuotes(prev => prev.map(q => q.id === id ? updatedQuote : q));
      
      // Update random quote if it's the selected one
      if (randomQuote && randomQuote.id === id) {
        setRandomQuote(updatedQuote);
      }
      
      // Update longest quotes if needed
      setLongestQuotes(prev => prev.map(q => q.id === id ? updatedQuote : q));
      
      // Update favorites list
      if (!isFavorited) {
        // Add to favorites
        setFavorites(prev => [...prev, updatedQuote]);
      } else {
        // Remove from favorites
        setFavorites(prev => prev.filter(q => q.id !== id));
      }
      
    } catch (err) {
      console.error('Error toggling favorite status:', err);
    }
  };

  // Edit a quote
  const handleEdit = (quote) => {
    setFormData({
      id: quote.id,
      content: quote.content || '',
      author: quote.author || '',
      source: quote.source || '',
      category_id: quote.category_id || (quote.category ? quote.category.id : '') || '',
      tags: (quote.tags && Array.isArray(quote.tags)) ? quote.tags.map(tag => tag.id) : []
    });
    setActiveTab('add');
  };

  // Create a new category
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
      
      // Set the category in the form
      setFormData(prev => ({
        ...prev,
        category_id: newCategory.id
      }));
      
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
      return null;
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Just to make sure data is loaded
  useEffect(() => {
    if (quotes.length === 0 && !loading) {
      console.log("No quotes and not loading, fetching data");
      fetchData();
    }
  }, [quotes, loading]);

  // Loading state
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
        {/* Error display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Status info for debugging */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg mb-6 text-xs">
            API State: {loading ? 'Loading' : 'Ready'} | 
            Quotes: {quotes.length} | 
            Categories: {categories.length} |
            Tags: {tags.length}
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
              source: '',
              category_id: '',
              tags: []
            });
            setActiveTab('add');
          }}
        />
        
        {/* Content based on active tab */}
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
                }}
              />
              
              {/* Quote list */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Quotes ({quotes.length})</h2>
                
                {loading ? (
                  <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-lg">
                    <p className="text-gray-600">No quotes found. Add your first quote.</p>
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
                        key={quote.id || `quote-${Math.random()}`}
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
                      key={quote.id || `favorite-${Math.random()}`} 
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
          
          {/* Longest Quotes Tab */}
          {activeTab === 'longest' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Longest Quotes</h2>
              
              {longestQuotes.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg">
                  <p className="text-gray-600">No quotes available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {longestQuotes.map(quote => (
                    <QuoteCard 
                      key={quote.id || `longest-${Math.random()}`} 
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
                () => handleUpdate(formData.id) : 
                handleCreate
              }
              onCancel={() => setActiveTab('all')}
              onNewCategory={handleCreateCategory}
            />
          )}
        </div>
      </main>
    </div>
  );
}
