import React, { useEffect, useState, useRef } from "react";
import { Menu, X, ChevronDown, User, Settings, LogOut, Package } from "lucide-react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  getIdTokenResult,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await getIdTokenResult(currentUser);
          setRole(idTokenResult.claims.role || null);
        } catch (error) {
          console.error("Error getting token claims:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setShowDropdown(false);
        setMenuOpen(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("ไม่สามารถออกจากระบบได้:", error);
      });
  };

  const getInitials = (nameOrEmail) => {
    return nameOrEmail?.charAt(0)?.toUpperCase() || "U";
  };

  const commonMenuLinks = (
    <>
      <li>
        <button
          onClick={() => {
            setMenuOpen(false);
            navigate("/");
          }}
          className="relative group py-2 px-4 rounded-lg transition-all duration-300 hover:bg-white/5 hover:backdrop-blur-sm"
        >
          <span className="relative z-10 text-white">Home</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
        </button>
      </li>
      <li>
        <a 
          href="#productgrid" 
          onClick={() => setMenuOpen(false)} 
          className="relative group py-2 px-4 rounded-lg transition-all duration-300 hover:bg-white/5 hover:backdrop-blur-sm"
        >
          <span className="relative z-10 text-white">Products</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
        </a>
      </li>
      <li>
        <a 
          href="#about" 
          onClick={() => setMenuOpen(false)} 
          className="relative group py-2 px-4 rounded-lg transition-all duration-300 hover:bg-white/5 hover:backdrop-blur-sm"
        >
          <span className="relative z-10 text-white">About</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
        </a>
      </li>
      <li>
        <a 
          href="#newsletter" 
          onClick={() => setMenuOpen(false)} 
          className="relative group py-2 px-4 rounded-lg transition-all duration-300 hover:bg-white/5 hover:backdrop-blur-sm"
        >
          <span className="relative z-10 text-white">Newsletter</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
        </a>
      </li>
    </>
  );

  const UserDropdownMenu = () => {
    if (!user) return null;
    return (
      <div className="absolute right-0 mt-3 w-72 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 p-[1px] rounded-2xl">
          <div className="bg-black/95 rounded-2xl h-full w-full"></div>
        </div>
        
        <div className="relative">
          {/* User info header with gradient */}
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-red-500/5 to-purple-500/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user.displayName || user.email)
                )}
              </div>
              <div>
                <div className="font-semibold text-white truncate">{user.displayName || "ผู้ใช้"}</div>
                <div className="text-gray-400 text-sm truncate">{user.email}</div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <button 
              onClick={() => {
                setShowDropdown(false);
                navigate("/order-history");
              }}
              className="flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-white/5 text-white transition-all duration-200 group"
            >
              <User className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              <span className="group-hover:text-red-500 transition-colors">ประวัติคำสั่งซื้อ</span>
            </button>
            
            {role === "admin" && (
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/admin/orders");
                }}
                className="flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-purple-500/10 text-white transition-all duration-200 group"
              >
                <Settings className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                <span className="font-semibold group-hover:text-purple-500 transition-colors">Admin Dashboard</span>
                <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </button>
            )}
            
            <div className="border-t border-white/10 my-2"></div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-red-500/10 text-white transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              <span className="group-hover:text-red-500 transition-colors">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MobileMenu = () => {
    return (
      <div className={`absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 md:hidden transition-all duration-300 ${
        menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <ul className="flex flex-col p-6 space-y-2">
          {commonMenuLinks}
          {user ? (
            <li className="pt-4 border-t border-white/10 mt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left py-2 px-4 rounded-lg hover:bg-red-500/10 text-white transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </li>
          ) : (
            <li className="pt-4 border-t border-white/10 mt-4">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/Login");
                }}
                className="block w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-center shadow-lg shadow-red-500/25"
              >
                LOGIN / REGISTER
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/20' 
        : 'bg-black/95 backdrop-blur-xl border-b border-white/5'
    }`}>
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with gradient effect */}
          <button 
            onClick={() => navigate("/")}
            className="relative group"
          >
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-red-500 to-purple-500 bg-clip-text text-transparent">
              BLACKBOYBRAND
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>

          {/* Desktop menu and user controls */}
          <div className="flex items-center gap-6">
            {/* Desktop navigation */}
            <div className="hidden md:flex">
              <ul className="flex items-center gap-2">
                {commonMenuLinks}
              </ul>
            </div>

            {/* User avatar or login button */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(user.displayName || user.email)
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-200 ${
                    showDropdown ? 'rotate-180' : ''
                  }`} />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/Login")}
                  className="relative overflow-hidden px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
                >
                  <span className="relative z-10">LOGIN</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                </button>
              )}
              
              {showDropdown && <UserDropdownMenu />}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300"
            >
              {menuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu />
    </nav>
  );
}