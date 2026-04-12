import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useButtonTracking } from "@/hooks/useButtonTracking";
import { usePageSEO } from "@/hooks/usePageSEO";
import GalleryOverlay from "@/components/landing/GalleryOverlay";
import ownerPhoto from "@/assets/owner-eric.webp";
import galleryAttic from "@/assets/gallery/attic-install.webp";
import galleryOutdoorSide from "@/assets/gallery/outdoor-units-side.webp";
import galleryClosetFurnace from "@/assets/gallery/closet-furnace.webp";
import galleryStacked from "@/assets/gallery/stacked-condensers.webp";
import galleryYard from "@/assets/gallery/outdoor-unit-yard.webp";
import galleryAirHandler from "@/assets/gallery/air-handler-closet.webp";
import "./smart-group-march-v2.css";

// Load Google Fonts asynchronously to avoid render-blocking
const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600&display=swap";

const galleryItems = [
  { src: galleryAttic, tag: "New Install", caption: "Goodman SD — Richardson, TX" },
  { src: galleryOutdoorSide, tag: "Fence-Line SD", caption: "Side Discharge — Plano, TX" },
  { src: galleryClosetFurnace, tag: "Brick Home", caption: "Clean Install — Frisco, TX" },
  { src: galleryStacked, tag: "Indoor Unit", caption: "Indoor Unit — McKinney, TX" },
  { src: galleryYard, tag: "Dual System", caption: "Two-System Replace — Garland, TX" },
  { src: galleryAirHandler, tag: "Tight Clearance", caption: "SD Fence-Line Install — Irving, TX" },
];

const processSteps = [
  { num: 1, tag: "Start Here", title: "Sign Up for the Promo", desc: "Tell us a bit about your home so we can confirm you qualify for the Smart Group high-efficiency upgrade. Takes less than 60 seconds.", circle: "v2-current" },
  { num: 2, tag: "Estimate", title: "Visit Our Online Estimator", desc: "We send you a link to our estimator so you can see your projected installed price for a 16–17 SEER2 variable-speed Goodman system — transparent and itemized." },
  { num: 3, tag: "Group Threshold", title: "Group Purchase Threshold Is Met", desc: "Once the group reaches the required number of systems, your Group Buy discount is unlocked — automatically applied to your estimate." },
  { num: 4, tag: "Site Visit", title: "On-Site Inspection", desc: "Our team visits your home to verify sizing, ductwork, and details so your new system is engineered correctly for your specific comfort and efficiency goals." },
  { num: 5, tag: "Agreement", title: "Sign Contract + Deposit", desc: "We review all details with you, answer questions, and finalize your contract and deposit to reserve your installation slot. Full terms covered at this stage." },
  { num: 6, tag: "Install Day", title: "Installation", desc: "Our install team replaces your old equipment with your new high-efficiency Goodman variable-speed system. Clean, professional, on time." },
  { num: 7, tag: "Quality Assurance", title: "Commissioning Report", desc: "We perform a full commissioning and quality-assurance check, verify system performance, and document all settings in a Commissioning Report — your proof it was done right." },
  { num: 8, tag: "Close Out", title: "Final Payment", desc: "Once your system is installed and commissioned, we complete your final payment and close out the project. Simple and straightforward." },
  { num: 9, tag: "You're Done — Start Saving", title: "Enjoy Energy Savings & Increased Comfort", desc: "You enjoy more even temperatures, quieter operation, and reduced energy usage every month. You saved twice — once on the system, and again on every energy bill that follows.", circle: "v2-end", final: true },
];

