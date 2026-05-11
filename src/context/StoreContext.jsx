import { createContext, useContext, useState } from "react";

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Amul Butter 500g",
      sku: "AMU-3535",
      barcode: "8901020303535",
      category: "Dairy",
      price: 265,
      mrp: 280,
      unit: "pcs",
      stock: 22,
      reorder: 10,
      safety: 5,
    },
  ]);

  const [sales, setSales] = useState([]);

  // 🔥 ADD PRODUCT
  const addProduct = (product) => {
    setProducts((prev) => [product, ...prev]);
  };

  // 🔥 ADD STOCK (PROCUREMENT)
  const addStock = (productId, qty) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock: Number(p.stock) + Number(qty) }
          : p
      )
    );
  };

  // 🔥 SELL PRODUCT (BILLING)
  const sellProduct = (productId, qty) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock: Math.max(0, p.stock - qty) }
          : p
      )
    );

    setSales((prev) => [...prev, { productId, qty }]);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        addStock,
        sellProduct,
        sales,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};