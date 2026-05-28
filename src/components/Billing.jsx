import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Billing() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [scanLock, setScanLock] = useState(false);

  const [discount, setDiscount] = useState(0);

  const [paymentMode, setPaymentMode] = useState("CASH");

  const [cashPaid, setCashPaid] = useState(0);

  const [upiPaid, setUpiPaid] = useState(0);

  const [cardPaid, setCardPaid] = useState(0);

  const scannerRef = useRef(null);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      fetchProduct(barcode);

      setBarcode("");
    }
  };

  const fetchProduct = async (code) => {
    if (!code) return;

    try {
      const clean = code.trim();
      const res = await api.get(`/products/scan/${clean}`);

      const data = res.data;

      if (data.exists && data.product) {
        const product = data.product;

        if (product.status === "PENDING") {
          alert("This product is pending approval.");

          return;
        }

        if (product.status !== "ACTIVE") {
          alert(product.name + " is not for sale");

          return;
        }

        addToCart(product);

        if (navigator.vibrate) navigator.vibrate(200);

        return;
      }

      alert("Product not found");
    } catch {
      alert("Product not found");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const reader = new BrowserMultiFormatReader();

      const imageUrl = URL.createObjectURL(file);

      const img = document.createElement("img");

      img.src = imageUrl;

      img.onload = async () => {
        try {
          const result = await reader.decodeFromImageElement(img);

          const code = result.getText();

          setBarcode(code);

          fetchProduct(code);
        } catch {
          alert("Barcode not detected");
        }
      };
    } catch {
      alert("Scan failed");
    }
  };

  const addToCart = (product) => {
    const exists = cart.find((x) => x.id === product.id);

    if (exists) {
      setCart(
        cart.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x)),
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ]);
    }
  };

  const removeItem = (id) => {
    setCart(cart.filter((x) => x.id !== id));
  };

  const clearAll = () => {
    setCart([]);

    setDiscount(0);

    setCashPaid(0);

    setUpiPaid(0);

    setCardPaid(0);

   setPaymentMode("CASH");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const safeDiscount = discount > subtotal ? subtotal : discount;

  const tax = (subtotal - safeDiscount) * 0.05;

  const grandTotal = subtotal - safeDiscount + tax;

  const totalPaid = Number(cashPaid) + Number(upiPaid) + Number(cardPaid);

  const balance = totalPaid - grandTotal;

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Cart empty");

      return;
    }

    if (totalPaid < grandTotal) {
      alert("Insufficient payment");

      return;
    }

    try {
      const res = await api.post("/billing/checkout", {
        customerName: "Walk-in Customer",
        customerMobile: "",
        paymentMode,
        discount: safeDiscount,
        cashPaid,
        upiPaid,
        cardPaid,
        items: cart.map((x) => ({
          productId: x.id,
          qty: x.qty,
          price: x.price,
        })),
      });

      console.log(res);

      alert("Billing completed successfully");

      clearAll();
    } catch (error) {
      console.log(error);

      alert("Billing failed");
    }
  };

  useEffect(() => {
    if (!scannerOpen) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 220,
      },
      false,
    );

    scanner.render(
      (decodedText) => {
        if (scanLock) return;

        setScanLock(true);

        fetchProduct(decodedText);

        setTimeout(() => {
          scanner.clear();

          setScannerOpen(false);

          setScanLock(false);
        }, 800);
      },
      () => {},
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [scannerOpen]);

  return (
    <>
      <style>{`

      .billing-page{
        display:flex;
        gap:18px;
        padding:20px;
        min-height:100vh;

        background:var(--bg);
        color:var(--text);
      }

      .billing-left{
        flex:1;
        min-width:0;
      }

      .billing-right{
        width:340px;
        flex-shrink:0;
      }

      .billing-title{
        font-size:28px;
        font-weight:800;
        margin-bottom:5px;
      }

      .billing-sub{
        color:var(--muted);
        font-size:13px;
        margin-bottom:18px;
      }

      .scan-box{
        background:var(--surface);

        border:1px solid #16a34a;

        border-radius:18px;

        padding:12px;

        display:flex;
        align-items:center;

        gap:10px;

        margin-bottom:18px;
      }

      .scan-icon{
        font-size:22px;
        padding:0 6px;
      }

      .scan-input{
        flex:1;

        height:46px;

        border:none;

        border-radius:12px;

        background:var(--bg);

        color:var(--text);

        padding:0 16px;

        outline:none;

        font-size:14px;
      }

      .scan-btn{
        border:none;

        background:#166534;

        color:#fff;

        height:46px;

        padding:0 18px;

        border-radius:12px;

        font-size:13px;

        font-weight:700;

        cursor:pointer;

        transition:.25s ease;
      }

      .scan-btn:hover{
        transform:translateY(-1px);
      }

      .cart-box,
      .summary{
        background:var(--surface);

        border:1px solid var(--border);

        border-radius:20px;

        padding:18px;
      }

      .cart-top{
        display:flex;
        justify-content:space-between;
        align-items:center;

        margin-bottom:16px;
      }

      .cart-title{
        font-size:18px;
        font-weight:800;
      }

      .clear-btn{
        border:none;

        background:var(--bg);

        color:var(--text);

        border:1px solid var(--border);

        height:42px;

        padding:0 18px;

        border-radius:12px;

        font-weight:700;

        cursor:pointer;
      }

      .cart-items{
        display:flex;
        flex-direction:column;
        gap:14px;

        max-height:480px;
        overflow:auto;
      }

      .cart-item{
        display:flex;
        justify-content:space-between;
        align-items:center;

        padding:14px;

        border-radius:16px;

        background:var(--bg);

        border:1px solid var(--border);
      }

      .item-name{
        font-size:14px;
        font-weight:700;
      }

      .item-price{
        font-size:12px;
        color:var(--muted);
        margin-top:4px;
      }

      .qty-box{
        display:flex;
        align-items:center;
        gap:10px;
      }

      .qty-input{
        width:55px;
        height:34px;

        border-radius:10px;

        border:1px solid var(--border);

        background:var(--surface);

        color:var(--text);

        text-align:center;
      }

      .remove-btn{
        width:34px;
        height:34px;

        border:none;

        border-radius:10px;

        background:#dc2626;

        color:#fff;

        font-size:18px;

        cursor:pointer;
      }

      .empty{
        height:340px;

        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;

        color:var(--muted);

        text-align:center;
      }

      .empty-icon{
        font-size:42px;
        margin-bottom:10px;
      }

      .total-card{
        background:#166534;

        color:#fff;

        border-radius:20px;

        padding:22px;

        margin-bottom:18px;
      }

      .total-label{
        font-size:13px;
        opacity:.9;
      }

      .total-amount{
        font-size:48px;
        font-weight:800;

        margin-top:8px;
      }

      .total-items{
        margin-top:8px;
        font-size:13px;
        opacity:.9;
      }

      .row{
        display:flex;
        justify-content:space-between;
        align-items:center;

        margin-bottom:14px;

        color:var(--muted);

        gap:10px;
      }

      .row input,
      .row select{
        width:120px;

        height:40px;

        border-radius:10px;

        border:1px solid var(--border);

        background:var(--bg);

        color:var(--text);

        padding:0 10px;

        outline:none;
      }

      .big-total{
        display:flex;
        justify-content:space-between;

        margin-top:20px;

        padding-top:18px;

        border-top:1px solid var(--border);

        font-size:32px;
        font-weight:800;
      }

      .checkout-btn{
        width:100%;

        height:48px;

        border:none;

        background:#16a34a;

        color:#fff;

        border-radius:14px;

        font-size:15px;

        font-weight:700;

        cursor:pointer;

        margin-top:20px;
      }

      .cancel-btn{
        width:100%;

        height:46px;

        border:none;

        background:var(--bg);

        color:var(--text);

        border-radius:14px;

        border:1px solid var(--border);

        font-size:14px;

        font-weight:700;

        cursor:pointer;

        margin-top:10px;
      }

      .overlay{
        position:fixed;
        inset:0;

        background:rgba(0,0,0,.7);

        display:flex;
        justify-content:center;
        align-items:center;

        z-index:9999;
      }

      .modal{
        width:100%;
        max-width:500px;

        background:var(--surface);

        border-radius:20px;

        padding:20px;
      }

      .modal-top{
        display:flex;
        justify-content:space-between;
        align-items:center;

        margin-bottom:16px;
      }

      .close-btn{
        width:38px;
        height:38px;

        border:none;

        border-radius:10px;

        background:#dc2626;

        color:#fff;

        font-size:22px;

        cursor:pointer;
      }

      @media(max-width:1100px){

        .billing-page{
          flex-direction:column;
        }

        .billing-right{
          width:100%;
        }

      }

      @media(max-width:768px){

        .billing-page{
          padding:14px;
        }

        .scan-box{
          flex-direction:column;
          align-items:stretch;
        }

        .scan-btn{
          width:100%;
        }

        .cart-item{
          flex-direction:column;
          align-items:flex-start;
          gap:14px;
        }

        .qty-box{
          width:100%;
          justify-content:space-between;
        }

        .total-amount{
          font-size:38px;
        }

        .big-total{
          font-size:28px;
        }

      }

      `}</style>

      <div className="billing-page">
        {/* LEFT */}

        <div className="billing-left">
          <div className="billing-title">Billing</div>

          <div className="billing-sub">
            Barcode-only lookup — scan products instantly
          </div>

          <div className="scan-box">
            <div className="scan-icon">▌▌▌</div>

            <input
              className="scan-input"
              placeholder="Scan barcode then press Enter..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleEnter}
            />

            <button className="scan-btn" onClick={() => setScannerOpen(true)}>
              📷 Camera
            </button>

            <button
              className="scan-btn"
              onClick={() => fileInputRef.current.click()}
            >
              🖼 Upload
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>

          {/* CART */}

          <div className="cart-box">
            <div className="cart-top">
              <div className="cart-title">🛒 Cart</div>

              <button className="clear-btn" onClick={clearAll}>
                Clear All
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🛒</div>

                <div>No items added yet</div>

                <div style={{ marginTop: 6 }}>
                  Scan barcode to start billing
                </div>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div>
                      <div className="item-name">{item.name}</div>

                      <div className="item-price">
                        ₹{item.price} × {item.qty}
                      </div>
                    </div>

                    <div className="qty-box">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        className="qty-input"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;

                          setCart((prev) =>
                            prev.map((p) =>
                              p.id === item.id ? { ...p, qty: value } : p,
                            ),
                          );
                        }}
                      />

                      <div
                        style={{
                          fontWeight: 700,
                          minWidth: "80px",
                          textAlign: "right",
                        }}
                      >
                        ₹{(item.price * item.qty).toFixed(2)}
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}

        <div className="billing-right">
          <div className="total-card">
            <div className="total-label">TOTAL PAYABLE</div>

            <div className="total-amount">₹{grandTotal.toFixed(2)}</div>

            <div className="total-items">{totalItems} items</div>
          </div>

          <div className="summary">
            <div className="row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="row">
              <span>Discount</span>

              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            <div className="row">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <div className="row">
              <span>Payment</span>

              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="MIXED">Split</option>
              </select>
            </div>

           {(paymentMode === "CASH" || paymentMode === "MIXED") && (
              <div className="row">
                <span>Cash</span>

                <input
                  type="number"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(Number(e.target.value))}
                />
              </div>
            )}
              {(paymentMode === "UPI" || paymentMode === "MIXED") && (
              <div className="row">
                <span>UPI</span>

                <input
                  type="number"
                  value={upiPaid}
                  onChange={(e) => setUpiPaid(Number(e.target.value))}
                />
              </div>
            )}
              {(paymentMode === "CARD" || paymentMode === "MIXED") && (
              <div className="row">
                <span>Card</span>

                <input
                  type="number"
                  value={cardPaid}
                  onChange={(e) => setCardPaid(Number(e.target.value))}
                />
              </div>
            )}

            <div className="row">
              <span>Paid</span>
              <span>₹{totalPaid.toFixed(2)}</span>
            </div>

            <div className="row">
              <span>{balance >= 0 ? "Balance" : "Pending"}</span>

              <span>₹{Math.abs(balance).toFixed(2)}</span>
            </div>

            <div className="big-total">
              <span>Total</span>

              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button className="checkout-btn" onClick={checkout}>
              ✔ Complete Billing
            </button>

            <button className="cancel-btn" onClick={clearAll}>
              ✖ Cancel Bill
            </button>
          </div>
        </div>
      </div>

      {scannerOpen && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-top">
              <h3>Scan Barcode</h3>

              <button
                className="close-btn"
                onClick={() => setScannerOpen(false)}
              >
                ×
              </button>
            </div>

            <div id="reader"></div>
          </div>
        </div>
      )}
    </>
  );
}
