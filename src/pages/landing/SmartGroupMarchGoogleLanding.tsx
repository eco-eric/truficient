import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useButtonTracking } from "@/hooks/useButtonTracking";
import { usePageSEO } from "@/hooks/usePageSEO";
import GalleryOverlay from "@/components/landing/GalleryOverlay";
import galleryAttic from "@/assets/gallery/attic-install.webp";
import galleryOutdoorSide from "@/assets/gallery/outdoor-units-side.webp";
import galleryClosetFurnace from "@/assets/gallery/closet-furnace.webp";
import galleryStacked from "@/assets/gallery/stacked-condensers.webp";
import galleryYard from "@/assets/gallery/outdoor-unit-yard.webp";
import galleryAirHandler from "@/assets/gallery/air-handler-closet.webp";
import "./smart-group-march-google.css";

const galleryPhotos = [
  { src: galleryAttic, alt: "Goodman SD attic install — Richardson, TX" },
  { src: galleryOutdoorSide, alt: "Side discharge unit — Plano, TX" },
  { src: galleryClosetFurnace, alt: "Clean furnace install — Frisco, TX" },
  { src: galleryStacked, alt: "Stacked condensers — McKinney, TX" },
  { src: galleryYard, alt: "Outdoor unit — Garland, TX" },
  { src: galleryAirHandler, alt: "Air handler closet — Irving, TX" },
];