export default function SmartGroupMarchV2Landing() {
  const { trackButtonClick } = useButtonTracking();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const formSectionRef = useRef<HTMLElement>(null);

  // Load Google Fonts asynchronously (non-render-blocking)
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_URL;
    link.media = "print";
    link.onload = () => { link.media = "all"; };
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [timeline, setTimeline] = useState("");
  const [referral, setReferral] = useState("");

  usePageSEO("/smart-group-march-F-26v2");

  useEffect(() => {
    document.title = "Smart Group Upgrade Event — March 2026 V2 | Truficient Energy Solutions";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Join the March Smart Group and save up to 20% on a 16–17 SEER2 Goodman variable-speed system — plus save on energy bills every month.');
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "ViewContent", { content_name: "March Group Buy V2 Landing" });
    }
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_view", { page_title: "March Group Buy V2 Landing" });
    }
  }, []);

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
      const { error: insertError } = await supabase.from("landing_page_submissions").insert({
        form_id: "b07901ea-0e4b-4d2d-a189-a415067bc68e",
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        service_type: "Smart Group - Goodman SD Variable Speed 16-17 SEER2",
        message: `Timeline: ${timeline}. Referred by: ${referral || "N/A"}`,
        custom_fields: { zip, timeline, referral, campaign: "march-group-buy-2026-v2", source: "smart_group_march_v2" },
      });

      if (insertError) throw insertError;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      fetch(`${supabaseUrl}/functions/v1/sync-ghl-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          source: "smart_group_march_v2",
          tags: ["Smart Group Buy", "Goodman SD", "March 2026", "Facebook Ad", "V2"],
          customFields: {
            zip_code: zip,
            service_type: "Smart Group - Goodman SD Variable Speed 16-17 SEER2",
            message: `Timeline: ${timeline}. Referred by: ${referral || "N/A"}`,
          },
        }),
      }).catch(() => {});

      if ((window as any).fbq) (window as any).fbq("track", "Lead");
      if ((window as any).gtag) (window as any).gtag("event", "generate_lead", { currency: "USD", value: 0 });

      trackButtonClick({ buttonName: "Group Buy V2 Form Submit", buttonLocation: "smart-group-march-F-26v2", destinationUrl: "" });
      setSubmitted(true);
    } catch (err) {
      console.error("Landing page submission error:", err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="v2-page" style={{ paddingBottom: showSticky ? 72 : 0 }}>
      {/* STICKY MOBILE CTA */}
      {showSticky && (
        <div className="v2-mobile-sticky">
          <a href="#get-info">See If Your Home Qualifies — Free, No Obligation →</a>
        </div>
      )}

      {/* TOP BAR */}
      <div className="v2-topbar">🔥 March 2026 Smart Group Event — DFW Homeowners Only · Limited Spots</div>

      {/* NAV */}
      <nav className="v2-nav">
        <a href="https://www.truficient.com" className="v2-logo">Truf<span>icient</span></a>
        <a href="tel:2142384349" className="v2-nav-phone">📞 (214) 238-4349</a>
      </nav>

      {/* HERO */}
      <section className="v2-hero">
        <div className="v2-hero-circ v2-hc1" />
        <div className="v2-hero-circ v2-hc2" />
        <div className="v2-inner v2-hero-inner">
          <div>
            <div className="v2-hero-eyebrow"><span className="v2-eyedot" /> March 2026 · Smart Group Event</div>
            <h1>Save on a<br />High-Efficiency System —<br /><span className="v2-hl">And the Bill It Creates.</span></h1>

            <div className="v2-save-twice-pill">
              <span className="v2-stp-icon">⚡</span>
              <div className="v2-stp-text">
                <strong>Save Twice:</strong> Once on your install through the Group Buy, and every month on your energy bill with a variable-speed system.
              </div>
            </div>

            <p className="v2-hero-sub">This Smart Group event helps DFW homeowners upgrade to a 16–17 SEER2 variable-speed Goodman system at a group-buy discount — designed to cut wasted energy and smooth out comfort.</p>
            <p className="v2-hero-micro">Full details on pricing, timing, and terms are shared after you sign up — no pressure, just clear numbers.</p>

            <div className="v2-hero-btns">
              <a href="#get-info" className="v2-btn-orange" onClick={() => trackButtonClick({ buttonName: "See If Qualifies CTA", buttonLocation: "hero-v2", destinationUrl: "#get-info" })}>See If Your Home Qualifies →</a>
              <a href="#process" className="v2-btn-ghost">How It Works</a>
            </div>

            <div className="v2-hero-badges">
              {["Mitsubishi Diamond Contractor", "HERS Certified", "1,000+ DFW Installs", "Licensed & Insured"].map((b) => (
                <div key={b} className="v2-hbadge"><span className="v2-hdot" />{b}</div>
              ))}
            </div>
          </div>

          {/* Offer Card */}
          <div className="v2-offer-card">
            <div className="v2-oc-head">
              <div className="v2-oc-sub">March Smart Group</div>
              <div className="v2-oc-big">Save Twice</div>
            </div>
            {[
              { lbl: "System", val: "Goodman SD Variable-Speed" },
              { lbl: "SEER2 Rating", val: "16–17 SEER2" },
              { lbl: "Save #1: Group Buy discount", val: "Up to 20% OFF", cls: "v2-org v2-big" },
              { lbl: "Save #2: Monthly energy savings", val: "$70–$110/mo", cls: "v2-org" },
              { lbl: "Installs needed to unlock", val: "7 DFW homes" },
              { lbl: "Referral bonus", val: "$250 per friend", cls: "v2-org" },
              { lbl: "Cost to sign up", val: "Free · No obligation" },
            ].map((r) => (
              <div key={r.lbl} className="v2-oc-row">
                <span className="v2-lbl">{r.lbl}</span>
                <span className={`v2-val ${r.cls || ""}`}>{r.val}</span>
              </div>
            ))}
            <div className="v2-oc-foot">Full pricing, deposit, and timing details shared after signup.</div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="v2-trust-bar">
        <div className="v2-trust-inner">
          {[
            { ic: "🏆", t: "Mitsubishi Diamond" },
            { ic: "⭐", t: "5-Star Google" },
            { ic: "🔧", t: "1,000+ Installs" },
            { ic: "📋", t: "Licensed & Insured" },
            { ic: "🌡️", t: "HERS Certified" },
          ].map((ti) => (
            <div key={ti.t} className="v2-ti"><div className="v2-ic">{ti.ic}</div>{ti.t}</div>
          ))}
        </div>
      </div>

      {/* QUICK HOW IT WORKS */}
      <section className="v2-quick-how">
        <div className="v2-inner">
          <div className="v2-tag">At a Glance</div>
          <h2>How the Smart Group Works</h2>
          <p className="v2-sub" style={{ marginBottom: 28 }}>Four simple steps from sign-up to savings.</p>
          <div className="v2-quick-grid">
            {[
              { n: "1", title: "Sign Up for the Smart Group", desc: <>Tell us about your home so we can confirm you qualify for a <strong>variable-speed upgrade</strong>.</> },
              { n: "2", title: "See Your Estimated Price", desc: <>We send you a link to our estimator — see your <strong>projected installed price</strong> upfront, no sales visit required.</> },
              { n: "3", title: "Group Discount Unlocks", desc: <>When the group hits the threshold, your <strong>Group Buy discount is applied</strong> — automatically, no negotiating.</> },
              { n: "4", title: "Upgrade & Save Twice", desc: <>We install, commission, and hand you a <strong>Commissioning Report</strong>. Your monthly savings begin immediately.</> },
            ].map((s) => (
              <div key={s.n} className="v2-qc">
                <div className="v2-qc-num">{s.n}</div>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAVE TWICE BAND */}
      <section className="v2-save-twice-band">
        <div className="v2-inner">
          <div className="v2-tag" style={{ color: "var(--v2-orange-lt)" }}>Why This Isn't Just a Discount</div>
          <h2 className="v2-stb-title">It's a Smart <span>Efficiency Upgrade.</span></h2>
          <p className="v2-stb-deck">We only install high-efficiency, variable-speed systems for this event — not basic on/off boxes. The goal is to help you save twice: once on the system, and every month on your bills.</p>

          <div className="v2-stb-cols">
            <div className="v2-stb-col">
              <div className="v2-col-head">
                <span className="v2-col-emoji">💰</span>
                <h4>Save <span>#1</span> — On the Install</h4>
              </div>
              <p>When the group reaches the required number of systems, everyone in the group receives up to 20% off their standard installed price. We negotiate bulk pricing from our supplier and pass the savings directly to you.</p>
            </div>
            <div className="v2-stb-col">
              <div className="v2-col-head">
                <span className="v2-col-emoji">⚡</span>
                <h4>Save <span>#2</span> — Every Month</h4>
              </div>
              <p>Variable-speed systems use only the energy your home actually needs — running longer at lower speeds for more even temperatures and better humidity control. That means a smaller energy bill every single month.</p>
            </div>
          </div>

          <ul className="v2-stb-bullets">
            <li>We only install <strong>high-efficiency, variable-speed systems</strong> for this event — not basic on/off equipment</li>
            <li>Variable-speed technology ramps up and down continuously, using only the energy your home needs at any moment</li>
            <li>Many homeowners upgrading from older systems see <strong>double-digit reductions</strong> in HVAC energy use — in some cases <strong>up to 30%+</strong></li>
            <li>Better humidity control means more even room-to-room comfort, quieter operation, and fewer temperature swings</li>
          </ul>

          <div className="v2-stb-closer">
            "The Smart Group event is about helping you save twice — once on the system, and again every month on your bills. That's the whole point."
          </div>
        </div>
      </section>

      {/* 9-STEP PROCESS */}
      <section className="v2-process-section" id="process">
        <div className="v2-inner">
          <div className="v2-tag">Full Process</div>
          <h2>How the Smart Group Upgrade Works</h2>
          <p className="v2-process-deck">Here's what happens after you raise your hand. We keep it simple and transparent.</p>
          <div className="v2-process-intro">
            <strong>No surprises.</strong> Full details on pricing, deposit, and timing are covered after you sign up and complete the estimator — no pressure, just clear numbers and options.
          </div>

          <div className="v2-steps-list">
            {processSteps.map((step) => (
              <div key={step.num} className={`v2-pstep${step.final ? " v2-pstep-final" : ""}`}>
                <div className="v2-pstep-left">
                  <div className={`v2-pstep-circle${step.circle ? ` ${step.circle}` : ""}`}>{step.num}</div>
                  <div className="v2-pstep-line" />
                </div>
                <div className="v2-pstep-right">
                  <div className={`v2-pstep-tag${step.final ? " v2-end-tag" : ""}`}>{step.tag}</div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="v2-process-footer">
            <strong>No pressure, no surprises.</strong> Full details on pricing, timing, and terms are covered after you sign up and complete the estimator. You're never committed until you sign a contract.
          </div>
        </div>
      </section>

      {/* OWNER */}
      <section className="v2-owner-section">
        <div className="v2-inner">
          <div className="v2-tag" style={{ color: "var(--v2-orange-lt)" }}>From the Owner</div>
          <div className="v2-owner-card">
            <div>
              <div className="v2-owner-photo-wrap">
                <img src={ownerPhoto} alt="Eric, Owner of Truficient Energy Solutions" className="v2-owner-photo" />
                <div>
                  <div className="v2-owner-name">Eric</div>
                  <div className="v2-owner-title">Owner, Truficient Energy Solutions</div>
                  <div className="v2-owner-badge-wrap">
                    <span className="v2-owner-badge">1,000+ Installs</span>
                    <span className="v2-owner-badge">Richardson, TX</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="v2-owner-body">
              <blockquote className="v2-owner-quote">"I started Truficient because I believe every DFW homeowner deserves a comfortable home that doesn't cost a fortune to run. The Smart Group Buy is my way of making high-efficiency upgrades more accessible — when we install in bulk, I can pass real savings back to you."</blockquote>
              <p>I personally oversee every install to make sure it's done right. Over 1,000 systems installed across DFW — and I'm still on the job site making sure each one exceeds expectations. This isn't about selling equipment. It's about engineering a system that genuinely improves your daily comfort and your monthly budget.</p>
              <p>The Goodman SD variable-speed units we're featuring this month run at exactly the capacity your home needs — quieter, more consistent temps, and dramatically lower energy usage than the single-speed equipment most DFW homes still have. That's the Save Twice promise.</p>
              <div className="v2-owner-creds">
                {["Mitsubishi Diamond Contractor", "HERS Certified", "Licensed & Insured", "808 Business Pkwy, Richardson TX"].map((c) => (
                  <span key={c} className="v2-cred">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="v2-gallery-section">
        <div className="v2-inner">
          <div className="v2-tag">Our Work</div>
          <h2>Goodman SD Installs Across DFW</h2>
          <p className="v2-sub">These are the same side-discharge variable-speed systems in the March Smart Group — installed clean, by Truficient.</p>
          <div className="v2-gallery-intro">
            <h3>About the Goodman SD Variable-Speed Unit</h3>
            <ul>
              <li><strong>Side Discharge (SD)</strong> design — ideal for tight yards and fence-line installs</li>
              <li><strong>16–17 SEER2</strong> variable-speed compressor — meaningful upgrade over 14 SEER single-speed</li>
              <li>Runs at <strong>precise capacity</strong> your home needs — not just full blast on/off</li>
              <li>Quieter operation, better humidity control, more even temperatures</li>
              <li>Qualifies for <strong>Synchrony Bank financing</strong> through Truficient</li>
            </ul>
          </div>
          <div className="v2-gallery-grid">
            {galleryItems.map((g, i) => (
              <div key={i} className="v2-gallery-item">
                <img src={g.src} alt={g.caption} loading="lazy" decoding="async" width="600" height="450" />
                <span className="v2-gallery-tag">{g.tag}</span>
                <div className="v2-gallery-caption">{g.caption}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              className="v2-cta-btn"
              style={{ background: "transparent", border: "2px solid #FFB547", color: "#FFB547", padding: "12px 32px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}
              onClick={() => { setGalleryOpen(true); trackButtonClick({ buttonName: "View Full Gallery", buttonLocation: "gallery-section-fb-v2", destinationUrl: "" }); }}
            >
              View Full Gallery →
            </button>
          </div>
        </div>
      </section>

      <GalleryOverlay open={galleryOpen} onClose={() => setGalleryOpen(false)} />

      {/* ENERGY SAVINGS */}
      <section className="v2-savings-section">
        <div className="v2-inner">
          <div className="v2-tag">Energy Savings</div>
          <h2>What upgrading really means<br />for your DFW energy bill.</h2>
          <p className="v2-sub">Dallas-Fort Worth summers are relentless. Here's what homeowners typically see after replacing an older single-speed system with a 16–17 SEER2 Goodman variable-speed unit.</p>
          <div className="v2-savings-grid">
            <div className="v2-big-stat-card">
              <div className="v2-snum">Up to 30%+</div>
              <div className="v2-slbl">Reduction in HVAC energy usage</div>
              <p>When replacing a 10–15 year-old system with a properly-sized 16–17 SEER2 variable-speed unit, many DFW homeowners report significant reductions in monthly cooling costs.</p>
            </div>
            <div className="v2-savings-right">
              <h3>Why your older system costs more than it should</h3>
              <p>Traditional single-speed systems blast on at 100% power, cool quickly, then shut off — leaving humidity behind and cycling on again minutes later. Variable-speed systems ramp up and down continuously, using exactly the energy required at any moment.</p>
              <ul className="v2-fact-list">
                <li>HVAC accounts for <strong>~60% of the average Texas home's energy bill</strong></li>
                <li>A 10-year-old unit can be <strong>up to 40% less efficient</strong> than today's models</li>
                <li>Goodman SD runs at <strong>16–17 SEER2</strong> vs. 10–13 SEER on older equipment</li>
                <li>Better humidity control means your thermostat <strong>doesn't have to work as hard</strong></li>
                <li>DFW averages <strong>60+ days over 100°F</strong> — every efficiency point matters</li>
              </ul>
            </div>
          </div>
          <div className="v2-stats-trio">
            <div className="v2-stat-box"><div className="v2-num">$80–150</div><p>Monthly energy bill reduction reported by DFW homeowners replacing 12–15 year-old systems in summer months.</p></div>
            <div className="v2-stat-box"><div className="v2-num">2–4 yrs</div><p>Typical payback period on a high-efficiency upgrade — especially when combined with 20% group-buy pricing.</p></div>
            <div className="v2-stat-box"><div className="v2-num">16–17 SEER</div><p>SEER2 rating on the Goodman SD units in this Smart Group vs. 10–13 SEER on most pre-2012 equipment.</p></div>
          </div>
        </div>
      </section>

      {/* GROUP BUY DETAIL */}
      <section className="v2-group-section">
        <div className="v2-inner">
          <div className="v2-tag">The Offer</div>
          <h2>Here's exactly what 20% off looks like.</h2>
          <p className="v2-sub">Your estimator price is your anchor. If the group fills, your price drops automatically — no negotiating.</p>
          <div className="v2-group-box">
            <div className="v2-gb-head">
              <div>
                <h3>March Smart Group — Goodman SD Variable-Speed</h3>
                <p>16–17 SEER2 · Side Discharge · DFW Only · Truficient Energy Solutions</p>
              </div>
              <div className="v2-pct-badge">20% OFF<small>when group fills</small></div>
            </div>
            <div className="v2-gb-body">
              <div className="v2-conditions">
                {[
                  { ic: "📅", t: "March Installs Only", d: "Must be scheduled and installed during March 2026 to qualify for group pricing." },
                  { ic: "🏠", t: "All of DFW Qualifies", d: "Any home in our DFW service area. No neighborhood coordination needed." },
                  { ic: "⚙️", t: "Goodman SD Variable-Speed", d: "16–17 SEER2 side-discharge units. Bulk pricing negotiated to pass savings directly to you." },
                  { ic: "🔓", t: "Zero Obligation to Sign Up", d: "No deposit to reserve your spot. Full terms covered after signup and site inspection." },
                ].map((c) => (
                  <div key={c.t} className="v2-cond">
                    <div className="v2-cond-ic">{c.ic}</div>
                    <div><h4>{c.t}</h4><p>{c.d}</p></div>
                  </div>
                ))}
              </div>
              <div>
                <div className="v2-price-example">
                  <h4>Example: 2,200 sq ft DFW Home</h4>
                  <p>Illustration only. Your estimate from our tool reflects your home's specific requirements.</p>
                  <div className="v2-p-row"><span className="v2-pl">Standard estimator price</span><span className="v2-pv">$15,000</span></div>
                  <div className="v2-p-row"><span className="v2-pl">Smart Group discount (20%)</span><span className="v2-pv v2-org">− $3,000</span></div>
                  <div className="v2-p-total"><span className="v2-pl">Your Smart Group price</span><span className="v2-pv">$12,000</span></div>
                </div>
                <div className="v2-energy-tag">⚡ Plus estimated $70–$110/month in ongoing energy savings</div>
                <div className="v2-fin-note"><strong>Financing via Synchrony Bank</strong><br />$150/mo until paid in full at 9.99% APR, subject to credit approval.</div>
              </div>
            </div>
            <div className="v2-gb-foot">*Financing subject to credit approval through Synchrony Bank. Minimum monthly payments required. Example pricing for illustration only. Energy savings estimates based on typical DFW conditions and may vary. Smart Group discount requires minimum 7 confirmed March 2026 installs.</div>
          </div>
        </div>
      </section>

      {/* REFERRAL */}
      <section className="v2-referral-section">
        <div className="v2-inner v2-ref-inner">
          <div className="v2-ref-layout">
            <div>
              <div className="v2-ref-eyebrow">💰 Referral Program</div>
              <h2 className="v2-ref-headline">Earn $250 Per System<br /><span>You Refer.</span></h2>
              <p className="v2-ref-deck">Know someone who's been talking about replacing their system? For every homeowner you refer who joins the Smart Group and completes an install, you get $250 per system as a thank-you — after their install is done and paid. No limit on how many you refer.</p>

              <div className="v2-ref-card-grid">
                {[
                  { icon: "👋", title: "Tag Them or Name Them", desc: <>Have your friend <strong>mention your name</strong> when they sign up, or tag them in our Facebook post — we'll connect the dots.</> },
                  { icon: "🔁", title: "No Limit on Referrals", desc: <>Refer 3 friends who install? You earn <strong>$750</strong>. There's no cap — refer as many as you like.</> },
                  { icon: "💳", title: "Paid After Install Completes", desc: <>Referral bonuses are paid after the referred homeowner's <strong>installation is completed and paid in full</strong>.</> },
                ].map((card) => (
                  <div key={card.title} className="v2-ref-card">
                    <span className="v2-ref-card-icon">{card.icon}</span>
                    <div>
                      <h4>{card.title}</h4>
                      <p>{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="v2-ref-cta">
                <a href="#get-info" className="v2-btn-orange" style={{ marginTop: 24 }}>Sign Up & Start Referring →</a>
              </div>
            </div>

            <div className="v2-ref-amount-box">
              <div className="v2-amt">$250</div>
              <div className="v2-amt-sub">per completed referral install<br />No limit on referrals</div>
              <div className="v2-amt-note">Paid after referred install is completed and paid in full.</div>
            </div>
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section className="v2-form-section" id="get-info" ref={formSectionRef}>
        <div className="v2-inner">
          <div className="v2-form-layout">
            <div className="v2-form-sidebar">
              <div>
                <div className="v2-tag">Reserve Your Spot</div>
                <h2>See If Your Home Qualifies.</h2>
                <p className="v2-sub" style={{ marginBottom: 20 }}>Takes 60 seconds. We'll send you full details on pricing, timing, and terms — no pressure, no commitment.</p>
              </div>
              <ul className="v2-checklist">
                <li>Goodman SD system details & qualifying models</li>
                <li>Link to your free custom online estimate</li>
                <li>How to track group progress toward the threshold</li>
                <li>Financing options & monthly payment examples</li>
                <li>Full pricing, deposit & timing details</li>
                <li>Zero commitment to join — no deposit required to sign up</li>
              </ul>
              <div className="v2-estimator-box">
                <p><strong>Ready to see your price right now?</strong> Go straight to our estimator and note "Smart Group Buy" in the comments.</p>
                <Link to="/estimate/smart-group-march" className="v2-btn-sm" onClick={() => trackButtonClick({ buttonName: "Open Estimator CTA V2", buttonLocation: "form-sidebar-v2", destinationUrl: "/estimate/smart-group-march" })}>Get My Estimate →</Link>
              </div>
            </div>

            <div className="v2-form-card">
              <div className="v2-fc-head">
                <h3>Request Smart Group Info</h3>
                <p>Same-day follow-up. No sales pressure.</p>
              </div>
              <div className="v2-fc-body">
                {!submitted ? (
                  <form onSubmit={handleSubmit}>
                    <div className="v2-fg-row">
                      <div className="v2-fg"><label>First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required autoComplete="given-name" /></div>
                      <div className="v2-fg"><label>Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" required autoComplete="family-name" /></div>
                    </div>
                    <div className="v2-fg"><label>Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required autoComplete="email" /></div>
                    <div className="v2-fg"><label>Phone Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(214) 555-0100" required autoComplete="tel" /></div>
                    <div className="v2-fg-row">
                      <div className="v2-fg"><label>City / ZIP</label><input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Plano · 75024" required /></div>
                      <div className="v2-fg">
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
                    <div className="v2-fg"><label>Referred by (optional)</label><input type="text" value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="Friend's name or 'Facebook post'" /></div>
                    <button type="submit" className="v2-form-btn" disabled={submitting}>{submitting ? "Sending..." : "See If My Home Qualifies →"}</button>
                    <p className="v2-form-fine">By submitting you agree to receive email and SMS from Truficient Energy Solutions. We never share your info. Unsubscribe anytime.</p>
                  </form>
                ) : (
                  <div className="v2-success-msg">
                    <h4>✓ You're in!</h4>
                    <p>Check your inbox — we're sending you the full Smart Group details, including a link to your free custom estimate. We'll be in touch soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="v2-footer">
        <div className="v2-footer-logo">Truf<span>icient</span> Energy Solutions</div>
        <p className="v2-footer-contact">
          808 Business Parkway, Richardson, TX 75081<br />
          <a href="tel:2142384349">(214) 238-4349</a> &nbsp;·&nbsp;
          <a href="mailto:info@truficient.com">info@truficient.com</a>
        </p>
        <p>*Financing subject to credit approval through Synchrony Bank. Minimum monthly payments required. Smart Group discount requires minimum 7 confirmed March 2026 installs. Energy savings estimates based on typical DFW residential conditions; individual results vary. Offer valid for qualifying Goodman SD variable-speed systems installed in March 2026 only. SEER2 ratings 16–17 as rated. Referral bonuses paid after referred installation is completed and paid in full. See store for details.</p>
      </footer>
    </div>
  );
}
