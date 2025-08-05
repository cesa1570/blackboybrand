import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Heart,
  Package,
  Star,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  Filter,
  Sparkles
} from "lucide-react";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("stock");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [favorites, setFavorites] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    NProgress.start();
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      let prods = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        rating: doc.data().rating || 4.5,
        reviewCount: doc.data().reviewCount || Math.floor(Math.random() * 100) + 10,
        category: doc.data().category || "เสื้อผ้า",
        isNew: doc.data().createdAt && (new Date() - doc.data().createdAt.toDate() < 7 * 24 * 60 * 60 * 1000),
        discount: doc.data().discount || 0
      }));

      prods.sort((a, b) => b.stock - a.stock);
      setProducts(prods);
    } catch (err) {
      toast.error("โหลดสินค้าล้มเหลว");
      console.error("โหลดสินค้าล้มเหลว", err);
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  const handleAddToCart = (product) => {
    if (!user) {
      toast("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า", { icon: "🔒", duration: 3000 });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (product.stock <= 0) {
      toast.error("สินค้าหมด");
      return;
    }

    addToCart(product);
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว 🛒`, { duration: 2000 });
  };

  const toggleFavorite = (productId) => {
    if (!user) {
      toast("กรุณาเข้าสู่ระบบเพื่อเพิ่มรายการโปรด", { icon: "❤️" });
      return;
    }

    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast.success("ลบออกจากรายการโปรดแล้ว");
    } else {
      newFavorites.add(productId);
      toast.success("เพิ่มในรายการโปรดแล้ว");
    }
    setFavorites(newFavorites);
  };

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ["all", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "price":
          comparison = a.price - b.price;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name, "th");
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "stock":
          comparison = a.stock - b.stock;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, sortOrder]);

  const ProductCard = ({ product, index }) => {
    const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

    return (
      <div
        className={`group relative bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl hover:shadow-red-500/20 border border-gray-100 ${
          viewMode === "list" ? "flex" : "flex flex-col"
        } animate-fadeInUp`}
        style={{
          animationDelay: `${index * 80}ms`,
          animationFillMode: "both"
        }}
      >
        {/* Gradient Border Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-500 to-purple-600 rounded-3xl p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="bg-white rounded-3xl h-full w-full"></div>
        </div>

        {/* Image Container */}
        <div className={`relative overflow-hidden z-10 ${viewMode === "list" ? "w-48 flex-shrink-0" : "w-full"}`}>
          <div className="relative">
            <img
              src={product.img}
              alt={product.name}
              className={`${viewMode === "list" ? "h-full" : "h-80"} w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110`}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x400?text=No+Image";
              }}
            />
            
            {/* Image Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Enhanced Badges */}
          <div className="absolute top-4 left-4 space-y-2 z-20">
            {product.isNew && (
              <div className="relative">
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-pulse">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  ใหม่
                </span>
              </div>
            )}
            {product.discount > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-bounce">
                -{product.discount}%
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                เหลือน้อย
              </span>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-8 group-hover:translate-x-0 space-y-3 z-20">
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`p-3 rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                favorites.has(product.id) 
                  ? "bg-red-500 text-white shadow-red-500/50" 
                  : "bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white"
              }`}
            >
              <Heart className="h-5 w-5" fill={favorites.has(product.id) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => navigate(`/product/${product.id}`)}
              className="p-3 bg-white/90 text-gray-600 hover:text-blue-500 hover:bg-white rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-110"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>

          {/* Enhanced Stock Overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="text-center">
                <Package className="h-12 w-12 text-white mx-auto mb-2 opacity-80" />
                <span className="text-white font-bold text-xl">หมดแล้ว</span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Product Info */}
        <div className={`p-6 flex flex-col z-10 bg-white relative ${viewMode === "list" ? "flex-1" : ""}`}>
          {/* Product Name and Category */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <span className="text-xs font-semibold text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-full ml-3 whitespace-nowrap border">
              {product.category}
            </span>
          </div>

          {/* Enhanced Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-full">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700 ml-2">
                {product.rating}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          {/* Description for List View */}
          {product.description && viewMode === "list" && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Enhanced Price Display */}
          <div className="mb-4">
            {product.discount > 0 ? (
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  ฿{discountedPrice.toLocaleString()}
                </span>
                <span className="text-base text-gray-500 line-through opacity-75">
                  ฿{product.price.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ประหยัด ฿{(product.price - discountedPrice).toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                ฿{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Enhanced Stock Info */}
          <div className="flex items-center mb-6">
            <div className={`flex items-center px-3 py-2 rounded-full ${
              product.stock > 10 ? 'bg-green-100 text-green-700' :
              product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
              product.stock > 0 ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              <Package className="h-4 w-4 mr-2" />
              <span className="text-sm font-semibold">
                คงเหลือ: {product.stock} ชิ้น
              </span>
            </div>
          </div>

          {/* Enhanced Add to Cart Button */}
          <button
            className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-500 flex items-center justify-center space-x-3 relative overflow-hidden group/btn ${
              product.stock > 0
                ? "bg-gradient-to-r from-red-600 via-red-500 to-rose-500 hover:from-red-700 hover:via-red-600 hover:to-rose-600 text-white shadow-lg hover:shadow-2xl hover:shadow-red-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed"
            }`}
            onClick={() => handleAddToCart(product)}
            disabled={product.stock <= 0}
          >
            {/* Button Background Effect */}
            {product.stock > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
            )}
            
            <ShoppingCart className="h-5 w-5 z-10" />
            <span className="z-10 text-base">
              {product.stock > 0 ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}
            </span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 px-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Enhanced Loading Header */}
            <div className="text-center mb-12">
              <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-48 mx-auto"></div>
            </div>
            
            {/* Enhanced Loading Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-8 bg-gray-200 rounded-xl w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-2/3"></div>
                    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="productgrid" className="py-16 px-6 bg-gradient-to-br from-gray-50 via-white to-red-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto text-left">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="text-6xl font-bold bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent mb-6 animate-fadeInDown">
              สินค้า
            </h2>
            <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Enhanced Search and Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-rose-500/5 pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 lg:space-x-6 relative z-10">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-lg placeholder-gray-400"
              />
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center space-x-4">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  showFilters ? 'bg-red-500 text-white' : 'bg-white border-2 border-gray-200 hover:border-red-300'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 bg-white/80 backdrop-blur-sm text-base font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "ทั้งหมด" : cat}
                  </option>
                ))}
              </select>

              {/* Sort Controls */}
              <div className="flex items-center bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-4 border-none focus:ring-0 bg-transparent text-base font-medium"
                >
                  <option value="stock">จำนวนคงเหลือ</option>
                  <option value="price">ราคา</option>
                  <option value="name">ชื่อ</option>
                  <option value="rating">คะแนน</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-4 hover:bg-gray-50 transition-colors border-l-2 border-gray-200"
                >
                  {sortOrder === "asc" ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
                </button>
              </div>

              {/* Enhanced View Mode */}
              <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === "grid" ? "bg-white shadow-lg scale-105" : "hover:bg-gray-200"
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === "list" ? "bg-white shadow-lg scale-105" : "hover:bg-gray-200"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Enhanced Refresh */}
              <button
                onClick={fetchProducts}
                className="p-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Enhanced Results Count */}
          <div className="mt-6 flex items-center justify-between text-base">
            <div className="text-gray-600">
              แสดง <span className="font-bold text-red-600">{filteredProducts.length}</span> รายการ 
              จากทั้งหมด <span className="font-bold">{products.length}</span> รายการ
            </div>
            {searchTerm && (
              <div className="text-gray-500">
                ค้นหา: "<span className="font-semibold text-red-600">{searchTerm}</span>"
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <Package className="h-24 w-24 text-gray-300 mx-auto" />
              <div className="absolute -top-2 -right-2 bg-red-100 rounded-full p-2">
                <Search className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">ไม่พบสินค้าที่ค้นหา</h3>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
              ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่ หรือดูสินค้าทั้งหมดของเรา
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-2xl font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ดูสินค้าทั้งหมด
            </button>
          </div>
        ) : (
          <div className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
              : "space-y-8"
          }`}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Custom Styles */}
      <style>
        {`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-40px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .animate-fadeInDown {
            animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #dc2626, #ef4444);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #b91c1c, #dc2626);
          }

          @media (max-width: 640px) {
            .grid {
              gap: 1.5rem;
            }
          }

          /* Enhanced hover effects */
          .group:hover .group-hover\\:scale-110 {
            transform: scale(1.1) rotate(1deg);
          }

          /* Glass morphism effect */
          .backdrop-blur-sm {
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }

          /* Custom gradient text */
          .bg-clip-text {
            background-clip: text;
            -webkit-background-clip: text;
          }

          /* Enhanced animations */
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0, -8px, 0);
            }
            70% {
              transform: translate3d(0, -4px, 0);
            }
            90% {
              transform: translate3d(0, -2px, 0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }

          /* Enhanced focus states */
          input:focus, select:focus {
            outline: none;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          }

          /* Enhanced button hover states */
          button:hover {
            transform: translateY(-1px);
          }

          button:active {
            transform: translateY(0);
          }

          /* Enhanced card hover effects */
          .group:hover {
            transform: translateY(-8px) scale(1.02);
          }

          /* Enhanced shadow effects */
          .shadow-2xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }

          .hover\\:shadow-2xl:hover {
            box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.3);
          }

          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .text-6xl {
              font-size: 2.5rem;
            }
            
            .text-2xl {
              font-size: 1.5rem;
            }
            
            .p-8 {
              padding: 1.5rem;
            }
            
            .space-x-6 > :not([hidden]) ~ :not([hidden]) {
              --tw-space-x-reverse: 0;
              margin-right: calc(1rem * var(--tw-space-x-reverse));
              margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));
            }
          }

          /* Enhanced loading animation */
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          /* Product card special effects */
          .group:hover .bg-gradient-to-r {
            background-size: 200% 200%;
            animation: gradient-shift 3s ease infinite;
          }

          @keyframes gradient-shift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>
    </section>
  );
}