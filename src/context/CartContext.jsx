import React, { createContext, useState, useContext } from "react";
import { getAuth } from "firebase/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null); // เก็บ error message

  function addToCart(product) {
    const user = getAuth().currentUser;
    if (!user) {
      setError("มึงต้องล็อกอินก่อนจะเพิ่มของในตะกร้า");
      return false; // คืน false บอกว่าล้มเหลว
    }
    setError(null); // เคลียร์ error ถ้าเพิ่มได้

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    return true; // เพิ่มได้สำเร็จ
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, error }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
