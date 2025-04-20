import React, { useState } from 'react';

// Category modal component
const CategoryModal = ({ show, onClose, onSubmit }) => {
  console.log("teeeeeeeeeeee");
  
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

export default QuoteForm;