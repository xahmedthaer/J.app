
import React, { useEffect, useMemo } from 'react';
import { Product, Order } from '../types';
import { HeaderConfig } from '../App';
import { BoxOpenIcon, ChartUpIcon, XCircleIcon } from './icons';

interface AdminProductStatsViewProps {
  products: Product[];
  orders: Order[];
  setHeaderConfig: (config: HeaderConfig | null) => void;
  onBack: () => void;
}

const ProductStatCard: React.FC<{
  product: Product;
  extraInfo?: string;
  count?: number;
  label?: string;
}> = ({ product, extraInfo, count, label }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-3 flex items-center gap-3 text-right">
    <img src={product.image_urls[0]} alt={product.name} className="w-16 h-16 object-contain bg-gray-100 dark:bg-gray-700 rounded-md border dark:border-gray-600" />
    <div className="flex-grow">
      <p className="font-bold text-gray-800 dark:text-gray-100">{product.name}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">سعر الجملة: {product.price.toLocaleString()} د.ع</p>
      {extraInfo && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{extraInfo}</p>}
      {label && count !== undefined && (
        <p className="text-sm text-primary dark:text-primary-light font-semibold mt-1">
          {label}: {count}
        </p>
      )}
    </div>
  </div>
);

const AdminProductStatsView: React.FC<AdminProductStatsViewProps> = ({ products, orders, setHeaderConfig, onBack }) => {
  useEffect(() => {
    setHeaderConfig({
      title: 'إحصائيات المنتجات',
      showBack: true,
      onBack: onBack,
    });
    return () => setHeaderConfig(null);
  }, [onBack, setHeaderConfig]);

  // Most Requested Products
  const mostRequestedProducts = useMemo(() => {
    const productQuantities: { [productId: string]: number } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        productQuantities[item.product.id] = (productQuantities[item.product.id] || 0) + item.quantity;
      });
    });

    return products
      .filter(p => productQuantities[p.id])
      .sort((a, b) => productQuantities[b.id] - productQuantities[a.id])
      .slice(0, 5) // Top 5 most requested
      .map(p => ({ product: p, count: productQuantities[p.id] }));
  }, [products, orders]);

  // Low Stock Products
  const lowStockThreshold = 10; // Define your low stock threshold
  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => p.inventory.reduce((sum, item) => sum + item.stock, 0) <= lowStockThreshold && p.inventory.reduce((sum, item) => sum + item.stock, 0) > 0)
      .sort((a,b) => a.inventory.reduce((sum, item) => sum + item.stock, 0) - b.inventory.reduce((sum, item) => sum + item.stock, 0))
      .map(p => ({ product: p, count: p.inventory.reduce((sum, item) => sum + item.stock, 0) }));
  }, [products]);

  // Out of Stock Products (Added for clarity, previously included in low stock logic if threshold was 0)
  const outOfStockProducts = useMemo(() => {
    return products.filter(p => p.inventory.reduce((sum, item) => sum + item.stock, 0) === 0);
  }, [products]);


  // Products with No Demand (never ordered)
  const productsInOrders = useMemo(() => {
    const orderedProductIds = new Set<string>();
    orders.forEach(order => {
      order.items.forEach(item => orderedProductIds.add(item.product.id));
    });
    return orderedProductIds;
  }, [orders]);

  const noDemandProducts = useMemo(() => {
    return products.filter(p => !productsInOrders.has(p.id));
  }, [products, productsInOrders]);


  const StatSection: React.FC<{
    title: string;
    icon: React.ElementType;
    iconColor: string;
    productsList: { product: Product, count?: number }[];
    emptyMessage: string;
    countLabel?: string;
  }> = ({ title, icon: Icon, iconColor, productsList, emptyMessage, countLabel }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-end gap-3 pb-3 border-b dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title} ({productsList.length})</h3>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {productsList.length > 0 ? (
        <div className="space-y-3">
          {productsList.map((item) => (
            <ProductStatCard
              key={item.product.id}
              product={item.product}
              label={countLabel}
              count={item.count}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-6 dark:bg-slate-900">
      <StatSection
        title="المنتجات الأكثر طلباً"
        icon={ChartUpIcon}
        iconColor="text-green-500"
        productsList={mostRequestedProducts}
        emptyMessage="لا توجد منتجات تم طلبها بعد."
        countLabel="عدد الطلبات"
      />

      <StatSection
        title={`منتجات ذات مخزون قليل (أقل من ${lowStockThreshold} قطعة)`}
        icon={BoxOpenIcon}
        iconColor="text-orange-500"
        productsList={lowStockProducts}
        emptyMessage="لا توجد منتجات ذات مخزون قليل."
        countLabel="الكمية المتبقية"
      />

      <StatSection
        title="منتجات نفذت من المخزون"
        icon={XCircleIcon}
        iconColor="text-red-500"
        productsList={outOfStockProducts.map(p => ({product:p}))}
        emptyMessage="لا توجد منتجات نفذت من المخزون."
      />

      <StatSection
        title="منتجات بدون طلبات"
        icon={XCircleIcon} // Re-using XCircleIcon, could be a new icon if desired
        iconColor="text-gray-500"
        productsList={noDemandProducts.map(p => ({product:p}))}
        emptyMessage="جميع المنتجات لديها طلبات."
      />
    </div>
  );
};

export default AdminProductStatsView;
