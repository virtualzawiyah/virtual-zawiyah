'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, HelpCircle } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

interface FAQItemType {
  q: string;
  a: React.ReactNode;
}

interface FAQCategory {
  category: string;
  items: FAQItemType[];
}

const faqs: FAQCategory[] = [
  {
    category: "Enrollment & Getting Started",
    items: [
      {
        q: "How do I enroll at Virtual Zawiyah?",
        a: (
          <>
            Simply fill out our <Link href="/enrollment" className="underline font-medium text-primary hover:opacity-80">Admission Application</Link> form online. Once submitted, our team will review your application and reach out within 1–2 business days to schedule your free trial session and confirm your placement.
          </>
        ),
      },
      {
        q: "Is there a free trial before I commit?",
        a: "Yes! We offer a 3-day free trial for all new students. This gives you the opportunity to experience our teaching style, meet your teacher, and ensure the course is the right fit — with absolutely no obligation or payment required.",
      },
      {
        q: "What age groups do you accept?",
        a: "We welcome students of all ages — from young children (5+) to adults. For students under 18, a parent or guardian must complete the enrollment process and may be asked to be present during classes.",
      },
      {
        q: "Do I need any prior Islamic knowledge to enroll?",
        a: "Not at all. We offer courses for complete beginners through to advanced students. During the admission process, we assess your current level to place you in the most suitable class.",
      },
      {
        q: "Can I enroll mid-month or mid-term?",
        a: "Yes, we accept new students on a rolling basis. Fees for the first month are pro-rated based on your start date.",
      },
    ],
  },
  {
    category: "Courses & Curriculum",
    items: [
      {
        q: "What courses does Virtual Zawiyah offer?",
        a: (
          <>
            We offer a broad range of Islamic education courses, including: Quran Nazra (Reading), Applied Tajweed, Quran Hifz (Memorisation), Noorani Qaida (for beginners), Islamic Studies, Arabic Language, Seerah of the Prophet ﷺ, and Fiqh (Islamic Jurisprudence). See our <Link href="/courses" className="underline font-medium text-primary hover:opacity-80">Courses page</Link> for full details.
          </>
        ),
      },
      {
        q: "Are classes one-on-one or in groups?",
        a: "We offer both formats. One-on-one (individual) classes provide maximum personalised attention and are recommended for Hifz and Tajweed. Small group classes (2–5 students) are available for some courses and are more economical. Your preference can be indicated at enrollment.",
      },
      {
        q: "How long is each class session?",
        a: "Standard sessions are 30 minutes for younger students (under 10) and 45–60 minutes for older students and adults. Session length can be adjusted based on the course type and student needs.",
      },
      {
        q: "What is Applied Tajweed?",
        a: "Applied Tajweed is the practical application of Tajweed rules during Quran recitation. Unlike purely theoretical Tajweed, our Applied Tajweed course focuses on correcting and perfecting your actual recitation through guided practice with a qualified Qari.",
      },
      {
        q: "Do you offer female teachers for female students?",
        a: (
          <>
            Yes. We have qualified female teachers available for female students and children. You can specify your preference on the <Link href="/enrollment" className="underline font-medium text-primary hover:opacity-80">admission form</Link>. See our <Link href="/teachers" className="underline font-medium text-primary hover:opacity-80">Teachers page</Link> to learn about our faculty.
          </>
        ),
      },
    ],
  },
  {
    category: "Schedule & Classes",
    items: [
      {
        q: "How do I schedule my classes?",
        a: "After enrollment, our academic coordinator will contact you to agree on a convenient timetable with your assigned teacher. We are flexible and can accommodate most time zones, including US, European, and Asia-Pacific schedules.",
      },
      {
        q: "How many classes per week are recommended?",
        a: "For consistent progress, we recommend a minimum of 3 sessions per week. For Hifz students, 5–6 sessions per week are ideal. However, we understand busy schedules — even 2 sessions per week will yield results over time.",
      },
      {
        q: "What if I need to reschedule or miss a class?",
        a: "Please notify your teacher or our support team at least 24 hours in advance to reschedule without the session being counted as an absence. We will always try to offer a make-up session. For last-minute cancellations, make-up sessions are offered subject to teacher availability.",
      },
      {
        q: "Do you accommodate different time zones?",
        a: "Yes. Our teachers are available across a wide range of time slots, typically from early morning to late evening Pakistan Standard Time (PKT/UTC+5). This covers morning slots for Europe, afternoon for the Middle East, and evening/late night for North America and the Asia-Pacific.",
      },
      {
        q: "What platform is used for online classes?",
        a: "Classes are conducted via Zoom, which provides high-quality audio and video essential for Quran recitation and Tajweed correction. A Zoom account is free to create and works on all devices including smartphones, tablets, and computers.",
      },
    ],
  },
  {
    category: "Fees & Payment",
    items: [
      {
        q: "How much do courses cost?",
        a: (
          <>
            Course fees vary depending on the course type, number of sessions per week, and individual vs. group format. Please visit our <Link href="/pricing" className="underline font-medium text-primary hover:opacity-80">Pricing page</Link> or <Link href="/contact" className="underline font-medium text-primary hover:opacity-80">contact us on WhatsApp</Link> for a personalised fee quote.
          </>
        ),
      },
      {
        q: "What currencies do you accept?",
        a: "We primarily invoice in US Dollars (USD), which is convenient for international students. Payment can also be arranged in GBP, EUR, or PKR depending on your location.",
      },
      {
        q: "What payment methods are available?",
        a: "We accept bank transfers, and major international payment methods. Details are provided at enrollment. We do not store your payment card information — all card transactions are processed by our secure payment provider.",
      },
      {
        q: "What is your refund policy?",
        a: "We offer a full refund if you cancel at least 7 days before your first class. A 50% refund is available within the first week of classes. After the first week, no refund is issued for the current billing period, but you may cancel future billing. Please see our Terms of Service for full details.",
      },
    ],
  },
  {
    category: "Technical Requirements",
    items: [
      {
        q: "What equipment do I need for online classes?",
        a: "You need a device with a camera and microphone (laptop, tablet, or smartphone), a stable internet connection, and the free Zoom app. A headset or earphones are highly recommended for better audio quality during Quran recitation.",
      },
      {
        q: "What internet speed is required?",
        a: "A minimum of 2 Mbps upload and download speed is recommended for smooth video calls. A wired connection or being close to your Wi-Fi router will give the best results.",
      },
      {
        q: "Can I use a smartphone for classes?",
        a: "Yes, Zoom works well on smartphones (iOS and Android). For younger students, a larger screen (tablet or laptop) is recommended to make it easier to follow along with text and the teacher's screen.",
      },
    ],
  },
  {
    category: "About Our Teachers",
    items: [
      {
        q: "Are your teachers qualified?",
        a: (
          <>
            All Virtual Zawiyah teachers hold formal Islamic qualifications including Ijazah in Quran recitation (a chain of transmission going back to the Prophet ﷺ), and degrees from recognised Islamic institutions. You can learn more on our <Link href="/teachers" className="underline font-medium text-primary hover:opacity-80">Teachers page</Link>.
          </>
        ),
      },
      {
        q: "Can I request a specific teacher?",
        a: "You can express a preference for a teacher during enrollment. We will do our best to accommodate requests, subject to teacher availability and your time zone.",
      },
      {
        q: "What happens if my teacher is unavailable?",
        a: "In the event of teacher absence, we will arrange a qualified substitute teacher or reschedule the session with advance notice. Continuity of learning is a priority for us.",
      },
    ],
  },
];

