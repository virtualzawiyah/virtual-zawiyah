import { Layout, GeometricPattern } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Globe, Users, ShieldCheck } from "lucide-react";
import { fadeUp } from "@/lib/animations";

const values = [
  { icon: BookOpen, title: "Authentic Islamic Knowledge", desc: "We teach from the traditional, chain-transmitted Islamic sciences — the same knowledge passed down through generations of scholars." },
  { icon: Users, title: "Qualified Teachers", desc: "Every teacher holds formal Islamic qualifications. We do not allow unqualified individuals to teach sacred knowledge." },
  { icon: Shield, title: "Safe and Respectful Environment", desc: "We maintain strict standards of adab (etiquette) in every class. Students learn in a secure, dignified, and professional environment." },
  { icon: Globe, title: "Accessible to All", desc: "Islamic education should not be limited by geography. We serve students in every country, every timezone, at every level." },
];

const orgLevels = [
  { role: "Administration", desc: "Oversees all academy operations and student welfare" },
  { role: "Supervisor", desc: "Manages teacher quality and academic standards" },
  { role: "Teacher", desc: "Delivers classes and tracks student progress" },
  { role: "Student", desc: "Learns, grows, and connects with their deen" },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}>
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <nav className="text-sm text-muted-foreground mb-6" aria-label="breadcrumb">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">About</span>
            </nav>
            <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>About Us</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#666666" }}>
              Rooted in tradition. Delivered with excellence. Serving the global Muslim community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Academy Story */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>Our Story</span>
              <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2 mb-6" style={{ color: "#1A1A1A" }}>Why Virtual Zawiyah Was Founded</h2>
              <p className="leading-relaxed mb-4" style={{ color: "#444" }}>
                Virtual Zawiyah was founded with a simple but urgent vision: to make authentic Islamic education accessible to every Muslim, wherever they live. For too long, the lack of qualified Islamic teachers outside Muslim-majority countries has left communities disconnected from their deen.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: "#444" }}>
                Our founders — scholars and educators who saw this gap firsthand — built this academy to bridge it. We offer the same quality of instruction you would find in a traditional madrasa, delivered through modern technology to your home.
              </p>
              <p className="leading-relaxed" style={{ color: "#444" }}>
                The word <em>zawiyah</em> refers to a corner or gathering place for Islamic learning. That is what we aim to be — your corner of the world where sacred knowledge is transmitted with care, dignity, and excellence.
              </p>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="rounded-2xl p-10 text-center border"
              style={{ background: "#E8F5EE", borderColor: "rgba(27,107,58,0.15)" }}
            >
              <div className="font-serif font-bold text-7xl text-primary mb-4">زاوية</div>
              <p className="font-serif text-xl font-semibold mb-2" style={{ color: "#1A1A1A" }}>Zawiyah</p>
              <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
                In the Islamic tradition, a zawiyah is a sacred corner — a place where seekers of knowledge gather to learn, grow, and connect with their Lord. Your zawiyah is now wherever you are.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission and Values */}
      <section className="py-24" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>Our Principles</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2" style={{ color: "#1A1A1A" }}>Mission and Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                whileHover={{ y: -4 }}
                className="rounded-xl p-8 border bg-background transition-all"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
                data-testid={`value-card-${i}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gender Segregation Policy */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <ShieldCheck className="w-14 h-14 text-secondary mx-auto mb-6" />
            <h2 className="font-serif font-bold text-3xl text-white mb-5">Our Gender Segregation Policy</h2>
            <p className="text-white/85 text-lg leading-relaxed mb-4">
              At Virtual Zawiyah, we take the Islamic principle of gender segregation seriously. <strong className="text-white">Male teachers teach male students only. Female teachers teach female students only.</strong>
            </p>
            <p className="text-white/75 leading-relaxed">
              This applies to all one-on-one and group classes. We maintain this policy without exception, because we believe sacred knowledge is best transmitted in an environment of Islamic propriety. Parents and guardians can enroll their children with complete peace of mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Organizational Overview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl mx-auto">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>How We Are Organized</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2" style={{ color: "#1A1A1A" }}>Our Structure</h2>
          </motion.div>
          <div className="flex flex-col items-center gap-0">
            {orgLevels.map((level, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="flex flex-col items-center w-full max-w-sm"
                data-testid={`org-level-${i}`}
              >
                <div className="w-full rounded-xl p-5 text-center border" style={{ background: i === 0 ? "#1B6B3A" : i === 3 ? "#E8F5EE" : "#FAFAF7", borderColor: "rgba(27,107,58,0.2)", color: i === 0 ? "#fff" : "#1A1A1A" }}>
                  <div className="font-serif font-bold text-xl mb-1">{level.role}</div>
                  <div className="text-sm" style={{ color: i === 0 ? "rgba(255,255,255,0.75)" : "#666" }}>{level.desc}</div>
                </div>
                {i < orgLevels.length - 1 && (
                  <div className="w-0.5 h-8 my-0" style={{ background: "rgba(27,107,58,0.3)" }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "#E8F5EE" }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="font-serif font-bold text-3xl mb-4" style={{ color: "#1A1A1A" }}>Ready to Join Our Academy?</h2>
            <p className="mb-8 text-lg max-w-md mx-auto" style={{ color: "#666" }}>Take the first step towards authentic Islamic knowledge. Apply today.</p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 h-14 shadow-md" data-testid="btn-apply-about">
              <Link href="/admission">Join Our Academy</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
