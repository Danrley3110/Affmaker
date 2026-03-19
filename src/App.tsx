import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  Share2, 
  X, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Gem,
  BookOpen,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Play,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Banner, VideoStory, SiteSettings } from './types';
import { LucideIcon } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_VIDEOS, INITIAL_SETTINGS } from './constants';
import { GoogleGenAI, Type } from "@google/genai";

// --- Components ---

const ProductCard: React.FC<{ product: Product, onOfferClick: (p: Product) => void }> = ({ product, onOfferClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative group"
    >
      {product.discount > 0 && (
        <div className="absolute top-3 left-0 z-10 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-r-full shadow-lg transform -rotate-12 origin-left">
          -{product.discount}% OFF 🔥
        </div>
      )}
      
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">{product.category}</span>
        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-gray-900">R$ {product.promoPrice.toFixed(2)}</span>
            {product.originalPrice > product.promoPrice && (
              <span className="text-xs text-gray-400 line-through">R$ {product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <button 
            onClick={() => onOfferClick(product)}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-md shadow-primary/20"
          >
            Ver Oferta
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ title, icon: Icon, color = "text-primary" }: { title: string, icon: LucideIcon, color?: string }) => (
  <div className="flex items-center gap-2 mb-6">
    <div className={`p-2 rounded-lg bg-white shadow-sm ${color}`}>
      <Icon size={20} />
    </div>
    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{title}</h2>
  </div>
);

// --- Main App ---

export default function App() {
  // State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('affili_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [banners, setBanners] = useState<Banner[]>(() => {
    const saved = localStorage.getItem('affili_banners');
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });
  const [videos] = useState<VideoStory[]>(() => {
    const saved = localStorage.getItem('affili_videos');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('affili_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.adminPassword) parsed.adminPassword = INITIAL_SETTINGS.adminPassword;
      return parsed;
    }
    return INITIAL_SETTINGS;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    return localStorage.getItem('affili_accepted_terms') === 'true';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [adminTab, setAdminTab] = useState<'config' | 'products'>('config');
  const [isExtracting, setIsExtracting] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('affili_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('affili_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('affili_settings', JSON.stringify(settings));
  }, [settings]);

  // Auto Banner
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === settings.adminPassword) {
      setIsLoginOpen(false);
      setIsAdminOpen(true);
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Senha incorreta');
    }
  };

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    localStorage.setItem('affili_accepted_terms', 'true');
    setIsPrivacyOpen(false);
  };

  const handleOfferClick = (product: Product) => {
    setProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, clicks: p.clicks + 1 } : p
    ));
    window.open(product.affiliateLink, '_blank');
  };

  const shareSite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AffiliMarket',
        text: 'Confira os melhores achadinhos da internet!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(products.map(p => p.category)));

  const handleAutoExtract = async (productId: string, url: string) => {
    if (!url || !url.startsWith('http')) return;
    
    setIsExtracting(productId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract product information from this URL: ${url}. Return ONLY a JSON object with these fields: name, description, promoPrice (number), discount (number), image (URL). If you cannot find a field, leave it empty.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              promoPrice: { type: Type.NUMBER },
              discount: { type: Type.NUMBER },
              image: { type: Type.STRING }
            }
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        if (data) {
          setProducts(prev => prev.map(p => {
            if (p.id === productId) {
              return {
                ...p,
                name: data.name || p.name,
                description: data.description || p.description,
                promoPrice: data.promoPrice || p.promoPrice,
                discount: data.discount || p.discount,
                image: data.image || p.image,
                affiliateLink: url
              };
            }
            return p;
          }));
        }
      }
    } catch (error) {
      console.error("Extraction error:", error);
    } finally {
      setIsExtracting(null);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ '--primary': settings.primaryColor } as React.CSSProperties}>
      <style>{`
        :root { --primary: ${settings.primaryColor}; }
        .bg-primary { background-color: var(--primary); }
        .text-primary { color: var(--primary); }
        .border-primary { border-color: var(--primary); }
        .shadow-primary { --tw-shadow-color: var(--primary); }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-bottom border-gray-100 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic shadow-lg shadow-primary/30">A</div>
              <h1 className="text-xl font-black tracking-tighter text-gray-900 hidden sm:block">AFFILI<span className="text-primary">MARKET</span></h1>
            </div>
          </div>

          <div className="flex-grow max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="O que você está procurando?" 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={shareSite} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all active:scale-90">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-xl font-black">MENU</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categorias</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => { setSearchTerm(cat); setIsSidebarOpen(false); }}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/5 hover:text-primary font-medium transition-all flex items-center justify-between group"
                      >
                        {cat}
                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Redes Sociais</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <a href={settings.instagram} target="_blank" className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-pink-50 text-pink-600 hover:scale-105 transition-transform">
                      <Instagram size={24} />
                      <span className="text-[10px] font-bold">Insta</span>
                    </a>
                    <a href={settings.facebook} target="_blank" className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:scale-105 transition-transform">
                      <Facebook size={24} />
                      <span className="text-[10px] font-bold">Face</span>
                    </a>
                    <a href={settings.whatsapp} target="_blank" className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-green-50 text-green-600 hover:scale-105 transition-transform">
                      <MessageCircle size={24} />
                      <span className="text-[10px] font-bold">Whats</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100">
                <button 
                  onClick={() => { setIsLoginOpen(true); setIsSidebarOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  <SettingsIcon size={20} />
                  Painel Administrativo
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Acesso Restrito</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Digite a senha do administrador</p>
                </div>
                <button onClick={() => { setIsLoginOpen(false); setLoginError(''); setLoginPassword(''); }} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-4 bg-gray-100 rounded-2xl outline-none border-2 transition-all font-bold ${loginError ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-primary'}`}
                    autoFocus
                  />
                  {loginError && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  Entrar no Painel
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal / Pop-up */}
      <AnimatePresence>
        {(!hasAcceptedTerms || isPrivacyOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Política de Privacidade e Termos</h2>
                </div>
                {hasAcceptedTerms && (
                  <button onClick={() => setIsPrivacyOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-all">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-2">Aviso Importante ao Usuário</h3>
                  <p className="text-sm">Este site atua exclusivamente como plataforma de divulgação de produtos afiliados, podendo conter links de redirecionamento para sites de terceiros, como Mercado Livre, Shopee e outros parceiros.</p>
                </div>

                <p className="font-medium">Ao acessar e utilizar este site, você concorda com os seguintes termos:</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold flex items-center gap-2 text-gray-900 mb-2">
                      <span>🛒</span> Sobre Compras e Responsabilidade
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Este site <strong>NÃO</strong> realiza vendas diretas.</li>
                      <li>Não somos responsáveis por: Pagamentos, Entregas, Trocas ou devoluções, Qualidade ou funcionamento dos produtos.</li>
                      <li>Todas as transações são realizadas diretamente nos sites parceiros, sendo estes totalmente responsáveis pelo processo de compra.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold flex items-center gap-2 text-gray-900 mb-2">
                      <span>🔗</span> Sobre os Links
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Os produtos exibidos aqui contêm links de afiliados.</li>
                      <li>Ao clicar, você será redirecionado para o site oficial do vendedor.</li>
                      <li>Podemos receber uma comissão sem custo adicional para você.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold flex items-center gap-2 text-gray-900 mb-2">
                      <span>🔐</span> Privacidade
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Este site pode coletar dados básicos de navegação, como cookies, para melhorar sua experiência.</li>
                      <li>Nenhuma informação sensível é armazenada ou vendida.</li>
                      <li>Sites parceiros possuem suas próprias políticas de privacidade.</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <h4 className="font-bold flex items-center gap-2 text-orange-900 mb-2">
                      <span>⚠️</span> Isenção de Responsabilidade
                    </h4>
                    <p className="text-sm text-orange-900">Este site atua apenas como intermediador de divulgação, não possuindo qualquer vínculo direto com os produtos, vendedores ou processos financeiros.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
                {!hasAcceptedTerms ? (
                  <button 
                    onClick={handleAcceptTerms}
                    className="w-full sm:w-auto px-12 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Aceitar e Continuar
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPrivacyOpen(false)}
                    className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm"
                  >
                    Fechar
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-12">
        {/* Banner Carousel */}
        {banners.length > 0 && !searchTerm && (
          <div className="relative rounded-3xl overflow-hidden shadow-xl group h-[200px] sm:h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentBanner}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img 
                  src={banners[currentBanner].image} 
                  alt={banners[currentBanner].title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 sm:p-16">
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-5xl font-black text-white mb-2 sm:mb-4 max-w-xl"
                  >
                    {banners[currentBanner].title}
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm sm:text-xl text-white/80 mb-4 sm:mb-8"
                  >
                    {banners[currentBanner].subtitle}
                  </motion.p>
                  <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-fit px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm hover:scale-105 transition-transform shadow-lg shadow-primary/30"
                  >
                    Confira Agora
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            <button 
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${currentBanner === idx ? 'w-8 bg-primary' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Video Stories */}
        {videos.length > 0 && !searchTerm && (
          <section>
            <SectionHeader title="Achadinhos em Vídeo" icon={Play} color="text-red-500" />
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {videos.map(video => (
                <motion.div 
                  key={video.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 w-40 sm:w-56 video-card-aspect rounded-3xl overflow-hidden relative shadow-lg snap-start group"
                >
                  <video 
                    src={video.videoUrl} 
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                    <p className="text-white text-xs font-bold line-clamp-2 mb-2">{video.productName}</p>
                    <a 
                      href={video.affiliateLink} 
                      target="_blank"
                      className="w-full py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase text-center hover:bg-primary hover:text-white transition-colors"
                    >
                      Ver Produto
                    </a>
                  </div>
                  <div className="absolute top-4 right-4 p-1.5 bg-black/20 backdrop-blur-md rounded-full text-white">
                    <Play size={12} fill="white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Product Sections */}
        {searchTerm ? (
          <section>
            <SectionHeader title={`Resultados para "${searchTerm}"`} icon={Search} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} onOfferClick={handleOfferClick} />)}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 font-medium">Nenhum produto encontrado.</p>
              </div>
            )}
          </section>
        ) : (
          <>
            <section>
              <SectionHeader title="Ofertas do Dia" icon={Flame} color="text-orange-500" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {products.filter(p => p.discount >= 20).map(p => <ProductCard key={p.id} product={p} onOfferClick={handleOfferClick} />)}
              </div>
            </section>

            <section>
              <SectionHeader title="Produtos Mais Populares" icon={Trophy} color="text-yellow-500" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {products.sort((a, b) => b.clicks - a.clicks).slice(0, 5).map(p => <ProductCard key={p.id} product={p} onOfferClick={handleOfferClick} />)}
              </div>
            </section>

            <section>
              <SectionHeader title="Achadinhos da Internet" icon={Gem} color="text-blue-500" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {products.filter(p => p.category === 'Eletrônicos').map(p => <ProductCard key={p.id} product={p} onOfferClick={handleOfferClick} />)}
              </div>
            </section>

            <section>
              <SectionHeader title="Livros e Ebooks" icon={BookOpen} color="text-purple-500" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {products.filter(p => p.category === 'Livros e ebooks').map(p => <ProductCard key={p.id} product={p} onOfferClick={handleOfferClick} />)}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Painel Administrativo</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Gerencie seu marketplace</p>
                </div>
                <button onClick={() => setIsAdminOpen(false)} className="p-3 hover:bg-gray-200 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-12">
                {/* Admin Tabs */}
                <div className="flex gap-8 border-b border-gray-100 mb-8">
                  <button 
                    onClick={() => setAdminTab('config')}
                    className={`pb-4 font-black text-sm uppercase tracking-widest transition-all relative ${adminTab === 'config' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Configurações
                    {adminTab === 'config' && (
                      <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                    )}
                  </button>
                  <button 
                    onClick={() => setAdminTab('products')}
                    className={`pb-4 font-black text-sm uppercase tracking-widest transition-all relative ${adminTab === 'products' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Produtos
                    {adminTab === 'products' && (
                      <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                    )}
                  </button>
                </div>

                {adminTab === 'config' ? (
                  <div className="space-y-12">
                    {/* Banners Management */}
                    <section>
                      <h3 className="text-lg font-black uppercase tracking-tight mb-6">Gerenciar Banners</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {banners.map(b => (
                          <div key={b.id} className="p-6 bg-gray-50 rounded-3xl space-y-4">
                            <img src={b.image} className="w-full h-32 object-cover rounded-2xl mb-4" referrerPolicy="no-referrer" />
                            <input 
                              className="w-full p-3 bg-white rounded-xl text-sm font-bold outline-none border border-gray-200 focus:border-primary"
                              value={b.title}
                              placeholder="Título do Banner"
                              onChange={(e) => {
                                setBanners(prev => prev.map(item => item.id === b.id ? { ...item, title: e.target.value } : item));
                              }}
                            />
                            <input 
                              className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-gray-200 focus:border-primary"
                              value={b.image}
                              placeholder="URL da Imagem"
                              onChange={(e) => {
                                setBanners(prev => prev.map(item => item.id === b.id ? { ...item, image: e.target.value } : item));
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Settings Management */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-6">Cores e Estilo</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <span className="text-sm font-bold">Cor Principal</span>
                            <input 
                              type="color" 
                              value={settings.primaryColor}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, primaryColor: e.target.value }));
                              }}
                              className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <span className="text-sm font-bold">Fonte do Site</span>
                            <select 
                              value={settings.fontFamily}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, fontFamily: e.target.value }));
                              }}
                              className="bg-transparent font-bold text-sm outline-none"
                            >
                              <option value="Inter">Inter (Padrão)</option>
                              <option value="Montserrat">Montserrat</option>
                              <option value="Poppins">Poppins</option>
                              <option value="Roboto">Roboto</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-6">Redes Sociais</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                            <Instagram size={20} className="text-pink-600" />
                            <input 
                              className="flex-grow bg-transparent text-sm outline-none"
                              value={settings.instagram}
                              placeholder="Link Instagram"
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, instagram: e.target.value }));
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                            <Facebook size={20} className="text-blue-600" />
                            <input 
                              className="flex-grow bg-transparent text-sm outline-none"
                              value={settings.facebook}
                              placeholder="Link Facebook"
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, facebook: e.target.value }));
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                            <MessageCircle size={20} className="text-green-600" />
                            <input 
                              className="flex-grow bg-transparent text-sm outline-none"
                              value={settings.whatsapp}
                              placeholder="Link WhatsApp"
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, whatsapp: e.target.value }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Security Settings */}
                    <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
                      <h3 className="text-lg font-black uppercase tracking-tight mb-6 text-red-900">Configurações de Segurança</h3>
                      <div className="max-w-md space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">Alterar Senha do Painel</label>
                          <div className="flex gap-3">
                            <input 
                              type="text" 
                              className="flex-grow p-3 bg-white rounded-xl text-sm font-bold outline-none border border-red-200 focus:border-red-500"
                              value={settings.adminPassword}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, adminPassword: e.target.value }));
                              }}
                            />
                            <div className="p-3 bg-red-500 text-white rounded-xl flex items-center justify-center">
                              <Save size={18} />
                            </div>
                          </div>
                          <p className="text-[10px] text-red-400 font-medium ml-1">Cuidado: Não esqueça sua nova senha!</p>
                        </div>
                      </div>
                    </section>
                  </div>
                ) : (
                  /* Products Management */
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black uppercase tracking-tight">Gerenciar Produtos</h3>
                      <button 
                        onClick={() => {
                          const newP: Product = {
                            id: Date.now().toString(),
                            name: 'Novo Produto',
                            description: '',
                            category: 'Geral',
                            image: 'https://picsum.photos/seed/new/400/400',
                            originalPrice: 0,
                            promoPrice: 0,
                            discount: 0,
                            affiliateLink: '',
                            clicks: 0
                          };
                          setProducts(prev => [newP, ...prev]);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                      >
                        <Plus size={18} /> Adicionar
                      </button>
                    </div>
                    <div className="space-y-4">
                      {products.map(p => (
                        <div key={p.id} className="p-4 bg-gray-50 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div className="flex items-center gap-3 col-span-1 md:col-span-2">
                            <div className="relative group/img">
                              <img src={p.image} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              {isExtracting === p.id && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                  <Loader2 className="text-white animate-spin" size={16} />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow space-y-1">
                              <input 
                                className="w-full bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-primary"
                                value={p.name}
                                placeholder="Nome do Produto"
                                onChange={(e) => {
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, name: e.target.value } : item));
                                }}
                              />
                              <input 
                                className="w-full bg-transparent text-[10px] text-gray-500 outline-none border-b border-transparent focus:border-primary"
                                value={p.image}
                                placeholder="Link da imagem do produto"
                                onChange={(e) => {
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, image: e.target.value } : item));
                                }}
                              />
                              <input 
                                className="w-full bg-transparent text-[10px] text-gray-500 outline-none border-b border-transparent focus:border-primary"
                                value={p.description}
                                placeholder="Descrição do produto"
                                onChange={(e) => {
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, description: e.target.value } : item));
                                }}
                              />
                              <div className="relative flex items-center">
                                <input 
                                  className="w-full bg-transparent text-[10px] text-gray-500 outline-none border-b border-transparent focus:border-primary pr-8"
                                  value={p.affiliateLink}
                                  placeholder="Link do produto (Cole aqui para extrair dados)"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, affiliateLink: val } : item));
                                  }}
                                  onPaste={(e) => {
                                    const pastedText = e.clipboardData.getData('text');
                                    if (pastedText.startsWith('http')) {
                                      handleAutoExtract(p.id, pastedText);
                                    }
                                  }}
                                />
                                {isExtracting === p.id ? (
                                  <Loader2 size={12} className="absolute right-0 animate-spin text-primary" />
                                ) : (
                                  <Sparkles size={12} className="absolute right-0 text-primary opacity-50" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-gray-400">Preço</span>
                              <input 
                                type="number"
                                className="bg-transparent font-bold text-sm outline-none"
                                value={p.promoPrice}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, promoPrice: val } : item));
                                }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold text-gray-400">Porcentagem de oferta</span>
                              <input 
                                type="number"
                                className="bg-transparent font-bold text-sm outline-none"
                                value={p.discount}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, discount: val } : item));
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setProducts(prev => prev.filter(item => item.id !== p.id));
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setIsAdminOpen(false)}
                  className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-gray-800 transition-all"
                >
                  <Save size={20} /> Salvar e Sair
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic">A</div>
              <h1 className="text-xl font-black tracking-tighter">AFFILI<span className="text-primary">MARKET</span></h1>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              O melhor catálogo de achadinhos da internet. Encontre as melhores ofertas das maiores lojas do mundo em um só lugar.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-500">Links Rápidos</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><button onClick={() => setSearchTerm('')} className="hover:text-primary transition-colors">Início</button></li>
              <li><button onClick={() => setSearchTerm('Eletrônicos')} className="hover:text-primary transition-colors">Eletrônicos</button></li>
              <li><button onClick={() => setSearchTerm('Livros')} className="hover:text-primary transition-colors">Livros</button></li>
              <li><button onClick={() => setIsPrivacyOpen(true)} className="hover:text-primary transition-colors">Política de Privacidade</button></li>
              <li><button onClick={() => setIsLoginOpen(true)} className="hover:text-primary transition-colors">Painel ADM</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-500">Siga-nos</h4>
            <div className="flex gap-4">
              <a href={settings.instagram} className="p-3 bg-white/5 rounded-2xl hover:bg-primary transition-all"><Instagram size={20} /></a>
              <a href={settings.facebook} className="p-3 bg-white/5 rounded-2xl hover:bg-primary transition-all"><Facebook size={20} /></a>
              <a href={settings.whatsapp} className="p-3 bg-white/5 rounded-2xl hover:bg-primary transition-all"><MessageCircle size={20} /></a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 text-center text-gray-500 text-xs">
          © 2026 AffiliMarket. Todos os direitos reservados. Este site contém links de afiliados.
        </div>
      </footer>
    </div>
  );
}
