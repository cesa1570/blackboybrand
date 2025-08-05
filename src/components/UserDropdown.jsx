import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function UserDropdown({ user, role, onLogout, showDropdown, setShowDropdown }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown]);

  const getInitials = (nameOrEmail) => {
    return nameOrEmail?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="relative ml-4" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-white transition"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(user.displayName || user.email)
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white text-black rounded shadow z-10 overflow-hidden"
          >
            <div className="px-4 py-2 border-b text-sm">
              <div className="font-semibold truncate">{user.displayName || "ผู้ใช้"}</div>
              <div className="text-gray-500 truncate">{user.email}</div>
            </div>
            {role === "admin" && (
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/admin/orders");
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-semibold text-red-600"
              >
                Admin Dashboard
              </button>
            )}
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate("/order-history");
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              ประวัติคำสั่งซื้อ
            </button>
            <button
              onClick={() => {
                onLogout();
                setShowDropdown(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              ออกจากระบบ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
