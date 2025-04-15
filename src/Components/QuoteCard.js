import React from 'react';

const QuoteCard = ({ quote, categories, onLike, onFavorite, onEdit, onDelete, showActions = true }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-4 relative">
      <div className="text-3xl text-purple-300 absolute left-3 top-2">❝</div>
      <div className="pt-4">
        <p className="text-gray-800 text-lg mb-2">{quote.content}</p>
        <p className="text-right text-gray-600 italic">— {quote.author}</p>
        
        {quote.category && (
          <div className="mt-3">
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {typeof quote.category === 'object' ? quote.category.name : 
                categories?.find(c => c.id === quote.category_id)?.name || 'Uncategorized'}
            </span>
          </div>
        )}
        
        {quote.tags && quote.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {quote.tags.map(tag => (
              <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
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
                Favorite
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

export default QuoteCard;