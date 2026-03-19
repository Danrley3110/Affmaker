export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  originalPrice: number;
  promoPrice: number;
  discount: number;
  affiliateLink: string;
  mlProductId?: string;
  clicks: number;
  isPopular?: boolean;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface VideoStory {
  id: string;
  videoUrl: string;
  productName: string;
  affiliateLink: string;
}

export interface SiteSettings {
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  fontFamily: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  adminPassword?: string;
}
