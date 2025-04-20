import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// API URL base
const API_BASE = 'https://youquote.adilaitelhoucine.me/api';

// Component for tabs
const TabButton = ({ label, activeTab, setActiveTab }) => (
  <button 
    onClick={() => setActiveTab(label.toLowerCase())} 
    className={`flex-1 py-3 px-5 rounded-full font-medium text-sm transition ${
      activeTab === label.toLowerCase() 
        ? 'bg-purple-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-purple-50'
    }`}
  >
    {label}
  </button>
);

// Quote card component
const QuoteCard = ({ quote, onLike, onFavorite, onEdit, onDelete, showActions = true }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden relative group">
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
            onClick={() => onLike(quote.id)}
            className={`flex items-center space-x-1 ${quote.is_liked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={quote.is_liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={quote.is_liked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{quote.likes_count || 0}</span>
          </button>
          
          <button 
            onClick={() => onFavorite(quote.id)}
            className={`flex items-center ${quote.is_favorited ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={quote.is_favorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={quote.is_favorited ? 0 : 2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
        
        {showActions && (
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(quote)}
              className="p-1 text-blue-500 hover:text-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={() => onDelete('quotes', quote.id)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Item list component (for tags and categories)
const ItemList = ({ items, type, onEdit, onDelete, onAdd }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    <ul className="divide-y divide-gray-100">
      {items.length > 0 ? (
        items.map(item => (
          <li key={item.id} className="p-4 flex justify-between items-center">
            <span className="text-gray-700">{item.name}</span>
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit(item)}
                className="p-1 text-blue-500 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={() => onDelete(type, item.id)}
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
          <p className="text-gray-500 mb-4">You haven't created any {type} yet.</p>
          <button 
            onClick={onAdd}
            className="bg-purple-600 text-white py-2 px-4 rounded-full font-medium hover:bg-purple-700 transition"
          >
            Add Your First {type === 'tags' ? 'Tag' : 'Category'}
          </button>
        </li>
      )}
    </ul>
  </div>
);

// Form modal component
const FormModal = ({ show, type, data, onClose, onSubmit, onChange }) => {
  if (!show) return null;
  
  const itemType = type.includes('Category') ? 'Category' : 'Tag';
  
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
          {type.includes('new') ? 'Create New' : 'Edit'} {itemType}
        </h3>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">{itemType} Name</label>
            <input
              type="text"
              name="name"
              placeholder={`Enter ${itemType.toLowerCase()} name`}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
              value={data.name || ''}
              onChange={onChange}
              required
            />
          </div>
          
          <button 
            type="submit"
            className="bg-purple-600 text-white py-3 px-6 rounded-full font-semibold text-center w-full hover:bg-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-md"
          >
            {type.includes('new') ? 'Create' : 'Update'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  // State
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('tags');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});
  
  const navigate = useNavigate();
  
  // Check auth and load data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [navigate]);
  
  // API functions
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch tags and categories in parallel
      const [tagsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/tags`, { headers }),
        axios.get(`${API_BASE}/categories`, { headers })
      ]);
      
      setTags(tagsRes.data);
      setCategories(categoriesRes.data);
      
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
  
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'tags' ? 'tag' : 'category'}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update state after deletion
      if (type === 'tags') {
        setTags(tags.filter(tag => tag.id !== id));
      } else if (type === 'categories') {
        setCategories(categories.filter(category => category.id !== id));
      }
      
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      setError(`Failed to delete ${type}. Please try again.`);
    }
  };
  
  // Modal handlers
  const openModal = (type, data = {}) => {
    console.log("Opening modal:", type, data);
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setModalData({});
    setError('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (modalType === 'newTag' || modalType === 'editTag') {
        const method = modalType === 'newTag' ? 'post' : 'put';
        const url = modalType === 'newTag'
          ? `${API_BASE}/tags`
          : `${API_BASE}/tags/${modalData.id}`;
          
        await axios[method](url, { name: modalData.name }, { headers });
      } else if (modalType === 'newCategory' || modalType === 'editCategory') {
        const method = modalType === 'newCategory' ? 'post' : 'put';
        const url = modalType === 'newCategory'
          ? `${API_BASE}/categories`
          : `${API_BASE}/categories/${modalData.id}`;
          
        await axios[method](url, { name: modalData.name }, { headers });
      }
      
      // Refresh data after changes
      await fetchData();
      closeModal();
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save changes. Please try again.');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Loading state
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
            <h1 className="text-2xl font-bold text-purple-600">Admin Dashboard</h1>
            <div className="text-3xl text-purple-300 leading-none ml-2">❝</div>
          </div>
          
          <button onClick={handleLogout} className="flex items-center text-purple-600 hover:text-purple-800 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-full shadow-md p-1">
          <TabButton label="Tags" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton label="Categories" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {/* Tab Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          
          <button 
            onClick={() => openModal(activeTab === 'tags' ? 'newTag' : 'newCategory')}
            className="bg-purple-600 text-white py-2 px-4 rounded-full font-medium flex items-center hover:bg-purple-700 transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New {activeTab === 'tags' ? 'Tag' : 'Category'}
          </button>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}
        
        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <ItemList 
            items={tags}
            type="tags"
            onEdit={(item) => openModal('editTag', item)}
            onDelete={handleDelete}
            onAdd={() => openModal('newTag')}
          />
        )}
        
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <ItemList 
            items={categories}
            type="categories"
            onEdit={(item) => openModal('editCategory', item)}
            onDelete={handleDelete}
            onAdd={() => openModal('newCategory')}
          />
        )}
      </main>
      
      {/* Modal for creating/editing items */}
      <FormModal 
        show={showModal}
        type={modalType}
        data={modalData}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
      />
    </div>
  );
}