import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeOff, User, Phone, Mail, Lock, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const schema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(50, "ชื่อยาวเกินไป")
      .required("กรอกชื่อด้วยนะเว้ย"),
    lastName: Yup.string()
      .min(2, "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(50, "นามสกุลยาวเกินไป")
      .required("อย่าลืมนามสกุล"),
    phone: Yup.string()
      .matches(/^0[0-9]{8,9}$/, "เบอร์โทรไม่ถูกต้อง (ขึ้นต้นด้วย 0 และมี 9-10 หลัก)")
      .required("ต้องกรอกเบอร์"),
    email: Yup.string()
      .email("รูปแบบอีเมลไม่ถูกต้อง")
      .required("ต้องกรอกอีเมล"),
    password: Yup.string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "รหัสผ่านต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข")
      .required("กรอกรหัสผ่าน"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "รหัสผ่านไม่ตรงกัน")
      .required("ยืนยันรหัสผ่านก่อน"),
    acceptTerms: Yup.boolean()
      .oneOf([true], "กรุณายอมรับเงื่อนไขการใช้งาน")
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched"
  });

  const watchPassword = watch("password", "");

  // Calculate password strength
  React.useEffect(() => {
    if (!watchPassword) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (watchPassword.length >= 8) strength += 1;
    if (/[a-z]/.test(watchPassword)) strength += 1;
    if (/[A-Z]/.test(watchPassword)) strength += 1;
    if (/\d/.test(watchPassword)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(watchPassword)) strength += 1;
    
    setPasswordStrength(strength);
  }, [watchPassword]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-yellow-500";
    if (passwordStrength <= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "อ่อนแอ";
    if (passwordStrength <= 2) return "ปานกลาง";
    if (passwordStrength <= 3) return "ดี";
    return "แข็งแกร่ง";
  };

  const onSubmit = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=111827&color=ffffff&size=200`
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        emailVerified: false,
        isActive: true,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      alert("สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
      navigate("/login");
    } catch (err) {
      let errorMessage = "เกิดข้อผิดพลาดในการสมัครสมาชิก";
      
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "อีเมลนี้ถูกใช้งานแล้ว";
          break;
        case "auth/weak-password":
          errorMessage = "รหัสผ่านไม่แข็งแกร่งพอ";
          break;
        case "auth/invalid-email":
          errorMessage = "รูปแบบอีเมลไม่ถูกต้อง";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "การสมัครสมาชิกถูกปิดใช้งานชั่วคราว";
          break;
        default:
          errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-black px-4 py-8">
      <div className="bg-[#181818] rounded-2xl shadow-2xl max-w-lg w-full p-8 md:p-10 border border-neutral-700 transition-all duration-500 hover:scale-[1.02] hover:shadow-red-500/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white tracking-wide uppercase animate-fadeIn">
            สมัครสมาชิก
          </h2>
          <p className="text-neutral-400 text-sm">
            เข้าร่วมชุมชน BlackBoyBrand วันนี้
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-4 h-5 w-5 text-neutral-400" />
              <input
                {...register("firstName")}
                placeholder="ชื่อ"
                className="input pl-12"
                disabled={isSubmitting}
              />
              {errors.firstName && <p className="error">{errors.firstName.message}</p>}
            </div>
            <div className="relative">
              <User className="absolute left-3 top-4 h-5 w-5 text-neutral-400" />
              <input
                {...register("lastName")}
                placeholder="นามสกุล"
                className="input pl-12"
                disabled={isSubmitting}
              />
              {errors.lastName && <p className="error">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Phone Field */}
          <div className="relative">
            <Phone className="absolute left-3 top-4 h-5 w-5 text-neutral-400" />
            <input
              {...register("phone")}
              placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
              className="input pl-12"
              disabled={isSubmitting}
              maxLength="10"
            />
            {errors.phone && <p className="error">{errors.phone.message}</p>}
          </div>

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-4 h-5 w-5 text-neutral-400" />
            <input
              {...register("email")}
              type="email"
              placeholder="อีเมล"
              className="input pl-12"
              disabled={isSubmitting}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-4 h-5 w-5 text-neutral-400" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
              className="input pl-12 pr-12"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 h-5 w-5 text-neutral-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
            {errors.password && <p className="error">{errors.password.message}</p>}
            
            {/* Password Strength Indicator */}
            {watchPassword && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-400">ความแข็งแกร่ง:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength <= 1 ? "text-red-500" :
                    passwordStrength <= 2 ? "text-yellow-500" :
                    passwordStrength <= 3 ? "text-blue-500" : "text-green-500"
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-4 h-5 w-5 text-neutral-400" />
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="ยืนยันรหัสผ่าน"
              className="input pl-12 pr-12"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-4 h-5 w-5 text-neutral-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3">
            <input
              {...register("acceptTerms")}
              type="checkbox"
              id="acceptTerms"
              className="mt-1 h-4 w-4 text-red-600 border-neutral-600 rounded focus:ring-red-500 focus:ring-2"
              disabled={isSubmitting}
            />
            <label htmlFor="acceptTerms" className="text-sm text-neutral-300 leading-relaxed">
              ฉันยอมรับ{" "}
              <button
                type="button"
                onClick={() => window.open("/terms", "_blank")}
                className="text-red-500 hover:text-red-400 underline"
              >
                เงื่อนไขการใช้งาน
              </button>{" "}
              และ{" "}
              <button
                type="button"
                onClick={() => window.open("/privacy", "_blank")}
                className="text-red-500 hover:text-red-400 underline"
              >
                นโยบายความเป็นส่วนตัว
              </button>
            </label>
          </div>
          {errors.acceptTerms && <p className="error">{errors.acceptTerms.message}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-semibold tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 ${
              isSubmitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/25 transform hover:scale-[1.02]"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>สมัครอยู่...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>สมัครสมาชิก</span>
              </>
            )}
          </button>
        </form>

        {/* Navigation Links */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="text-red-500 hover:text-red-400 underline font-medium transition-colors"
            disabled={isSubmitting}
          >
            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-neutral-400 hover:text-white underline transition-colors"
            disabled={isSubmitting}
          >
            ← กลับไปหน้าแรก
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
          <h4 className="text-sm font-semibold text-white mb-2">ข้อมูลการสมัครสมาชิก:</h4>
          <ul className="text-xs text-neutral-300 space-y-1">
            <li>• ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย</li>
            <li>• คุณจะได้รับอีเมลยืนยันบัญชี</li>
            <li>• สามารถยกเลิกสมาชิกได้ตลอดเวลา</li>
          </ul>
        </div>
      </div>

      <style>
        {`
          .input {
            width: 100%;
            padding: 1rem;
            border-radius: 0.75rem;
            border: 1px solid #404040;
            background: #202020;
            color: white;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .input:focus {
            outline: none;
            border-color: #f87171;
            box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
            background: #252525;
          }

          .input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .error {
            color: #f87171;
            font-size: 0.85rem;
            margin-top: 0.5rem;
            font-weight: 500;
          }

          @keyframes fadeIn {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.6s ease-in-out;
          }

          @media (max-width: 640px) {
            .input {
              padding: 0.875rem;
              font-size: 0.9rem;
            }
          }
        `}
      </style>
    </div>
  );
}