import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import About from "./components/About";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import FloatingCart from "./components/FloatingCart";
import NewCollection from "./components/NewCollection";
import { Toaster } from "react-hot-toast";

import LoginPage from "./components/LoginPages";
import RegisterPage from "./components/RegisterPage";
import Checkout from "./pages/Checkout";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminDashboard from "./admincomponents/AdminDashboard";

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>     
              <Navbar /> 
              <Hero />
              <ProductGrid />
              <NewCollection />
              <About />
              <Newsletter />
              <Footer />
              <FloatingCart />
            </>
          }
        />
        <Route path="/newcollection" element={<NewCollection />} /> 
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
