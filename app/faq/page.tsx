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
        a: "We offer a 3-day free trial exclusively for our 1:1 (individual) course students. This gives you the opportunity to experience our teaching style, meet your teacher, and ensure the course is the right fit before committing — with absolutely no obligation or payment required. Group programs do not include a free trial.",
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
        a: "For 1:1 (individual) courses, yes, we accept new students on a rolling basis (fees are pro-rated). For group programs (such as Dars-e-Nizami or the Tajweed Group Program), we do not accept registrations mid-session; new cohorts for group courses begin exclusively on the 1st of every Ramadan.",
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
        a: "Classes are conducted entirely on our own custom, browser-based online classroom. You do not need to install any external apps like Zoom or Teams — everything runs securely inside your web browser via our student portal.",
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
            Course fees vary depending on the course type, number of sessions per week, and individual vs. group format. Please visit our <Link href="/fee" className="underline font-medium text-primary hover:opacity-80">Fee page</Link> or <a href="https://wa.me/923255777312" target="_blank" rel="noopener noreferrer" className="underline font-medium text-primary hover:opacity-80">contact us on WhatsApp</a> for a personalised fee quote.
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
        a: "You need a device with a camera and microphone (laptop, desktop, or tablet recommended), a stable internet connection, and a modern web browser (such as Chrome, Safari, Firefox, or Edge) to access our custom classroom. A headset or earphones are highly recommended for better audio quality during Quran recitation.",
      },
      {
        q: "What internet speed is required?",
        a: "A minimum of 2 Mbps upload and download speed is recommended for smooth video calls. A wired connection or being close to your Wi-Fi router will give the best results.",
      },
      {
        q: "Can I use a smartphone for classes?",
        a: "While our custom classroom can run on mobile web browsers, we strongly recommend using a large-screen device (such as a laptop, desktop, or tablet) to ensure the best learning experience, allowing you to clearly view the Quranic text, shared board, and teacher's screens.",
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
              href="https://wa.me/923255777312?text=Assalamu%20Alaikum%2C%20I%20have%2520a%2520question%2520about%2520Virtual%2520Zawiyah."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ask your question to Virtual Zawiyah on WhatsApp"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-105 text-white"
              style={{ background: "#25D366" }}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
