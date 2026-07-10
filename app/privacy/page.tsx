'use client'

import Link from 'next/link'
import { Shield, Mail, Phone } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="font-serif font-bold text-2xl mb-4" style={{ color: "#1B6B3A" }}>{title}</h2>
    <div className="space-y-3 text-base leading-relaxed text-gray-700">
      {children}
    </div>
  </section>
)

export default function PrivacyPolicyPage() {
  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Page Header */}
      <section 
        className="relative overflow-hidden py-16" 
        style={{ background: "linear-gradient(135deg, #1B6B3A 0%, #145530 100%)" }}
      >
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center text-white animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4 text-white">Privacy Policy</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            We are committed to protecting your personal data and respecting your privacy rights — wherever you are in the world.
          </p>
          <p className="text-white/60 text-sm mt-4">Last updated: 29 May 2026 &nbsp;·&nbsp; Effective: 29 May 2026</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-semibold">Privacy Policy</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 animate-fade-in-up">

            {/* Jurisdiction Notice */}
            <div className="rounded-xl p-5 mb-10 border" style={{ background: "#E8F5EE", borderColor: "rgba(27, 107, 58, 0.15)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "#1B6B3A" }}>Jurisdiction Coverage</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                This Privacy Policy complies with the <strong>EU/UK General Data Protection Regulation (GDPR)</strong>, the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>, the <strong>Hong Kong Personal Data (Privacy) Ordinance (PDPO, Cap. 486)</strong>, and applicable privacy laws in other jurisdictions. Your rights vary by location — see Section 10 for jurisdiction-specific rights.
              </p>
            </div>

            <Section title="1. Who We Are">
              <p>
                Virtual Zawiyah (&quot;<strong>we</strong>&quot;, &quot;<strong>our</strong>&quot;, or &quot;<strong>us</strong>&quot;) is an online Islamic learning provider offering Quran and Islamic education services globally. We operate as the data controller responsible for your personal information collected through our website at <strong>virtualzawiyah.com</strong> and all associated services.
              </p>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Contact: <a href="mailto:info@virtualzawiyah.com" className="text-primary hover:underline font-semibold">info@virtualzawiyah.com</a> &nbsp;|&nbsp; WhatsApp: <a href="https://wa.me/923255777312" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">+92 325 5777312</a> &nbsp;|&nbsp; Call: <a href="tel:+923255777312" className="text-primary hover:underline font-semibold">+92 325 5777312</a>
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <p>We collect information in the following ways:</p>
              <p className="font-semibold mt-2 text-gray-800">a) Information you provide directly:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Full name, gender, date of birth</li>
                <li>Email address, phone/WhatsApp number</li>
                <li>Postal address and country of residence</li>
                <li>Educational background and Islamic knowledge level</li>
                <li>Course preferences and enrollment details</li>
                <li>Guardian/parent information for students under 18</li>
                <li>Communications you send to us (contact form, email, WhatsApp)</li>
              </ul>
              <p className="font-semibold mt-4 text-gray-800">b) Information collected automatically:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>IP address, browser type, and operating system</li>
                <li>Pages visited, time spent, referring URL</li>
                <li>Device identifiers</li>
                <li>Cookies and similar tracking technologies (see Section 8)</li>
              </ul>
              <p className="font-semibold mt-4 text-gray-800">c) Information from third parties:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Payment processors (billing confirmation only — we do not store card details)</li>
                <li>Our custom, browser-based online classroom portal</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use your personal information to:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Process and manage your enrollment application</li>
                <li>Deliver online classes, course materials, and academic records</li>
                <li>Communicate about your course, schedule, and progress</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Send important notices (schedule changes, policy updates)</li>
                <li>Send optional newsletters and promotions (only with your consent)</li>
                <li>Improve our website, services, and educational offerings</li>
                <li>Comply with legal obligations and resolve disputes</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </Section>

            <Section title="4. Legal Basis for Processing (GDPR)">
              <p>For users in the European Economic Area (EEA) and United Kingdom, we process your data on the following lawful bases:</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-sm md:text-base text-gray-650">
                <li><strong>Contract performance</strong> — processing necessary to provide the educational services you enrolled in (Article 6(1)(b))</li>
                <li><strong>Legitimate interests</strong> — improving our services, fraud prevention, and direct marketing to existing students (Article 6(1)(f))</li>
                <li><strong>Consent</strong> — marketing communications and optional cookies (Article 6(1)(a)); you may withdraw consent at any time</li>
                <li><strong>Legal obligation</strong> — compliance with applicable laws (Article 6(1)(c))</li>
              </ul>
            </Section>

            <Section title="5. How We Share Your Information">
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-sm md:text-base text-gray-650">
                <li><strong>Teachers and academic staff</strong> — to deliver and monitor your education</li>
                <li><strong>Technology providers</strong> — hosting, video conferencing, payment processing, and email services, bound by data processing agreements</li>
                <li><strong>Legal authorities</strong> — when required by law, court order, or to protect rights and safety</li>
                <li><strong>Business transfers</strong> — in the event of a merger or acquisition, with advance notice to you</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600">All third-party processors are contractually required to handle your data in accordance with applicable privacy laws.</p>
            </Section>

            <Section title="6. International Data Transfers">
              <p>
                Virtual Zawiyah operates globally and your data may be transferred to and processed in countries outside your own, including Pakistan, where our operations are based. When transferring data from the EEA/UK, we ensure adequate safeguards are in place, including:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions where applicable</li>
              </ul>
              <p className="mt-2">For Hong Kong residents, transfers outside Hong Kong are conducted in compliance with the PDPO data transfer restrictions (Schedule 1, Data Protection Principle 3).</p>
            </Section>

            <Section title="7. Data Retention">
              <p>We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li><strong>Active student records</strong> — duration of enrollment plus 5 years after graduation/withdrawal</li>
                <li><strong>Enquiry and contact records</strong> — 2 years from last contact</li>
                <li><strong>Financial/payment records</strong> — 7 years (tax and accounting requirements)</li>
                <li><strong>Marketing consent records</strong> — until withdrawal of consent plus 1 year</li>
                <li><strong>Website analytics</strong> — 26 months in aggregate form</li>
              </ul>
              <p className="mt-2">When data is no longer needed, it is securely deleted or anonymised.</p>
            </Section>

            <Section title="8. Cookies and Tracking Technologies">
              <p>We use cookies and similar technologies on our website:</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-sm md:text-base text-gray-650">
                <li><strong>Strictly necessary cookies</strong> — essential for the website to function (cannot be disabled)</li>
                <li><strong>Analytics cookies</strong> — help us understand how visitors use our site (e.g., page views, session duration)</li>
                <li><strong>Preference cookies</strong> — remember your settings and choices</li>
              </ul>
              <p className="mt-2">
                You can control cookies through your browser settings. Disabling non-essential cookies may affect website functionality. We do not use third-party advertising or behavioural tracking cookies.
              </p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>
                Virtual Zawiyah provides educational services to students of all ages, including children under 13. Where a student is under 13 (or under 16 in certain jurisdictions), we require verifiable parental or guardian consent prior to collecting any personal data. We collect only the minimum data necessary for educational purposes from minors.
              </p>
              <p>
                Parents and guardians may review, correct, or request deletion of their child&apos;s information by contacting us at <strong><a href="mailto:info@virtualzawiyah.com" className="text-primary hover:underline">info@virtualzawiyah.com</a></strong>.
              </p>
            </Section>

            <Section title="10. Your Privacy Rights">
              <p>Depending on your location, you have the following rights regarding your personal data:</p>

              <p className="font-semibold mt-4 text-primary">EU / UK (GDPR / UK GDPR):</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-gray-650">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing based on legitimate interests</li>
                <li>Right to withdraw consent at any time</li>
                <li>Right to lodge a complaint with your national supervisory authority</li>
              </ul>

              <p className="font-semibold mt-4 text-primary">California Residents (CCPA / CPRA):</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-gray-650">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information (with exceptions)</li>
                <li>Right to correct inaccurate personal information</li>
                <li>Right to opt-out of sale or sharing (we do not sell personal information)</li>
                <li>Right to limit use of sensitive personal information</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>

              <p className="font-semibold mt-4 text-primary">Hong Kong Residents (PDPO):</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-gray-650">
                <li>Right to request access to personal data (Data Access Request)</li>
                <li>Right to request correction of inaccurate personal data (Data Correction Request)</li>
                <li>Right to be informed of the purpose of data collection</li>
                <li>Right to opt-out of direct marketing use</li>
              </ul>

              <p className="font-semibold mt-4 text-primary">Other Jurisdictions:</p>
              <p className="text-sm">We respect equivalent rights under applicable local laws in all jurisdictions where we operate, including Canada (PIPEDA), Australia (Privacy Act), and others.</p>

              <p className="mt-4 text-sm text-gray-650">To exercise any of these rights, please contact us at <strong><a href="mailto:info@virtualzawiyah.com" className="text-primary hover:underline">info@virtualzawiyah.com</a></strong>. We will respond within 30 days (or within the timeframe required by applicable law). We may need to verify your identity before processing your request.</p>
            </Section>

            <Section title="11. Data Security">
              <p>
                We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These include:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>HTTPS encryption for all data in transit</li>
                <li>Access controls and authentication for staff accessing personal data</li>
                <li>Regular security reviews of our systems and processes</li>
                <li>Staff training on data protection obligations</li>
              </ul>
              <p className="mt-2">
                In the event of a personal data breach that poses a risk to your rights, we will notify the relevant supervisory authority within 72 hours and inform affected individuals without undue delay, as required by GDPR.
              </p>
            </Section>

            <Section title="12. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will notify you by email (if we hold your address) and update the &quot;Last updated&quot; date at the top of this page. We encourage you to review this policy periodically.
              </p>
            </Section>

            <Section title="13. Contact & Complaints">
              <p>If you have any questions, concerns, or wish to exercise your rights, please contact our Data Protection Officer:</p>
              <div className="mt-3 p-5 rounded-xl border space-y-3" style={{ borderColor: "#E0E0E0", background: "#FAFAF7" }}>
                <div className="flex items-center gap-3 text-sm md:text-base">
                  <Mail className="w-5 h-5 shrink-0 text-primary" />
                  <span>
                    <a href="mailto:privacy@virtualzawiyah.com" className="text-primary hover:underline">privacy@virtualzawiyah.com</a>
                    &nbsp;|&nbsp;
                    <a href="mailto:info@virtualzawiyah.com" className="text-primary hover:underline">info@virtualzawiyah.com</a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm md:text-base">
                  <Phone className="w-5 h-5 shrink-0 text-primary" />
                  <span>
                    WhatsApp: <a href="https://wa.me/923255777312" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">+92 325 5777312</a>
                    &nbsp;·&nbsp;
                    Call: <a href="tel:+923255777312" className="text-primary hover:underline font-semibold">+92 325 5777312</a>
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-650 leading-relaxed">
                If you are in the EU/EEA and are not satisfied with our response, you have the right to lodge a complaint with your local data protection supervisory authority. For UK residents, the relevant authority is the <strong>Information Commissioner&apos;s Office (ICO)</strong>. For Hong Kong residents, complaints may be directed to the <strong>Office of the Privacy Commissioner for Personal Data (PCPD)</strong>.
              </p>
            </Section>

          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
