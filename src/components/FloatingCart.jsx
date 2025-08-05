import React, { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, X, Plus, Minus } from "lucide-react";

export default function FloatingCart() {
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart();
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cartRef = useRef(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleToggleCart = () => {
    setIsAnimating(true);
    setOpen(!open);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={cartRef}>
      {/* Cart Button */}
      <button
        onClick={handleToggleCart}
        className={`relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform ${
          isAnimating ? 'scale-95' : 'hover:scale-110'
        } ${open ? 'rotate-12' : ''}`}
      >
        <ShoppingCart className="w-6 h-6" />
        
        {/* Badge */}
        {totalItems > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
            {totalItems > 99 ? '99+' : totalItems}
          </div>
        )}

        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></div>
      </button>

      {/* Cart Popup */}
      {open && (
        <div className={`absolute bottom-20 right-0 w-96 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                🛒 ตะกร้าสินค้า
                {totalItems > 0 && (
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {totalItems} รายการ
                  </span>
                )}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">ยังไม่มีสินค้าในตะกร้า</p>
                <p className="text-sm text-gray-400 mt-1">เพิ่มสินค้าเพื่อเริ่มช้อปปิ้ง</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all duration-200"
                      style={{ 
                        animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
                      }}
                    >
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={item.img || '/placeholder-product.jpg'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate text-sm">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          ฿{item.price.toLocaleString()} × {item.quantity}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="text-sm font-medium text-gray-700 min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="mt-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-2 mt-4 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-all duration-200 group"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    ล้างตะกร้าทั้งหมด
                  </button>
                )}

                {/* Total */}
                <div className="border-t border-gray-100 mt-6 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">ยอดรวม</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ฿{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 px-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      💳 ไปชำระเงิน
                      <div className="w-0 group-hover:w-6 transition-all duration-300 overflow-hidden">
                        →
                      </div>
                    </span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}