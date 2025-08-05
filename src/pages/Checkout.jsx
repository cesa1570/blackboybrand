import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function CheckoutPage() {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();
  const navigate = useNavigate();

  const { cart, clearCart } = useCart();

  const SHIPPING_FEE = 50;

  // ฟอร์มข้อมูล
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qr");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

      // ตรวจสอบการ login
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // ตรวจสอบตะกร้าสินค้า
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
      return;
    }
  }, [cart, navigate]);

  // ดึงจังหวัด
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json"
        );
        setProvinceList(Object.values(res.data));
      } catch (err) {
        console.error("ดึงจังหวัดล้มเหลว:", err);
      }
    };
    fetchProvinces();
  }, []);

  // ดึงอำเภอตามจังหวัด
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!province) {
        setDistrictList([]);
        setDistrict("");
        return;
      }
      try {
        const res = await axios.get(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json"
        );
        const filtered = Object.values(res.data).filter(
          (d) => d.province_id.toString() === province
        );
        setDistrictList(filtered);
      } catch (err) {
        console.error("ดึงอำเภอล้มเหลว:", err);
      }
    };
    fetchDistricts();
  }, [province]);

  // สร้างเลขที่คำสั่งซื้อ
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD${timestamp}${random}`;
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name.trim() || !phone.trim() || !email.trim() || !address.trim() || !province || !district || !postalCode.trim()) {
      setShowErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      setIsSubmitting(false);
      setTimeout(() => setShowErrorMessage(""), 3000);
      return;
    }

    // ตรวจสอบรูปแบบเบอร์โทร
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setShowErrorMessage("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)");
      setIsSubmitting(false);
      setTimeout(() => setShowErrorMessage(""), 3000);
      return;
    }

    // ตรวจสอบรหัสไปรษณีย์
    const postalRegex = /^[0-9]{5}$/;
    if (!postalRegex.test(postalCode)) {
      setShowErrorMessage("กรุณากรอกรหัสไปรษณีย์ให้ถูกต้อง (5 หลัก)");
      setIsSubmitting(false);
      setTimeout(() => setShowErrorMessage(""), 3000);
      return;
    }

    const selectedProvince = provinceList.find((p) => p.id.toString() === province);
    const selectedDistrict = districtList.find((d) => d.id.toString() === district);
    const orderNum = generateOrderNumber();

    try {
      const order = {
        orderNumber: orderNum,
        userId: user.uid,
        userEmail: user.email,
        customerInfo: {
          name: name.trim(),
          email: email.trim(),
          phone: cleanPhone,
        },
        shippingAddress: {
          address: address.trim(),
          province: selectedProvince?.name_th || "",
          district: selectedDistrict?.name_th || "",
          postalCode: postalCode.trim(),
          fullAddress: `${address.trim()} อำเภอ${selectedDistrict?.name_th} จังหวัด${selectedProvince?.name_th} ${postalCode.trim()}`
        },
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.img,
          subtotal: item.price * item.quantity
        })),
        pricing: {
          subtotal: subtotal,
          shippingFee: SHIPPING_FEE,
          total: total
        },
        payment: {
          method: paymentMethod,
          status: "pending", // pending, paid, failed
        },
        status: "รอการยืนยัน", // รอการยืนยัน, ยืนยันแล้ว, กำลังเตรียมสินค้า, กำลังจัดส่ง, จัดส่งแล้ว, สำเร็จ, ยกเลิก
        adminNote: "",
        trackingNumber: "",
        estimatedDelivery: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // บันทึกคำสั่งซื้อลง Firestore
      const docRef = await addDoc(collection(db, "orders"), order);
      
      // อัปเดตสถานะความสำเร็จ
      setOrderNumber(orderNum);
      setOrderSuccess(true);
      
      // ล้างตะกร้าสินค้า
      clearCart();
      
      // แสดงข้อความสำเร็จ
      setTimeout(() => {
        setShowSuccessMessage(`สั่งซื้อสำเร็จ! เลขที่คำสั่งซื้อ: ${orderNum}`);
        navigate("/order-history");
      }, 1000);

    } catch (err) {
      console.error("Error creating order:", err);
      setShowErrorMessage("เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
      setTimeout(() => setShowErrorMessage(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // แสดงหน้าสำเร็จ
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">สั่งซื้อสำเร็จ!</h1>
          <p className="text-gray-600 mb-2">เลขที่คำสั่งซื้อ</p>
          <p className="text-xl font-mono font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg mb-6">
            {orderNumber}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            กำลังเปลี่ยนเส้นทางไปหน้าประวัติการสั่งซื้อ...
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      {/* เพิ่ม padding-top เพื่อเว้นพื้นที่สำหรับ Navbar */}
      {/* Error/Success Messages */}
      {showErrorMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-xl">❌</span>
            <span>{showErrorMessage}</span>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span>{showSuccessMessage}</span>
          </div>
        </div>
      )}

      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            ยืนยันคำสั่งซื้อ
          </h1>
          <p className="text-gray-600">กรอกข้อมูลเพื่อจัดส่งสินค้าให้คุณ</p>
        </div>

        {/* Cart Preview */}
        {cart.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              สินค้าที่สั่งซื้อ ({cart.length} รายการ)
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {cart.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex-shrink-0 group hover:scale-105 transition-transform duration-300"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="relative">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-2xl shadow-lg border-4 border-white group-hover:shadow-2xl transition-shadow duration-300"
                    />
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                      {item.quantity}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-center mt-2 text-gray-700 max-w-32 truncate" title={item.name}>
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <form onSubmit={handleOrder} className="space-y-6">
                <div className="border-b pb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    ข้อมูลผู้สั่งซื้อ
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="กรอกชื่อ-นามสกุล"
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">อีเมล *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์ *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812345678"
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    ที่อยู่จัดส่ง
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">ที่อยู่ *</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="บ้านเลขที่ / หมู่บ้าน / ซอย / ถนน"
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">จังหวัด *</label>
                        <select
                          value={province}
                          onChange={(e) => {
                            setProvince(e.target.value);
                            setDistrict("");
                          }}
                          className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-white"
                          required
                        >
                          <option value="">-- เลือกจังหวัด --</option>
                          {provinceList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name_th}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">อำเภอ *</label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-white"
                          disabled={!province}
                          required
                        >
                          <option value="">-- เลือกอำเภอ --</option>
                          {districtList.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name_th}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">รหัสไปรษณีย์ *</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="12345"
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        maxLength="5"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    การชำระเงิน
                  </h2>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        💳 โอนเงินผ่าน QR PromptPay
                      </h3>
                      <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
                        <img
                          src="/qrcode.jpg"
                          alt="QR Code"
                          className="w-48 h-48 mx-auto rounded-xl shadow-md border-4 border-gray-100"
                        />
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-700 font-medium">
                            🏦 ธนาคารกสิกรไทย
                          </p>
                          <p className="text-sm text-gray-700">
                            👤 นายสุรเชษฐ์ เนื่องจากจันทร์
                          </p>
                          <p className="text-sm text-gray-700 font-mono">
                            💳 187-1-76896-6
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-yellow-100 rounded-xl border-l-4 border-yellow-500">
                        <p className="text-yellow-800 font-semibold text-sm">
                          ⚡ หลังโอนแล้วกด "ยืนยันคำสั่งซื้อ" ได้เลย
                        </p>
                        <p className="text-yellow-700 text-xs mt-1">
                          💰 ยอดที่ต้องชำระ: ฿{total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      isSubmitting || cart.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        กำลังสร้างคำสั่งซื้อ...
                      </span>
                    ) : (
                      '✅ ยืนยันคำสั่งซื้อ'
                    )}
                  </button>
                  
                  <button
                    onClick={() => navigate("/")}
                    type="button"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                  >
                    🏠 กลับหน้าแรก
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📋 สรุปรายการ
              </h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-500">ยังไม่มีสินค้าในตะกร้า</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover shadow-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} x ฿{item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            ฿{(item.quantity * item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-gray-100 pt-6 space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>รวมสินค้า</span>
                      <span>฿{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ค่าจัดส่ง</span>
                      <span>฿{SHIPPING_FEE.toLocaleString()}</span>
                    </div>
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between text-2xl font-bold text-gray-800">
                        <span>ยอดรวม</span>
                        <span className="text-blue-600">฿{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}