export default function SmartGroupMarchGoogleLanding() {
  const { trackButtonClick } = useButtonTracking();
  const navigate = useNavigate();
  const [showSticky, setShowSticky] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  usePageSEO("/smart-group-march-G-26");

  useEffect(() => {
    document.title = "20% Off Variable-Speed HVAC — March Smart Group | Truficient Energy Solutions";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Join the March 2026 Smart Group and save 20% on a Goodman SD variable-speed HVAC system. Transparent pricing. Licensed & insured. DFW area.");
  }, []);

  useEffect(() => {
    if ((window as any).gtag) {
      (window as any).gtag("event", "page_view", {
        page_title: "Smart Group March Google Landing",
        campaign_source: "google",
        campaign_medium: "paid",
        campaign_name: "smart-group-march-2026",
      });
    }
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 600;
    if (!isMobile) return;
    const handleScroll = () => setShowSticky(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ctaUrl = "/estimate/smart-group-march";

  const handleCTA = (label: string) => {
    trackButtonClick({ buttonName: label, buttonLocation: "smart-group-march-G-26", destinationUrl: ctaUrl });
    navigate(ctaUrl);
  };

  return (
    <div className="sg-g-page" style={{ paddingBottom: showSticky ? 74 : 0 }}>
      {/* STICKY MOBILE CTA */}
      {showSticky && (
        <div className="sg-g-sticky-mobile">
          <p>March Smart Group<br /><span>20% Off</span> Goodman SD</p>
          <Link to={ctaUrl} onClick={() => trackButtonClick({ buttonName: "Sticky CTA", buttonLocation: "smart-group-march-G-26", destinationUrl: ctaUrl })}>Get My Price →</Link>
        </div>
      )}

      {/* BANNER */}
      <div className="sg-g-banner">
        🔥 March 2026 Smart Group — 20% Off Goodman SD Variable-Speed Systems &nbsp;·&nbsp; Limited to March Installs
      </div>

      {/* NAV */}
      <nav className="sg-g-nav">
        <a href="https://truficient.com" className="sg-g-logo">Truf<span>icient</span></a>
        <div className="sg-g-nav-right">
          <a href="tel:2142384349" className="sg-g-nav-phone">📞 (214) 238-4349</a>
          <Link to={ctaUrl} className="sg-g-nav-cta" onClick={() => handleCTA("Nav CTA")}>Get My Price →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="sg-g-hero">
        <div className="sg-g-container">
          <div className="sg-g-hero-eyebrow">🗓 March 2026 · Smart Group Buy</div>
          <h1>Save <em>20% Off</em> a Variable-Speed HVAC System This March</h1>
          <p className="sg-g-hero-sub">Join our March Smart Group and get a Goodman SD variable-speed system installed at 20% below regular price — with fully transparent, online pricing. No surprises.</p>
          <div className="sg-g-hero-badges">
            <span className="sg-g-badge">📌 Real prices online</span>
            <span className="sg-g-badge">⏱ 2-minute estimate</span>
            <span className="sg-g-badge">🏠 DFW area only</span>
            <span className="sg-g-badge">✅ Mitsubishi Diamond Contractor</span>
          </div>
          <div className="sg-g-hero-cta-group">
            <button className="sg-g-btn-primary" onClick={() => handleCTA("Hero CTA")}>
              Get My Free Price Estimate <span className="sg-arrow">→</span>
            </button>
            <p className="sg-g-hero-micro">No obligation &nbsp;·&nbsp; No sales call required &nbsp;·&nbsp; Instant online pricing</p>
          </div>
        </div>
      </section>

      {/* SAVINGS STRIP */}
      <div className="sg-g-savings-strip">
        <p>Smart Group Savings: <span>20% off</span> Goodman SD Variable-Speed — Select <strong>"Efficient"</strong> in the estimator to apply</p>
      </div>

      {/* HOW IT WORKS */}
      <div className="sg-g-how">
        <section className="sg-g-section">
          <div className="sg-g-container">
            <p className="sg-g-section-label">The Process</p>
            <h2>How the Smart Group Works</h2>
            <p style={{ color: "var(--sg-gray-txt)", fontSize: "0.9rem", maxWidth: 540 }}>We group installs in March to offer deeper discounts. Four simple steps:</p>
            <div className="sg-g-steps-grid">
              {[
                { n: 1, t: "Get Your Price Online", d: "Answer a few questions about your home. See your exact, final install price in under 2 minutes — no sales call." },
                { n: 2, t: 'Select "Efficient" Tier', d: 'In the estimator, choose the "Efficient" system tier. Your 20% Smart Group discount applies automatically.' },
                { n: 3, t: "Scheduled in March", d: "We lock you in for a March 2026 install date. Our crew handles everything — done before the Texas heat hits." },
                { n: 4, t: "That's the Price You Pay", d: "No hidden fees, no surprises at install. The price you see online is the price on your invoice." },
              ].map((s) => (
                <div key={s.n} className="sg-g-step-card">
                  <div className="sg-g-step-num">{s.n}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* WHY VARIABLE SPEED */}
      <div className="sg-g-why">
        <section className="sg-g-section">
          <div className="sg-g-container">
            <p className="sg-g-section-label">Why It Matters</p>
            <h2>Why We Only Install Variable-Speed Systems</h2>
            <p style={{ color: "var(--sg-gray-txt)", fontSize: "0.9rem", maxWidth: 560, marginBottom: 0 }}>Basic on/off equipment cools your home like a light switch. Variable-speed changes everything.</p>
            <div className="sg-g-benefits-grid">
              {[
                { icon: "❄️", cls: "blue", t: "No More Hot & Cold Spots", d: "Runs continuously at low speed, maintaining even temps throughout every room." },
                { icon: "💸", cls: "green", t: "Up to 30–40% Lower Bills", d: "Precise modulation uses far less energy than systems that cycle on and off all day." },
                { icon: "💧", cls: "blue", t: "Better Humidity Control", d: "Longer, slower run times pull significantly more moisture out of the air — crucial in Texas summers." },
                { icon: "🔇", cls: "green", t: "Whisper-Quiet Operation", d: "No more jarring on/off blasts. Variable-speed runs so quietly you'll forget it's there." },
                { icon: "🔧", cls: "orange", t: "Longer Equipment Life", d: "Fewer start/stop cycles means dramatically less mechanical stress on the compressor." },
                { icon: "📱", cls: "orange", t: "Smart Thermostat Ready", d: "Full compatibility with Ecobee, Nest, and other smart controllers for whole-home automation." },
              ].map((b) => (
                <div key={b.t} className="sg-g-benefit-card">
                  <div className={`sg-g-benefit-icon ${b.cls}`}>{b.icon}</div>
                  <div>
                    <h3>{b.t}</h3>
                    <p>{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* PRICING */}
      <div className="sg-g-pricing">
        <section className="sg-g-section">
          <div className="sg-g-container">
            <p className="sg-g-section-label">Transparent Pricing</p>
            <h2>Real Numbers. No Surprises.</h2>
            <p style={{ color: "var(--sg-gray-txt)", fontSize: "0.9rem", maxWidth: 540 }}>Here's an example what it looks like with the Smart Group discount. Use our estimator for your exact price.</p>
            <div className="sg-g-price-example">
              <div className="sg-g-price-header">Example Pricing · Goodman SD Variable-Speed System</div>
              <div className="sg-g-price-rows">
                <div className="sg-g-price-row strikethrough">
                  <span className="sg-label">Standard Install Price</span>
                  <span className="sg-amt">$15,000</span>
                </div>
                <div className="sg-g-price-row">
                  <span className="sg-label">Smart Group Discount (20%)</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="sg-g-discount-badge">20% OFF</span>
                    <span className="sg-amt" style={{ color: "var(--sg-green)", fontWeight: 700 }}>−$3,000</span>
                  </div>
                </div>
                <div className="sg-g-price-row">
                  <span className="sg-label">Equipment + Labor + Materials</span>
                  <span className="sg-amt">All included</span>
                </div>
                <div className="sg-g-price-row total">
                  <span className="sg-label">Your Smart Group Price</span>
                  <span className="sg-amt">$12,000</span>
                </div>
              </div>
              <p className="sg-g-price-note">* Financing available — $150/mo until paid in full at 9.99% APR. Price varies by home — use the estimator for your exact quote.</p>
            </div>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button className="sg-g-btn-primary" onClick={() => handleCTA("Pricing CTA")} style={{ display: "inline-flex" }}>
                Get My Exact Price <span className="sg-arrow">→</span>
              </button>
              <p style={{ fontSize: "0.73rem", color: "var(--sg-gray-txt)", marginTop: 10 }}>Takes 2 minutes · No personal info required to see pricing</p>
            </div>
          </div>
        </section>
      </div>

      {/* TRUST */}
      <div className="sg-g-trust">
        <section className="sg-g-section">
          <div className="sg-g-container">
            <p className="sg-g-section-label">Why Truficient</p>
            <h2>We're Not Your Average HVAC Contractor</h2>
            <div className="sg-g-trust-grid">
              {[
                { icon: "💎", t: "Diamond Contractor", d: "Mitsubishi Electric's highest installer certification. Fewer than 3% qualify." },
                { icon: "🏠", t: "1,000+ Installs", d: "Over a thousand completed installations across the DFW metroplex." },
                { icon: "⭐", t: "4.9 Google Rating", d: "Consistently top-rated for quality, timeliness, and transparency." },
                { icon: "📋", t: "HERS Certified", d: "Energy efficiency specialists. We size systems right — not oversized." },
                { icon: "🔒", t: "Licensed & Insured", d: "Fully licensed in Texas. Liability covered. Zero risk to you." },
                { icon: "💵", t: "Price-Match Guarantee", d: "Find a lower quote for the same system? We'll match it." },
              ].map((ti) => (
                <div key={ti.t} className="sg-g-trust-item">
                  <span className="sg-trust-icon">{ti.icon}</span>
                  <strong>{ti.t}</strong>
                  <p>{ti.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* GALLERY */}
      <div className="sg-g-gallery">
        <section className="sg-g-section">
          <div className="sg-g-container">
            <p className="sg-g-section-label">Our Work</p>
            <h2>Real DFW Installs</h2>
            <p style={{ color: "var(--sg-gray-txt)", fontSize: "0.9rem", maxWidth: 500, marginBottom: 0 }}>Clean, code-compliant, built to last. See what your neighbors are getting.</p>
            <div className="sg-g-gallery-grid">
              {galleryPhotos.map((photo, i) => (
                <div key={i} className="sg-g-gallery-thumb">
                  <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" width="600" height="450" />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                className="sg-g-btn-secondary"
                onClick={() => { setGalleryOpen(true); trackButtonClick({ buttonName: "View Full Gallery", buttonLocation: "smart-group-march-G-26", destinationUrl: "#gallery" }); }}
                style={{
                  background: "transparent",
                  border: "2px solid var(--sg-navy)",
                  color: "var(--sg-navy)",
                  padding: "10px 28px",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--sg-gold)"; e.currentTarget.style.color = "var(--sg-gold-dk)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--sg-navy)"; e.currentTarget.style.color = "var(--sg-navy)"; }}
              >
                View Full Gallery →
              </button>
            </div>
          </div>
        </section>
      </div>

      <GalleryOverlay open={galleryOpen} onClose={() => setGalleryOpen(false)} />

      {/* REVIEWS */}
      <div className="sg-g-proof">
        <section className="sg-g-section">
          <div className="sg-g-container">
            <p className="sg-g-section-label">Customer Reviews</p>
            <h2>What DFW Homeowners Are Saying</h2>
            <div className="sg-g-reviews-grid">
              {[
                { text: '"The online estimator showed me an exact price and that\'s exactly what I paid. No upsells, no surprises. Install crew was in and out in one day. My electric bill dropped immediately."', author: "— Michael T., Plano TX" },
                { text: '"I used to have a hot spot in our master bedroom every summer. With the variable-speed system Truficient installed, every room in the house is the same temperature. Game changer."', author: "— Sarah K., Frisco TX" },
                { text: '"Did the online estimate, called to confirm, they were here the next week. Completely transparent pricing. Would never go back to a regular HVAC company."', author: "— David R., Allen TX" },
              ].map((r, i) => (
                <div key={i} className="sg-g-review-card">
                  <div className="sg-g-review-stars">★★★★★</div>
                  <p className="sg-g-review-text">{r.text}</p>
                  <p className="sg-g-review-author">{r.author}</p>
                </div>
              ))}
            </div>
            <div className="sg-g-proof-stats">
              {[
                { num: "1,000+", lbl: "Completed Installs" },
                { num: "4.9⭐", lbl: "Google Rating" },
                { num: "20%", lbl: "Smart Group Savings" },
                { num: "March", lbl: "Only — Limited Slots" },
              ].map((s) => (
                <div key={s.lbl} className="sg-g-proof-stat">
                  <span className="sg-num">{s.num}</span>
                  <span className="sg-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* BOTTOM CTA */}
      <div className="sg-g-bottom-cta">
        <div className="sg-g-container">
          <div className="sg-g-urgency-bar">🔥 March 2026 Only — Limited Install Slots Remaining</div>
          <h2>Ready to Lock In Your 20% Discount?</h2>
          <p>Get your exact, final price online in under 2 minutes. No sales call. No pressure. Transparent pricing on a system that will change how your home feels.</p>
          <button className="sg-g-btn-primary" onClick={() => handleCTA("Bottom CTA")} style={{ display: "inline-flex", fontSize: "1.05rem" }}>
            Start My Free Estimate <span className="sg-arrow">→</span>
          </button>
          <p style={{ fontSize: "0.73rem", color: "var(--sg-gray-txt)", marginTop: 12 }}>No obligation · Instant pricing · Your 20% discount applies at checkout</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="sg-g-footer">
        <p><strong style={{ color: "rgba(255,255,255,0.6)" }}>Truficient Energy Solutions</strong></p>
        <p>808 Business Pkwy, Richardson TX 75081 &nbsp;·&nbsp; <a href="tel:2142384349">(214) 238-4349</a> &nbsp;·&nbsp; <a href="mailto:info@truficient.com">info@truficient.com</a></p>
        <p>Mitsubishi Diamond Contractor &nbsp;·&nbsp; HERS Certified &nbsp;·&nbsp; Licensed &amp; Insured &nbsp;·&nbsp; DFW Area</p>
        <p style={{ marginTop: 8 }}>*20% Smart Group discount applies to Goodman SD variable-speed systems on March 2026 installations only. Financing subject to credit approval via Synchrony Bank.</p>
      </footer>
    </div>
  );
}
