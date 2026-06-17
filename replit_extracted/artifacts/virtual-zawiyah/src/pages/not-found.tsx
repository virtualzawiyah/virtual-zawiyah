import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Users, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <section
        className="min-h-[70vh] flex items-center justify-center py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 60%, #E8F5EE 100%)" }}
      >
        {/* Decorative Arabic numeral */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            className="font-serif font-bold"
            style={{ fontSize: "clamp(14rem, 40vw, 28rem)", color: "#1B6B3A", opacity: 0.04, lineHeight: 1 }}
          >
            404
          </span>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-md"
              style={{ background: "#1B6B3A" }}
            >
              <span className="font-serif text-white font-bold text-2xl">VZ</span>
            </motion.div>

            <h1
              className="font-serif font-bold mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#1A1A1A" }}
            >
              Page Not Found
            </h1>

            <p className="text-lg mb-3" style={{ color: "#555" }}>
              The page you are looking for doesn't exist or may have been moved.
            </p>
            <p className="text-sm mb-10" style={{ color: "#999" }}>
              <span className="font-mono px-2 py-1 rounded" style={{ background: "#E8F5EE", color: "#1B6B3A" }}>
                Error 404
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 w-full sm:w-auto">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5 font-semibold px-8 h-12 w-full sm:w-auto">
                <Link href="/contact">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Us
                </Link>
              </Button>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#999" }}>
                Popular Pages
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { href: "/courses", label: "Courses", icon: BookOpen },
                  { href: "/teachers", label: "Teachers", icon: Users },
                  { href: "/admission", label: "Apply Now", icon: Home },
                  { href: "/faq", label: "FAQ", icon: Phone },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-all hover:border-primary hover:text-primary"
                    style={{ borderColor: "#DDD", color: "#555" }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
