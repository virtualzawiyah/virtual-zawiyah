'use client'

import Link from 'next/link'
import { FileText, Mail } from 'lucide-react'
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

export default function TermsOfServicePage() {
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
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4 text-white">Terms of Service</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our website or enrolling in any of our courses.
          </p>
          <p className="text-white/60 text-sm mt-4">Last updated: 29 May 2026 &nbsp;·&nbsp; Effective: 29 May 2026</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-semibold">Terms of Service</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 animate-fade-in-up">

            {/* Acceptance Notice */}
            <div className="rounded-xl p-5 mb-10 border" style={{ background: "#E8F5EE", borderColor: "rgba(27, 107, 58, 0.15)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "#1B6B3A" }}>Agreement to Terms</p>
              <p className="text-sm text-gray-705 leading-relaxed">
                By accessing our website or enrolling in any course offered by Virtual Zawiyah, you agree to be bound by these Terms of Service and our <Link href="/privacy" className="underline font-medium text-primary hover:opacity-80">Privacy Policy</Link>. If you do not agree with any part of these terms, you must not use our services.
              </p>
            </div>

            <Section title="1. About Virtual Zawiyah">
              <p>
                Virtual Zawiyah is an online Islamic learning platform offering live, instructor-led courses in Quran recitation, Tajweed, Islamic studies, and related disciplines. We serve students globally, including but not limited to the United States, European Union, United Kingdom, Hong Kong, Canada, Australia, and Pakistan.
              </p>
              <p>
                These Terms of Service govern your use of our website (<strong>virtualzawiyah.com</strong>) and all services, courses, and content provided through it. By using our services, you confirm you are at least 18 years old, or have parental/guardian consent if younger.
              </p>
            </Section>

            <Section title="2. Enrollment and Accounts">
              <p>
                To enroll in a course, you must complete our Admission Application form and provide accurate, complete, and current information. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Maintaining the confidentiality of any account credentials</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately of any unauthorised use of your account</li>
                <li>Keeping your contact information current</li>
              </ul>
              <p className="mt-2">
                We reserve the right to refuse enrollment, suspend, or terminate an account at our discretion, particularly where these Terms are violated.
              </p>
            </Section>

            <Section title="3. Trial Period Policy">
              <p>
                We offer a <strong>3-day trial period</strong> exclusively for our 1:1 (individual) courses to allow prospective students to experience our teaching methodology. During the trial period:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Trial sessions are not available for group programs</li>
                <li>Trial sessions begin after completing your initial enrollment application</li>
                <li>Trial access is limited to your chosen course program</li>
                <li>We reserve the right to end or modify trial offerings at any time</li>
                <li>Continued enrollment after the trial requires agreement to our standard monthly fee schedule</li>
              </ul>
            </Section>

            <Section title="4. Fees, Payment, and Refunds">
              <p><strong>Fees:</strong> Course fees are clearly stated at the time of enrollment. Fees are quoted in US Dollars (USD) unless otherwise specified. Prices are subject to change with 30 days&apos; notice to enrolled students.</p>
              <p className="mt-2"><strong>Payment:</strong> Payment is due in advance of the billing period unless a payment plan is agreed in writing. We use secure third-party payment processors; we do not store your full payment card details.</p>
              <p className="mt-4 font-semibold text-gray-800">Refund Policy:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li><strong>Before course commencement:</strong> Full refund if requested at least 7 days before the first scheduled class</li>
                <li><strong>Within the first week of classes:</strong> 50% refund of the monthly fee paid</li>
                <li><strong>After the first week:</strong> No refund for the current billing period; you may cancel future billing</li>
                <li><strong>Exceptional circumstances</strong> (illness, bereavement): considered on a case-by-case basis — please contact us</li>
              </ul>
              <p className="mt-2">Refund requests must be submitted in writing to <strong><a href="mailto:info@virtualzawiyah.com" className="text-primary hover:underline">info@virtualzawiyah.com</a></strong>.</p>
            </Section>

            <Section title="5. Scheduling and Attendance">
              <ul className="list-disc list-inside space-y-2 pl-4 text-sm md:text-base text-gray-650">
                <li>Class schedules are agreed between the student and their assigned teacher at enrollment</li>
                <li>Students must provide at least <strong>24 hours&apos; notice</strong> to reschedule or cancel a session without it counting as an absence</li>
                <li>We will make reasonable efforts to reschedule missed classes due to teacher unavailability</li>
                <li>Repeated unexplained absences (3 or more consecutive sessions) may result in enrollment suspension</li>
                <li>Public holidays in Pakistan may affect teacher availability; we will notify students in advance where possible</li>
              </ul>
            </Section>

            <Section title="6. Code of Conduct">
              <p>Virtual Zawiyah is a respectful Islamic learning environment. All students, parents, and guardians are expected to:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Treat teachers, staff, and fellow students with respect and courtesy</li>
                <li>Dress modestly and appropriately for online sessions</li>
                <li>Be punctual and prepared for scheduled classes</li>
                <li>Refrain from recording sessions without prior written consent</li>
                <li>Not share course materials, recordings, or proprietary content with third parties</li>
                <li>Not engage in any behaviour that could be deemed harassing, threatening, or discriminatory</li>
              </ul>
              <p className="mt-2">
                Violations of this Code of Conduct may result in a formal warning, suspension, or permanent termination of enrollment without refund.
              </p>
            </Section>

            <Section title="7. Intellectual Property">
              <p>
                All content on the Virtual Zawiyah website and within our courses — including but not limited to text, images, course materials, videos, audio recordings, and teaching methodologies — is the intellectual property of Virtual Zawiyah or our licensed content providers and is protected by applicable copyright and intellectual property laws.
              </p>
              <p className="mt-2">You are granted a limited, non-exclusive, non-transferable licence to access and use our content solely for your personal educational purposes. You may not:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Copy, reproduce, distribute, or publish any course content without our written permission</li>
                <li>Create derivative works based on our materials</li>
                <li>Use our content for commercial purposes</li>
                <li>Remove any copyright or proprietary notices from materials</li>
              </ul>
            </Section>

            <Section title="8. Privacy and Data Protection">
              <p>
                Your use of our services is also governed by our <Link href="/privacy" className="underline font-medium text-primary hover:opacity-80">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information in compliance with GDPR, CCPA, PDPO, and other applicable laws. Our Privacy Policy is incorporated into these Terms by reference.
              </p>
            </Section>

            <Section title="9. Prohibited Activities">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm md:text-base text-gray-650">
                <li>Use our website or services for any unlawful purpose</li>
                <li>Attempt to gain unauthorised access to our systems or other users&apos; accounts</li>
                <li>Transmit any malware, viruses, or harmful code</li>
                <li>Scrape, harvest, or collect data from our website without authorisation</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in any conduct that disrupts or interferes with our services</li>
                <li>Use our platform to promote content contrary to Islamic values or applicable law</li>
              </ul>
            </Section>

            <Section title="10. Disclaimers and Limitation of Liability">
              <p>
                <strong>Services provided &quot;as is&quot;:</strong> Our services are provided in good faith but without warranty of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p>
                <strong>Service availability:</strong> We strive for high availability but cannot guarantee uninterrupted service. We are not liable for outages caused by internet connectivity issues, third-party service provider outages, or force majeure events.
              </p>
              <p>
                <strong>Limitation of liability:</strong> To the maximum extent permitted by applicable law, Virtual Zawiyah&apos;s total liability to you for any claim arising from these Terms or your use of our services shall not exceed the total fees paid by you in the three months preceding the claim.
              </p>
              <p>
                <strong>Note for EU consumers:</strong> Nothing in these Terms affects your statutory consumer rights under applicable EU or UK consumer protection law, which cannot be excluded or limited.
              </p>
              <p>
                <strong>California residents:</strong> You may have additional rights under California law. Nothing in these Terms waives your statutory rights under California consumer protection statutes.
              </p>
            </Section>

            <Section title="11. Third-Party Links and Services">
              <p>
                Our website may contain links to third-party websites (e.g., payment gateways or social media). These links are provided for your convenience. We do not endorse and are not responsible for the content, privacy practices, or terms of any third-party website. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </Section>

            <Section title="12. Governing Law and Dispute Resolution">
              <p>
                These Terms are governed by and construed in accordance with the laws of <strong>Pakistan</strong>, without regard to its conflict of law provisions.
              </p>
              <p>
                In the event of any dispute, we encourage you to first contact us at <strong><a href="mailto:info@virtualzawiyah.com" className="text-primary hover:underline">info@virtualzawiyah.com</a></strong> to seek an amicable resolution. If a resolution cannot be reached within 30 days, disputes shall be submitted to binding arbitration or the courts of competent jurisdiction in Pakistan, except where prohibited by local consumer protection law.
              </p>
              <p>
                <strong>EU/UK consumers:</strong> You retain the right to bring proceedings in the courts of your country of residence and may also use the EU Online Dispute Resolution platform at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:opacity-80">ec.europa.eu/consumers/odr</a>.
              </p>
              <p>
                <strong>California residents:</strong> You may have additional rights under California law. Nothing in these Terms waives your statutory rights under California consumer protection statutes.
              </p>
            </Section>

            <Section title="13. Changes to These Terms">
              <p>
                We may update these Terms of Service from time to time. When we make material changes, we will notify enrolled students by email and update the &quot;Last updated&quot; date above. Your continued use of our services after any changes constitutes your acceptance of the revised Terms. If you do not agree with the revised Terms, you should discontinue use of our services.
              </p>
            </Section>

            <Section title="14. Severability and Entire Agreement">
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining Terms remain in full force and effect.
              </p>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Virtual Zawiyah regarding the use of our services and supersede all prior agreements, understandings, and representations.
              </p>
            </Section>

            <Section title="15. Contact Us">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <div className="mt-3 p-5 rounded-xl border space-y-3" style={{ borderColor: "#E0E0E0", background: "#FAFAF7" }}>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 shrink-0 text-primary" />
                  <a href="mailto:info@virtualzawiyah.com" className="text-primary hover:underline">info@virtualzawiyah.com</a>
                </div>
              </div>
            </Section>

          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
