import { useState, useEffect, useRef } from "react";
import API from "./api/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const GOAL = 60000;
const BIKE_NUMBER = "TN 61 AA 3652";

function BikeAnimation() {
  const [pos, setPos] = useState(0);
  const [wheelRot, setWheelRot] = useState(0);

  const rafRef = useRef();
  const startRef = useRef(null);

  useEffect(() => {
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;

      const elapsed = ts - startRef.current;

      setPos(Math.sin(elapsed / 1200) * 8);
      setWheelRot((elapsed / 5) % 360);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 130,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 22,
          background: "#1e293b",
        }}
      />

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 8,
            left: `${i * 18}%`,
            width: "10%",
            height: 4,
            background: "#fbbf24",
            borderRadius: 2,
            opacity: 0.5,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 20,
          transform: `translateX(-50%) translateY(${pos}px)`,
        }}
      >
        <svg width="160" height="90" viewBox="0 0 160 90">
          <g transform={`translate(30,65) rotate(${wheelRot},0,0)`}>
            <circle r="22" fill="none" stroke="#111827" strokeWidth="8" />
          </g>

          <g transform={`translate(130,65) rotate(${wheelRot},0,0)`}>
            <circle r="22" fill="none" stroke="#111827" strokeWidth="8" />
          </g>

          <polygon
            points="30,43 55,20 95,20 115,43 80,43"
            fill="#dc2626"
          />

          <path
            d="M30,43 Q50,28 80,28 Q110,28 130,43 L115,55 Q80,60 45,55 Z"
            fill="#111827"
          />

          <ellipse cx="72" cy="28" rx="22" ry="7" fill="#1f2937" />

          <ellipse cx="138" cy="38" rx="7" ry="5" fill="#fef08a" />
        </svg>

        <div
          style={{
            position: "absolute",
            bottom: -4,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            borderRadius: 4,
            padding: "2px 6px",
            fontSize: 9,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {BIKE_NUMBER}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [form, setForm] = useState({
    date: "",
    loginHours: "",
    totalOrders: "",
    earningWithoutIncentive: "",
    incentive: "",
    expenses: "",
    totalKm: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/rides");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addDay = async () => {
    const ewi = parseFloat(form.earningWithoutIncentive) || 0;
    const inc = parseFloat(form.incentive) || 0;
    const exp = parseFloat(form.expenses) || 0;

    const newRide = {
      day: `Day ${data.length + 1}`,
      date: form.date,
      loginHours: parseFloat(form.loginHours) || 0,
      totalOrders: parseInt(form.totalOrders) || 0,
      earningWithoutIncentive: ewi,
      incentive: inc,
      earningWithIncentive: ewi + inc,
      expenses: exp,
      netProfit: ewi + inc - exp,
      totalKm: parseFloat(form.totalKm) || 0,
    };

    try {
      const res = await API.post("/rides", newRide);

      setData([...data, res.data]);

      setForm({
        date: "",
        loginHours: "",
        totalOrders: "",
        earningWithoutIncentive: "",
        incentive: "",
        expenses: "",
        totalKm: "",
      });

      setShowForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  const totalProfit = data.reduce((s, d) => s + d.netProfit, 0);

  const balance = GOAL - totalProfit;

  const goalPct = Math.min((totalProfit / GOAL) * 100, 100).toFixed(1);

  return (
    <div
      style={{
        background: "#020617",
        minHeight: "100vh",
        color: "#fff",
        padding: 16,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h1 style={{ color: "#fbbf24" }}>🛺 Rapido Tracker</h1>

        <div style={{ color: "#94a3b8" }}>
          Honda SP 125 • {BIKE_NUMBER}
        </div>
      </div>

      <div
        style={{
          background: "#1e293b",
          borderRadius: 20,
          padding: 10,
          marginBottom: 16,
        }}
      >
        <BikeAnimation />
      </div>

      <div
        style={{
          background: "#1e293b",
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span>🎯 Goal Progress</span>

          <span style={{ color: "#fbbf24" }}>{goalPct}%</span>
        </div>

        <div
          style={{
            height: 12,
            background: "#334155",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${goalPct}%`,
              height: "100%",
              background:
                "linear-gradient(90deg,#f59e0b,#22c55e)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <span style={{ color: "#22c55e", fontWeight: 700 }}>
            ₹{totalProfit.toFixed(2)} earned
          </span>

          <span style={{ color: "#f87171", fontWeight: 700 }}>
            ₹{balance.toFixed(2)} left
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {["overview", "charts", "details"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: 12,
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              background:
                activeTab === tab
                  ? "#fbbf24"
                  : "#1e293b",
              color:
                activeTab === tab
                  ? "#000"
                  : "#fff",
              fontWeight: 700,
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {data.map((d, i) => (
            <div
              key={i}
              style={{
                background: "#1e293b",
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h2 style={{ color: "#fbbf24" }}>
                    {d.day}
                  </h2>

                  <div style={{ color: "#94a3b8" }}>
                    {d.date}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#22c55e",
                      fontWeight: 700,
                      fontSize: 28,
                    }}
                  >
                    ₹{d.netProfit}
                  </div>

                  <div style={{ color: "#94a3b8" }}>
                    Net Profit
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(180px,1fr))",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                {[
                  ["🕒 Login", `${d.loginHours}h`],
                  ["🛺 Orders", d.totalOrders],
                  ["📍 KM", `${d.totalKm} km`],
                  ["💰 w/ Inc", `₹${d.earningWithIncentive}`],
                  ["📦 w/o Inc", `₹${d.earningWithoutIncentive}`],
                  ["🎁 Incentive", `₹${d.incentive}`],
                  ["💸 Expenses", `₹${d.expenses}`],
                  [
                    "📊 ₹/km",
                    `₹${(
                      d.earningWithIncentive /
                      d.totalKm
                    ).toFixed(1)}`,
                  ],
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#020617",
                      padding: 16,
                      borderRadius: 14,
                    }}
                  >
                    <div style={{ color: "#94a3b8" }}>
                      {item[0]}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontWeight: 700,
                        fontSize: 20,
                      }}
                    >
                      {item[1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === "charts" && (
        <div
          style={{
            background: "#1e293b",
            borderRadius: 20,
            padding: 20,
          }}
        >
          <h2 style={{ marginBottom: 20 }}>
            📊 Earnings Analytics
          </h2>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="netProfit"
                  fill="#22c55e"
                />

                <Bar
                  dataKey="expenses"
                  fill="#ef4444"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              width: "100%",
              height: 300,
              marginTop: 30,
            }}
          >
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="earningWithIncentive"
                  stroke="#fbbf24"
                />

                <Line
                  type="monotone"
                  dataKey="netProfit"
                  stroke="#22c55e"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <div
          style={{
            background: "#1e293b",
            borderRadius: 20,
            padding: 20,
          }}
        >
          <h2>📋 Overall Summary</h2>

          <div style={{ marginTop: 20 }}>
            <p>🚴 Total Days: {data.length}</p>

            <p>
              💰 Total Earnings: ₹
              {data.reduce(
                (s, d) =>
                  s + d.earningWithIncentive,
                0
              )}
            </p>

            <p>
              💸 Total Expenses: ₹
              {data.reduce(
                (s, d) => s + d.expenses,
                0
              )}
            </p>

            <p>
              🏆 Total Profit: ₹
              {totalProfit.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 16,
          borderRadius: 16,
          border: "none",
          cursor: "pointer",
          background:
            "linear-gradient(90deg,#f59e0b,#22c55e)",
          color: "#000",
          fontWeight: 800,
          fontSize: 18,
        }}
      >
        {showForm ? "✕ Close Form" : "➕ Add New Day"}
      </button>

      {showForm && (
        <div
          style={{
            background: "#1e293b",
            borderRadius: 20,
            padding: 20,
            marginTop: 16,
          }}
        >
          {[
            ["date", "Date"],
            ["loginHours", "Login Hours"],
            ["totalOrders", "Orders"],
            [
              "earningWithoutIncentive",
              "Earnings",
            ],
            ["incentive", "Incentive"],
            ["expenses", "Expenses"],
            ["totalKm", "Total KM"],
          ].map((f) => (
            <div
              key={f[0]}
              style={{ marginBottom: 12 }}
            >
              <div
                style={{
                  marginBottom: 6,
                  color: "#94a3b8",
                }}
              >
                {f[1]}
              </div>
<input
  type={
    f[0] === "date"
      ? "date"
      : [
          "loginHours",
          "totalOrders",
          "earningWithoutIncentive",
          "incentive",
          "expenses",
          "totalKm",
        ].includes(f[0])
      ? "number"
      : "text"
  }
  value={form[f[0]]}
  onChange={(e) =>
    setForm({
      ...form,
      [f[0]]: e.target.value,
    })
  }
  style={{
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#020617",
    color: "#fff",
  }}
/>
            </div>
          ))}

          <button
            onClick={addDay}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 14,
              border: "none",
              background: "#22c55e",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ✅ Save Day
          </button>
        </div>
      )}
    </div>
  );
}