import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useButtonTracking } from "@/hooks/useButtonTracking";
import ownerPhoto from "@/assets/owner-eric.jpg";
import "./smart-group-march.css";

// SVG gallery placeholders (inline for self-containment)
const GalleryPlaceholder1 = () => (
  <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="450" fill="#1a2b3c"/><linearGradient id="s1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#87CEEB" stopOpacity="0.5"/><stop offset="100%" stopColor="#2a3a50"/></linearGradient><rect width="800" height="450" fill="url(#s1)"/><rect x="0" y="200" width="800" height="250" fill="#c4b8a8"/><rect x="0" y="340" width="800" height="110" fill="#8B7355"/><rect x="280" y="200" width="240" height="190" rx="6" fill="#e0e0e0" stroke="#bbb" strokeWidth="2"/><rect x="280" y="200" width="240" height="30" rx="4" fill="#d0d0d0"/><rect x="295" y="240" width="210" height="130" rx="3" fill="#c8c8c8"/>{[255,270,285,300,315,330,345,360].map(y=><line key={y} x1="295" y1={y} x2="505" y2={y} stroke="#aaa" strokeWidth="1.5"/>)}<rect x="310" y="207" width="90" height="16" rx="2" fill="#E8600A" opacity="0.9"/><text x="355" y="219" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">GOODMAN</text><rect x="265" y="385" width="270" height="15" rx="3" fill="#aaa"/></svg>
);
const GalleryPlaceholder2 = () => (
  <svg viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="450" fill="#2a3a50"/><rect x="0" y="220" width="600" height="230" fill="#b0a090"/><rect x="170" y="210" width="200" height="175" rx="5" fill="#ddd" stroke="#bbb" strokeWidth="2"/><rect x="170" y="210" width="200" height="28" rx="4" fill="#ccc"/><rect x="175" y="248" width="190" height="120" rx="3" fill="#c5c5c5"/>{[262,276,290,304,318,332,346,360].map(y=><line key={y} x1="175" y1={y} x2="365" y2={y} stroke="#aaa" strokeWidth="1.5"/>)}<rect x="185" y="215" width="80" height="14" rx="2" fill="#E8600A" opacity="0.9"/><text x="225" y="226" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">GOODMAN</text><rect x="155" y="378" width="230" height="13" rx="3" fill="#999"/></svg>
);
const GalleryPlaceholder3 = () => (
  <svg viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="450" fill="#3a4a5a"/><rect x="0" y="180" width="600" height="270" fill="#c4a882"/>{[180,210,240,270,300,330,360].map(y=><rect key={y} x="0" y={y} width="600" height="20" fill="#b89060" opacity="0.4"/>)}<rect x="0" y="400" width="600" height="50" fill="#6a8a4a"/><rect x="160" y="175" width="220" height="210" rx="5" fill="#e5e5e5" stroke="#ccc" strokeWidth="2"/><rect x="160" y="175" width="220" height="32" rx="4" fill="#d5d5d5"/><rect x="168" y="216" width="204" height="145" rx="3" fill="#d0d0d0"/>{[230,246,262,278,294,310,326,342,358].map(y=><line key={y} x1="168" y1={y} x2="372" y2={y} stroke="#bbb" strokeWidth="2"/>)}<rect x="175" y="182" width="90" height="16" rx="2" fill="#E8600A" opacity="0.9"/><text x="220" y="194" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">GOODMAN</text><rect x="145" y="382" width="250" height="18" rx="3" fill="#aaa"/></svg>
);
const GalleryPlaceholder4 = () => (
  <svg viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg"><linearGradient id="r1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0e8dc"/><stop offset="100%" stopColor="#c0b8ac"/></linearGradient><rect width="600" height="450" fill="url(#r1)"/><rect x="100" y="80" width="180" height="300" rx="4" fill="#ddd" stroke="#ccc" strokeWidth="2"/><rect x="100" y="80" width="180" height="40" rx="4" fill="#ccc"/><rect x="110" y="130" width="160" height="220" rx="3" fill="#c8c8c8"/>{[148,164,180,196,212,228,244,260,276,292,308,324,340].map(y=><line key={y} x1="110" y1={y} x2="270" y2={y} stroke="#bbb" strokeWidth="2"/>)}<rect x="112" y="87" width="80" height="14" rx="2" fill="#E8600A" opacity="0.9"/><text x="152" y="98" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">GOODMAN</text><rect x="295" y="120" width="80" height="110" rx="4" fill="#1a2b3c"/><rect x="140" y="30" width="100" height="52" rx="3" fill="#ccc" stroke="#bbb" strokeWidth="2"/></svg>
);
const GalleryPlaceholder5 = () => (
  <svg viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="450" fill="#1a2b3c"/><rect x="0" y="230" width="600" height="220" fill="#b8a888"/><rect x="0" y="390" width="600" height="60" fill="#5a7a3a"/><rect x="80" y="210" width="185" height="175" rx="5" fill="#e0e0e0" stroke="#ccc" strokeWidth="2"/><rect x="80" y="210" width="185" height="28" rx="4" fill="#d0d0d0"/><rect x="87" y="248" width="171" height="115" rx="3" fill="#ccc"/><rect x="92" y="217" width="80" height="14" rx="2" fill="#E8600A" opacity="0.9"/><text x="132" y="228" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">GOODMAN</text><rect x="290" y="210" width="185" height="175" rx="5" fill="#e0e0e0" stroke="#ccc" strokeWidth="2"/><rect x="290" y="210" width="185" height="28" rx="4" fill="#d0d0d0"/><rect x="302" y="217" width="80" height="14" rx="2" fill="#E8600A" opacity="0.9"/><text x="342" y="228" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">GOODMAN</text><rect x="68" y="382" width="210" height="14" rx="3" fill="#999"/><rect x="278" y="382" width="210" height="14" rx="3" fill="#999"/></svg>
);
const GalleryPlaceholder6 = () => (
  <svg viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="450" fill="#2a3a4a"/><rect x="0" y="200" width="600" height="250" fill="#c8b898"/><rect x="0" y="380" width="600" height="70" fill="#708860"/><rect x="400" y="100" width="20" height="350" fill="#8B6914"/><rect x="200" y="190" width="175" height="175" rx="5" fill="#ddd" stroke="#ccc" strokeWidth="2"/><rect x="200" y="190" width="175" height="27" rx="4" fill="#ccc"/><rect x="208" y="226" width="159" height="115" rx="3" fill="#c8c8c8"/><rect x="213" y="196" width="80" height="13" rx="2" fill="#E8600A" opacity="0.9"/><text x="253" y="207" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">GOODMAN</text><rect x="185" y="360" width="200" height="14" rx="3" fill="#999"/></svg>
);

