import { Layout, GeometricPattern } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { useState } from "react";
import { CheckCircle2, Mail, Phone, Globe } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";


const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Please write at least 10 characters"),
});

type ContactForm = z.infer<typeof schema>;

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const submitContact = useSubmitContact();

  const { register, handleSubmit, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: ContactForm) => {
    submitContact.mutate(
      { data },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}>
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <nav className="text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">Contact</span>
            </nav>
            <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Contact Us</h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#666666" }}>
              We serve students in all countries and timezones. Reach out — we are happy to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">

            {/* Left: Contact Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-10">

              {/* WhatsApp CTA */}
              <div className="rounded-2xl p-8 border" style={{ background: "#E8F5EE", borderColor: "rgba(27,107,58,0.2)" }}>
                <FaWhatsapp className="w-12 h-12 mb-4" style={{ color: "#25D366" }} />
                <h2 className="font-serif font-bold text-2xl mb-3" style={{ color: "#1A1A1A" }}>Chat with Us on WhatsApp</h2>
                <p className="mb-5 text-sm leading-relaxed" style={{ color: "#555" }}>
                  The fastest way to reach us. Our team is available to answer questions about courses, fees, schedules, and enrollment.
                </p>
                <a
                  href="https://wa.me/923355777312"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="btn-whatsapp-contact"
                  className="inline-flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:opacity-90 shadow-md"
                  style={{ background: "#25D366" }}
                >
                  <FaWhatsapp className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>

              {/* Contact Details */}
              <div className="space-y-5">
                <h3 className="font-serif font-bold text-xl" style={{ color: "#1A1A1A" }}>Other Ways to Reach Us</h3>

                <a href="mailto:info@virtualzawiyah.com" className="flex items-center gap-4 group" data-testid="link-email">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <Mail className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#C9A84C" }}>Email</div>
                    <div className="font-medium hover:text-primary transition-colors" style={{ color: "#1A1A1A" }}>info@virtualzawiyah.com</div>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#C9A84C" }}>WhatsApp Number</div>
                    <div className="font-medium" style={{ color: "#1A1A1A" }}>+92 335 5777312 <span className="text-xs font-normal" style={{ color: "#888" }}>(primary)</span> &nbsp;·&nbsp; +92 325 5777312 <span className="text-xs font-normal" style={{ color: "#888" }}>(secondary)</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#C9A84C" }}>Serving</div>
                    <div className="font-medium" style={{ color: "#1A1A1A" }}>Students in all countries and timezones</div>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="font-serif font-bold text-xl mb-4" style={{ color: "#1A1A1A" }}>Follow Us</h3>
                <div className="flex gap-4">
                  {[
                    { icon: FaFacebook, label: "Facebook", href: "https://www.facebook.com/share/17jfKU4HpL/" },
                    { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/azzaviyah?igsh=cG01NDF0ZHJtY25u" },
                    { icon: FaYoutube, label: "YouTube", href: "#" },
                  ].map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      data-testid={`link-social-${label.toLowerCase()}`}
                      className="w-12 h-12 rounded-full border flex items-center justify-center transition-all hover:bg-primary hover:border-primary hover:text-primary-foreground"
                      style={{ borderColor: "rgba(27,107,58,0.2)", color: "#1B6B3A" }}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
              <Card className="border" style={{ borderColor: "rgba(27,107,58,0.15)" }}>
                <CardContent className="p-8 md:p-10">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                      data-testid="contact-success"
                    >
                      <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="font-serif font-bold text-2xl mb-3" style={{ color: "#1A1A1A" }}>Message Received!</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
                        Thank you for reaching out. We will get back to you as soon as possible. You can also reach us directly on WhatsApp for a faster response.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <h2 className="font-serif font-bold text-2xl mb-2" style={{ color: "#1A1A1A" }}>Send Us a Message</h2>
                      <p className="text-sm mb-8" style={{ color: "#666" }}>Have a question? We'd love to hear from you.</p>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                        <div className="space-y-1.5">
                          <Label htmlFor="name">Your Name <span className="text-destructive">*</span></Label>
                          <Input id="name" data-testid="input-contact-name" {...register("name")} placeholder="Full name" />
                          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                          <Input id="email" type="email" data-testid="input-contact-email" {...register("email")} placeholder="your@email.com" />
                          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                          <Textarea id="message" data-testid="textarea-contact-message" {...register("message")} placeholder="How can we help you?" rows={5} />
                          {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                        </div>
                        {submitContact.isError && (
                          <p className="text-destructive text-sm">Something went wrong. Please try again or contact us on WhatsApp.</p>
                        )}
                        <Button
                          type="submit"
                          disabled={submitContact.isPending}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
                          data-testid="btn-submit-contact"
                        >
                          {submitContact.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
