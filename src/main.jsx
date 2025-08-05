import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Checkout from "./pages/Checkout";
import LoginPage from "./components/LoginPages";
import RegisterPage from "./components/RegisterPage";
import { CartProvider } from "./context/CartContext";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminDashboard from "./admincomponents/AdminDashboard";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          {/* fallback route ถ้ามี */}
          <Route path="*" element={<h1>404 Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
);
