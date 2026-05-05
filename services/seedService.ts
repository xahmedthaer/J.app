import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
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
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      
      // Seed Products
      for (const prod of mockProducts) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      
      // Seed Settings
      await setDoc(doc(db, 'settings', 'global'), mockSiteSettings);
      
      // Seed FAQ
      for (const [index, faq] of mockFaqItems.entries()) {
        await setDoc(doc(db, 'faq', `faq-${index}`), faq);
      }
      
      console.log('Seeding completed successfully.');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
