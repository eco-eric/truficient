import { useState } from "react";
import { useNavigate } from "react-router-dom";
import truficientLogo from "@/assets/truficient-logo.webp";

const SmartGroupEntry = () => {
  const [zip, setZip] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    const params = new URLSearchParams({
      utm_source: "smart_group_march",
      utm_medium: "landing_page",
      utm_campaign: "smart_group_v2",
      source: "smart_group_march_v2",
      zip: zip,
    });
    navigate(`/central-ac-estimate?${params.toString()}`);
  };

  return (
    <div className="min-h-screen" style={{ background: "#f5f7fa", fontFamily: "'Open Sans', sans-serif" }}>
      {/* MINIMAL NAV */}
      <nav
        className="flex items-center justify-between"
        style={{ background: "#002244", height: 56, padding: "0 20px" }}
      >
        <a href="/" className="flex items-center gap-1.5 no-underline">
          <img src={truficientLogo} alt="Truficient" className="h-7 w-7 rounded object-contain" />
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: "1.05rem",
              color: "#fff",
            }}
          >
            Truf<span style={{ color: "#FFB547" }}>icient</span>
          </span>
        </a>
        <a
          href="tel:2142384349"
          style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}
        >
          📞 (214) 238-4349
        </a>
      </nav>

      {/* CAMPAIGN BANNER */}
      <div
        style={{
          background: "#FFB547",
          padding: "9px 20px",
          textAlign: "center",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#002244",
          letterSpacing: "0.02em",
        }}
      >
        🔥 March 2026 Smart Group — 20% Off Goodman SD Variable-Speed Systems
      </div>

      {/* PAGE CONTENT */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 48px" }}>
        {/* OFFER CALLOUT */}
        <div
          style={{
            background: "#003366",
            borderRadius: 10,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "#FFB547",
              color: "#002244",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: "1.3rem",
              lineHeight: 1,
              padding: "9px 12px",
              borderRadius: 7,
              textAlign: "center",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            20%
            <br />
            OFF
            <small
              style={{
                display: "block",
                fontSize: "0.5rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.85,
                marginTop: 2,
              }}
            >
              Smart Group
            </small>
          </div>
          <div>
            <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.55 }}>
              Select <strong style={{ color: "#fff" }}>"Efficient"</strong> in the estimator to get your 20% Smart Group discount on the Goodman SD variable-speed system.
            </p>
            <p style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.52)", marginTop: 4, fontStyle: "italic" }}>
              We only install variable-speed systems — no basic on/off equipment.
            </p>
          </div>
        </div>

        {/* ESTIMATOR WIDGET */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Widget Header */}
          <div style={{ padding: "24px 24px 20px", textAlign: "center", borderBottom: "1px solid #e8ecf0" }}>
            <h1
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.25rem, 5vw, 1.6rem)",
                color: "#003366",
                lineHeight: 1.2,
                marginBottom: 7,
              }}
            >
              Get Your Instant HVAC Price Online
            </h1>
            <p style={{ fontSize: "0.83rem", color: "#5a6a7a", lineHeight: 1.6 }}>
              Answer a few questions about your home and see accurate, transparent pricing for your new variable-speed system.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginTop: 12 }}>
              {["📌 Final pricing, not estimates", "⏱ Takes just 2 minutes", "📅 No appointment required"].map((t) => (
                <span
                  key={t}
                  style={{
                    background: "#f5f7fa",
                    border: "1px solid #d6dde4",
                    borderRadius: 999,
                    padding: "4px 11px",
                    fontSize: "0.7rem",
                    color: "#5a6a7a",
                    fontWeight: 500,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Real Prices Box */}
          <div
            style={{
              margin: "0 24px",
              marginTop: 18,
              background: "#e8f5e9",
              border: "1px solid #c8e6c9",
              borderRadius: 8,
              padding: "13px 15px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>✅</span>
            <div>
              <h4
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: "#1e7e34",
                  marginBottom: 3,
                }}
              >
                Real Prices, Not Just Estimates
              </h4>
              <p style={{ fontSize: "0.75rem", color: "#388e3c", lineHeight: 1.5, margin: 0 }}>
                No surprises, no hidden fees. As long as your home matches the details you provide, this is the final price you'll pay.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                {["No hidden fees", "Price-match guarantee", "Licensed & insured"].map((c) => (
                  <span key={c} style={{ fontSize: "0.68rem", color: "#2e7d32", fontWeight: 600 }}>
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ZIP Input + Button */}
          <div style={{ padding: "18px 24px 22px" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#003366",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              📍 Enter your ZIP code to get started
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 75024"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              style={{
                width: "100%",
                border: "2px solid #d6dde4",
                borderRadius: 8,
                padding: "15px 16px",
                fontSize: 16,
                fontFamily: "'Open Sans', sans-serif",
                color: "#1a2b3c",
                outline: "none",
                marginBottom: 12,
                WebkitAppearance: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#003366")}
              onBlur={(e) => (e.target.style.borderColor = "#d6dde4")}
            />
            <button
              onClick={handleStart}
              style={{
                width: "100%",
                background: "#FFB547",
                color: "#002244",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "1.05rem",
                padding: "17px 20px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 56,
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FFC96B")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FFB547")}
            >
              Start My Free Estimate <span>→</span>
            </button>
            <p style={{ textAlign: "center", fontSize: "0.71rem", color: "#5a6a7a", marginTop: 10, lineHeight: 1.5 }}>
              No obligation · Takes about 2 minutes · Your 20% discount applies at the end
            </p>
          </div>

          {/* Social Proof */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 32,
              padding: "15px 24px",
              borderTop: "1px solid #e8ecf0",
              background: "#f5f7fa",
            }}
          >
            {[
              { num: "1,000+", lbl: "Installs" },
              { num: "4.9 ⭐", lbl: "Google Rating" },
              { num: "March", lbl: "Only" },
            ].map((item) => (
              <div key={item.lbl} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "#003366",
                    lineHeight: 1,
                  }}
                >
                  {item.num}
                </div>
                <div style={{ fontSize: "0.67rem", color: "#5a6a7a", marginTop: 2 }}>{item.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MINI FOOTER */}
        <div style={{ textAlign: "center", padding: "16px 20px 0", fontSize: "0.69rem", color: "#5a6a7a", lineHeight: 1.7 }}>
          Truficient Energy Solutions · 808 Business Pkwy, Richardson TX 75081
          <br />
          <a href="tel:2142384349" style={{ color: "#5a6a7a", textDecoration: "none" }}>
            (214) 238-4349
          </a>{" "}
          ·{" "}
          <a href="mailto:info@truficient.com" style={{ color: "#5a6a7a", textDecoration: "none" }}>
            info@truficient.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default SmartGroupEntry;
