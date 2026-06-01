import { useState, useEffect } from "react";
import api from "../services/api";

function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [loading, setLoading] = useState(false);

  // LOGIN

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // REGISTER

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // MOCK LIVE DATA    Only for UI design

  const [orders, setOrders] = useState(124);
  const [revenue, setRevenue] = useState(58240);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => prev + Math.floor(Math.random() * 3));

      setRevenue((prev) => prev + Math.floor(Math.random() * 500));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // LOGIN
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await api.post("/auth/login", { username, password });
    // ApiResponse structure: { success, message, status, data: { token, username, tenantId } }
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("username", res.data.username);
    localStorage.setItem("tenantId", res.data.tenantId);
    window.location.href = "/";
  } catch (err) {
    console.error(err);
    alert("Invalid Credentials");
  } finally {
    setLoading(false);
  }
};
const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await api.post("/auth/register", {
      companyName,
      email,
      phone,
      username: regUsername,
      password: regPassword,
    });
    alert("Account Created Successfully! Please login.");
    setCompanyName(""); setEmail(""); setPhone("");
    setRegUsername(""); setRegPassword("");
    setIsRegister(false);
  } catch (err) {
    console.error(err);
    alert("Registration Failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <style>{`

        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:Inter,sans-serif;
        }

        .page{
          min-height:100vh;

          display:grid;
          grid-template-columns:1.1fr .9fr;

          background:#020617;

          overflow-y:auto;
        }

        /* LEFT */

        .left{
          position:relative;

          padding:60px;

          display:flex;
          flex-direction:column;
          justify-content:space-between;

          background:
          radial-gradient(circle at top left,#2563eb33 0%,transparent 35%),
          radial-gradient(circle at bottom right,#06b6d433 0%,transparent 35%),
          linear-gradient(135deg,#020617,#0f172a,#111827);

          overflow:hidden;
        }

        .logo-row{
          display:flex;
          align-items:center;
          gap:16px;
        }

        .logo{
          width:68px;
          height:68px;

          border-radius:20px;

          background:linear-gradient(135deg,#2563eb,#06b6d4);

          display:flex;
          justify-content:center;
          align-items:center;

          color:#fff;

          font-size:30px;
          font-weight:800;

          box-shadow:
          0 20px 40px rgba(37,99,235,.35);
        }

        .brand h1{
          color:#fff;

          font-size:38px;
          font-weight:800;
        }

        .brand p{
          color:#94a3b8;

          margin-top:6px;

          font-size:15px;
        }

        .hero{
          margin-top:50px;
        }

        .hero h2{
          color:#fff;

          font-size:54px;
          line-height:1.1;

          max-width:620px;

          font-weight:800;
        }

        .hero span{
          background:linear-gradient(135deg,#38bdf8,#2563eb);

          -webkit-background-clip:text;

          -webkit-text-fill-color:transparent;
        }

        .hero p{
          margin-top:22px;

          color:#94a3b8;

          font-size:18px;

          line-height:1.8;

          max-width:650px;
        }

        .stats{
          display:grid;
          grid-template-columns:repeat(2,1fr);

          gap:22px;

          margin-top:50px;

          max-width:700px;
        }

        .card{
          background:rgba(255,255,255,.06);

          border:1px solid rgba(255,255,255,.08);

          backdrop-filter:blur(14px);

          border-radius:24px;

          padding:28px;

          transition:.3s ease;
        }

        .card:hover{
          transform:translateY(-5px);
        }

        .card h3{
          color:#94a3b8;

          font-size:14px;

          margin-bottom:12px;
        }

        .card-value{
          color:#fff;

          font-size:34px;
          font-weight:800;
        }

        .green{
          color:#22c55e;
        }

        .blue{
          color:#38bdf8;
        }

        .orange{
          color:#f59e0b;
        }

        .chart{
          height:90px;

          display:flex;
          align-items:flex-end;
          gap:10px;

          margin-top:22px;
        }

        .bar{
          flex:1;

          border-radius:12px 12px 0 0;

          background:linear-gradient(180deg,#38bdf8,#2563eb);

          animation:grow 1s ease;
        }

        @keyframes grow{
          from{
            height:0;
          }
        }

        .floating{
          position:absolute;

          border-radius:24px;

          background:rgba(255,255,255,.05);

          border:1px solid rgba(255,255,255,.06);

          backdrop-filter:blur(12px);

          padding:18px 20px;

          color:#fff;

          animation:float 5s ease-in-out infinite;
        }

        .f1{
          top:120px;
          right:80px;
        }

        .f2{
          bottom:140px;
          right:120px;

          animation-delay:2s;
        }

        @keyframes float{

          0%{
            transform:translateY(0px);
          }

          50%{
            transform:translateY(18px);
          }

          100%{
            transform:translateY(0px);
          }

        }

        /* RIGHT */

        .right{
          display:flex;
          justify-content:center;
          align-items:center;

          padding:40px 30px;

          background:#0f172a;
        }

        .form-card{
          width:100%;
          max-width:430px;

          background:rgba(255,255,255,.05);

          border:1px solid rgba(255,255,255,.08);

          border-radius:30px;

          padding:40px 34px;

          backdrop-filter:blur(16px);

          box-shadow:
          0 20px 60px rgba(0,0,0,.45);

          animation:fade .5s ease;
        }

        @keyframes fade{

          from{
            opacity:0;
            transform:translateY(20px);
          }

          to{
            opacity:1;
            transform:translateY(0px);
          }

        }

        .form-title h2{
          color:#fff;

          font-size:34px;
          font-weight:800;
        }

        .form-title p{
          color:#94a3b8;

          margin-top:10px;

          line-height:1.6;
        }

        .group{
          margin-top:18px;
        }

        .label{
          display:block;

          color:#cbd5e1;

          margin-bottom:8px;

          font-size:13px;
          font-weight:600;
        }

        .input{
          width:100%;

          height:56px;

          border:none;
          outline:none;

          border-radius:16px;

          padding:0 18px;

          background:rgba(255,255,255,.05);

          border:1px solid rgba(255,255,255,.08);

          color:#fff;

          font-size:14px;

          transition:.25s ease;
        }

        .input:focus{
          border:1px solid #38bdf8;

          box-shadow:0 0 0 4px rgba(56,189,248,.12);
        }

        .input::placeholder{
          color:#64748b;
        }

        .btn{
          width:100%;

          height:58px;

          border:none;

          border-radius:18px;

          margin-top:28px;

          background:linear-gradient(135deg,#2563eb,#06b6d4);

          color:#fff;

          font-size:15px;
          font-weight:700;

          cursor:pointer;

          transition:.25s ease;

          box-shadow:
          0 12px 30px rgba(37,99,235,.35);
        }

        .btn:hover{
          transform:translateY(-2px);
        }

        .switch{
          margin-top:24px;

          text-align:center;

          color:#94a3b8;

          font-size:14px;
        }

        .switch span{
          color:#38bdf8;

          cursor:pointer;

          font-weight:700;

          margin-left:6px;
        }

        .switch span:hover{
          color:#fff;
        }

        .footer{
          margin-top:20px;

          text-align:center;

          color:#64748b;

          font-size:12px;
        }

        @media(max-width:1000px){

          .page{
            grid-template-columns:1fr;
          }

          .left{
            display:none;
          }

          .right{
            min-height:100vh;
          }

        }

      `}</style>

      <div className="page">
        {/* LEFT SIDE */}

        <div className="left">
          <div>
            <div className="logo-row">
              <div className="logo">S</div>

              <div className="brand">
                <h1>StockFlow</h1>

                <p>Enterprise Inventory Platform</p>
              </div>
            </div>

            <div className="hero">
              <h2>
                Smarter Inventory For
                <span> Modern Businesses.</span>
              </h2>

              <p>
                Manage products, procurement, billing, reports and inventory
                operations securely with your own multi-tenant workspace.
              </p>
            </div>

            <div className="stats">
              <div className="card">
                <h3>Live Orders</h3>

                <div className="card-value blue">{orders}</div>

                <div className="chart">
                  <div className="bar" style={{ height: "40%" }}></div>
                  <div className="bar" style={{ height: "70%" }}></div>
                  <div className="bar" style={{ height: "55%" }}></div>
                  <div className="bar" style={{ height: "85%" }}></div>
                  <div className="bar" style={{ height: "65%" }}></div>
                </div>
              </div>

              <div className="card">
                <h3>Revenue</h3>

                <div className="card-value green">
                  ₹{revenue.toLocaleString()}
                </div>

                <p
                  style={{
                    marginTop: "16px",
                    color: "#94a3b8",
                    lineHeight: "1.7",
                    fontSize: "14px",
                  }}
                >
                  +18% growth this month with faster stock movement and
                  procurement.
                </p>
              </div>

              <div className="card">
                <h3>Inventory Health</h3>

                <div className="card-value orange">94%</div>

                <p
                  style={{
                    marginTop: "16px",
                    color: "#94a3b8",
                    lineHeight: "1.7",
                    fontSize: "14px",
                  }}
                >
                  Low stock alerts and smart reorder tracking enabled.
                </p>
              </div>

              <div className="card">
                <h3>Active Stores</h3>

                <div className="card-value">12</div>

                <p
                  style={{
                    marginTop: "16px",
                    color: "#94a3b8",
                    lineHeight: "1.7",
                    fontSize: "14px",
                  }}
                >
                  Multi-tenant architecture securely isolates all customer data.
                </p>
              </div>
            </div>
          </div>

          <div className="floating f1">🔥 Billing Increased 22%</div>

          <div className="floating f2">📦 14 New Products Added</div>
        </div>

        {/* RIGHT SIDE */}

        <div className="right">
          <div className="form-card">
            {!isRegister ? (
              <>
                <div className="form-title">
                  <h2>Welcome Back 👋</h2>

                  <p>
                    Login to continue managing your business operations
                    securely.
                  </p>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="group">
                    <label className="label">Username</label>

                    <input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <div className="group">
                    <label className="label">Password</label>

                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Signing In..." : "Login to Dashboard"}
                  </button>
                </form>

                <div className="switch">
                  New to StockFlow?
                  <span onClick={() => setIsRegister(true)}>
                    Create Account
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="form-title">
                  <h2>Create Account 🚀</h2>

                  <p>
                    Start your own company workspace with StockFlow enterprise
                    tools.
                  </p>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="group">
                    <label className="label">Company Name</label>

                    <input
                      type="text"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <div className="group">
                    <label className="label">Email</label>

                    <input
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <div className="group">
                    <label className="label">Phone Number</label>

                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <div className="group">
                    <label className="label">Username</label>

                    <input
                      type="text"
                      placeholder="Create username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <div className="group">
                    <label className="label">Password</label>

                    <input
                      type="password"
                      placeholder="Create password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </form>

                <div className="switch">
                  Already have an account?
                  <span onClick={() => setIsRegister(false)}>Login</span>
                </div>
              </>
            )}

            <div className="footer">Powered by StockFlow Enterprise</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
