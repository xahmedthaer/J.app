import React from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, placeholder = "ابحث عن المنتج" }) => {
  return (
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full py-3 pr-5 pl-12 text-right bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar;