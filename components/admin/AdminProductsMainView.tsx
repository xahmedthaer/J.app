
import React, { useState, useEffect } from 'react';
import { Product, Order, Category } from '../../types';
import { HeaderConfig } from '../../App';
import AdminProductsListPage from './AdminProductsListPage';
import AdminProductEditPage from './AdminProductEditPage';
import AdminProductStatsView from './AdminProductStatsView';

type AdminProductsSubView = 'list' | 'edit' | 'stats';

interface AdminProductsMainViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void; // Prop for deleting product
  orders: Order[]; // Needed for AdminProductStatsView
  categories: Category[]; // Needed for AdminProductEditPage
  setHeaderConfig: (config: HeaderConfig | null) => void;
  onBackToAdminDashboardMenu: () => void; // New prop for going back to the admin dashboard menu
}

const AdminProductsMainView: React.FC<AdminProductsMainViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct, // Destructure the new prop
  orders,
  categories,
  setHeaderConfig,
  onBackToAdminDashboardMenu, // Destructure new prop
}) => {
  const [currentSubView, setCurrentSubView] = useState<AdminProductsSubView>('list');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  useEffect(() => {
    // Set header config based on current sub-view
    let newConfig: HeaderConfig | null = null;
    const commonBackAction = () => {
      setProductToEdit(null); // Clear any product being edited
      setCurrentSubView('list'); // Always go back to the list
    };

    switch (currentSubView) {
      case 'list':
        newConfig = {
          title: 'المنتجات', // Title for the main product list
          showBack: true,
          onBack: onBackToAdminDashboardMenu, // Use the prop for back action to dashboard menu
          showAddProduct: true,
          onAddProduct: () => handleNavigateToProductEdit(null), // For adding new product
          showProductStats: true,
          onProductStatsClick: handleNavigateToProductStats, // For navigating to stats
        };
        break;
      case 'edit':
        // Header title will be dynamically set by AdminProductEditPage itself
        newConfig = {
          title: '', // Set a placeholder or empty, as AdminProductEditPage will manage it
          showBack: true,
          onBack: commonBackAction,
        };
        break;
      case 'stats':
        newConfig = {
          title: 'إحصائيات المنتجات',
          showBack: true,
          onBack: commonBackAction,
        };
        break;
      default:
        newConfig = null;
    }
    setHeaderConfig(newConfig);

    // Cleanup: Reset header when component unmounts or view changes to something else
    return () => {
      setHeaderConfig(null);
    };
  }, [currentSubView, productToEdit, setHeaderConfig, onBackToAdminDashboardMenu]);

  const handleNavigateToProductEdit = (product: Product | null) => {
    setProductToEdit(product);
    setCurrentSubView('edit');
  };

  const handleNavigateToProductStats = () => {
    setCurrentSubView('stats');
  };

  const handleProductSave = (product: Product | Omit<Product, 'id'>) => {
    if ('id' in product) {
      onUpdateProduct(product);
    } else {
      onAddProduct(product);
    }
    setCurrentSubView('list'); // Go back to list after saving
    setProductToEdit(null); // Clear product to edit
  };

  const renderSubView = () => {
    switch (currentSubView) {
      case 'list':
        return (
          <AdminProductsListPage
            products={products}
            categories={categories}
            onNavigateToProductEdit={handleNavigateToProductEdit}
          />
        );
      case 'edit':
        return (
          <AdminProductEditPage
            productToEdit={productToEdit}
            onSave={handleProductSave}
            onCancel={() => setCurrentSubView('list')} // Back to list
            onDeleteProduct={onDeleteProduct} // Pass onDeleteProduct
            categories={categories}
            setHeaderConfig={setHeaderConfig} // Pass the setter to ProductEditPage
          />
        );
      case 'stats':
        return (
          <AdminProductStatsView
            products={products}
            orders={orders}
            setHeaderConfig={setHeaderConfig}
            onBack={() => setCurrentSubView('list')} // Back to list
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="dark:bg-slate-900">
      {renderSubView()}
    </div>
  );
};

export default AdminProductsMainView;
