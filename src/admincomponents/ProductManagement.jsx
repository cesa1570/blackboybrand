import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function ProductManagement() {
  const db = getFirestore();
  const [products, setProducts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    });
    return () => unsub();
  }, [db]);

  async function addProduct() {
    if (!newProduct.name || !newProduct.price) {
      alert("กรอกชื่อกับราคาก่อนเว้ย");
      return;
    }

    try {
      const imageName = imageFile ? imageFile.name : "";

      await addDoc(collection(db, "products"), {
        name: newProduct.name,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock) || 0,
        description: newProduct.description,
        imageName,
      });

      setNewProduct({ name: "", price: "", stock: "", description: "" });
      setImageFile(null);
    } catch (error) {
      alert("เพิ่มสินค้าล้มเหลว: " + error.message);
    }
  }

  async function updateProduct(id, field, value) {
    try {
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        [field]: field === "price" || field === "stock" ? Number(value) : value,
      });
    } catch (error) {
      alert("อัพเดตข้อมูลล้มเหลว: " + error.message);
    }
  }

  async function deleteProduct(id) {
    if (!confirm("แน่ใจว่าลบสินค้าตัวนี้?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (error) {
      alert("ลบสินค้าล้มเหลว: " + error.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">จัดการสินค้า</h2>

      {/* ฟอร์มเพิ่มสินค้า */}
      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="ชื่อสินค้า"
          className="border p-2 rounded w-full"
          value={newProduct.name}
          onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="number"
          placeholder="ราคา"
          className="border p-2 rounded w-full"
          value={newProduct.price}
          onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
        />
        <input
          type="number"
          placeholder="สต็อก"
          className="border p-2 rounded w-full"
          value={newProduct.stock}
          onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))}
        />
        <textarea
          placeholder="คำอธิบายสินค้า"
          className="border p-2 rounded w-full resize-none"
          rows={3}
          value={newProduct.description}
          onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
        ></textarea>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={addProduct}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          เพิ่มสินค้า
        </button>
      </div>

      {/* ตารางสินค้า */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="border px-3 py-1">รูป</th>
            <th className="border px-3 py-1">ชื่อสินค้า</th>
            <th className="border px-3 py-1">ราคา</th>
            <th className="border px-3 py-1">สต็อก</th>
            <th className="border px-3 py-1">คำอธิบาย</th>
            <th className="border px-3 py-1">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {products.map(({ id, name, price, stock, description, imageName }) => (
            <tr key={id} className="border-b hover:bg-gray-50">
              <td className="border px-3 py-1">
                {imageName ? (
                  <img
                    src={`/products/${imageName}`}
                    alt={name}
                    className="w-24 h-24 object-cover rounded"
                    onError={(e) => {
                      e.target.src = "/products/placeholder.jpg";
                    }}
                  />
                ) : (
                  <span className="text-gray-400 italic">ไม่มีรูป</span>
                )}
              </td>
              <td className="border px-3 py-1">{name}</td>
              <td className="border px-3 py-1">
                <input
                  type="number"
                  value={price}
                  className="w-24 border rounded p-1"
                  onChange={(e) => updateProduct(id, "price", e.target.value)}
                />
              </td>
              <td className="border px-3 py-1">
                <input
                  type="number"
                  value={stock}
                  className="w-20 border rounded p-1"
                  onChange={(e) => updateProduct(id, "stock", e.target.value)}
                />
              </td>
              <td className="border px-3 py-1">
                <textarea
                  value={description}
                  rows={2}
                  className="border p-1 rounded w-full resize-none"
                  onChange={(e) => updateProduct(id, "description", e.target.value)}
                />
              </td>
              <td className="border px-3 py-1">
                <button
                  onClick={() => deleteProduct(id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-4">
                ไม่มีสินค้าในระบบ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