function FAQItem({ item }: { item: FAQItemType }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border rounded-xl overflow-hidden transition-all duration-300"
      style={{ borderColor: open ? "rgba(27, 107, 58, 0.25)" : "#E0E0E0" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors"
        style={{ background: open ? "#E8F5EE" : "#fff" }}
        aria-expanded={open}
      >
        <span className="font-semibold text-base pr-2" style={{ color: "#1A1A1A" }}>{item.q}</span>
        <ChevronDown
          className="w-5 h-5 shrink-0 transition-transform duration-300"
          style={{ color: "#1B6B3A", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 text-base leading-relaxed border-t text-gray-650" style={{ borderColor: "#E8F5EE" }}>
          {item.a}
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Header */}
      <section 
        className="relative overflow-hidden py-16" 
        style={{ background: "linear-gradient(135deg, #1B6B3A 0%, #145530 100%)" }}
      >
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center text-white animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4 text-white">Frequently Asked Questions</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Everything you need to know about studying at Virtual Zawiyah. Can&apos;t find your answer? Chat with us on WhatsApp.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-semibold">FAQ</span>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="py-16" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4 max-w-3xl">

          {faqs.map((section) => (
            <div key={section.category} className="mb-12 animate-fade-in-up">
              <h2
                className="font-serif font-bold text-2xl mb-5 pb-3 border-b"
                style={{ color: "#1B6B3A", borderColor: "rgba(201, 168, 76, 0.25)" }}
              >
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <FAQItem key={i} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* Still have questions CTA */}
          <div
            className="mt-12 rounded-2xl p-8 text-center text-white animate-fade-in-up"
            style={{ background: "linear-gradient(135deg, #1B6B3A 0%, #145530 100%)" }}
          >
            <h3 className="font-serif font-bold text-2xl mb-3 text-white">Still have a question?</h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto text-sm md:text-base">
              Our team is available on WhatsApp to answer any question about courses, enrollment, scheduling, or fees.
            </p>
            <a
              href="https://wa.me/923355777312?text=Assalamu%20Alaikum%2C%20I%20have%20a%20question%20about%20Virtual%20Zawiyah."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ask your question to Virtual Zawiyah on WhatsApp"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-105 text-white"
              style={{ background: "#25D366" }}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.785 9.785 0 0 0-6.96-2.879c-5.43 0-9.855 4.37-9.859 9.801-.002 1.741.485 3.45 1.407 4.966l-.995 3.637 3.792-.987zm11.58-7.16c-.076-.127-.278-.203-.581-.355-.304-.152-1.793-.883-2.071-.984-.279-.101-.482-.152-.684.152-.203.304-.785.984-.963 1.186-.177.203-.355.228-.658.076-.304-.152-1.283-.473-2.443-1.507-.903-.805-1.512-1.8-1.689-2.103-.177-.304-.019-.468.133-.619.136-.136.304-.355.456-.532.152-.177.203-.304.304-.506.101-.203.051-.38-.025-.532-.076-.152-.684-1.647-.937-2.256-.247-.599-.498-.518-.684-.527-.177-.008-.38-.01-.582-.01-.203 0-.532.076-.81.38-.279.304-1.064 1.039-1.064 2.532 0 1.494 1.089 2.937 1.241 3.14.152.203 2.144 3.273 5.193 4.59.724.313 1.29.5 1.732.64.727.23 1.39.198 1.912.12.583-.088 1.794-.733 2.048-1.442.253-.709.253-1.316.177-1.442z" />
              </svg>
              Ask on WhatsApp
            </a>
          </div>

        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
