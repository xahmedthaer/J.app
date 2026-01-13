import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col animate-pulse">
      <div className="relative bg-gray-200 dark:bg-gray-700 w-full h-32"></div>
      <div className="p-2 flex-grow flex flex-col">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-auto"></div>
        <div className="flex justify-between items-end mt-2">
             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
             <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;