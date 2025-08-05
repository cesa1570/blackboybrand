import React, { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function UserManagement() {
  const db = getFirestore();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [tempRole, setTempRole] = useState({});
  const [loadingIds, setLoadingIds] = useState(new Set());

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(data);
    });
    return () => unsub();
  }, [db]);

  const filtered = users.filter((u) => {
  const email = u.email ?? "";  // ถ้า undefined ให้เป็น empty string
  const name = u.name ?? "";    // ถ้า undefined ให้เป็น empty string
  const searchLower = search?.toLowerCase() ?? "";

  return email.toLowerCase().includes(searchLower) || name.toLowerCase().includes(searchLower);
});

  async function saveRole(id) {
    const newRole = tempRole[id];
    const currentRole = users.find(u => u.id === id)?.role ?? "user";

    if (!newRole || newRole === currentRole) {
      alert("ยังไม่ได้เปลี่ยนสิทธิ์ หรือเลือกสิทธิ์เหมือนเดิม");
      return;
    }

    setLoadingIds(prev => new Set(prev).add(id));
    try {
      const docRef = doc(db, "users", id);
      await updateDoc(docRef, { role: newRole });
      alert("อัพเดตสิทธิ์ผู้ใช้เรียบร้อย");
      setTempRole(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (e) {
      alert("อัพเดตสิทธิ์ล้มเหลว: " + e.message);
    }
    setLoadingIds(prev => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
  }

  async function deleteUser(id) {
    if (!confirm("ลบผู้ใช้นี้จริงหรือ?")) return;

    setLoadingIds(prev => new Set(prev).add(id));
    try {
      await deleteDoc(doc(db, "users", id));
      alert("ลบผู้ใช้เรียบร้อย");
    } catch (e) {
      alert("ลบผู้ใช้ล้มเหลว: " + e.message);
    }
    setLoadingIds(prev => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">จัดการผู้ใช้</h2>
      <input
        type="text"
        placeholder="ค้นหา (ชื่อ, อีเมล)"
        className="border p-2 mb-4 rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map((user) => {
        const isLoading = loadingIds.has(user.id);
        const selectedRole = tempRole[user.id] ?? user.role ?? "user";
        return (
          <div key={user.id} className="border p-3 rounded mb-3 shadow-sm flex flex-col gap-2">
            <p>ชื่อ: {user.name || "-"}</p>
            <p>อีเมล: {user.email}</p>
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) =>
                  setTempRole((prev) => ({ ...prev, [user.id]: e.target.value }))
                }
                disabled={isLoading}
                className="border rounded p-1"
              >
                <option value="user">ผู้ใช้ทั่วไป</option>
                <option value="admin">แอดมิน</option>
                <option value="manager">ผู้จัดการ</option>
              </select>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                onClick={() => saveRole(user.id)}
                disabled={isLoading || selectedRole === (user.role ?? "user")}
              >
                {isLoading ? "กำลังบันทึก..." : "บันทึกสิทธิ์"}
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-gray-400"
                onClick={() => deleteUser(user.id)}
                disabled={isLoading}
              >
                {isLoading ? "กำลังลบ..." : "ลบผู้ใช้"}
              </button>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && <p>ไม่พบผู้ใช้ที่ค้นหา</p>}
    </div>
  );
}
