import React, { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

export default function Report() {
  const db = getFirestore();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const data = snap.docs.map((d) => d.data());
      setOrders(data);
    });
    return () => unsub();
  }, [db]);

  // คำนวนรายงานง่ายๆ
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">รายงานสรุป</h2>
      <p>ยอดขายรวม: <strong>{totalSales.toLocaleString()} บาท</strong></p>
      <p>จำนวนออเดอร์: <strong>{totalOrders}</strong></p>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">จำนวนออเดอร์ตามสถานะ:</h3>
        <ul className="list-disc list-inside">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <li key={status}>
              {status}: {count} ออเดอร์
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
