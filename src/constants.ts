import { Product, Banner, VideoStory, SiteSettings } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Smartphone Premium X1',
    description: 'O melhor smartphone para fotos e jogos.',
    category: 'Eletrônicos',
    image: 'https://picsum.photos/seed/phone/400/400',
    originalPrice: 2999,
    promoPrice: 2399,
    discount: 20,
    affiliateLink: 'https://amazon.com.br',
    clicks: 150,
    isPopular: true
  },
  {
    id: '2',
    name: 'Fone de Ouvido Noise Cancelling',
    description: 'Silêncio total e som de alta fidelidade.',
    category: 'Eletrônicos',
    image: 'https://picsum.photos/seed/headphones/400/400',
    originalPrice: 899,
    promoPrice: 629,
    discount: 30,
    affiliateLink: 'https://shopee.com.br',
    clicks: 85,
    isPopular: true
  },
  {
    id: '3',
    name: 'Livro: O Poder do Hábito',
    description: 'Transforme sua vida mudando seus hábitos.',
    category: 'Livros e ebooks',
    image: 'https://picsum.photos/seed/book/400/400',
    originalPrice: 59.90,
    promoPrice: 39.90,
    discount: 33,
    affiliateLink: 'https://mercadolivre.com.br',
    clicks: 200,
    isPopular: false
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: '1',
    image: 'https://picsum.photos/seed/banner1/1200/400',
    title: 'Ofertas da Semana',
    subtitle: 'Até 50% de desconto nos melhores eletrônicos',
    link: '#'
  },
  {
    id: '2',
    image: 'https://picsum.photos/seed/banner2/1200/400',
    title: 'Achadinhos Incríveis',
    subtitle: 'Produtos que você não sabia que precisava',
    link: '#'
  }
];

export const INITIAL_VIDEOS: VideoStory[] = [
  {
    id: '1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-3627-large.mp4',
    productName: 'Lâmpada RGB Inteligente',
    affiliateLink: '#'
  },
  {
    id: '2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-white-screen-4022-large.mp4',
    productName: 'Suporte Articulado',
    affiliateLink: '#'
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  primaryColor: '#ff6321',
  secondaryColor: '#1a1a1a',
  buttonColor: '#ff6321',
  fontFamily: 'Inter',
  instagram: 'https://instagram.com',
  facebook: 'https://facebook.com',
  whatsapp: 'https://wa.me/5500000000000',
  adminPassword: '123ADM'
};
