import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // ปรับ path ให้ตรงกับไฟล์ของมึง

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrder(orderSnap.data());
        } else {
          console.error("ไม่เจอคำสั่งซื้อนี้");
        }
      } catch (error) {
        console.error("ดึงข้อมูลคำสั่งซื้อพัง:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="p-4">กำลังโหลด...</div>;
  if (!order) return <div className="p-4">ไม่พบคำสั่งซื้อ</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">รายละเอียดคำสั่งซื้อ</h1>
      <div className="mb-4">
        <strong>รหัสคำสั่งซื้อ:</strong> {orderId}
      </div>
      <div className="mb-4">
        <strong>สถานะ:</strong> {order.status}
      </div>
      <div className="mb-4">
        <strong>ชื่อผู้รับ:</strong> {order.shippingInfo?.name}
      </div>
      <div className="mb-4">
        <strong>ที่อยู่จัดส่ง:</strong> {order.shippingInfo?.address}
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">รายการสินค้า</h2>
      <ul className="space-y-2">
        {order.items?.map((item, idx) => (
          <li key={idx} className="border p-2 rounded">
            <div>{item.name}</div>
            <div>จำนวน: {item.quantity}</div>
            <div>ราคา: {item.price} บาท</div>
          </li>
        ))}
      </ul>

      <div className="mt-6 font-bold text-right">
        รวมทั้งหมด: {order.total} บาท
      </div>
    </div>
  );
}
