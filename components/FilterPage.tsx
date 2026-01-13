
import React, { useState, useMemo } from 'react';
import SearchBar from './SearchBar';

const categories = [
    'أجهزة المنزل', 'منوعات', 'ملابس', 'العدد اليدوية والأثاثية',
    'أجهزة كهربائية', 'أجهزة العناية', 'الكترونيات', 'لانجري',
    'حقائب', 'ألعاب الأطفال الذكية'
];

interface FilterPageProps {
    onApply: () => void;
}

const FilterPage: React.FC<FilterPageProps> = ({ onApply }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleToggleCategory = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
            ? prev.filter(c => c !== category)
            : [...prev, category]
        );
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        return categories.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    return (
        <div className="pb-24">
            <div className="bg-white p-3 shadow-sm">
                <SearchBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="بحث في الأقسام"
                />
            </div>

            <div className="p-4 bg-white">
                <div className="divide-y divide-gray-200">
                    {filteredCategories.map((category, index) => (
                        <label key={index} className="flex items-center justify-end gap-4 py-3 text-right cursor-pointer">
                            <span className="font-semibold text-gray-700">{category}</span>
                            <input 
                                type="checkbox" 
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleToggleCategory(category)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] border-t border-gray-200">
                <button onClick={onApply} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg">
                    تطبيق الفلتر ({selectedCategories.length})
                </button>
            </div>
        </div>
    );
};

export default FilterPage;
