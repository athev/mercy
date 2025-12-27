
import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Search, Heart, Star, ChevronLeft, Minus, Plus, Share2, Filter } from 'lucide-react';
import { Button } from './ui/Button';

// Extended Mock Data to populate the UI
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'MERCY Glasses Pro',
    price: 12990000,
    description: 'Top-tier AI smart glasses featuring real-time translation HUD, 4K camera for object recognition, and bone conduction audio.',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
    features: ['Real-time Translation HUD', '12MP AI Camera', 'Bone Conduction Audio', 'Titanium Frame'],
    category: 'Glasses',
    rating: 4.9,
    reviews: 128,
    isFeatured: true,
    isNew: true
  },
  {
    id: '2',
    name: 'MERCY Watch Elite',
    price: 8990000,
    description: 'Seamlessly connects with your glasses. Health monitoring and quick-access translation controls on your wrist.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    features: ['Bio-Sensors', 'Holographic Display', '7-Day Battery', 'Gesture Control'],
    category: 'Watch',
    rating: 4.8,
    reviews: 89,
    isNew: false
  },
  {
    id: '3',
    name: 'Mercy Buds X',
    price: 4500000,
    description: 'High-fidelity audio with active noise cancellation and dedicated AI translation processor.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop',
    features: ['Lossless Audio', 'Live Translate Mode', 'Voice Isolation', 'IPX7 Waterproof'],
    category: 'Audio',
    rating: 4.7,
    reviews: 245,
    isNew: true
  },
  {
    id: '4',
    name: 'Mercy Home Hub',
    price: 5990000,
    description: 'Central control unit for your Mercy ecosystem. Always-on listening for home automation and translation.',
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc0d5?q=80&w=800&auto=format&fit=crop',
    features: ['Voice Control', 'Matter Support', 'Privacy First', 'Room-scale Audio'],
    category: 'Robot',
    rating: 4.6,
    reviews: 56,
    isNew: false
  },
   {
    id: '5',
    name: 'Mercy Lens Basic',
    price: 6990000,
    description: 'Entry level smart glasses for everyday use. Lightweight and stylish.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    features: ['Notifications', 'Audio', 'Lightweight', 'Blue Light Filter'],
    category: 'Glasses',
    rating: 4.5,
    reviews: 312,
    isNew: false
  }
];

const CATEGORIES = ['All', 'Glasses', 'Watch', 'Audio', 'Robot'];

export const Marketplace: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(2);
  const [isAnimatingCart, setIsAnimatingCart] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const addToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsAnimatingCart(true);
    setCartCount(prev => prev + 1);
    setTimeout(() => setIsAnimatingCart(false), 300);
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Don't show the featured product in the grid if we are on "All" tab to avoid duplication, 
    // unless searching or filtering specifically
    if (activeCategory === 'All' && !searchQuery && p.isFeatured) return false;
    return matchesCategory && matchesSearch;
  });

  const featuredProduct = PRODUCTS.find(p => p.isFeatured);

  // --- Product Detail View ---
  if (selectedProduct) {
    return (
        <div className="h-full bg-black text-white overflow-y-auto animate-in slide-in-from-right duration-300 z-50 relative pb-24">
            {/* Nav */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft className="text-white" />
                </button>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Heart className="text-white w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Share2 className="text-white w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Image */}
            <div className="w-full h-[50vh] relative">
                <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
            </div>

            {/* Content */}
            <div className="px-6 -mt-12 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h1 className="text-3xl font-bold">{selectedProduct.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{selectedProduct.rating}</span>
                            <span className="text-sm text-zinc-500">({selectedProduct.reviews} reviews)</span>
                        </div>
                    </div>
                </div>

                <div className="text-2xl font-bold text-white mb-6">
                    {formatPrice(selectedProduct.price)}
                </div>

                <p className="text-zinc-400 leading-relaxed mb-8">
                    {selectedProduct.description}
                </p>

                <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Key Features</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {selectedProduct.features.map((feature, i) => (
                            <div key={i} className="bg-zinc-900 border border-white/5 rounded-xl p-3 text-xs md:text-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></div>
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Sticky Action Bar */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/10 pb-4">
                     <div className="flex items-center gap-4 bg-zinc-900 rounded-full px-4 py-3 border border-white/10">
                        <Minus className="w-4 h-4 cursor-pointer hover:text-white text-zinc-400" />
                        <span className="font-bold">1</span>
                        <Plus className="w-4 h-4 cursor-pointer hover:text-white text-zinc-400" />
                     </div>
                     <Button className="flex-1 rounded-full py-4 bg-white text-black hover:bg-zinc-200" onClick={() => addToCart()}>
                        Add to Cart
                     </Button>
                </div>
            </div>
        </div>
    );
  }

  // --- Main Marketplace View ---
  return (
    <div className="h-full bg-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between sticky top-0 z-10 bg-black/90 backdrop-blur-md">
        <div>
            <h1 className="text-2xl font-bold">MERCY Store</h1>
            <p className="text-xs text-zinc-500 tracking-widest uppercase">Premium AI Ecosystem</p>
        </div>
        <button className="relative p-2 bg-zinc-900 rounded-full border border-white/5 hover:bg-zinc-800 transition-colors">
            <ShoppingCart className="w-5 h-5 text-white" />
            {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full transition-transform ${isAnimatingCart ? 'scale-150' : 'scale-100'}`}>
                    {cartCount}
                </span>
            )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-6 no-scrollbar">
        {/* Search */}
        <div className="mt-4 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 group-focus-within:text-white transition-colors" />
            <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-full py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-600"
            />
        </div>

        {/* Categories */}
        <div className="flex gap-3 mt-6 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`
                        px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                        ${activeCategory === cat 
                            ? 'bg-white text-black shadow-lg shadow-white/10' 
                            : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-white'}
                    `}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Featured Product (Only show on 'All' tab and no search) */}
        {activeCategory === 'All' && !searchQuery && featuredProduct && (
            <div className="mt-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Featured</span>
                    <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
                </div>
                
                <div 
                    onClick={() => setSelectedProduct(featuredProduct)}
                    className="group relative w-full aspect-[4/3] bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 cursor-pointer"
                >
                    <img 
                        src={featuredProduct.image} 
                        alt={featuredProduct.name} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold mb-1">{featuredProduct.name}</h2>
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-medium text-zinc-300">{featuredProduct.rating} ({featuredProduct.reviews} reviews)</span>
                                </div>
                                <p className="text-lg font-bold">{formatPrice(featuredProduct.price)}</p>
                            </div>
                            <Button size="sm" onClick={(e) => addToCart(e)} className="rounded-full px-4 bg-white text-black hover:bg-zinc-200">
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Product Grid */}
        <div className="mt-8">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                    {searchQuery ? 'Search Results' : 'All Products'}
                </h3>
                <button className="p-2 text-zinc-500 hover:text-white">
                    <Filter className="w-4 h-4" />
                </button>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                    <div 
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="group flex flex-col gap-3 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <div className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden relative border border-white/5">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300" 
                            />
                            <button className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-white hover:text-black transition-colors">
                                <Heart className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div>
                            <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm truncate pr-2">{product.name}</h4>
                            </div>
                            <p className="text-xs text-zinc-500 mb-1">{product.category}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm font-bold text-zinc-200">{formatPrice(product.price)}</span>
                                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    {product.rating}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
             
             {filteredProducts.length === 0 && (
                 <div className="py-12 text-center text-zinc-500">
                     <p>No products found.</p>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};
