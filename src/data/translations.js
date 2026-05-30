// translations.js — Partner Portal UI strings in three language modes.
// 'default' = Bangla-English mix, 'bn' = pure Bangla, 'en' = pure English.

export const TRANSLATIONS = {
  appName: { default: 'FlashCart Partner', bn: 'ফ্ল্যাশকার্ট পার্টনার', en: 'FlashCart Partner' },
  poweredBy: { default: 'Powered by', bn: 'পরিচালনায়', en: 'Powered by' },
  developedBy: { default: 'Developed by', bn: 'ডেভেলপার', en: 'Developed by' },

  // Nav / sections
  dashboard: { default: 'Dashboard', bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  orders: { default: 'Orders', bn: 'অর্ডার', en: 'Orders' },
  menu: { default: 'Menu', bn: 'মেনু', en: 'Menu' },
  settings: { default: 'Settings', bn: 'সেটিংস', en: 'Settings' },
  analytics: { default: 'Analytics & SEO', bn: 'অ্যানালিটিক্স ও SEO', en: 'Analytics & SEO' },
  certificates: { default: 'Certificates', bn: 'সার্টিফিকেট', en: 'Certificates' },
  reviews: { default: 'Reviews', bn: 'রিভিউ', en: 'Reviews' },
  profile: { default: 'Profile', bn: 'প্রোফাইল', en: 'Profile' },
  guide: { default: 'Setup Guide', bn: 'গাইড', en: 'Setup Guide' },
  notifications: { default: 'Notifications', bn: 'নোটিফিকেশন', en: 'Notifications' },
  logout: { default: 'Logout', bn: 'লগআউট', en: 'Logout' },
  login: { default: 'Login', bn: 'লগইন', en: 'Login' },
  signup: { default: 'Sign Up', bn: 'সাইন আপ', en: 'Sign Up' },

  // Dashboard stats
  todayRevenue: { default: "Today's Revenue", bn: 'আজকের আয়', en: "Today's Revenue" },
  totalOrders: { default: 'Total Orders', bn: 'মোট অর্ডার', en: 'Total Orders' },
  avgRating: { default: 'Average Rating', bn: 'গড় রেটিং', en: 'Average Rating' },
  profileScore: { default: 'Profile Score', bn: 'প্রোফাইল স্কোর', en: 'Profile Score' },
  newOrders: { default: 'New Orders', bn: 'নতুন অর্ডার', en: 'New Orders' },
  stopSound: { default: 'Stop Sound', bn: 'সাউন্ড বন্ধ', en: 'Stop Sound' },
  viewOrder: { default: 'View', bn: 'দেখুন', en: 'View' },
  testSound: { default: 'Test Sound', bn: 'সাউন্ড টেস্ট', en: 'Test Sound' },
  salesChart: { default: 'Sales (7 days)', bn: 'বিক্রয় (৭ দিন)', en: 'Sales (7 days)' },
  topItems: { default: 'Top Selling Items', bn: 'বেশি বিক্রিত পণ্য', en: 'Top Selling Items' },
  recentOrders: { default: 'Recent Orders', bn: 'সাম্প্রতিক অর্ডার', en: 'Recent Orders' },
  quickActions: { default: 'Quick Actions', bn: 'কুইক অ্যাকশন', en: 'Quick Actions' },

  // Orders
  newOrder: { default: 'New Order', bn: 'নতুন অর্ডার', en: 'New Order' },
  accept: { default: 'Accept', bn: 'গ্রহণ করুন', en: 'Accept' },
  reject: { default: 'Reject', bn: 'বাতিল করুন', en: 'Reject' },
  markPreparing: { default: 'Mark Preparing', bn: 'প্রস্তুত হচ্ছে', en: 'Mark Preparing' },
  markOutForDelivery: { default: 'Out for Delivery', bn: 'ডেলিভারিতে', en: 'Out for Delivery' },
  markDelivered: { default: 'Mark Delivered', bn: 'ডেলিভারড', en: 'Mark Delivered' },
  viewInvoice: { default: 'View Invoice', bn: 'ইনভয়েস দেখুন', en: 'View Invoice' },
  customer: { default: 'Customer', bn: 'কাস্টমার', en: 'Customer' },
  items: { default: 'Items', bn: 'পণ্য', en: 'Items' },
  status: { default: 'Status', bn: 'স্ট্যাটাস', en: 'Status' },
  filterAll: { default: 'All', bn: 'সব', en: 'All' },

  // Menu
  addItem: { default: 'Add Item', bn: 'পণ্য যোগ করুন', en: 'Add Item' },
  editItem: { default: 'Edit Item', bn: 'পণ্য এডিট', en: 'Edit Item' },
  itemName: { default: 'Item Name', bn: 'পণ্যের নাম', en: 'Item Name' },
  price: { default: 'Price', bn: 'মূল্য', en: 'Price' },
  discountPrice: { default: 'Discount Price', bn: 'ছাড় মূল্য', en: 'Discount Price' },
  description: { default: 'Description', bn: 'বিবরণ', en: 'Description' },
  category: { default: 'Category', bn: 'ক্যাটাগরি', en: 'Category' },
  available: { default: 'Available', bn: 'স্টকে আছে', en: 'Available' },
  unavailable: { default: 'Unavailable', bn: 'স্টক শেষ', en: 'Unavailable' },
  save: { default: 'Save', bn: 'সংরক্ষণ', en: 'Save' },
  delete: { default: 'Delete', bn: 'মুছুন', en: 'Delete' },
  cancel: { default: 'Cancel', bn: 'বাতিল', en: 'Cancel' },

  // Settings
  storeInfo: { default: 'Store Information', bn: 'দোকানের তথ্য', en: 'Store Information' },
  storeName: { default: 'Store Name', bn: 'দোকানের নাম', en: 'Store Name' },
  location: { default: 'Location', bn: 'লোকেশন', en: 'Location' },
  hours: { default: 'Opening Hours', bn: 'খোলার সময়', en: 'Opening Hours' },
  delivery: { default: 'Delivery', bn: 'ডেলিভারি', en: 'Delivery' },
  deliveryRadius: { default: 'Delivery Radius (km)', bn: 'ডেলিভারি এরিয়া (কিমি)', en: 'Delivery Radius (km)' },
  allBangladesh: { default: 'Deliver All Bangladesh', bn: 'সারা বাংলাদেশে ডেলিভারি', en: 'Deliver All Bangladesh' },
  storeOpen: { default: 'Store Open', bn: 'দোকান খোলা', en: 'Store Open' },
  acceptingOrders: { default: 'Accepting Orders', bn: 'অর্ডার নিচ্ছি', en: 'Accepting Orders' },
  phone: { default: 'Phone', bn: 'ফোন', en: 'Phone' },
  whatsapp: { default: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ', en: 'WhatsApp' },

  // Notifications
  enableNotifications: { default: 'Enable Notifications', bn: 'নোটিফিকেশন চালু করুন', en: 'Enable Notifications' },
  notifyImportance: {
    default: 'নতুন অর্ডার মিস করবেন না! Notifications চালু রাখুন।',
    bn: 'নতুন অর্ডার মিস করবেন না! নোটিফিকেশন চালু রাখুন।',
    en: "Don't miss new orders! Keep notifications enabled.",
  },
  notifyBlocked: {
    default: 'Notification blocked. ব্রাউজার সেটিংস থেকে allow করুন।',
    bn: 'নোটিফিকেশন ব্লক করা আছে। ব্রাউজার সেটিংস থেকে অনুমতি দিন।',
    en: 'Notifications are blocked. Please allow them in your browser settings.',
  },

  // Misc
  loading: { default: 'Loading...', bn: 'লোড হচ্ছে...', en: 'Loading...' },
  noResults: { default: 'No results found', bn: 'কিছু পাওয়া যায়নি', en: 'No results found' },
  saved: { default: 'Saved successfully', bn: 'সফলভাবে সংরক্ষিত', en: 'Saved successfully' },
  next: { default: 'Next', bn: 'পরবর্তী', en: 'Next' },
  back: { default: 'Back', bn: 'পূর্ববর্তী', en: 'Back' },
  finish: { default: 'Finish', bn: 'সম্পন্ন', en: 'Finish' },
  email: { default: 'Email', bn: 'ইমেইল', en: 'Email' },
  password: { default: 'Password', bn: 'পাসওয়ার্ড', en: 'Password' },
  fullName: { default: 'Full Name', bn: 'পুরো নাম', en: 'Full Name' },
  welcome: { default: 'Welcome to FlashCart Partner', bn: 'ফ্ল্যাশকার্ট পার্টনারে স্বাগতম', en: 'Welcome to FlashCart Partner' },
}

/**
 * Translate a key into the active language.
 * @param {string} key
 * @param {'default'|'bn'|'en'} lang
 */
export function translate(key, lang = 'default') {
  const entry = TRANSLATIONS[key]
  if (!entry) return key
  return entry[lang] || entry.default || entry.en || key
}
