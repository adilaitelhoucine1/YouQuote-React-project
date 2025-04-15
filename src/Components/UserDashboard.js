import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QuoteCard from './QuoteCard';
import QuoteForm from './QuoteForm';
import FilterPanel from './FilterPanel';
import TabNavigation from './TabNavigation';

const API_BASE = 'https://youquote.adilaitelhoucine.me/api';

const MOCK_ID_COUNTER = { current: 1000 }; // Starting ID for mock quotes

export default function UserDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [randomQuote, setRandomQuote] = useState(null);
  const [popularQuotes, setPopularQuotes] = useState([]);
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
  
  // Effect for initial data loading
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);
  
  // Effect for tab changes
  useEffect(() => {
    if (activeTab === 'random') fetchRandomQuote();
    if (activeTab === 'popular') fetchPopularQuotes();
  }, [activeTab]);
  
  // Main data fetching function
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch main data
      const [quotesRes, categoriesRes, tagsRes] = await Promise.all([
        axios.get(`${API_BASE}/quotes`, { headers }),
        axios.get(`${API_BASE}/categories`, { headers }),
        axios.get(`${API_BASE}/tags`, { headers })
      ]);
      
      setQuotes(quotesRes.data);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      
      // Try to fetch favorites
      try {
        const favoritesRes = await axios.get(`${API_BASE}/quotes/Favorie`, { headers });
        setFavorites(favoritesRes.data);
      } catch (err) {
        // Fallback: filter quotes that are marked as favorited
        const userFavorites = quotesRes.data.filter(quote => quote.is_favorited);
        setFavorites(userFavorites);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomQuote = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_BASE}/quotes/random`, { headers });
      setRandomQuote(response.data);
    } catch (err) {
      // Fallback: pick a random quote from existing quotes
      if (quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setRandomQuote(quotes[randomIndex]);
      }
    }
  };

  const fetchPopularQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_BASE}/quotes/popular`, { headers });
      setPopularQuotes(response.data);
    } catch (err) {
      // Fallback: sort by likes
      const sorted = [...quotes].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      setPopularQuotes(sorted.slice(0, 5));
    }
  };

  // Quote CRUD operations
  const handleCreate = async (formData) => {
    try {
      setError(''); // Clear previous errors
      
      // Make sure formData.tags is always an array
      const safeFormData = {
        ...formData,
        tags: Array.isArray(formData.tags) ? formData.tags : []
      };
      
      console.log('Creating quote with data:', safeFormData);
      
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`
      };
      
      // Ensure data is properly formatted for the API
      const payload = {
        content: safeFormData.content,
        author: safeFormData.author,
        category_id: safeFormData.category_id || null
      };
      
      // Only include tags if they exist and are not empty
      if (safeFormData.tags && safeFormData.tags.length > 0) {
        payload.tags = safeFormData.tags;
      }
      
      const response = await axios.post(`${API_BASE}/quotes`, payload, { headers });
      
      // If successful, add to quotes and go back to all quotes view
      setQuotes(prev => [response.data, ...prev]);
      setActiveTab('all');
      return true;
    } catch (err) {
      console.error('Error creating quote:', err);
      
      // Show a simple error message
      setError('Failed to create quote. Please try again.');
      
      // Use mock quote as fallback if server error
      if (err.response?.status === 500) {
        const mockQuote = createMockQuote(formData);
        setQuotes(prev => [mockQuote, ...prev]);
        setActiveTab('all');
        return true;
      }
      
      return false;
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(`${API_BASE}/quotes/${id}`, formData, { headers });
      setQuotes(prev => prev.map(q => q.id === id ? response.data : q));
      setActiveTab('all');
      return true;
    } catch (err) {
      setError('Failed to update quote');
      return false;
    }
  };

  const handleDelete = async (id) => {
    console.log(id);
    
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE}/quotes/${id}`, { headers });
      setQuotes(prev => prev.filter(q => q.id !== id));
      setFavorites(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError('Failed to delete quote');
    }
  };

  // Helper function to create a mock quote when the API fails
  const createMockQuote = (formData) => {
    // Increment the mock ID counter
    const id = MOCK_ID_COUNTER.current++;
    
    // Find category name if category_id is provided
    let category = null;
    if (formData.category_id) {
      const categoryObj = categories.find(c => c.id === parseInt(formData.category_id));
      if (categoryObj) {
        category = {
          id: categoryObj.id,
          name: categoryObj.name
        };
      }
    }
    
    // Get tags if provided
    const quoteTags = formData.tags.map(tagId => {
      const tag = tags.find(t => t.id === parseInt(tagId));
      return tag ? { id: tag.id, name: tag.name } : { id: tagId, name: `Tag ${tagId}` };
    });
    
    // Create a mock quote object
    return {
      id,
      content: formData.content,
      author: formData.author,
      category_id: formData.category_id,
      category,
      tags: quoteTags,
      likes_count: 0,
      is_liked: false,
      is_favorited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _isMock: true // Add a flag to identify mock quotes
    };
  };

  // Actions
  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_BASE}/quotes/${id}/like`, {}, { headers });
      
      // Update quotes with new like count
      setQuotes(prev => prev.map(q => {
        if (q.id === id) {
          return { ...q, likes_count: (q.likes_count || 0) + 1, is_liked: true };
        }
        return q;
      }));
    } catch (err) {
      console.error('Error liking quote:', err);
    }
  };

  const handleFavorite = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        await axios.post(`${API_BASE}/quotes/${id}/favorite`, {}, { headers });
      } catch (err) {
        // Continue even if endpoint doesn't exist
      }
      
      // Find the quote to toggle
      const quoteToToggle = quotes.find(q => q.id === id);
      const newFavoritedState = !quoteToToggle.is_favorited;
      
      // Update quotes
      setQuotes(prev => prev.map(q => 
        q.id === id ? { ...q, is_favorited: newFavoritedState } : q
      ));
      
      // Update favorites
      if (newFavoritedState) {
        setFavorites(prev => [...prev, { ...quoteToToggle, is_favorited: true }]);
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

  // Render loading state
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
            />
          )}
        </div>
      </main>
    </div>
  );
}
