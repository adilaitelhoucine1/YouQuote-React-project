import React from 'react';

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
          onClick={() => setActiveTab('popular')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'popular'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Popular Quotes
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

export default TabNavigation;