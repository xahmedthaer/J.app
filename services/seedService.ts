import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebaseConfig';
import { 
  mockProducts, 
  mockCategories, 
  mockSiteSettings, 
  mockFaqItems 
} from '../data/mockData';

export const seedInitialData = async () => {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    if (productsSnapshot.empty) {
      console.log('Seeding initial data...');
      
      // Seed Categories
      for (const cat of mockCategories) {
        try {
          await setDoc(doc(db, 'categories', cat.id), cat);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `categories/${cat.id}`);
        }
      }
      
      // Seed Products
      for (const prod of mockProducts) {
        try {
          await setDoc(doc(db, 'products', prod.id), prod);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `products/${prod.id}`);
        }
      }
      
      // Seed Settings
      try {
        await setDoc(doc(db, 'settings', 'global'), mockSiteSettings);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'settings/global');
      }
      
      // Seed FAQ
      for (const [index, faq] of mockFaqItems.entries()) {
        const id = `faq-${index}`;
        try {
          await setDoc(doc(db, 'faq', id), faq);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `faq/${id}`);
        }
      }
      
      console.log('Seeding completed successfully.');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
