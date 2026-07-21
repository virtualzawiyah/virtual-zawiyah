'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Megaphone, 
  BookOpen, 
  CreditCard, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  Star,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react'
import GeometricPattern from '@/components/GeometricPattern'
import BackToFounderBanner from '@/components/BackToFounderBanner'
import NotificationBell from '@/components/NotificationBell'

// --- Mock Interfaces ---
interface Announcement {
  id: string
  title: string
  message: string
  appliesTo: 'All' | '1:1 Only' | 'Group Only'
  startDate: string
  endDate: string
  isActive: boolean
}

interface Course {
  id: string
  name: string
  description: string
  price: string
  category: '1:1' | 'Group'
  highlights?: string[]
  icon?: string
}

interface FeeCard {
  id: string
  title: string
  title_original?: string
  price: string
  base_fee?: number
  program_type?: string
  duration?: string
  features: string[]
}

// --- Initial Mock Data ---
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Eid-ul-Adha Holidays Notification',
    message: 'All live Quran classes will remain suspended from June 16 to June 19, 2026, in observance of Eid-ul-Adha. Regular schedules will resume on June 20, 2026. Eid Mubarak!',
    appliesTo: 'All',
    startDate: '2026-06-15',
    endDate: '2026-06-20',
    isActive: true
  },
  {
    id: 'ann-2',
    title: 'Ramadan Tajweed Adjustments',
    message: 'Classes will start 30 minutes earlier during the holy month of Ramadan to accommodate Iftar times.',
    appliesTo: '1:1 Only',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    isActive: false
  },
  {
    id: 'ann-3',
    title: 'New Dars-e-Nizami Group Admission Open',
    message: 'Enrollment is now open for our new intermediate-level Arabic Grammar & Hadith study circle starting July 1st, 2026.',
    appliesTo: 'Group Only',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    isActive: true
  }
]

const INITIAL_COURSES: Course[] = [
  {
    id: 'c-1',
    name: 'Quran Reading with Tajweed',
    description: 'Learn to read the Holy Quran correctly with proper Tajweed rules. This foundational course is suitable for beginners and those looking to improve their recitation. Progress at your own pace with personalized guidance.',
    price: '$60',
    category: '1:1'
  },
  {
    id: 'c-2',
    name: 'Applied Tajweed (Basic)',
    description: 'A focused course on mastering the foundational rules of Tajweed with practical application. Ideal for students who can read Arabic but want to perfect their recitation quality.',
    price: '$60',
    category: '1:1'
  },
  {
    id: 'c-3',
    name: 'Quran Memorization (Hifz)',
    description: 'Embark on the noble journey of becoming a Hafiz or Hafizah. This personalized course uses proven memorization techniques adapted to your schedule and learning style.',
    price: '$60',
    category: '1:1'
  },
  {
    id: 'c-4',
    name: '40 Hadith Memorization',
    description: "Memorize Imam Nawawi's collection of 40 essential Hadiths — the prophetic traditions every Muslim should know. Each Hadith is explained in context.",
    price: '$60',
    category: '1:1'
  },
  {
    id: 'c-5',
    name: 'Quran Translation',
    description: "Understand the meaning of the Quran in English. This course helps students connect with the Quran's message, themes, and wisdom beyond recitation.",
    price: '$60',
    category: '1:1'
  },
  {
    id: 'c-6',
    name: 'Arabic Grammar (Sarf & Nahw)',
    description: 'Master classical Arabic grammar — the key that unlocks the Quran, Hadith, and Islamic texts. Covers both morphology (Sarf) and syntax (Nahw) in a structured sequence.',
    price: '$60',
    category: '1:1'
  },
  {
    id: 'c-7',
    name: 'Dars-e-Nizami — Classical Islamic Curriculum',
    description: 'The complete 8-year classical Islamic scholarship curriculum taught in traditional seminaries worldwide. Students select their year of entry at admission. Subjects include Fiqh, Hadith, Tafsir, Aqeedah, Arabic Grammar, Mantiq (Logic), Balagha (Rhetoric), and more.',
    price: '$10',
    category: 'Group'
  },
  {
    id: 'c-8',
    name: 'Tajweed — 2-Year Structured Group Program',
    description: 'A comprehensive two-year group course covering all Tajweed rules from beginner to advanced level. Students progress through a structured curriculum alongside peers and benefit from group recitation practice.',
    price: '$10',
    category: 'Group'
  }
]

const INITIAL_FEECARDS: FeeCard[] = [
  {
    id: 'fc-1',
    title: '1:1 Monthly ($60) - 3 lessons/week',
    price: '$60',
    features: [
      '12 live sessions per month',
      'Dedicated personal teacher',
      '30-minute focused session',
      'Progress reports',
      'Flexible scheduling'
    ]
  },
  {
    id: 'fc-2',
    title: '1:1 Monthly ($100) - 5 lessons/week',
    price: '$100',
    features: [
      '20 live sessions per month',
      'Dedicated personal teacher',
      '30-minute focused session',
      'Weekly progress report',
      'Flexible scheduling',
      'Priority teacher matching'
    ]
  },
  {
    id: 'fc-3',
    title: '1:1 Monthly ($120) - 3 lessons/week',
    price: '$120',
    features: [
      '12 live sessions per month',
      'Dedicated personal teacher',
      '60-minute in-depth session',
      'Progress reports',
      'Flexible scheduling'
    ]
  },
  {
    id: 'fc-4',
    title: '1:1 Monthly ($200) - 5 lessons/week',
    price: '$200',
    features: [
      '20 live sessions per month',
      'Dedicated personal teacher',
      '60-minute in-depth session',
      'Weekly progress report',
      'Flexible scheduling',
      'Priority teacher matching'
    ]
  },
  {
    id: 'fc-5',
    title: 'Group Monthly ($10)',
    price: '$10',
    features: [
      '20 live sessions per month',
      'Group sessions',
      '120-minute session',
      'Structured curriculum',
      'Deeper coverage per session',
      'Q&A time included'
    ]
  },
  {
    id: 'fc-6',
    title: 'Weekend Monthly ($100)',
    price: '$100',
    features: [
      '8 dedicated weekend sessions/month',
      'Personal one-on-one teacher',
      '30-minute focused session',
      'Perfect for working adults & school students',
      'Consistent weekend routine',
      'Progress reports'
    ]
  }
]


