import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import { getAuth } from "firebase/auth";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  const db = getFirestore();
  const auth = getAuth();

  // เช็คว่า admin login ยัง
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        // TODO: เช็ค admin role จริงๆด้วย ถ้ามึงมีระบบ role
        setAdminUser(user);
      } else {
        setAdminUser(null);
      }
    });
    return () => unsub();
  }, [auth]);

  useEffect(() => {
    if (!adminUser) return;

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      const orderList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderList);
      setLoading(false);
    });

    return () => unsub();
  }, [adminUser, db]);

  const updateOrder = async (orderId, field, value) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { [field]: value });
    } catch (err) {
      console.error("แก้ไขออเดอร์ไม่สำเร็จ:", err);
      alert("แก้ไขไม่สำเร็จ");
    }
  };

  if (!adminUser) {
    return (
      <div>
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-xl font-semibold text-red-600">
            กรุณาเข้าสู่ระบบผู้ดูแลก่อน
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">รายการคำสั่งซื้อ (Admin)</h1>

        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : orders.length === 0 ? (
          <p>ยังไม่มีคำสั่งซื้อ</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border px-4 py-2">รหัสคำสั่งซื้อ</th>
                <th className="border px-4 py-2">วันที่</th>
                <th className="border px-4 py-2">ชื่อผู้สั่ง</th>
                <th className="border px-4 py-2">ยอดรวม</th>
                <th className="border px-4 py-2">สถานะ</th>
                <th className="border px-4 py-2">หมายเหตุ</th>
                <th className="border px-4 py-2">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="border px-4 py-2">{order.id}</td>
                  <td className="border px-4 py-2">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleString()
                      : "ไม่ทราบ"}
                  </td>
                  <td className="border px-4 py-2">{order.name}</td>
                  <td className="border px-4 py-2">{order.total?.toLocaleString()}</td>
                  <td className="border px-4 py-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrder(order.id, "status", e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="paid">ชำระเงินแล้ว</option>
                      <option value="shipped">จัดส่งแล้ว</option>
                      <option value="completed">เสร็จสิ้น</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      defaultValue={order.adminNote}
                      onBlur={(e) => updateOrder(order.id, "adminNote", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="ใส่หมายเหตุ"
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {/* อาจจะมีปุ่มลบ หรืออื่นๆเพิ่มทีหลัง */}
                    —
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
