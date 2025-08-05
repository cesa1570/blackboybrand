import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Routes, Route, NavLink, Navigate } from "react-router-dom";
import OrderList from "./OrderList";
import ProductManagement from "./ProductManagement";
import Reports from "./Reports";
import UserManagement from "./UserManagement";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("❌ ยังไม่ได้ login");
        navigate("/login");
        return;
      }

      console.log("✅ เข้ามาแล้ว UID:", user.uid);

      try {
        // กด force refresh token เลย เผื่อเคย login นานแล้วยังไม่ update claims
        const tokenResult = await user.getIdTokenResult(true); 
        console.log("🎫 Custom Claims:", tokenResult.claims);

        if (tokenResult.claims.role === "admin") {
          console.log("✅ เจอ custom claim role: admin แล้ว!");
          setIsAdmin(true);
        } else {
          console.warn("❌ ไม่ใช่แอดมิน claim role=", tokenResult.claims.role);
          alert("มึงไม่ใช่แอดมิน!");
          navigate("/");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("💥 Error ตอนโหลด custom claims:", error);
        alert("เกิดข้อผิดพลาด");
        navigate("/");
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [auth, navigate]);

  if (loading) return <div>⏳</div>;
  if (!isAdmin) return null;

  return (
    <div className="admin-dashboard p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <nav className="mb-6 flex gap-4">
        <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-700"}>Orders</NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-700"}>Products</NavLink>
        <NavLink to="/admin/reports" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-700"}>Reports</NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-700"}>Users</NavLink>
      </nav>

      <Routes>
        {/* เปลี่ยนตรงนี้ให้ถูกต้องแบบ React Router 6+ */}
        <Route index element={<Navigate to="/admin/orders" replace />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UserManagement />} />
      </Routes>
    </div>
  );
}
