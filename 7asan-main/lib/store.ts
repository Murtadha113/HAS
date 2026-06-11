// =============================
// مخزن البيانات
// =============================

export type Category = {
  id: string;
  name: string;
  order: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUSD: number;
  type: "course" | "book" | "other";
  categoryId?: string;
  categoryName?: string;
  image: string;
  paymentMode: "direct" | "external";
  externalLink?: string;
  benfitLink?: string;
  downloadLink?: string;
  active: boolean;
};

export type AdPackage = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  image?: string;
  active: boolean;
  highlighted: boolean;
};

export type AdRequest = {
  id: string;
  packageId: string;
  packageName: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  message: string;
  createdAt: string;
  status: "new" | "contacted" | "done";
};

export type Order = {
  id: string;
  productId: string;
  productTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  location: "bahrain" | "outside";
  paymentProof?: string;
  status: "pending" | "confirmed" | "delivered";
  createdAt: string;
};

// =============================
// أنواع جديدة
// =============================

export type ServiceCategory = {
  id: string;
  name: string;
  order: number;
};

export type Service = {

  id: string;
  title: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  price?: number;
  deliveryTime?: string;
  active: boolean;
  order: number;
};

export type ServiceRequest = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  businessName: string;
  phone: string;
  instagram: string;
  extra: string;
  createdAt: string;
  status: "new" | "contacted" | "done";
};

export type SiteSettings = {
  benfitNumber: string;
  benfitIban: string;
  benfitQrUrl: string;
  whatsapp: string;
  email: string;
  telegramNotify: string;
  // إعدادات جديدة
  aboutText: string;
  instagramUrl: string;
  tiktokUrl: string;
  instagramHandle: string;
  tiktokHandle: string;
};

export type Tool = {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  category?: string;
  active: boolean;
  order: number;
};