export default function ContentManagerDashboard() {
  const handleLogout = async () => {
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    await supabase.auth.signOut()
    window.location.href = '/staff/login'
  }

  const [activeTab, setActiveTab] = useState<'announcements' | 'courses' | 'fee-cards' | 'profile-requests' | 'feedback-reviews'>('announcements')

  // --- States ---
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [feeCards, setFeeCards] = useState<FeeCard[]>([])
  const [profileRequests, setProfileRequests] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Success message toaster state
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // --- Modal Forms state ---
  const [activeModal, setActiveModal] = useState<'create-announcement' | 'edit-announcement' | 'create-course' | 'edit-course' | 'edit-feecard' | 'create-feecard' | 'confirm-remove-course' | null>(null)

  // Selected Entities
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedFeeCard, setSelectedFeeCard] = useState<FeeCard | null>(null)

  // --- Announcement Form fields ---
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')
  const [annAppliesTo, setAnnAppliesTo] = useState<'All' | '1:1 Only' | 'Group Only'>('All')
  const [annStartDate, setAnnStartDate] = useState('')
  const [annEndDate, setAnnEndDate] = useState('')

  // --- Course Form fields ---
  const [courseName, setCourseName] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [coursePrice, setCoursePrice] = useState('')
  const [courseCategory, setCourseCategory] = useState<'1:1' | 'Group'>('1:1')
  const [courseHighlights, setCourseHighlights] = useState<string[]>([])
  const [newHighlightText, setNewHighlightText] = useState('')
  const [draggedHighlightIdx, setDraggedHighlightIdx] = useState<number | null>(null)
  const [courseIcon, setCourseIcon] = useState('📖')

  // --- Fee Card Form fields ---
  const [feeTitle, setFeeTitle] = useState('')
  const [feeDuration, setFeeDuration] = useState('30-minute focused session (3 days/week)')
  const [feeCategory, setFeeCategory] = useState<'3days' | '5days' | 'weekend' | 'group'>('3days')
  const [feePrice, setFeePrice] = useState('')
  const [feeFeatures, setFeeFeatures] = useState<string[]>([])
  const [newFeatureText, setNewFeatureText] = useState('')
  const [draggedFeatureIdx, setDraggedFeatureIdx] = useState<number | null>(null)

  // Toast helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg)
    setTimeout(() => {
      setSuccessToast(null)
    }, 5000)
  }

  // Handle Resolving Teacher Profile Change Request
  const handleResolveProfileRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/content-manager/profile-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to resolve request')
      }

      triggerToast(`Teacher profile update request has been successfully ${action === 'approve' ? 'approved & updated' : 'rejected'}.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  // Handle Resolving Feedback Submissions
  const handleResolveFeedback = async (feedbackId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/content-manager/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, action })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to resolve feedback')
      }

      triggerToast(`User feedback submission has been successfully ${action === 'approve' ? 'approved & published' : 'rejected'}.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  // Handle Deleting Fee Card
  const handleDeleteFeeCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee card? It will be removed from public pricing sheets.')) return
    try {
      const res = await fetch(`/api/content/fee-cards?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete fee card')
      }
      triggerToast('Fee card deleted successfully.')
      await fetchData()
    } catch (err: any) {
      alert(`Error deleting fee card: ${err.message}`)
    }
  }

  // Open Create Fee Card Modal
  const openCreateFeeCard = () => {
    setFeeTitle('')
    setFeeDuration('30-minute focused session (3 days/week)')
    setFeePrice('60')
    setFeeCategory('3days')
    setFeeFeatures(['12 live sessions per month', 'Dedicated personal teacher', '30-minute focused session', 'Progress reports', 'Flexible scheduling'])
    setNewFeatureText('')
    setActiveModal('create-feecard')
  }

  // Handle Submitting New Fee Card
  const handleCreateFeeCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const mappedProgramType = feeCategory === 'group' ? 'group' : '1:1'
      let finalTitle = feeTitle
      if (feeCategory === 'weekend' && !finalTitle.toLowerCase().includes('weekend')) {
        finalTitle = `${feeTitle} (Weekend)`
      } else if (feeCategory === '5days' && !finalTitle.toLowerCase().includes('5 days') && !finalTitle.toLowerCase().includes('intensive')) {
        finalTitle = `${feeTitle} (5 Days/Week)`
      }

      const res = await fetch('/api/content/fee-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          program_type: mappedProgramType,
          base_fee: feePrice,
          duration: feeDuration,
          features: feeFeatures
        })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create fee card')
      }
      triggerToast('New fee card created successfully!')
      setActiveModal(null)
      await fetchData()
    } catch (err: any) {
      alert(`Error creating fee card: ${err.message}`)
    }
  }

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [annRes, coursesRes, feeRes, reqRes, feedbackRes] = await Promise.all([
        fetch('/api/content/announcements'),
        fetch('/api/content/courses'),
        fetch('/api/content/fee-cards'),
        fetch('/api/content-manager/profile-requests'),
        fetch('/api/content-manager/feedback')
      ])
      
      if (!annRes.ok) throw new Error('Failed to fetch announcements')
      if (!coursesRes.ok) throw new Error('Failed to fetch courses')
      if (!feeRes.ok) throw new Error('Failed to fetch fee cards')
      if (!reqRes.ok) throw new Error('Failed to fetch profile requests')
      if (!feedbackRes.ok) throw new Error('Failed to fetch feedback reviews')
      
      const annData = await annRes.json()
      const coursesData = await coursesRes.json()
      const feeData = await feeRes.json()
      const reqData = await reqRes.json()
      const feedbackData = await feedbackRes.json()

      setProfileRequests(reqData.requests || [])
      setFeedbacks(feedbackData.feedbacks || [])
      
      // Map Announcements (using home page 2026-06-30 fallback, or fallback to current time)
      const referenceDate = new Date('2026-06-30T12:00:00')
      const mappedAnnouncements = annData.map((ann: any) => {
        const start = new Date(ann.start_date + 'T00:00:00')
        const end = new Date(ann.end_date + 'T23:59:59')
        const isActive = referenceDate >= start && referenceDate <= end
        
        let appliesTo: 'All' | '1:1 Only' | 'Group Only' = 'All'
        if (ann.applies_to === '1:1') appliesTo = '1:1 Only'
        if (ann.applies_to === 'group') appliesTo = 'Group Only'
        
        return {
          id: ann.id,
          title: ann.title,
          message: ann.content,
          appliesTo,
          startDate: ann.start_date,
          endDate: ann.end_date,
          isActive
        }
      })
      setAnnouncements(mappedAnnouncements)
      
      // Map Courses (filter active courses)
      const mappedCourses = coursesData
        .filter((c: any) => c.active !== false)
        .map((c: any) => ({
          id: c.id,
          name: c.title,
          description: c.description || '',
          price: `$${Number(c.base_fee)}`,
          category: c.program_type === 'group' ? 'Group' : '1:1',
          highlights: c.highlights || [],
          icon: c.icon || '📖'
        }))
      setCourses(mappedCourses)
      
      // Map Fee Cards
      const mappedFeeCards = feeData.map((fc: any) => ({
        id: fc.id,
        title: fc.title,
        title_original: fc.title_original,
        price: fc.price,
        base_fee: fc.base_fee,
        program_type: fc.program_type,
        duration: fc.duration || '30-minute focused session',
        features: fc.features || []
      }))
      setFeeCards(mappedFeeCards)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'An error occurred while loading content data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- Action Handlers: Announcements ---
  const openCreateAnnouncement = () => {
    setAnnTitle('')
    setAnnMessage('')
    setAnnAppliesTo('All')
    setAnnStartDate('')
    setAnnEndDate('')
    setActiveModal('create-announcement')
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let mappedAppliesTo = 'all'
      if (annAppliesTo === '1:1 Only') mappedAppliesTo = '1:1'
      if (annAppliesTo === 'Group Only') mappedAppliesTo = 'group'
      
      const res = await fetch('/api/content/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          content: annMessage,
          applies_to: mappedAppliesTo,
          start_date: annStartDate || '2026-06-22',
          end_date: annEndDate || '2026-07-22'
        })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to publish announcement')
      }
      
      setActiveModal(null)
      triggerToast(`Announcement "${annTitle}" published successfully! This will now appear as a popup on the public website landing page.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const openEditAnnouncement = (ann: Announcement) => {
    setSelectedAnnouncement(ann)
    setAnnTitle(ann.title)
    setAnnMessage(ann.message)
    setAnnAppliesTo(ann.appliesTo)
    setAnnStartDate(ann.startDate)
    setAnnEndDate(ann.endDate)
    setActiveModal('edit-announcement')
  }

  const handleEditAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAnnouncement) return
    try {
      let mappedAppliesTo = 'all'
      if (annAppliesTo === '1:1 Only') mappedAppliesTo = '1:1'
      if (annAppliesTo === 'Group Only') mappedAppliesTo = 'group'
      
      const res = await fetch('/api/content/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAnnouncement.id,
          title: annTitle,
          content: annMessage,
          applies_to: mappedAppliesTo,
          start_date: annStartDate,
          end_date: annEndDate
        })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update announcement')
      }
      
      setActiveModal(null)
      triggerToast(`Announcement "${annTitle}" updated successfully on the public dashboard overlay.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const toggleAnnouncementState = async (ann: Announcement) => {
    try {
      const res = await fetch('/api/content/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ann.id,
          action: ann.isActive ? 'deactivate' : 'activate'
        })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to toggle state')
      }
      
      triggerToast(`Announcement "${ann.title}" is now ${!ann.isActive ? 'Active' : 'Inactive'}.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  // --- Action Handlers: Courses ---
  const openCreateCourse = () => {
    setCourseName('')
    setCourseDescription('')
    setCoursePrice('$60')
    setCourseCategory('1:1')
    setCourseHighlights(['Qualified scholar instruction', 'Flexible schedule & progress tracking', '3-Day Free Trial included'])
    setNewHighlightText('')
    setCourseIcon('📖')
    setActiveModal('create-course')
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/content/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseName,
          description: courseDescription,
          base_fee: Number(coursePrice.replace('$', '')),
          program_type: courseCategory === 'Group' ? 'group' : '1:1',
          duration_months: 12,
          highlights: courseHighlights,
          icon: courseIcon
        })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create course')
      }
      
      setActiveModal(null)
      triggerToast(`Course "${courseName}" added successfully with ${courseHighlights.length} specialities.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const openEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setCourseName(course.name)
    setCourseDescription(course.description)
    setCoursePrice(course.price)
    setCourseCategory(course.category)
    setCourseHighlights(course.highlights || [])
    setNewHighlightText('')
    setCourseIcon(course.icon || '📖')
    setActiveModal('edit-course')
  }

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return
    try {
      const res = await fetch('/api/content/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCourse.id,
          title: courseName,
          description: courseDescription,
          base_fee: Number(coursePrice.replace('$', '')),
          program_type: courseCategory === 'Group' ? 'group' : '1:1',
          duration_months: 12,
          highlights: courseHighlights,
          icon: courseIcon
        })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update course')
      }
      
      setActiveModal(null)
      triggerToast(`Course details & specialities for "${courseName}" updated successfully.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleAddHighlight = () => {
    if (!newHighlightText.trim()) return
    setCourseHighlights([...courseHighlights, newHighlightText.trim()])
    setNewHighlightText('')
  }

  const handleRemoveHighlight = (index: number) => {
    setCourseHighlights(courseHighlights.filter((_, idx) => idx !== index))
  }

  const handleMoveHighlightUp = (index: number) => {
    if (index <= 0) return
    setCourseHighlights(prev => {
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[index - 1]
      updated[index - 1] = temp
      return updated
    })
  }

  const handleMoveHighlightDown = (index: number) => {
    if (index >= courseHighlights.length - 1) return
    setCourseHighlights(prev => {
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[index + 1]
      updated[index + 1] = temp
      return updated
    })
  }

  const handleDragStartHighlight = (e: React.DragEvent, index: number) => {
    setDraggedHighlightIdx(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropHighlight = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedHighlightIdx === null || draggedHighlightIdx === dropIndex) return
    setCourseHighlights(prev => {
      const updated = [...prev]
      const draggedItem = updated[draggedHighlightIdx]
      updated.splice(draggedHighlightIdx, 1)
      updated.splice(dropIndex, 0, draggedItem)
      return updated
    })
    setDraggedHighlightIdx(null)
  }

  const confirmRemoveCourse = (course: Course) => {
    setSelectedCourse(course)
    setActiveModal('confirm-remove-course')
  }

  const handleRemoveCourse = async () => {
    if (!selectedCourse) return
    try {
      const res = await fetch('/api/content/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCourse.id })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to delete course')
      }
      
      setActiveModal(null)
      triggerToast(`Course "${selectedCourse.name}" has been permanently removed from the public website directory.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  // --- Action Handlers: Fee Cards ---
  const openEditFeeCard = (card: FeeCard) => {
    setSelectedFeeCard(card)
    setFeeTitle(card.title_original || card.title || '')
    setFeePrice(card.price ? String(card.price).replace('$', '') : '')
    setFeeDuration(card.duration || '30-minute focused session')
    
    let cat: '3days' | '5days' | 'weekend' | 'group' = '3days'
    const titleLower = (card.title_original || card.title || '').toLowerCase()
    if (card.program_type === 'group') {
      cat = 'group'
    } else if (card.program_type === 'weekend' || titleLower.includes('weekend')) {
      cat = 'weekend'
    } else if (titleLower.includes('5 days') || titleLower.includes('intensive') || titleLower.includes('20 sessions')) {
      cat = '5days'
    }
    setFeeCategory(cat)
    setFeeFeatures([...card.features])
    setNewFeatureText('')
    setActiveModal('edit-feecard')
  }

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return
    setFeeFeatures([...feeFeatures, newFeatureText.trim()])
    setNewFeatureText('')
  }

  const handleRemoveFeature = (index: number) => {
    setFeeFeatures(feeFeatures.filter((_, idx) => idx !== index))
  }

  const handleMoveFeatureUp = (index: number) => {
    if (index <= 0) return
    setFeeFeatures(prev => {
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[index - 1]
      updated[index - 1] = temp
      return updated
    })
  }

  const handleMoveFeatureDown = (index: number) => {
    setFeeFeatures(prev => {
      if (index >= prev.length - 1) return prev
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[index + 1]
      updated[index + 1] = temp
      return updated
    })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedFeatureIdx(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedFeatureIdx === null || draggedFeatureIdx === targetIndex) return
    setFeeFeatures(prev => {
      const updated = [...prev]
      const [movedItem] = updated.splice(draggedFeatureIdx, 1)
      updated.splice(targetIndex, 0, movedItem)
      return updated
    })
    setDraggedFeatureIdx(null)
  }

  const handleSaveFeeCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFeeCard) return
    try {
      const res = await fetch('/api/content/fee-cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFeeCard.id,
          title: feeTitle,
          base_fee: Number(feePrice.replace('$', '')),
          duration: feeDuration,
          features: feeFeatures
        })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update fee card')
      }
      
      setActiveModal(null)
      triggerToast(`Changes saved successfully! The public Fee Page pricing for "${selectedFeeCard.title}" has been updated.`)
      await fetchData()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <BackToFounderBanner />
      <div className="flex-1 flex bg-[#FAFAF7] text-zinc-800 font-sans relative overflow-hidden select-none">
      
      {/* Soft background geometric pattern */}
      <GeometricPattern opacity={0.03} />

      {/* ========================================== */}
      {/* PERSISTENT LEFT SIDEBAR                    */}
      {/* ========================================== */}
      <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden z-20">
        
        <div className="flex border-b border-zinc-100 px-6 py-5 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className="text-sm font-bold font-serif text-zinc-900 leading-tight block">Virtual Zawiyah</span>
              <span className="block text-[9px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">CONTENT PORTAL</span>
            </div>
          </div>
          <NotificationBell align="left" />
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          
          {/* Announcements Tab link */}
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'announcements' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Megaphone className="h-4 w-4 shrink-0" />
              <span>Announcements</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
              activeTab === 'announcements' ? 'bg-[#FAFAF7]/20 text-white' : 'bg-zinc-100 text-zinc-600'
            }`}>
              {announcements.length}
            </span>
          </button>

          {/* Courses Tab link */}
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'courses' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>Courses Directory</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
              activeTab === 'courses' ? 'bg-[#FAFAF7]/20 text-white' : 'bg-zinc-100 text-zinc-600'
            }`}>
              {courses.length}
            </span>
          </button>

          {/* Fee Cards Tab link */}
          <button 
            onClick={() => setActiveTab('fee-cards')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'fee-cards' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Fee Cards Manager</span>
            </div>
          </button>

          {/* Profile Requests Tab link */}
          <button 
            onClick={() => setActiveTab('profile-requests')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'profile-requests' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="h-4 w-4 shrink-0" />
              <span>Profile Requests</span>
            </div>
            {profileRequests.length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                {profileRequests.length}
              </span>
            )}
          </button>

          {/* Feedback Reviews Tab link */}
          <button 
            onClick={() => setActiveTab('feedback-reviews')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'feedback-reviews' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>Feedback Reviews</span>
            </div>
            {feedbacks.filter(f => f.status === 'pending').length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                {feedbacks.filter(f => f.status === 'pending').length}
              </span>
            )}
          </button>

        </nav>

        {/* Sidebar Footer User Info */}
        <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 shrink-0 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm shrink-0 font-bold text-xs">
              MA
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-zinc-850 font-sans">Mariam Ahmed</p>
              <p className="truncate text-[10px] text-zinc-600 font-medium">Content Manager</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-[10px] font-bold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-[0.98] transition-all duration-150"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* ========================================== */}
      {/* PRIMARY WORKSPACE CONTENT                  */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Workspace Header */}
        <header className="h-16 shrink-0 bg-white border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-md font-serif font-bold text-zinc-900 capitalize">
              {activeTab === 'announcements' && 'Announcements Board'}
              {activeTab === 'courses' && 'Courses Catalog Directory'}
              {activeTab === 'fee-cards' && 'Fee Cards Configuration'}
              {activeTab === 'profile-requests' && 'Teacher Profile Requests'}
              {activeTab === 'feedback-reviews' && 'Website Feedback Moderation'}
            </h2>
            <span className="text-[10px] font-mono font-bold text-[#1B6B3A] border border-[#1B6B3A]/20 bg-[#1B6B3A]/5 px-2 py-0.5 rounded">
              Edit Mode
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-600 font-semibold font-mono">
              Server Status: <span className="text-emerald-700">Online & Live Sync</span>
            </span>
          </div>
        </header>

        {/* Main Scrolling Body */}
        <main className="flex-1 overflow-y-auto p-8 relative">

          {/* Toast Notification */}
          {successToast && (
            <div className="absolute top-4 left-8 right-8 z-30 bg-emerald-50 border border-emerald-200 text-emerald-850 px-4 py-3 rounded-2xl flex items-start gap-2.5 shadow-md animate-fade-in">
              <Check className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Success Confirmation</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium mt-0.5">{successToast}</p>
              </div>
              <button 
                onClick={() => setSuccessToast(null)} 
                className="ml-auto p-1 text-emerald-600 hover:text-emerald-950 rounded-lg hover:bg-emerald-100/50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Loading and Error States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[#1B6B3A]"></div>
              <p className="text-xs text-zinc-600 font-bold">Synchronizing with server database...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-850 p-4 rounded-2xl flex items-start gap-2.5 max-w-lg mb-6 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-950">Synchronization Error</p>
                <p className="text-[11px] leading-relaxed font-medium mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ========================================== */}
              {/* TAB 1: ANNOUNCEMENTS                       */}
          {/* ========================================== */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 max-w-5xl animate-fade-in">
              
              {/* Header Action Row */}
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                    Public Website Announcements
                  </h3>
                  <p className="text-[11px] text-zinc-700 mt-0.5">
                    Configure high-priority announcement banners that appear on the public website homepage overlay.
                  </p>
                </div>
                
                <button
                  onClick={openCreateAnnouncement}
                  className="py-2 px-3 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs transition-all active:scale-[0.98] flex items-center gap-2 shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Announcement</span>
                </button>
              </div>

              {/* Announcements List */}
              <div className="grid gap-4 md:grid-cols-2">
                {announcements.map(ann => (
                  <div 
                    key={ann.id} 
                    className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-zinc-950 leading-snug">{ann.title}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                          ann.isActive 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-150' 
                            : 'text-zinc-600 bg-zinc-100 border-zinc-200'
                        }`}>
                          {ann.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-zinc-700 leading-relaxed font-medium line-clamp-3">
                        {ann.message}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] font-medium">
                      <div className="space-y-0.5">
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Date Span</span>
                        <span className="text-zinc-700 font-mono font-bold flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-zinc-500" />
                          {ann.startDate} to {ann.endDate}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider">Target Scope</span>
                        <span className="text-zinc-800 font-bold">{ann.appliesTo}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-zinc-100/50">
                      <button
                        onClick={() => toggleAnnouncementState(ann)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[9px] uppercase tracking-wider font-bold transition-all ${
                          ann.isActive
                            ? 'border-zinc-200 text-zinc-650 hover:bg-zinc-50'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/50'
                        }`}
                      >
                        {ann.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => openEditAnnouncement(ann)}
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-750 hover:bg-zinc-50 hover:text-zinc-900 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: COURSES                             */}
          {/* ========================================== */}
          {activeTab === 'courses' && (
            <div className="space-y-8 max-w-5xl animate-fade-in">
              
              {/* Header Action Row */}
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                    Course Catalog Database
                  </h3>
                  <p className="text-[11px] text-zinc-700 mt-0.5">
                    Manage the directory of academic course offerings visible on the public website.
                  </p>
                </div>
                
                <button
                  onClick={openCreateCourse}
                  className="py-2 px-3 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs transition-all active:scale-[0.98] flex items-center gap-2 shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Course</span>
                </button>
              </div>

              {/* Two Group layout */}
              <div className="grid gap-8 lg:grid-cols-2">
                
                {/* 1:1 Courses Section */}
                <div className="space-y-4">
                  <div className="border-b border-zinc-200 pb-2 flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A] font-serif">
                      1:1 Private Courses
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {courses.filter(c => c.category === '1:1').length} Courses
                    </span>
                  </div>

                  <div className="space-y-3">
                    {courses.filter(c => c.category === '1:1').map(course => (
                      <div 
                        key={course.id} 
                        className="bg-white border border-zinc-200 rounded-2xl p-4 flex justify-between items-start gap-4 hover:border-zinc-300 transition-colors shadow-2xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <h5 className="text-xs font-bold text-zinc-950 truncate">{course.name}</h5>
                          <p className="text-[11px] text-zinc-750 font-medium leading-relaxed font-sans line-clamp-2">
                            {course.description}
                          </p>
                          <span className="inline-block text-[10px] text-[#1B6B3A] font-bold bg-[#1B6B3A]/5 px-2 py-0.5 rounded mt-2">
                            {course.price} / Month
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => openEditCourse(course)}
                            className="p-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl transition-colors active:scale-95"
                            title="Edit Course"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => confirmRemoveCourse(course)}
                            className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors active:scale-95"
                            title="Remove Course"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group Courses Section */}
                <div className="space-y-4">
                  <div className="border-b border-zinc-200 pb-2 flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 font-serif">
                      Group Study Classes
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {courses.filter(c => c.category === 'Group').length} Courses
                    </span>
                  </div>

                  <div className="space-y-3">
                    {courses.filter(c => c.category === 'Group').map(course => (
                      <div 
                        key={course.id} 
                        className="bg-white border border-zinc-200 rounded-2xl p-4 flex justify-between items-start gap-4 hover:border-zinc-300 transition-colors shadow-2xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <h5 className="text-xs font-bold text-zinc-950 truncate">{course.name}</h5>
                          <p className="text-[11px] text-zinc-750 font-medium leading-relaxed font-sans line-clamp-2">
                            {course.description}
                          </p>
                          <span className="inline-block text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded mt-2">
                            {course.price} / Month
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => openEditCourse(course)}
                            className="p-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl transition-colors active:scale-95"
                            title="Edit Course"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => confirmRemoveCourse(course)}
                            className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors active:scale-95"
                            title="Remove Course"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: FEE CARDS                           */}
          {/* ========================================== */}
          {activeTab === 'fee-cards' && (
            <div className="space-y-6 max-w-5xl animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                    Public Landing Page Fee Cards
                  </h3>
                  <p className="text-[11px] text-zinc-700 mt-0.5">
                    Directly customize the pricing tables, add new fee cards, or remove cards from the public pricing sheets.
                  </p>
                </div>
                
                <button
                  onClick={openCreateFeeCard}
                  className="py-2.5 px-4 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add New Fee Card</span>
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
                {feeCards.map(card => (
                  <div 
                    key={card.id} 
                    className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all relative overflow-hidden"
                  >
                    {/* Sage green header line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1B6B3A]" />

                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-950 font-serif">{card.title}</h4>
                          <span className="block text-[10px] text-zinc-500 mt-0.5">Subscription Plan Structure</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditFeeCard(card)}
                            className="py-1.5 px-3 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-[10px] font-bold text-zinc-700 flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs"
                            title="Configure Features & Price"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteFeeCard(card.id)}
                            className="p-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                            title="Delete Fee Card"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="py-4 border-y border-zinc-100 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-zinc-950 font-serif">{card.price}</span>
                        <span className="text-[11px] text-zinc-700 font-semibold uppercase">/ Month</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-600 mb-2">Included Features:</p>
                        <ul className="space-y-2.5">
                          {card.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-800 font-medium">
                              <Check className="h-4 w-4 text-[#1B6B3A] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: PROFILE REQUESTS                    */}
          {/* ========================================== */}
          {activeTab === 'profile-requests' && (
            <div className="space-y-6 max-w-5xl animate-fade-in">
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Teacher Profile Change Requests
                </h3>
                <p className="text-[11px] text-zinc-700 mt-0.5">
                  Review and resolve pending updates submitted by teachers for the public faculty directory.
                </p>
              </div>

              {profileRequests.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-2xl shadow-xs">
                  <span className="block text-4xl mb-4">🎉</span>
                  <h4 className="text-sm font-bold text-zinc-850">All caught up!</h4>
                  <p className="text-xs text-zinc-550 mt-1">There are no pending profile change requests for review.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {profileRequests.map(req => (
                    <div 
                      key={req.id} 
                      className="bg-white border border-zinc-250 rounded-3xl p-6 shadow-sm space-y-4 hover:border-zinc-355 transition-all"
                    >
                      {/* Request Header */}
                      <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
                        <div className="flex items-center gap-3">
                          {req.new_avatar_url ? (
                            <img 
                              src={req.new_avatar_url} 
                              alt="Avatar Requested" 
                              className="w-10 h-10 rounded-full object-cover border border-zinc-200 shadow-xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-[#1B6B3A]/20 flex items-center justify-center font-bold text-sm text-[#1B6B3A]">
                              {req.profiles?.full_name ? req.profiles.full_name.split(' ').map((p: any) => p[0]).join('').substring(0, 2).toUpperCase() : 'T'}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-zinc-950">{req.profiles?.full_name || 'Unknown Teacher'}</h4>
                            <span className="block text-[9px] text-zinc-500 font-mono">Submitted on {new Date(req.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveProfileRequest(req.id, 'reject')}
                            className="py-1.5 px-3 border border-rose-250 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg transition-all active:scale-95"
                          >
                            Reject Edits
                          </button>
                          <button
                            onClick={() => handleResolveProfileRequest(req.id, 'approve')}
                            className="py-1.5 px-3 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 shadow-2xs"
                          >
                            Approve & Update
                          </button>
                        </div>
                      </div>

                      {/* Request Comparison Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Live Profile */}
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                          <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400">Current Live Profile</span>
                          
                          <div>
                            <span className="font-bold text-zinc-650 block text-[10px]">Photo</span>
                            {req.profiles?.avatar_url ? (
                              <p className="text-[10px] text-zinc-505 truncate select-all">{req.profiles.avatar_url}</p>
                            ) : (
                              <p className="text-[10px] text-zinc-400 italic">No image URL configured</p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-zinc-200/60">
                            <span className="font-bold text-zinc-650 block text-[10px]">Qualifications</span>
                            <p className="text-zinc-600 italic leading-relaxed text-[11px] mt-0.5">{req.profiles?.education || 'Empty'}</p>
                          </div>

                          <div className="pt-2 border-t border-zinc-200/60">
                            <span className="font-bold text-zinc-650 block text-[10px]">Biography</span>
                            <p className="text-zinc-600 italic leading-relaxed text-[11px] mt-0.5">{req.profiles?.experience || 'Empty'}</p>
                          </div>
                        </div>

                        {/* Proposed Edits */}
                        <div className="bg-emerald-50/20 border border-emerald-200/30 rounded-2xl p-4 space-y-3">
                          <span className="block text-[8px] font-bold uppercase tracking-wider text-[#1B6B3A]">Proposed Edits</span>
                          
                          <div>
                            <span className="font-bold text-zinc-700 block text-[10px]">Photo</span>
                            {req.new_avatar_url ? (
                              <p className="text-[10px] text-zinc-800 font-semibold truncate select-all">{req.new_avatar_url}</p>
                            ) : (
                              <p className="text-[10px] text-zinc-400 italic">No change requested</p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-emerald-100">
                            <span className="font-bold text-zinc-700 block text-[10px]">Qualifications</span>
                            <p className="text-zinc-855 font-bold leading-relaxed text-[11px] mt-0.5">{req.new_education || 'Empty'}</p>
                          </div>

                          <div className="pt-2 border-t border-emerald-100">
                            <span className="font-bold text-zinc-700 block text-[10px]">Biography</span>
                            <p className="text-zinc-855 font-bold leading-relaxed text-[11px] mt-0.5">{req.new_experience || 'Empty'}</p>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 5: FEEDBACK REVIEWS                    */}
          {/* ========================================== */}
          {activeTab === 'feedback-reviews' && (
            <div className="space-y-6 max-w-5xl animate-fade-in">
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Website Feedback Moderation
                </h3>
                <p className="text-[11px] text-zinc-700 mt-0.5">
                  Moderate student, parent, and guardian feedback submissions for the public landing page testimonials.
                </p>
              </div>

              {feedbacks.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-2xl shadow-xs">
                  <span className="block text-4xl mb-4">💬</span>
                  <h4 className="text-sm font-bold text-zinc-850">No feedback submitted yet</h4>
                  <p className="text-xs text-zinc-550 mt-1">Submitted feedback messages will appear here for review.</p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {feedbacks.map(fb => (
                    <div 
                      key={fb.id} 
                      className={`bg-white border rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-sm transition-all duration-200 ${
                        fb.status === 'approved' ? 'border-emerald-200/60 bg-emerald-50/5' :
                        fb.status === 'rejected' ? 'border-rose-200/40 opacity-75' : 'border-zinc-250'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-950">{fb.author_name}</h4>
                            <span className="inline-block text-[9px] uppercase tracking-wider font-bold bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded mt-1">
                              {fb.author_role}
                            </span>
                          </div>
                          
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            fb.status === 'approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-150' :
                            fb.status === 'rejected' ? 'text-rose-700 bg-rose-50 border-rose-150' :
                            'text-amber-700 bg-amber-50 border-amber-150'
                          }`}>
                            {fb.status}
                          </span>
                        </div>

                        {/* Stars display */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < fb.rating ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-250 fill-transparent'
                              }`} 
                            />
                          ))}
                        </div>

                        <p className="text-xs text-zinc-700 leading-relaxed font-medium italic">
                          &quot;{fb.content}&quot;
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-500">
                        <span>Submitted {new Date(fb.created_at).toLocaleDateString()}</span>
                        
                        {fb.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResolveFeedback(fb.id, 'reject')}
                              className="py-1 px-2.5 border border-rose-250 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-all active:scale-95 text-[9px]"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleResolveFeedback(fb.id, 'approve')}
                              className="py-1 px-2.5 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-lg transition-all active:scale-95 shadow-2xs text-[9px]"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
            </>
          )}

        </main>
      </div>

      {/* ========================================== */}
      {/* MODALS COMPONENT CONTAINER                 */}
      {/* ========================================== */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h4 className="text-sm font-bold text-zinc-950 font-serif uppercase tracking-wider flex items-center gap-2">
                {activeModal === 'create-announcement' && 'Create New Announcement'}
                {activeModal === 'edit-announcement' && 'Edit Announcement Details'}
                {activeModal === 'create-course' && 'Add New Course Catalog'}
                {activeModal === 'edit-course' && 'Edit Course Details'}
                {activeModal === 'edit-feecard' && `Configure ${selectedFeeCard?.title} Card`}
                {activeModal === 'confirm-remove-course' && 'Confirm Course Deletion'}
              </h4>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* --- Case 1: Create/Edit Announcement Form --- */}
            {(activeModal === 'create-announcement' || activeModal === 'edit-announcement') && (
              <form onSubmit={activeModal === 'create-announcement' ? handleCreateAnnouncement : handleEditAnnouncement} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Announcement Title</label>
                  <input 
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Eid-ul-Adha Holidays"
                    className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-medium bg-zinc-50 focus:bg-white"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Notification Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    placeholder="Enter the full announcement text that will be displayed in the landing page popup banner..."
                    className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-medium bg-zinc-50 focus:bg-white"
                  />
                </div>

                {/* Grid inputs */}
                <div className="grid gap-4 grid-cols-2">
                  
                  {/* Applies To */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Applies To Scope</label>
                    <select
                      value={annAppliesTo}
                      onChange={(e) => setAnnAppliesTo(e.target.value as 'All' | '1:1 Only' | 'Group Only')}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-medium bg-zinc-50 focus:bg-white"
                    >
                      <option value="All">All</option>
                      <option value="1:1 Only">1:1 Students Only</option>
                      <option value="Group Only">Group Students Only</option>
                    </select>
                  </div>

                  {/* Empty cell for grid layout spacing */}
                  <div />

                  {/* Start Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input 
                      type="date"
                      required
                      value={annStartDate}
                      onChange={(e) => setAnnStartDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-mono font-medium bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">End Date</label>
                    <input 
                      type="date"
                      required
                      value={annEndDate}
                      onChange={(e) => setAnnEndDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-mono font-medium bg-zinc-50 focus:bg-white"
                    />
                  </div>

                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-xs active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs"
                  >
                    Publish
                  </button>
                </div>
              </form>
            )}

            {/* --- Case 2: Create/Edit Course Form --- */}
            {(activeModal === 'create-course' || activeModal === 'edit-course') && (
              <form onSubmit={activeModal === 'create-course' ? handleCreateCourse : handleEditCourse} className="space-y-4">
                
                {/* Course Name */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Course Title</label>
                  <input 
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Applied Tajweed Rules"
                    className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-medium bg-zinc-50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Catalog Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Provide a short description of the syllabus and class format..."
                    className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-medium bg-zinc-50"
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  
                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Class Format Category</label>
                    <select
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value as '1:1' | 'Group')}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-medium bg-zinc-50"
                    >
                      <option value="1:1">1:1 Private Course</option>
                      <option value="Group">Group Study Course</option>
                    </select>
                  </div>

                  {/* Icon Selection */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Course Icon Emoji</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text"
                        required
                        maxLength={4}
                        value={courseIcon}
                        onChange={(e) => setCourseIcon(e.target.value)}
                        placeholder="e.g. 📖"
                        className="w-16 text-center text-lg p-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 bg-zinc-50 font-sans"
                      />
                      <div className="flex-1 flex flex-wrap gap-1.5 p-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
                        {['📖', '🎯', '🌙', '📜', '🌐', '✍️', '🕌', '✨', '📚', '🎓', '⭐', '✏️', '🔑'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setCourseIcon(emoji)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm active:scale-90 transition-all ${
                              courseIcon === emoji 
                                ? 'bg-[#1B6B3A] text-white border-[#1B6B3A]' 
                                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-500 mt-1 block">Type or paste any custom emoji in the box, or click one of the quick presets.</span>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Pricing Tag</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-3 h-3.5 w-3.5 text-zinc-600" />
                      <input 
                        type="text"
                        required
                        value={coursePrice.replace('$', '')}
                        onChange={(e) => setCoursePrice(`$${e.target.value}`)}
                        placeholder="60"
                        className="w-full text-xs p-2.5 pl-7 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-mono font-medium bg-zinc-50"
                      />
                    </div>
                  </div>

                </div>

                {/* Course Specialities / Highlights List with Reordering */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">
                      Course Specialities / Key Highlights ({courseHighlights.length})
                    </label>
                    <span className="text-[10px] text-zinc-650 font-medium">Use ▲/▼ or drag handle to reorder</span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1 border border-zinc-200 rounded-xl p-2 bg-zinc-50/50">
                    {courseHighlights.map((high, idx) => (
                      <div 
                        key={idx} 
                        draggable
                        onDragStart={(e) => handleDragStartHighlight(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropHighlight(e, idx)}
                        className={`flex items-center gap-1.5 bg-white border border-zinc-200 p-2 rounded-xl text-xs transition-all ${draggedHighlightIdx === idx ? 'opacity-40 bg-zinc-100 border-dashed border-zinc-400' : 'hover:border-zinc-300 shadow-2xs'}`}
                      >
                        {/* Drag handle */}
                        <div className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-0.5 shrink-0" title="Drag to reorder">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Speciality Text */}
                        <span className="flex-1 text-zinc-850 font-medium font-sans leading-tight select-none">{high}</span>

                        {/* Up Button */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveHighlightUp(idx)}
                          className="p-1 hover:bg-zinc-100 text-zinc-600 disabled:opacity-20 disabled:hover:bg-transparent rounded-md transition-colors shrink-0"
                          title="Move Up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>

                        {/* Down Button */}
                        <button
                          type="button"
                          disabled={idx === courseHighlights.length - 1}
                          onClick={() => handleMoveHighlightDown(idx)}
                          className="p-1 hover:bg-zinc-100 text-zinc-600 disabled:opacity-20 disabled:hover:bg-transparent rounded-md transition-colors shrink-0"
                          title="Move Down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded-md transition-colors shrink-0 ml-0.5"
                          title="Remove line"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {courseHighlights.length === 0 && (
                      <p className="text-[10px] text-zinc-500 italic text-center py-4">No specialities added yet. Add a key course highlight below.</p>
                    )}
                  </div>

                  {/* Add Speciality Line Input */}
                  <div className="flex gap-2 pt-1.5">
                    <input 
                      type="text"
                      value={newHighlightText}
                      onChange={(e) => setNewHighlightText(e.target.value)}
                      placeholder="e.g. Makhaarij (articulation points)"
                      className="flex-1 text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-medium bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddHighlight()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="py-2 px-3 border border-zinc-300 bg-white hover:bg-zinc-50 text-[10px] font-bold text-zinc-850 rounded-lg active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Speciality</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-xs active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs"
                  >
                    Save Course
                  </button>
                </div>
              </form>
            )}

            {/* --- Case 3: Edit Fee Card Config --- */}
            {activeModal === 'edit-feecard' && (
              <form onSubmit={handleSaveFeeCard} className="space-y-4">
                
                {/* 1. Card Title */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">1. Card Title</label>
                  <input 
                    type="text"
                    required
                    value={feeTitle}
                    onChange={(e) => setFeeTitle(e.target.value)}
                    placeholder="e.g. Applied Tajweed (Advanced)"
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-bold bg-white"
                  />
                </div>

                {/* 2. Class Duration & 3. Monthly Fee */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Package Schedule Track</label>
                    <select
                      value={feeCategory}
                      onChange={(e) => {
                        const val = e.target.value as '3days' | '5days' | 'weekend' | 'group'
                        setFeeCategory(val)
                        if (val === '3days') setFeeDuration('30-minute focused session (3 days/week)')
                        else if (val === '5days') setFeeDuration('30-minute focused session (5 days/week)')
                        else if (val === 'weekend') setFeeDuration('30-minute focused session (Sat & Sun)')
                        else if (val === 'group') setFeeDuration('120-minute session (5 days/week)')
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-semibold bg-white"
                    >
                      <option value="3days">3 Days / Week (1:1)</option>
                      <option value="5days">5 Days / Week (1:1 Intensive)</option>
                      <option value="weekend">Weekend (Sat & Sun)</option>
                      <option value="group">Group Program (5 Days / Week)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">2. Class Duration</label>
                    <input 
                      type="text"
                      required
                      value={feeDuration}
                      onChange={(e) => setFeeDuration(e.target.value)}
                      placeholder="e.g. 30-minute focused session"
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-semibold bg-white"
                    />
                  </div>
                </div>

                {/* 3. Monthly Fee Rate */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">3. Monthly Fee Rate (USD)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-3 text-xs text-zinc-800 font-bold font-mono">$</span>
                    <input 
                      type="text"
                      required
                      value={feePrice.replace('$', '')}
                      onChange={(e) => setFeePrice(`$${e.target.value}`)}
                      placeholder="60"
                      className="w-full text-xs p-2.5 pl-7 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-mono font-bold bg-zinc-50"
                    />
                  </div>
                </div>

                {/* 4. Package Features List with Reordering */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">
                      4. Package Features ({feeFeatures.length})
                    </label>
                    <span className="text-[10px] text-zinc-650 font-medium">Use ▲/▼ or drag handle to reorder</span>
                  </div>

                  {/* Feature Rows */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border border-zinc-200 rounded-xl p-2 bg-zinc-50/50">
                    {feeFeatures.map((feat, idx) => (
                      <div 
                        key={idx} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`flex items-center gap-1.5 bg-white border border-zinc-200 p-2 rounded-xl text-xs transition-all ${draggedFeatureIdx === idx ? 'opacity-40 bg-zinc-100 border-dashed border-zinc-400' : 'hover:border-zinc-300 shadow-2xs'}`}
                      >
                        {/* Drag handle */}
                        <div className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-0.5 shrink-0" title="Drag to reorder">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Feature Text */}
                        <span className="flex-1 text-zinc-850 font-medium font-sans leading-tight select-none">{feat}</span>

                        {/* Up Button */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveFeatureUp(idx)}
                          className="p-1 hover:bg-zinc-100 text-zinc-600 disabled:opacity-20 disabled:hover:bg-transparent rounded-md transition-colors shrink-0"
                          title="Move Up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>

                        {/* Down Button */}
                        <button
                          type="button"
                          disabled={idx === feeFeatures.length - 1}
                          onClick={() => handleMoveFeatureDown(idx)}
                          className="p-1 hover:bg-zinc-100 text-zinc-600 disabled:opacity-20 disabled:hover:bg-transparent rounded-md transition-colors shrink-0"
                          title="Move Down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded-md transition-colors shrink-0 ml-0.5"
                          title="Remove line"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {feeFeatures.length === 0 && (
                      <p className="text-[10px] text-zinc-500 italic text-center py-4">No features configured. Add a feature line below.</p>
                    )}
                  </div>

                  {/* Add Feature Line Input */}
                  <div className="flex gap-2 pt-1.5">
                    <input 
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      placeholder="e.g. Free registration guides"
                      className="flex-1 text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-medium bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddFeature()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="py-2 px-3 border border-zinc-300 bg-white hover:bg-zinc-50 text-[10px] font-bold text-zinc-850 rounded-lg active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-xs active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* --- Case 3.5: Create New Fee Card --- */}
            {activeModal === 'create-feecard' && (
              <form onSubmit={handleCreateFeeCard} className="space-y-4">
                
                {/* 1. Card Title */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">1. Card Title</label>
                  <input 
                    type="text"
                    required
                    value={feeTitle}
                    onChange={(e) => setFeeTitle(e.target.value)}
                    placeholder="e.g. Applied Tajweed (Advanced)"
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-bold bg-white"
                  />
                </div>

                {/* Program Schedule Track & 2. Class Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Package Schedule Track</label>
                    <select
                      value={feeCategory}
                      onChange={(e) => {
                        const val = e.target.value as '3days' | '5days' | 'weekend' | 'group'
                        setFeeCategory(val)
                        if (val === '3days') setFeeDuration('30-minute focused session (3 days/week)')
                        else if (val === '5days') setFeeDuration('30-minute focused session (5 days/week)')
                        else if (val === 'weekend') setFeeDuration('30-minute focused session (Sat & Sun)')
                        else if (val === 'group') setFeeDuration('120-minute session (5 days/week)')
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-semibold bg-white"
                    >
                      <option value="3days">3 Days / Week (1:1)</option>
                      <option value="5days">5 Days / Week (1:1 Intensive)</option>
                      <option value="weekend">Weekend (Sat & Sun)</option>
                      <option value="group">Group Program (5 Days / Week)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">2. Class Duration</label>
                    <input 
                      type="text"
                      required
                      value={feeDuration}
                      onChange={(e) => setFeeDuration(e.target.value)}
                      placeholder="e.g. 30-minute focused session"
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-semibold bg-white"
                    />
                  </div>
                </div>

                {/* 3. Monthly Fee Rate */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">3. Monthly Fee Rate (USD)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-3 text-xs text-zinc-800 font-bold font-mono">$</span>
                    <input 
                      type="text"
                      required
                      value={feePrice}
                      onChange={(e) => setFeePrice(e.target.value)}
                      placeholder="60"
                      className="w-full text-xs p-2.5 pl-7 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-mono font-bold bg-zinc-50"
                    />
                  </div>
                </div>

                {/* 4. Package Features List with Reordering */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">
                      4. Package Features ({feeFeatures.length})
                    </label>
                    <span className="text-[10px] text-zinc-650 font-medium">Use ▲/▼ or drag handle to reorder</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 border border-zinc-200 rounded-xl p-2 bg-zinc-50/50">
                    {feeFeatures.map((feat, idx) => (
                      <div 
                        key={idx} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`flex items-center gap-1.5 bg-white border border-zinc-200 p-2 rounded-xl text-xs transition-all ${draggedFeatureIdx === idx ? 'opacity-40 bg-zinc-100 border-dashed border-zinc-400' : 'hover:border-zinc-300 shadow-2xs'}`}
                      >
                        {/* Drag handle */}
                        <div className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-0.5 shrink-0" title="Drag to reorder">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Feature Text */}
                        <span className="flex-1 text-zinc-850 font-medium font-sans leading-tight select-none">{feat}</span>

                        {/* Up Button */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveFeatureUp(idx)}
                          className="p-1 hover:bg-zinc-100 text-zinc-600 disabled:opacity-20 disabled:hover:bg-transparent rounded-md transition-colors shrink-0"
                          title="Move Up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>

                        {/* Down Button */}
                        <button
                          type="button"
                          disabled={idx === feeFeatures.length - 1}
                          onClick={() => handleMoveFeatureDown(idx)}
                          className="p-1 hover:bg-zinc-100 text-zinc-600 disabled:opacity-20 disabled:hover:bg-transparent rounded-md transition-colors shrink-0"
                          title="Move Down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded-md transition-colors shrink-0 ml-0.5"
                          title="Remove line"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {feeFeatures.length === 0 && (
                      <p className="text-[10px] text-zinc-500 italic text-center py-4">No features configured. Add a feature line below.</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input 
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      placeholder="e.g. Flexible scheduling"
                      className="flex-1 text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-medium bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddFeature()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="py-2 px-3 border border-zinc-300 bg-white hover:bg-zinc-50 text-[10px] font-bold text-zinc-850 rounded-lg active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-xs active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs"
                  >
                    Create Fee Card
                  </button>
                </div>
              </form>
            )}

            {/* --- Case 4: Delete Course Confirmation --- */}
            {activeModal === 'confirm-remove-course' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-950 uppercase tracking-wider font-serif">Remove Course Registration</h5>
                    <p className="text-[11px] text-zinc-800 font-medium leading-relaxed mt-1">
                      Are you sure you want to remove <strong className="font-semibold text-zinc-900">{selectedCourse?.name}</strong> from the catalog directory? This change will reflect on the public listing sheets immediately.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-xs active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCourse}
                    className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-sm"
                  >
                    Confirm Deletion
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      </div>
    </div>
  )
}
