import React from "react";
import { Seal, KenyaFlag } from "../components/UI.jsx";

const SERVICES = [
  { icon: "💰", title: "Project Funding", desc: "Financial support for local infrastructure, education, healthcare, and other community-led projects." },
  { icon: "🎓", title: "Education Support", desc: "Bursaries and financial aid to students at primary, secondary, and tertiary levels." },
  { icon: "🏗️", title: "Infrastructure Development", desc: "Construction of schools, hospitals, water points, and other key facilities." },
  { icon: "🛡️", title: "Security Enhancement", desc: "Support for police stations and posts to improve local safety and law enforcement." },
  { icon: "🤝", title: "Community Empowerment", desc: "Engaging residents in identifying and prioritizing projects for inclusive growth." },
  { icon: "🗳️", title: "Public Participation", desc: "Promoting transparency and inclusiveness through active involvement of community members." },
];

export default function Landing({ onApply, onSignIn, onHistory }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-green text-sand border-b-[3px] border-gold">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-11 w-11 rounded-full bg-green-d border border-gold">
              <Seal size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-extrabold leading-tight">Wajir South Constituency</div>
                <KenyaFlag width={22} />
              </div>
              <div className="text-xs text-[#cde0d1]">NG-CDF · Republic of Kenya</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <button onClick={() => scrollTo("home")} className="hover:text-gold transition-colors">Home</button>
            <button onClick={() => scrollTo("services")} className="hover:text-gold transition-colors">Services</button>
            <button onClick={onHistory} className="hover:text-gold transition-colors">About</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-gold transition-colors">Contact</button>
          </nav>
          <button onClick={onSignIn}
            className="text-xs font-semibold border border-gold rounded-lg px-3.5 py-2 transition-all duration-150 hover:bg-black/20 hover:-translate-y-px active:scale-95">
            Sign in
          </button>
        </div>
      </header>

      <section id="home" className="bg-green text-sand">
        <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20">
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight max-w-2xl animate-fade-up">
            Our Services
          </h1>
          <p className="mt-4 max-w-xl text-[#cde0d1] leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
            The NG-CDF drives grassroots development by supporting infrastructure, education,
            security, and community empowerment in Wajir South.
          </p>
        </div>
      </section>

      <section id="services" className="max-w-5xl mx-auto px-5 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <div key={s.title}
              className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="font-extrabold text-ink text-lg">{s.title}</div>
              <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand-2 border-y border-line">
        <div className="max-w-3xl mx-auto px-5 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-d">Apply for a Bursary</h2>
          <p className="mt-3 text-ink-soft leading-relaxed max-w-lg mx-auto">
            Eligible students from Wajir South can apply for bursaries online. Upload required
            documents and track your application securely.
          </p>
          <button onClick={onApply} className="btn-primary mt-6 !px-8 !py-3.5 !text-base">
            Start Bursary Application
          </button>
        </div>
      </section>

      <footer id="contact" className="bg-green-d text-sand">
        <div className="max-w-5xl mx-auto px-5 py-12 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Seal size={26} />
              <span className="font-extrabold">Wajir South</span>
            </div>
            <p className="text-sm text-[#9dc0a8] mt-3 leading-relaxed">
              Empowering local communities through development and digital services.
            </p>
          </div>
          <div>
            <div className="font-bold text-gold mb-2.5 text-sm uppercase tracking-wide">Quick Links</div>
            <div className="flex flex-col gap-1.5 text-sm text-[#cde0d1]">
              <button onClick={() => scrollTo("home")} className="text-left hover:text-white transition-colors w-fit">Home</button>
              <button onClick={onHistory} className="text-left hover:text-white transition-colors w-fit">About</button>
              <button onClick={() => scrollTo("services")} className="text-left hover:text-white transition-colors w-fit">Services</button>
              <button onClick={() => scrollTo("contact")} className="text-left hover:text-white transition-colors w-fit">Contact</button>
            </div>
          </div>
          <div>
            <div className="font-bold text-gold mb-2.5 text-sm uppercase tracking-wide">Contact Info</div>
            <div className="flex flex-col gap-1.5 text-sm text-[#cde0d1]">
              <div>Email: info@wajirsouth.ke</div>
              <div>Phone: +254 727124228</div>
              <div>Address: Wajir South Constituency Office</div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 text-center text-xs text-[#9dc0a8] py-4">
          © {new Date().getFullYear()} Wajir South Constituency · NG-CDF
        </div>
      </footer>
    </div>
  );
}