const galleryItems = [
  { Component: GalleryPlaceholder1, tag: "New Install", caption: "Goodman SD Install — Richardson, TX" },
  { Component: GalleryPlaceholder2, tag: "Fence-Line SD", caption: "Side Discharge — Plano, TX" },
  { Component: GalleryPlaceholder3, tag: "Brick Home", caption: "Clean Install — Frisco, TX" },
  { Component: GalleryPlaceholder4, tag: "Air Handler", caption: "Indoor Unit Install — McKinney, TX" },
  { Component: GalleryPlaceholder5, tag: "Dual System", caption: "Two-System Replace — Garland, TX" },
  { Component: GalleryPlaceholder6, tag: "Tight Clearance", caption: "SD Fence-Line Install — Irving, TX" },
];

export default function SmartGroupMarchLanding() {
  const { trackButtonClick } = useButtonTracking();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const formSectionRef = useRef<HTMLElement>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [timeline, setTimeline] = useState("");
  const [referral, setReferral] = useState("");

  // Tracking on mount
  useEffect(() => {
    // Facebook Pixel ViewContent
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "ViewContent", { content_name: "March Group Buy Landing" });
    }
    // GA4
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_view", { page_title: "March Group Buy Landing" });
    }
  }, []);

  // Sticky CTA logic
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const handleScroll = () => {
      if (window.scrollY > 400) setShowSticky(true);
    };
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setShowSticky(false);
        else if (window.scrollY > 400) setShowSticky(true);
      });
    });
    if (formSectionRef.current) observer.observe(formSectionRef.current);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Insert into landing_page_submissions
      await supabase.from("landing_page_submissions").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        form_type: "group-buy-march-2026",
        source: "march_group_buy_landing",
        form_data: { zip, timeline, referral },
      });

      // Sync to GHL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      fetch(`${supabaseUrl}/functions/v1/sync-ghl-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          source: "march_group_buy_landing",
          tags: ["Goodman Group Buy", "March 2026", "Facebook Ad"],
          customFields: {
            zip_code: zip,
            service_type: "Group Buy - Goodman SD Variable Speed",
            message: `Timeline: ${timeline}. Referred by: ${referral || "N/A"}`,
          },
        }),
      }).catch(() => {}); // Non-blocking

      // Tracking
      if ((window as any).fbq) (window as any).fbq("track", "Lead");
      if ((window as any).gtag) (window as any).gtag("event", "generate_lead", { currency: "USD", value: 0 });

      trackButtonClick({ buttonName: "Group Buy Form Submit", buttonLocation: "smart-group-march-F-26", destinationUrl: "" });
      setSubmitted(true);
    } catch {
      // Still show success to user
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gb-page" style={{ paddingBottom: showSticky ? 72 : 0 }}>
      {/* STICKY MOBILE CTA */}
      {showSticky && (
        <div className="gb-mobile-sticky-cta" style={{ display: "block" }}>
          <a href="#get-info">Reserve My Spot — Free, No Obligation →</a>
        </div>
      )}

      {/* ANNOUNCEMENT */}
      <div className="gb-announce">🔥 March 2026 Only — DFW Homeowners · Limited Group Spots Available</div>

      {/* NAV */}
      <nav className="gb-nav">
        <a href="https://www.truficient.com" className="gb-logo">Truf<span>icient</span></a>
        <a href="tel:2142384349" className="gb-nav-phone">📞 (214) 238-4349</a>
      </nav>

      {/* HERO */}
      <section className="gb-hero">
        <div className="gb-hero-bg-circle gb-hbc1" />
        <div className="gb-hero-bg-circle gb-hbc2" />
        <div className="gb-inner gb-hero-inner">
          <div>
            <div className="gb-hero-eyebrow"><span className="gb-eyebrow-dot" /> March 2026 · DFW Group Buy</div>
            <h1>Save on the install.<br /><span className="gb-hl">Save every month</span> after that.</h1>
            <p className="gb-hero-sub">Join Truficient's March High-Efficiency Group Buy. Get up to <strong>20% off</strong> your Goodman SD variable-speed system — and cut your monthly energy bills for years to come.</p>
            <div className="gb-hero-badges">
              {["Mitsubishi Diamond Contractor", "HERS Certified", "1,000+ DFW Installs", "Licensed & Insured"].map((b) => (
                <div key={b} className="gb-hbadge"><span className="gb-hbadge-dot" />{b}</div>
              ))}
            </div>
            <div className="gb-hero-btns">
              <a href="#get-info" className="gb-btn-orange" onClick={() => trackButtonClick({ buttonName: "Get Full Details CTA", buttonLocation: "hero", destinationUrl: "#get-info" })}>Get the Full Details →</a>
              <a href="#how-it-works" className="gb-btn-ghost">See How It Works</a>
            </div>
          </div>
          {/* Offer Card */}
          <div className="gb-offer-card">
            <div className="gb-oc-head">
              <div className="gb-sub">March Group Buy</div>
              <div className="gb-big">Up to 20% Off</div>
            </div>
            {[
              { lbl: "System", val: "Goodman SD Variable-Speed" },
              { lbl: "SEER2 Rating", val: "16–17 SEER2" },
              { lbl: "Installs to unlock", val: "7 DFW homes" },
              { lbl: "Your group discount", val: "20% OFF", cls: "gb-orange gb-big-val" },
              { lbl: "Est. monthly energy savings", val: "$70–$110/mo" },
              { lbl: "Referral bonus", val: "$250 cash/friend", cls: "gb-orange" },
              { lbl: "Cost to join", val: "Free · No obligation" },
            ].map((r) => (
              <div key={r.lbl} className="gb-oc-row">
                <span className="gb-lbl">{r.lbl}</span>
                <span className={`gb-val ${r.cls || ""}`}>{r.val}</span>
              </div>
            ))}
            <div className="gb-oc-foot">No deposit required. Walk away if the group doesn't reach 7.</div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="gb-trust-bar">
        <div className="gb-trust-bar-inner">
          {[
            { ic: "🏆", t: "Mitsubishi Diamond" },
            { ic: "⭐", t: "5-Star Google" },
            { ic: "🔧", t: "1,000+ Installs" },
            { ic: "📋", t: "Licensed & Insured" },
            { ic: "🌡️", t: "HERS Certified" },
          ].map((ti) => (
            <div key={ti.t} className="gb-ti"><div className="gb-ic">{ti.ic}</div>{ti.t}</div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: "#fff" }}>
        <div className="gb-inner">
          <div className="gb-section-tag">How It Works</div>
          <h2>Simple. No tricks. No pressure.</h2>
          <p className="gb-section-sub">Here's exactly how the March Group Buy works — four steps from first click to install day.</p>
          <div className="gb-steps">
            {[
              { icon: "📐", num: "Step 01", title: "Get Your Free Estimate", desc: <>Use our <strong>free online estimator</strong> to build your system. You'll see a transparent, itemized price for a Goodman SD variable-speed system sized for your home.</> },
              { icon: "✋", num: "Step 02", title: "Join the March Group", desc: <>Fill out the form below or note <strong>"Goodman Group Buy"</strong> in your estimate. No payment, no commitment — just reserve your spot.</> },
              { icon: "🎯", num: "Step 03", title: "We Hit 7 Installs", desc: <>Once we confirm <strong>7 March installs</strong>, everyone's price drops to 80% of their estimate. Don't hit 7? Proceed at standard price or walk away — zero obligation.</> },
              { icon: "⚡", num: "Step 04", title: "Install & Start Saving", desc: <>We install at <strong>group pricing</strong> and your energy savings begin immediately. Double savings — once on the install, every month on your bills.</> },
            ].map((s) => (
              <div key={s.num} className="gb-step">
                <div className="gb-step-left">
                  <div className="gb-step-circle">{s.icon}</div>
                  <div className="gb-step-num-label">{s.num}</div>
                </div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OWNER */}
      <section className="gb-owner-section">
        <div className="gb-inner">
          <div className="gb-section-tag" style={{ color: "var(--gb-orange-lt)" }}>From the Owner</div>
          <div className="gb-owner-card">
            <div className="gb-owner-photo-wrap">
              <img src={ownerPhoto} alt="Eric, Owner of Truficient" className="gb-owner-photo" />
              <div className="gb-owner-badge">Eric · Owner</div>
            </div>
            <div className="gb-owner-content">
              <blockquote>"I started Truficient because I believe every DFW homeowner deserves a comfortable home that doesn't cost a fortune to run. The Group Buy is my way of making that more accessible — when we install in bulk, I can pass real savings back to you."</blockquote>
              <p>I personally oversee every install to make sure it's done right. Over 1,000 systems installed across DFW, and I'm still on the job site making sure each one exceeds expectations. This isn't just about selling equipment — it's about engineering a system that genuinely improves your daily life and your monthly budget.</p>
              <p>The Goodman SD side-discharge units we're featuring this month are solid, variable-speed machines that run at exactly the capacity your home needs — quieter, more consistent temps, and dramatically lower energy usage than the single-speed equipment most DFW homes still have.</p>
              <div className="gb-owner-creds">
                {["Mitsubishi Diamond Contractor", "HERS Certified", "1,000+ Installs", "Richardson, TX Based"].map((c) => (
                  <span key={c} className="gb-cred-chip">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="gb-gallery-section">
        <div className="gb-inner">
          <div className="gb-section-tag">Our Work</div>
          <h2>Goodman SD Installs Across DFW</h2>
          <p className="gb-section-sub">These are the same side-discharge variable-speed systems featured in the March Group Buy — installed clean, by Truficient.</p>
          <div className="gb-gallery-intro">
            <h3>About the Goodman SD Variable-Speed Unit</h3>
            <ul>
              <li><strong>Side Discharge (SD)</strong> design — ideal for tight yards and fence-line installs</li>
              <li><strong>16–17 SEER2</strong> variable-speed compressor — significant upgrade over standard 14 SEER single-speed units</li>
              <li>Runs at <strong>precise capacity</strong> your home needs — not just full blast on/off</li>
              <li>Quieter operation, better humidity control, more even temperatures room to room</li>
              <li>Qualifies for <strong>Synchrony Bank financing</strong> through Truficient</li>
            </ul>
          </div>
          <div className="gb-gallery-grid">
            {galleryItems.map((g, i) => (
              <div key={i} className="gb-gallery-item">
                <g.Component />
                <span className="gb-gallery-tag">{g.tag}</span>
                <div className="gb-gallery-caption">{g.caption}</div>
              </div>
            ))}
          </div>
          <p className="gb-gallery-replace-note">📸 Placeholder illustrations — replace with actual Truficient job site photos before publishing</p>
        </div>
      </section>

      {/* ENERGY SAVINGS */}
      <section className="gb-savings-section">
        <div className="gb-inner">
          <div className="gb-section-tag">Energy Savings</div>
          <h2>What upgrading really means<br />for your DFW energy bill.</h2>
          <p className="gb-section-sub">Dallas-Fort Worth summers are relentless. Here's what homeowners typically see after replacing an older single-speed system with a Goodman SD variable-speed unit.</p>
          <div className="gb-savings-grid">
            <div className="gb-big-stat-card">
              <div className="gb-stat-num">Up to 30%+</div>
              <div className="gb-stat-lbl">Reduction in HVAC energy usage</div>
              <p>When replacing a 10–15 year-old system with a properly-sized 16–17 SEER2 variable-speed unit, many DFW homeowners report significant reductions in monthly cooling costs — especially during peak summer months.</p>
            </div>
            <div className="gb-savings-right">
              <h3>Why your older system costs more than it should</h3>
              <p>Traditional single-speed systems blast on at 100% power, cool quickly, then shut off — leaving humidity behind and cycling on again minutes later. Variable-speed systems ramp up and down continuously, using exactly the energy required at any moment.</p>
              <ul className="gb-fact-list">
                <li>HVAC accounts for <strong>~60% of the average Texas home's energy bill</strong></li>
                <li>A 10-year-old unit can be <strong>up to 40% less efficient</strong> than today's models</li>
                <li>Goodman SD runs at <strong>16–17 SEER2</strong> vs. 10–13 SEER on older equipment</li>
                <li>Better humidity control means your thermostat <strong>doesn't have to work as hard</strong></li>
                <li>DFW averages <strong>60+ days over 100°F</strong> — every efficiency point matters</li>
              </ul>
            </div>
          </div>
          <div className="gb-stats-trio">
            <div className="gb-stat-box"><div className="gb-num">$80–150</div><p>Monthly energy bill reduction reported by DFW homeowners replacing 12–15 year-old systems during summer months.</p></div>
            <div className="gb-stat-box"><div className="gb-num">2–4 yrs</div><p>Typical payback period on a high-efficiency upgrade — especially when combined with 20% group-buy pricing.</p></div>
            <div className="gb-stat-box"><div className="gb-num">16–17 SEER</div><p>SEER2 rating on the Goodman SD variable-speed units in this group buy — vs. 10–13 SEER on most pre-2012 equipment.</p></div>
          </div>
        </div>
      </section>

      {/* GROUP BUY DETAIL */}
      <section className="gb-group-section">
        <div className="gb-inner">
          <div className="gb-section-tag">The Offer</div>
          <h2>Here's exactly what 20% off looks like.</h2>
          <p className="gb-section-sub">Your estimator price is your anchor. If the group fills, your price drops automatically.</p>
          <div className="gb-group-box">
            <div className="gb-gb-head">
              <div>
                <h3>March High-Efficiency Group Buy</h3>
                <p>Goodman SD Variable-Speed · 16–17 SEER2 · Side Discharge · DFW Only</p>
              </div>
              <div className="gb-pct-badge">20% OFF<small>when group fills</small></div>
            </div>
            <div className="gb-gb-body">
              <div className="gb-conditions">
                {[
                  { ic: "📅", t: "March Installs Only", d: "Must be scheduled and installed during March 2026 to qualify." },
                  { ic: "🏠", t: "All of DFW Qualifies", d: "Any home in our DFW service area. No neighborhood coordination needed." },
                  { ic: "⚙️", t: "Goodman SD Variable-Speed", d: "16–17 SEER2 side-discharge units. Bulk pricing negotiated to pass savings to you." },
                  { ic: "🔓", t: "Zero Obligation", d: "No deposit to join. Don't hit 7? Proceed at standard price or walk away." },
                ].map((c) => (
                  <div key={c.t} className="gb-cond">
                    <div className="gb-cond-ic">{c.ic}</div>
                    <div><h4>{c.t}</h4><p>{c.d}</p></div>
                  </div>
                ))}
              </div>
              <div>
                <div className="gb-price-example">
                  <h4>Example: 2,200 sq ft DFW Home</h4>
                  <p>Illustration only. Your estimate from our tool reflects your home's requirements.</p>
                  <div className="gb-p-row"><span className="gb-pl">Variable Speed pricing</span><span className="gb-pv">$15,000</span></div>
                  <div className="gb-p-row"><span className="gb-pl">Group Buy discount (20%)</span><span className="gb-pv gb-orange">− $3,000</span></div>
                  <div className="gb-p-total"><span className="gb-pl">Your Group Buy price</span><span className="gb-pv">$12,000</span></div>
                </div>
                <div className="gb-energy-tag">⚡ Plus est. $70–$110/month in energy savings after install</div>
                <div className="gb-fin-note"><strong>Financing via Synchrony Bank</strong><br />$150/mo until paid in full at 9.99% APR, subject to credit approval.</div>
              </div>
            </div>
            <div className="gb-gb-foot">*Financing subject to credit approval through Synchrony Bank. Minimum monthly payments required. Example pricing for illustration only. Energy savings estimates based on typical DFW conditions and may vary. Group discount requires minimum 7 confirmed March 2026 installs.</div>
          </div>
        </div>
      </section>

      {/* REFERRAL */}
      <section className="gb-referral-section">
        <div className="gb-inner">
          <div className="gb-section-tag">Referral Program</div>
          <div className="gb-ref-card">
            <div className="gb-ref-card-top">
              <div className="gb-amt">$250</div>
              <small>per completed referral install</small>
            </div>
            <div className="gb-ref-card-body">
              <h3>Know someone who needs a new system? <span>You get $250.</span></h3>
              <p>For every friend, neighbor, or family member you refer who completes an install through this March group offer, we'll send you <strong>$250 as a thank-you</strong> after their job is completed and paid. Just mention their name when you fill out the form below, or tag them in the Facebook post comments. No limit on referrals — refer three friends and pocket $750.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section className="gb-form-section" id="get-info" ref={formSectionRef}>
        <div className="gb-inner">
          <div className="gb-form-layout">
            <div className="gb-form-sidebar">
              <div>
                <div className="gb-section-tag">Reserve Your Spot</div>
                <h2>Get full details sent to your inbox.</h2>
                <p className="gb-section-sub" style={{ marginBottom: 24 }}>No spam, no pressure. We'll send you the offer details and a link to your free custom estimate.</p>
              </div>
              <ul className="gb-checklist">
                <li>Goodman SD system details &amp; qualifying models</li>
                <li>Link to your free custom online estimate</li>
                <li>How to track group progress toward 7 installs</li>
                <li>Financing options &amp; monthly payment examples</li>
                <li>Zero commitment to join — no deposit required</li>
              </ul>
              <div className="gb-estimator-box">
                <p><strong>Ready to see your price right now?</strong> Go straight to our estimator and note "Goodman Group Buy" in the comments.</p>
                <Link to="/estimate/ducted" className="gb-btn-sm" onClick={() => trackButtonClick({ buttonName: "Open Estimator CTA", buttonLocation: "form-sidebar", destinationUrl: "/estimate/ducted" })}>Open Estimator →</Link>
              </div>
            </div>

            <div className="gb-form-card">
              <div className="gb-fc-head">
                <h3>Request Group Buy Info</h3>
                <p>Takes less than 60 seconds. Same-day follow-up.</p>
              </div>
              <div className="gb-fc-body">
                {!submitted ? (
                  <form onSubmit={handleSubmit}>
                    <div className="gb-fg-row">
                      <div className="gb-fg"><label>First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required autoComplete="given-name" /></div>
                      <div className="gb-fg"><label>Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" required autoComplete="family-name" /></div>
                    </div>
                    <div className="gb-fg"><label>Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required autoComplete="email" /></div>
                    <div className="gb-fg"><label>Phone Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(214) 555-0100" required autoComplete="tel" /></div>
                    <div className="gb-fg-row">
                      <div className="gb-fg"><label>City / ZIP</label><input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Plano · 75024" required /></div>
                      <div className="gb-fg">
                        <label>How soon?</label>
                        <select value={timeline} onChange={(e) => setTimeline(e.target.value)}>
                          <option value="">Select…</option>
                          <option>Ready for March</option>
                          <option>1–3 months</option>
                          <option>Just exploring</option>
                          <option>Mine is failing now</option>
                        </select>
                      </div>
                    </div>
                    <div className="gb-fg"><label>Referred by (optional)</label><input type="text" value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="Friend's name or 'Facebook post'" /></div>
                    <button type="submit" className="gb-form-btn" disabled={submitting}>{submitting ? "Sending..." : "Send Me the Details →"}</button>
                    <p className="gb-form-fine">By submitting you agree to receive email and SMS from Truficient Energy Solutions. We never share your info. Unsubscribe anytime.</p>
                  </form>
                ) : (
                  <div className="gb-success-msg">
                    <h4>✓ You're in the loop!</h4>
                    <p>Check your inbox — we're sending you the full offer details and your custom estimate link. We'll follow up soon to answer any questions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="gb-footer">
        <div className="gb-footer-logo">Truf<span>icient</span> Energy Solutions</div>
        <p className="gb-footer-contact">
          808 Business Parkway, Richardson, TX 75081<br />
          <a href="tel:2142384349">(214) 238-4349</a> &nbsp;·&nbsp;
          <a href="mailto:info@truficient.com">info@truficient.com</a>
        </p>
        <p>*Financing subject to credit approval through Synchrony Bank. Minimum monthly payments required. Group Buy discount requires minimum 7 confirmed March 2026 installs. Energy savings estimates based on typical DFW residential conditions; individual results vary. Offer valid for qualifying Goodman SD variable-speed systems installed in March 2026 only. SEER2 ratings 16–17 as rated. See store for details.</p>
      </footer>
    </div>
  );
}
