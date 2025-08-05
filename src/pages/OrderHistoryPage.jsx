import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubAuth();
  }, [auth]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const userOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(userOrders);
      setLoading(false);
    });

    return () => unsub();
  }, [user, db]);

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-xl font-semibold">กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อ</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">ประวัติคำสั่งซื้อของฉัน</h1>

        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : orders.length === 0 ? (
          <p>ยังไม่มีคำสั่งซื้อ</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border p-4 rounded shadow-sm hover:shadow-md transition"
              >
                <h2 className="font-semibold text-xl mb-2">
                  รหัสคำสั่งซื้อ: {order.id}
                </h2>
                <p>
                  วันที่:{" "}
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleString()
                    : "ไม่ทราบ"}
                </p>
                <p>ยอดรวม: {order.total?.toLocaleString()} บาท</p>
                <p>สถานะ: {order.status}</p>
                {order.adminNote && (
                  <p className="text-red-600">หมายเหตุจากแอดมิน: {order.adminNote}</p>
                )}
                <Link
                  to={`/order-detail/${order.id}`}
                  className="text-blue-600 underline mt-2 inline-block"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
