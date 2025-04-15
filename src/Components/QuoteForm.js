import React from 'react';

const QuoteForm = ({ formData, setFormData, categories, tags, onSubmit, onCancel }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    // Safely handle multi-select values
    const selectedOptions = Array.from(e.target.selectedOptions || [])
      .map(option => option.value)
      .filter(Boolean); // Filter out any undefined or empty values
    
    setFormData(prev => ({
      ...prev,
      tags: selectedOptions
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {formData.id ? 'Edit Quote' : 'Add New Quote'}
      </h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quote Content <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={5}
            required
            placeholder="Enter the quote text here..."
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            placeholder="Who said this quote?"
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select a Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <select
            multiple
            name="tags"
            value={formData.tags || []} // Ensure this is always an array
            onChange={handleTagsChange}
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 h-32"
          >
            {(tags || []).map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple tags</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            {formData.id ? 'Update Quote' : 'Add Quote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;