import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found"
          ? "ไม่มีผู้ใช้งานนี้"
          : err.code === "auth/wrong-password"
          ? "รหัสผ่านไม่ถูกต้อง"
          : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("กรุณากรอกอีเมลก่อนรีเซ็ตรหัสผ่าน");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
    } catch (err) {
      setError("ไม่สามารถส่งลิงก์ได้: " + err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/3 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <motion.div
        className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-10 border border-zinc-800/50 relative z-10"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none"></div>
        
        <motion.button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-all duration-300 text-sm flex items-center gap-2 z-10"
          disabled={loading}
          whileHover={{ gap: 12 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            whileHover={{ x: -2 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft size={18} />
          </motion.div>
          กลับหน้าแรก
        </motion.button>

        <div className="relative z-10">
          {/* Brand logo with enhanced styling */}
          <motion.div 
            className="text-center mb-12"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h2 
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 tracking-[0.2em] uppercase mb-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              BLACKBOY
            </motion.h2>
            <motion.div 
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 tracking-[0.3em] uppercase"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              BRAND
            </motion.div>
            <motion.div 
              className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto mt-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.div>

          {/* Email input with icon and enhanced styling */}
          <motion.div 
            className="relative mb-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 z-10">
              <Mail size={20} />
            </div>
            <input
              type="email"
              placeholder="อีเมล"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 font-medium transition-all duration-300 hover:bg-zinc-800/50 focus:scale-[1.02]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              disabled={loading}
            />
          </motion.div>

          {/* Password input with icon, toggle, and enhanced styling */}
          <motion.div 
            className="relative mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 z-10">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน"
              className="w-full pl-12 pr-12 py-4 rounded-xl border border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 font-medium transition-all duration-300 hover:bg-zinc-800/50 focus:scale-[1.02]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              disabled={loading}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors duration-200 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </motion.button>
          </motion.div>

          {/* Error message with enhanced styling */}
          {error && (
            <motion.div 
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
            >
              <motion.p 
                className="text-red-400 text-sm text-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {error}
              </motion.p>
            </motion.div>
          )}

          {/* Forgot password link with enhanced styling */}
          <motion.div 
            className="flex justify-end mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={handleResetPassword}
              className="text-sm text-zinc-400 hover:text-red-400 transition-colors duration-300 relative group"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
            >
              ลืมรหัสผ่าน?
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
            </motion.button>
          </motion.div>

          {/* Login button with enhanced styling */}
          <motion.button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-semibold tracking-wide transition-all duration-300 flex justify-center items-center shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <motion.div 
                  className="w-6 h-6 mr-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-full h-full border-2 border-white/30 border-t-white rounded-full"></div>
                </motion.div>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </motion.button>

          {/* Register link with enhanced styling */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-zinc-400 text-sm mb-2">ยังไม่มีบัญชี?</p>
            <motion.button
              onClick={() => navigate("/Register")}
              className="text-red-500 hover:text-red-400 font-semibold transition-all duration-300 relative group text-sm"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
            >
              สมัครสมาชิกเลย
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}