import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebaseConfig';
import { 
  User, 
  Product, 
  Order, 
  Customer, 
  WithdrawalRequest, 
  Category, 
  SiteSettings, 
  FaqItem,
  Ticket,
  Coupon
} from '../types';

// --- Users ---
export const getUserByPhone = async (phone: string): Promise<User | null> => {
  try {
    const mapRef = doc(db, 'phone_map', phone);
    const mapSnap = await getDoc(mapRef);
    
    if (mapSnap.exists()) {
      const { email } = mapSnap.data();
      const userQ = query(collection(db, 'users'), where('email', '==', email));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) return userSnap.docs[0].data() as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `phone_map/${phone}`);
    return null;
  }
};

export const syncUserProfile = async (user: any, additionalData?: { name?: string, phone?: string }) => {
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  const isBootstrapAdmin = user.email?.toLowerCase() === 'xahmedthaer@gmail.com';

  if (!userDoc.exists()) {
    const newUser: User = {
      id: user.uid,
      name: additionalData?.name || user.displayName || 'مستخدم جديد',
      email: user.email || '',
      phone: additionalData?.phone || '',
      is_admin: isBootstrapAdmin, // Bootstrap admin
      registration_date: new Date().toISOString(),
    };
    try {
      await setDoc(userRef, newUser);
      
      // If phone is provided, create a map
      if (newUser.phone) {
        await setDoc(doc(db, 'phone_map', newUser.phone), { email: newUser.email, uid: newUser.id });
      }
      
      return newUser;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  } else {
    const existingData = userDoc.data() as User;
    
    // Auto-repair admin status if email matches
    if (isBootstrapAdmin && !existingData.is_admin) {
        try {
            await updateDoc(userRef, { is_admin: true });
            existingData.is_admin = true;
        } catch (error) {
            console.error("Failed to repair admin status", error);
        }
    }

    if (additionalData) {
        // Optional update if data is provided
        try {
            await updateDoc(userRef, additionalData);
            if (additionalData.phone) {
                await setDoc(doc(db, 'phone_map', additionalData.phone), { email: existingData.email, uid: user.uid });
            }
            return { ...existingData, ...additionalData };
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        }
    }
    return existingData;
  }
  return null;
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
};

// --- Products ---
export const getProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
    return [];
  }
};

export const addProduct = async (productData: Omit<Product, 'id'>) => {
  try {
    const docRef = doc(collection(db, 'products'));
    const newProduct = { ...productData, id: docRef.id, created_at: new Date().toISOString() };
    await setDoc(docRef, newProduct);
    return newProduct;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
};

export const updateProduct = async (product: Product) => {
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
};

// --- Orders ---
export const getOrders = async (userId?: string): Promise<Order[]> => {
  try {
    let q = collection(db, 'orders');
    let firestoreQuery;
    if (userId) {
      firestoreQuery = query(q, where('user_id', '==', userId), orderBy('created_at', 'desc'));
    } else {
      firestoreQuery = query(q, orderBy('created_at', 'desc'));
    }
    const snapshot = await getDocs(firestoreQuery);
    return snapshot.docs.map(doc => doc.data() as Order);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
    return [];
  }
};

export const createOrder = async (orderData: Order) => {
  try {
    await setDoc(doc(db, 'orders', orderData.id), orderData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${orderData.id}`);
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status'], adminNote?: string) => {
  try {
    const updates: any = { status };
    if (adminNote !== undefined) updates.admin_note = adminNote;
    await updateDoc(doc(db, 'orders', orderId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
};

export const updateWithdrawalRequest = async (requestId: string, updates: Partial<WithdrawalRequest>) => {
  try {
    await updateDoc(doc(db, 'withdrawal_requests', requestId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `withdrawal_requests/${requestId}`);
  }
};

// --- Customers ---
export const getCustomers = async (userId: string): Promise<Customer[]> => {
  try {
    const q = query(collection(db, 'customers'), where('user_id', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Customer);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'customers');
    return [];
  }
};

export const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
  try {
    const docRef = doc(collection(db, 'customers'));
    const newCustomer = { ...customerData, id: docRef.id };
    await setDoc(docRef, newCustomer);
    return newCustomer;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'customers');
  }
};

// --- Withdrawal Requests ---
export const getWithdrawalRequests = async (userId?: string): Promise<WithdrawalRequest[]> => {
  try {
    let q = collection(db, 'withdrawal_requests');
    let firestoreQuery;
    if (userId) {
      firestoreQuery = query(q, where('user_id', '==', userId), orderBy('created_at', 'desc'));
    } else {
      firestoreQuery = query(q, orderBy('created_at', 'desc'));
    }
    const snapshot = await getDocs(firestoreQuery);
    return snapshot.docs.map(doc => doc.data() as WithdrawalRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'withdrawal_requests');
    return [];
  }
};

export const createWithdrawalRequest = async (request: WithdrawalRequest) => {
  try {
    await setDoc(doc(db, 'withdrawal_requests', request.id), request);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `withdrawal_requests/${request.id}`);
  }
};

// --- Categories ---
export const getCategories = async (): Promise<Category[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => doc.data() as Category);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'categories');
    return [];
  }
};

// --- Settings ---
export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'global'));
    return docSnap.exists() ? docSnap.data() as SiteSettings : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/global');
    return null;
  }
};

export const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
  try {
    await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/global');
  }
};
