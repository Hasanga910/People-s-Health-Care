import { useState, useEffect } from "react";

// Font import via style injection
const fontStyle = document.createElement("link");
fontStyle.rel = "stylesheet";
fontStyle.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontStyle);

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Doctor", href: "#doctor" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
      </svg>
    ),
    title: "Medical Consultations",
    desc: "Comprehensive consultations with our experienced physician, with personalized care plans tailored to your health needs.",
    color: "#1565C0",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Pharmacy Services",
    desc: "Full-service in-house pharmacy ensuring you receive prescribed medications promptly with expert pharmaceutical guidance.",
    color: "#00897B",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: "Laboratory & Diagnostics",
    desc: "Advanced laboratory testing and ECG services providing accurate diagnostic results to support informed medical decisions.",
    color: "#7B1FA2",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Appointment Scheduling",
    desc: "Convenient appointment booking with flexible scheduling options, ensuring you get timely access to medical care.",
    color: "#E65100",
  },
];

const STATS = [
  { number: "5000+", label: "Patients Treated" },
  { number: "15+", label: "Years of Experience" },
  { number: "98%", label: "Patient Satisfaction" },
  { number: "24/7", label: "Emergency Support" },
];

export default function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="bg-white text-gray-800">
      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-white shadow-lg py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                <path d="M11 4h2v3h3v2h-3v3h-2V9H8V7h3z" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: scrolled ? "#0D2137" : "white", fontSize: "1.1rem", lineHeight: 1 }}>
                People's Health Care
              </div>
              <div style={{ fontSize: "0.65rem", color: scrolled ? "#64748b" : "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Medical Centre
              </div>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition-colors duration-200 hover:opacity-80"
                style={{ color: scrolled ? "#0D2137" : "white" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-200"
              style={{
                borderColor: scrolled ? "#1565C0" : "rgba(255,255,255,0.6)",
                color: scrolled ? "#1565C0" : "white",
              }}
            >
              Login
            </a>
            <a
              href="#contact"
              className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white shadow-lg transition-transform duration-200 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
            >
              Book Appointment
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className={`w-6 h-0.5 mb-1.5 transition-all ${scrolled ? "bg-gray-800" : "bg-white"}`} />
            <div className={`w-6 h-0.5 mb-1.5 transition-all ${scrolled ? "bg-gray-800" : "bg-white"}`} />
            <div className={`w-6 h-0.5 transition-all ${scrolled ? "bg-gray-800" : "bg-white"}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-xl px-6 py-4 mt-2">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="block py-2.5 text-gray-700 font-medium border-b border-gray-100 text-sm">
                {link.label}
              </a>
            ))}
            <a href="#contact" className="block mt-3 text-center py-2.5 rounded-lg text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
              Book Appointment
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0D2137 0%, #1565C0 50%, #00ACC1 100%)",
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #00ACC1, transparent)" }} />
        <div className="absolute bottom-0 left-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Currently Accepting Patients</span>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.15, color: "white" }}>
              Your Health, Our
              <br />
              <span style={{ color: "#7DD3FC" }}>Sacred Commitment</span>
            </h1>

            <p className="mt-6 text-white/80 text-lg leading-relaxed max-w-md">
              Delivering compassionate, comprehensive healthcare with a personal touch. Experience trusted medical care for your entire family at People's Health Care.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-400/30"
                style={{ background: "linear-gradient(135deg, #00ACC1, #007bff)" }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Book Appointment
              </a>
              <a
                href="#services"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border-2 border-white/40 text-white transition-all duration-300 hover:bg-white/10"
              >
                Explore Services
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            {/* Quick info badges */}
            <div className="mt-10 flex flex-wrap gap-3">
              {["Mon – Sat: 8AM – 7PM", "Emergency: 24/7", "Matara, Sri Lanka"].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                  <span className="text-white/80 text-xs">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Stats card */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="text-center p-4 bg-white/10 rounded-2xl border border-white/10">
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "2rem", color: "#7DD3FC" }}>
                        {stat.number}
                      </div>
                      <div className="text-white/70 text-sm mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00ACC1, #1565C0)" }}>
                    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">People's Health Care</div>
                    <div className="text-white/60 text-xs">Matara, Southern Province, Sri Lanka</div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-green-400 text-green-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-700 animate-pulse" />
                Open Now
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="white" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "#00ACC1" }}>
              Why Choose Us
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", color: "#0D2137" }}>
              Healthcare Built on Trust & Excellence
            </h2>
            <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ background: "linear-gradient(90deg, #1565C0, #00ACC1)" }} />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏥",
                title: "Integrated Care",
                desc: "From consultation to prescription and lab testing — everything happens seamlessly under one roof.",
              },
              {
                icon: "👨‍⚕️",
                title: "Expert Physician",
                desc: "Benefit from the experience and dedication of Dr. M.T.D. Jayaweera, who personally oversees every aspect of your care.",
              },
              {
                icon: "🔬",
                title: "Advanced Diagnostics",
                desc: "State-of-the-art laboratory and ECG facilities ensuring accurate and timely diagnostic results.",
              },
              {
                icon: "💊",
                title: "In-House Pharmacy",
                desc: "Get your prescriptions filled immediately without the hassle of visiting an external pharmacy.",
              },
              {
                icon: "📋",
                title: "Complete Health Records",
                desc: "Your medical history, test results, and prescriptions are securely maintained and easily accessible.",
              },
              {
                icon: "⚡",
                title: "Fast & Efficient",
                desc: "Streamlined processes minimize your waiting time so you can focus on what matters — your recovery.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: "#0D2137" }}>{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24" style={{ background: "linear-gradient(180deg, #F0F7FF 0%, #E3F2FD 100%)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "#00ACC1" }}>
              Our Services
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", color: "#0D2137" }}>
              Comprehensive Medical Services
            </h2>
            <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ background: "linear-gradient(90deg, #1565C0, #00ACC1)" }} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${service.color}18`, color: service.color }}
                >
                  {service.icon}
                </div>
                <h3 className="font-semibold text-base mb-3" style={{ color: "#0D2137" }}>{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
                <div
                  className="mt-4 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: service.color }}
                >
                  Learn more
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / DOCTOR ── */}
      <section id="doctor" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Left – Doctor card */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg, #0D2137, #1565C0)" }}>
              <div className="p-10 text-white text-center">
                <div
                  className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/30 flex items-center justify-center text-6xl"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  👨‍⚕️
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }}>
                  Dr. M.T.D. Jayaweera
                </h3>
                <p className="text-blue-200 mt-1 text-sm">Founder & Chief Physician</p>
                <p className="text-blue-200 mt-0.5 text-xs">People's Health Care, Matara</p>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { n: "15+", l: "Years Exp." },
                    { n: "5K+", l: "Patients" },
                    { n: "98%", l: "Satisfaction" },
                  ].map((s) => (
                    <div key={s.l} className="bg-white/10 rounded-xl p-3">
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.3rem", color: "#7DD3FC" }}>{s.n}</div>
                      <div className="text-white/60 text-xs mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2 text-left">
                  {["General Medicine", "Preventive Healthcare", "Chronic Disease Management", "Family Health"].map((spec) => (
                    <div key={spec} className="flex items-center gap-2 text-sm text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl px-6 py-3 flex items-center gap-3 whitespace-nowrap">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E3F2FD" }}>
                <svg viewBox="0 0 20 20" fill="#1565C0" className="w-5 h-5">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-400">Call for Appointment</div>
                <div className="text-sm font-bold text-gray-800">0777 883 343</div>
              </div>
            </div>
          </div>

          {/* Right – About text */}
          <div className="pt-6">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "#00ACC1" }}>
              About Our Medical Centre
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)", color: "#0D2137", lineHeight: 1.3 }}>
              A Legacy of Compassionate Healthcare
            </h2>
            <div className="w-12 h-1 mt-4 mb-6 rounded-full" style={{ background: "linear-gradient(90deg, #1565C0, #00ACC1)" }} />

            <p className="text-gray-600 leading-relaxed mb-4">
              People's Health Care is a patient-first medical centre established in Matara, dedicated to delivering comprehensive, high-quality medical services to the community of Southern Sri Lanka.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Under the personal guidance of Dr. M.T.D. Jayaweera, our centre integrates primary care consultations, pharmaceutical services, and advanced diagnostic testing — all designed to provide you with seamless, coordinated healthcare from a single trusted source.
            </p>

            <div className="space-y-4">
              {[
                { label: "Consultation Hours", value: "Mon – Sat: 8:00 AM – 7:00 PM" },
                { label: "Location", value: "Matara, Southern Province, Sri Lanka" },
                { label: "Contact", value: "thilakjayaweera9@gmail.com" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: "#00ACC1" }} />
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.label}: </span>
                    <span className="text-gray-700 text-sm">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <a
                href="#contact"
                className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-105"
                style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
              >
                Book an Appointment
              </a>
              <a
                href="tel:0777883343"
                className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-colors hover:bg-blue-50"
                style={{ borderColor: "#1565C0", color: "#1565C0" }}
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT / APPOINTMENT ── */}
      <section
        id="contact"
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 100%)" }}
      >
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "#7DD3FC" }}>
                Get In Touch
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "white" }}>
                Book Your Appointment Today
              </h2>
              <p className="mt-4 text-white/70 leading-relaxed">
                Contact us to schedule a consultation. Our staff will confirm your appointment and provide all necessary information.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  { icon: "📍", label: "Address", value: "People's Health Care, Matara, Sri Lanka" },
                  { icon: "📞", label: "Phone", value: "0777 883 343" },
                  { icon: "📧", label: "Email", value: "thilakjayaweera9@gmail.com" },
                  { icon: "🕐", label: "Hours", value: "Mon – Sat: 8:00 AM – 7:00 PM" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-white/50 text-xs uppercase tracking-wide font-medium">{item.label}</div>
                      <div className="text-white font-medium text-sm mt-0.5">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Contact form */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem", color: "#0D2137" }}>
                Request an Appointment
              </h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">Fill in your details and we'll be in touch shortly.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                    <input type="text" placeholder="Kamal" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
                    <input type="text" placeholder="Perera" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input type="tel" placeholder="07X XXX XXXX" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preferred Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Reason for Visit</label>
                  <textarea
                    placeholder="Briefly describe your concern..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <button
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-blue-300/40"
                  style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0A1628] py-12 text-white/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.3rem", color: "white" }}>
                People's Health Care
              </div>
              <p className="mt-3 text-sm leading-relaxed max-w-xs">
                Providing compassionate, integrated healthcare services to the community of Matara and beyond.
              </p>
              <div className="mt-4 flex gap-3">
                {["📘", "🐦", "📸"].map((icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition text-sm">
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white font-semibold mb-4 text-sm">Quick Links</div>
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="block text-sm py-1 hover:text-white transition">{link.label}</a>
              ))}
            </div>

            <div>
              <div className="text-white font-semibold mb-4 text-sm">Contact</div>
              <div className="text-sm space-y-2">
                <div>📞 0777 883 343</div>
                <div>✉️ thilakjayaweera9@gmail.com</div>
                <div>📍 Matara, Sri Lanka</div>
                <div>🕐 Mon–Sat: 8AM–7PM</div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div>© {new Date().getFullYear()} People's Health Care. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="/login" className="hover:text-white transition">Staff Portal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
