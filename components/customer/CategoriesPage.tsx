import React from 'react';
import { Category } from '../../types';

interface CategoriesPageProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, onCategorySelect }) => {
  // تصفية الأقسام الرئيسية فقط
  const mainCategories = categories.filter(c => !c.parentId);

  return (
    <div className="p-4 bg-white dark:bg-slate-900">
      <div className="grid grid-cols-2 gap-3">
        {mainCategories.map(category => (
          <div 
            key={category.id} 
            onClick={() => onCategorySelect(category)} 
            className="flex flex-col items-center justify-center text-center cursor-pointer group bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-transparent hover:border-primary active:scale-95 transition-all duration-200 py-6 px-4"
          >
            <p className="font-bold text-gray-800 dark:text-gray-100 text-base group-hover:text-primary transition-colors">
              {category.name}
            </p>
            <div className="mt-2 w-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full group-hover:bg-primary/50 transition-colors"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;