'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Users, CheckCircle2, Award } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

interface Course {
  icon: string
  name: string
  description: string
  format: "One-on-One" | "Group"
  duration: string
  feeLabel: string
  freeTrial: boolean
  highlights: string[]
}

// Live courses lists will be fetched dynamically from the database.

function CourseCard({ course, index }: { course: Course; index: number }) {
  return (
    <div
      className="rounded-2xl p-8 border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[0.04] flex flex-col justify-between"
      style={{ borderColor: "rgba(27,107,58,0.15)" }}
      data-testid={`course-card-${index}`}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{course.icon}</div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${
              course.format === "Group" 
                ? "border-blue-300 text-blue-700 bg-blue-50" 
                : "border-green-300 text-green-700 bg-green-50"
            }`}>
              {course.format}
            </span>
            {course.freeTrial && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-secondary-foreground" style={{ background: "#C9A84C" }}>
                3-Day Trial
              </span>
            )}
          </div>
        </div>
        
        <h3 className="font-serif font-bold text-xl mb-3 text-gray-900">{course.name}</h3>
        <p className="text-sm leading-relaxed mb-5 text-gray-600 min-h-[72px]">{course.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Award className="w-4 h-4 shrink-0" />
            <Link href="/fee" className="underline underline-offset-2 hover:opacity-75 transition-opacity">
              View Fees & Plans →
            </Link>
          </div>
        </div>

        <ul className="space-y-2.5 mb-7">
          {course.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        <Link 
          href="/enrollment" 
          className="w-full inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-semibold py-3 px-4 rounded-md shadow-sm transition-colors text-sm text-center"
          data-testid={`btn-apply-course-${index}`}
        >
          Apply Now
        </Link>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [oneOnOneCourses, setOneOnOneCourses] = useState<Course[]>([])
  const [groupCourses, setGroupCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/content/courses')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load courses')
        return res.json()
      })
      .then(data => {
        const active = data.filter((c: any) => c.active)
        
        const mappedOneOnOne = active
          .filter((c: any) => c.program_type === '1:1')
          .map((c: any) => ({
            icon: c.icon || '📖',
            name: c.title,
            description: c.description || '',
            format: 'One-on-One' as const,
            duration: c.duration || '30 / 60 / 90 min per session',
            feeLabel: `$${c.base_fee} / month`,
            freeTrial: c.freeTrial !== undefined ? c.freeTrial : true,
            highlights: c.highlights || []
          }))

        const mappedGroup = active
          .filter((c: any) => c.program_type === 'group')
          .map((c: any) => ({
            icon: c.icon || '🕌',
            name: c.title,
            description: c.description || '',
            format: 'Group' as const,
            duration: c.duration || '120 min · 5 days/week',
            feeLabel: `$${c.base_fee} / month`,
            freeTrial: c.freeTrial !== undefined ? c.freeTrial : false,
            highlights: c.highlights || []
          }))

        setOneOnOneCourses(mappedOneOnOne)
        setGroupCourses(mappedGroup)
      })
      .catch(err => {
        console.error('Error fetching courses:', err)
        setError(err.message || 'Unable to connect to courses database.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section 
        className="relative overflow-hidden py-16" 
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}
      >
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-semibold">Courses</span>
          </nav>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Our Courses</h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-650">
            Comprehensive Islamic education — from Quran recitation to classical scholarship. Every course taught by qualified scholars.
          </p>
        </div>
      </section>

      {/* Pricing Note */}
      <section className="py-10 bg-white border-b border-gray-200/60 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center gap-8 text-center sm:text-left">
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-lg text-primary">From $60 / month</div>
                <div className="text-xs text-gray-500">One-on-One Classes</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-650" />
              </div>
              <div>
                <div className="font-bold text-lg text-blue-700">$10 / month</div>
                <div className="text-xs text-gray-500">Group Classes</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.15)" }}>
                <Award className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <div className="font-bold text-lg text-secondary">3-Day Trial</div>
                <div className="text-xs text-gray-500">For 1:1 Courses</div>
              </div>
            </div>

          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Full pricing breakdown with all plan options on our{" "}
            <Link href="/fee" className="font-semibold underline text-primary">
              Tuition & Fees
            </Link>{" "}
            page.
          </p>
        </div>
      </section>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-500 font-semibold mt-4">Loading our dynamic course offerings...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 bg-white px-4">
          <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl text-center max-w-md">
            <p className="font-bold text-rose-900 mb-1">Could Not Load Catalog</p>
            <p className="text-xs text-rose-750">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* One-on-One Courses */}
          <section className="py-24 bg-white relative z-10">
            <div className="container mx-auto px-4">
              <div className="mb-14 animate-fade-in-up">
                <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>One-on-One Courses</h2>
                <p className="mt-2 text-base text-gray-600">Personalized instruction tailored to your pace and learning style. From $60/month · 3-day trial.</p>
              </div>
              {oneOnOneCourses.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-10 bg-zinc-50 rounded-xl">No active 1:1 courses found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {oneOnOneCourses.map((course, i) => (
                    <CourseCard key={i} course={course} index={i} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Group Courses */}
          <section className="py-24 relative z-10" style={{ background: "#FAFAF7" }}>
            <div className="container mx-auto px-4">
              <div className="mb-14 animate-fade-in-up">
                <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Group Courses</h2>
                <p className="mt-2 text-base text-gray-600">Structured group learning with fellow students. $10/month · 120 min · 5 days/week.</p>
              </div>
              {groupCourses.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-10 bg-zinc-50 rounded-xl">No active Group courses found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {groupCourses.map((course, i) => (
                    <CourseCard key={i} course={course} index={oneOnOneCourses.length + i} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden z-10 text-white">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in-up">
          <h2 className="font-serif font-bold text-3xl mb-4">Not sure which course is right for you?</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Our admissions team will help match you with the perfect course and teacher based on your goals.
          </p>
          <Link 
            href="/enrollment" 
            className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-white hover:bg-secondary/90 py-3.5 px-10 font-semibold shadow-lg"
            data-testid="btn-apply-courses-cta"
          >
            Apply Now
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
