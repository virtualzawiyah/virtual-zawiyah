'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  UserPlus,
  Clock,
  Inbox,
  LogOut,
  Sliders,
  Award
} from 'lucide-react'
import BackToFounderBanner from '@/components/BackToFounderBanner'
import NotificationBell from '@/components/NotificationBell'
// --- Types & Interfaces ---

interface AdmissionMock {
  id: string
  studentName: string
  courseName: string
  type: '1:1' | 'Group'
  submissionDate: string
  genderPreference?: string
  timezone?: string
  preferredTimeSlot?: string
  availableDays?: string[]
  yearLevel?: string
  status?: string
  assignedTeacher?: string
}

interface MatchingTeacherMock {
  id: string
  name: string
  gender: string
  matchScore: number
  slotUtilization: string
  availableTimes: string
}

interface GroupClassMock {
  id: string
  className: string
  courseName: string
  yearLevel: string
  teacherName: string
  studentCount: number
  maxStudents: number
  timeSlot: string
}

interface TrialHistoryItem {
  teacherName: string
  feedback: string
}

interface TrialStudentMock {
  id: string
  studentName: string
  courseName: string
  trialsCount: number
  maxTrials: number
  history: TrialHistoryItem[]
  status?: string
}

interface OnboardedTeacherMock {
  id: string
  fullName: string
  gender: 'Male' | 'Female'
  type: '1:1' | 'Dars-e-Nizami' | 'Tajweed 2-Year'
  languages: string[]
  qualifications: string
  assignedClasses?: string[]
  status?: string
  createdDate?: string
}

interface MakeupRequestMock {
  id: string
  studentName: string
  courseName: string
  missedDate: string
  originalTeacher: string
}

// --- Static Mock Data ---

const INITIAL_ADMISSIONS: AdmissionMock[] = [
  {
    id: 'adm-101',
    studentName: 'Zayd Mansoor',
    courseName: 'Quran Reading (Nazra)',
    type: '1:1',
    submissionDate: '2026-06-20',
    genderPreference: 'Male Teacher preferred',
    timezone: 'PKT (UTC+5)',
    preferredTimeSlot: '5:00 PM - 7:00 PM',
    availableDays: ['Monday', 'Wednesday']
  },
  {
    id: 'adm-102',
    studentName: 'Fatima Zahra',
    courseName: 'Dars-e-Nizami',
    type: 'Group',
    submissionDate: '2026-06-19',
    yearLevel: 'Year 2'
  },
  {
    id: 'adm-103',
    studentName: 'Yahya Bilal',
    courseName: 'Quran Memorization (Hifz)',
    type: '1:1',
    submissionDate: '2026-06-18',
    genderPreference: 'Male Teacher preferred',
    timezone: 'PKT (UTC+5)',
    preferredTimeSlot: '4:00 PM - 6:00 PM',
    availableDays: ['Tuesday', 'Thursday']
  },
  {
    id: 'adm-104',
    studentName: 'Humaira Khan',
    courseName: 'Tajweed 2-Year',
    type: 'Group',
    submissionDate: '2026-06-18',
    yearLevel: 'Year 1'
  }
]

const MOCK_MATCHING_TEACHERS: MatchingTeacherMock[] = [
  {
    id: 'tch-match-1',
    name: 'Ustadh Hammad Ali',
    gender: 'Male',
    matchScore: 98,
    slotUtilization: '12 / 20 slots filled',
    availableTimes: 'Mon & Wed 5:00 PM - 6:00 PM'
  },
  {
    id: 'tch-match-2',
    name: 'Ustadh Khalid Rahman',
    gender: 'Male',
    matchScore: 92,
    slotUtilization: '18 / 20 slots filled',
    availableTimes: 'Mon & Wed 5:30 PM - 6:30 PM'
  },
  {
    id: 'tch-match-3',
    name: 'Ustadh Tariq Mahmood',
    gender: 'Male',
    matchScore: 85,
    slotUtilization: '8 / 20 slots filled',
    availableTimes: 'Mon & Wed 6:00 PM - 7:00 PM'
  }
]

const INITIAL_GROUP_CLASSES: GroupClassMock[] = [
  {
    id: 'class-dn2-a',
    className: 'Class A (Year 2)',
    courseName: 'Dars-e-Nizami',
    yearLevel: 'Year 2',
    teacherName: 'Ustadha Maryam',
    studentCount: 18,
    maxStudents: 25,
    timeSlot: 'Tue & Thu 6:00 PM'
  },
  {
    id: 'class-dn2-b',
    className: 'Class B (Year 2)',
    courseName: 'Dars-e-Nizami',
    yearLevel: 'Year 2',
    teacherName: 'Ustadh Rashid',
    studentCount: 24,
    maxStudents: 25,
    timeSlot: 'Tue & Thu 7:00 PM'
  },
  {
    id: 'class-tj1-a',
    className: 'Class A (Year 1)',
    courseName: 'Tajweed 2-Year',
    yearLevel: 'Year 1',
    teacherName: 'Ustadha Zainab',
    studentCount: 12,
    maxStudents: 25,
    timeSlot: 'Mon & Wed 4:00 PM'
  },
  {
    id: 'class-tj1-b',
    className: 'Class B (Year 1)',
    courseName: 'Tajweed 2-Year',
    yearLevel: 'Year 1',
    teacherName: 'Ustadha Fatima',
    studentCount: 20,
    maxStudents: 25,
    timeSlot: 'Mon & Wed 5:00 PM'
  }
]

const INITIAL_TRIAL_STUDENTS: TrialStudentMock[] = [
  {
    id: 'trial-stu-1',
    studentName: 'Ali Raza',
    courseName: 'Quran Memorization (Hifz)',
    trialsCount: 2,
    maxTrials: 3,
    history: [
      { teacherName: 'Ustadh Khalid', feedback: 'Recitation good but student timezone conflicted.' },
      { teacherName: 'Ustadh Tariq', feedback: 'Student missed first class due to technical issues.' }
    ]
  },
  {
    id: 'trial-stu-2',
    studentName: 'Aamina Yousuf',
    courseName: 'Quran Reading (Nazra)',
    trialsCount: 1,
    maxTrials: 3,
    history: [
      { teacherName: 'Ustadha Zainab', feedback: 'Excellent connection, student was very engaged.' }
    ]
  },
  {
    id: 'trial-stu-3',
    studentName: 'Sulayman Ahmed',
    courseName: 'Islamic Studies',
    trialsCount: 0,
    maxTrials: 3,
    history: []
  }
]

const INITIAL_ONBOARDED_TEACHERS: OnboardedTeacherMock[] = [
  {
    id: 'TCH-0201',
    fullName: 'Ustadh Hammad Ali',
    gender: 'Male',
    type: '1:1',
    languages: ['Urdu', 'Arabic'],
    qualifications: 'Shahadah al-Alimiyyah, 5 years teaching Quran and Arabic'
  },
  {
    id: 'TCH-0202',
    fullName: 'Ustadha Fatima Siddiqui',
    gender: 'Female',
    type: 'Dars-e-Nizami',
    languages: ['Urdu', 'English'],
    qualifications: 'Graduated from Wifaqul Madaris, Tajweed expert.',
    assignedClasses: ['Year 1', 'Year 2']
  },
  {
    id: 'TCH-0203',
    fullName: 'Ustadh Tariq Mahmood',
    gender: 'Male',
    type: '1:1',
    languages: ['Urdu', 'Arabic'],
    qualifications: 'Hafiz-e-Quran, 10 years experience.'
  }
]

const INITIAL_MAKEUP_REQUESTS: MakeupRequestMock[] = [
  {
    id: 'makeup-101',
    studentName: 'Bilal Khan',
    courseName: 'Quran Memorization (Hifz)',
    missedDate: '2026-06-18',
    originalTeacher: 'Ustadh Tariq'
  },
  {
    id: 'makeup-102',
    studentName: 'Mariam Ali',
    courseName: 'Dars-e-Nizami',
    missedDate: '2026-06-19',
    originalTeacher: 'Ustadha Maryam'
  }
]

export default function RegistrarDashboard() {
  const [activeTab, setActiveTab] = useState<'admissions' | 'trials' | 'onboarding' | 'makeups'>('admissions')
  
  // Lists States
  const [admissions, setAdmissions] = useState<AdmissionMock[]>([])
  const [trialStudents, setTrialStudents] = useState<TrialStudentMock[]>([])
  const [onboardedTeachers, setOnboardedTeachers] = useState<OnboardedTeacherMock[]>([])
  const [makeupRequests, setMakeupRequests] = useState<MakeupRequestMock[]>([])
  const [groupClasses, setGroupClasses] = useState<GroupClassMock[]>(INITIAL_GROUP_CLASSES)

  // Live query & loading states for Section 4
  const [isLoadingMakeups, setIsLoadingMakeups] = useState(false)
  const [makeupsFetchError, setMakeupsFetchError] = useState<string | null>(null)

  // Live query & loading states for Section 1
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false)
  const [admissionsFetchError, setAdmissionsFetchError] = useState<string | null>(null)

  // Live query & loading states for Section 2
  const [isLoadingTrials, setIsLoadingTrials] = useState(false)
  const [trialsFetchError, setTrialsFetchError] = useState<string | null>(null)
  
  const [matchingTeachers, setMatchingTeachers] = useState<MatchingTeacherMock[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [teacherFetchError, setTeacherFetchError] = useState<string | null>(null)

  const [matchingGroupClasses, setMatchingGroupClasses] = useState<any[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)
  const [classesFetchError, setClassesFetchError] = useState<string | null>(null)

  // Live query & loading states for Section 3
  const [isLoadingTeachersList, setIsLoadingTeachersList] = useState(false)
  const [teachersListFetchError, setTeachersListFetchError] = useState<string | null>(null)

  // --- Admission Tab States ---
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null)
  const [admissionSuccessMsg, setAdmissionSuccessMsg] = useState<{
    studentName: string
    portalId: string
    teacherName: string
    type: 'TRIAL' | 'REGULAR'
    className?: string
    pendingSupervisor?: boolean
  } | null>(null)

  // --- Trial Tab States ---
  const [activeTrialSelection, setActiveTrialSelection] = useState<string | null>(null)
  const [selectedTeacherForConvert, setSelectedTeacherForConvert] = useState<string>('')
  const [trialSuccessMsg, setTrialSuccessMsg] = useState<string | null>(null)

  // --- Onboarding Form States ---
  const [onboardName, setOnboardName] = useState('')
  const [onboardGender, setOnboardGender] = useState<'Male' | 'Female'>('Male')
  const [onboardLanguages, setOnboardLanguages] = useState<string[]>([])
  const [onboardQualifications, setOnboardQualifications] = useState('')
  const [onboardType, setOnboardType] = useState<'1:1' | 'Dars-e-Nizami' | 'Tajweed 2-Year'>('1:1')
  const [onboardAssignedClasses, setOnboardAssignedClasses] = useState<string[]>([])
  const [onboardSuccessMsg, setOnboardSuccessMsg] = useState<{ id: string; name: string; email?: string; password?: string } | null>(null)

  // --- Makeup Tab States ---
  const [activeMakeupId, setActiveMakeupId] = useState<string | null>(null)
  const [makeupDate, setMakeupDate] = useState('')
  const [makeupTime, setMakeupTime] = useState('')
  const [makeupSuccessMsg, setMakeupSuccessMsg] = useState<string | null>(null)

  // Map database enrollment request to UI AdmissionMock format
  const mapRequestToAdmission = (row: any): AdmissionMock => {
    const message = row.message || ''
    
    // Extract Preferred Teacher Gender
    const genderMatch = message.match(/\[Preferred Teacher Gender:\s*([^\]]+)\]/i)
    const genderPreference = genderMatch ? genderMatch[1].trim() : 'No preference'
    
    // Extract Preferred Time
    const timeMatch = message.match(/\[Preferred Time 1:\s*([^\]]+)\]/i)
    const preferredTimeSlot = timeMatch ? timeMatch[1].trim() : 'Not specified'
    
    // Extract Days Available
    const daysMatch = message.match(/\[Days Available:\s*([^\]]+)\]/i)
    const availableDays = daysMatch ? daysMatch[1].split(',').map((d: string) => d.trim()) : []
    
    // Extract Dars-e-Nizami Year
    const yearMatch = message.match(/\[Dars-e-Nizami Year:\s*([^\]]+)\]/i)
    const yearLevel = yearMatch && yearMatch[1].trim() !== 'N/A' ? yearMatch[1].trim() : 'Year 1'

    return {
      id: row.id,
      studentName: row.student_name,
      courseName: row.course_interest || 'Quran Reading',
      type: row.course_type === 'group' ? 'Group' : '1:1',
      submissionDate: new Date(row.created_at).toISOString().split('T')[0],
      genderPreference,
      timezone: row.timezone || 'UTC',
      preferredTimeSlot,
      availableDays,
      yearLevel,
      status: row.status,
      // Pass raw email/name values for downstream trial/group class inserts
      parentEmail: row.parent_email,
      parentName: row.parent_name,
      parentWhatsapp: row.parent_whatsapp
    } as any
  }

  const fetchAdmissions = async () => {
    setIsLoadingAdmissions(true)
    setAdmissionsFetchError(null)
    try {
      const { data, error } = await supabase
        .from('enrollment_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      const mapped = (data || []).map(mapRequestToAdmission)
      setAdmissions(mapped)
    } catch (err: any) {
      console.error('Error fetching enrollment requests:', err)
      setAdmissionsFetchError(err.message || 'Failed to load admissions.')
    } finally {
      setIsLoadingAdmissions(false)
    }
  }

  const fetchTrials = async () => {
    setIsLoadingTrials(true)
    setTrialsFetchError(null)
    try {
      const { data: trialsData, error: trialsErr } = await supabase
        .from('trial_requests')
        .select(`
          id,
          student_id,
          teacher_id,
          student_name,
          parent_email,
          requested_date,
          status,
          created_at,
          feedback,
          student:student_id ( full_name ),
          teacher:teacher_id ( full_name )
        `)
        .in('status', ['pending', 'active', 'scheduled'])
        .order('created_at', { ascending: false })

      if (trialsErr) throw trialsErr

      const { data: enrollmentsData, error: enrollmentsErr } = await supabase
        .from('enrollment_requests')
        .select('student_name, parent_email, course_interest')

      const enrollments = enrollmentsData || []

      const mapped = (trialsData || []).map((row: any) => {
        const match = enrollments.find(e => 
          (e.parent_email && e.parent_email === row.parent_email) || 
          (e.student_name && e.student_name === row.student_name)
        )
        const courseName = match ? match.course_interest : 'Quran Reading (Nazra)'

        const history = row.feedback 
          ? [{ teacherName: row.teacher?.full_name || 'Assigned Teacher', feedback: row.feedback }] 
          : []

        return {
          id: row.id,
          studentId: row.student_id,
          studentName: row.student?.full_name || row.student_name,
          courseName,
          trialsCount: 1,
          maxTrials: 3,
          history,
          status: row.status,
          teacherName: row.teacher?.full_name || 'Assigned Teacher',
          createdDate: new Date(row.created_at).toISOString().split('T')[0]
        }
      })

      setTrialStudents(mapped as any)
    } catch (err: any) {
      console.error('Error fetching trial requests:', err)
      setTrialsFetchError(err.message || 'Failed to load trials roster.')
    } finally {
      setIsLoadingTrials(false)
    }
  }

  const fetchTeachers = async () => {
    setIsLoadingTeachersList(true)
    setTeachersListFetchError(null)
    try {
      const response = await fetch('/api/registrar/teachers')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch teachers roster')

      const mapped: OnboardedTeacherMock[] = (result.teachers || []).map((t: any) => ({
        id: `TCH-${t.id.substring(0, 4).toUpperCase()}`,
        fullName: t.full_name,
        gender: t.gender === 'female' ? 'Female' : 'Male',
        type: t.teacher_type || '1:1',
        qualifications: 'Active Faculty Member',
        status: t.status,
        createdDate: new Date(t.created_at).toISOString().split('T')[0]
      }))

      setOnboardedTeachers(mapped)
    } catch (err: any) {
      console.error('Error fetching teachers list:', err)
      setTeachersListFetchError(err.message || 'Failed to load teachers roster.')
    } finally {
      setIsLoadingTeachersList(false)
    }
  }

  useEffect(() => {
    fetchAdmissions()
  }, [])

  useEffect(() => {
    if (activeTab === 'trials') {
      fetchTrials()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'onboarding') {
      fetchTeachers()
    }
  }, [activeTab])

  const fetchMakeups = async () => {
    setIsLoadingMakeups(true)
    setMakeupsFetchError(null)
    try {
      const response = await fetch('/api/registrar/makeup-requests')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch makeup requests')

      const mapped: MakeupRequestMock[] = (result.requests || []).map((r: any) => ({
        id: r.id,
        studentName: r.studentName,
        courseName: r.course,
        missedDate: r.missedDate,
        originalTeacher: r.originalTeacher
      }))

      setMakeupRequests(mapped)
    } catch (err: any) {
      console.error('Error fetching makeup requests:', err)
      setMakeupsFetchError(err.message || 'Failed to load pending makeup requests.')
    } finally {
      setIsLoadingMakeups(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'makeups') {
      fetchMakeups()
    }
  }, [activeTab])

  // Fetch 1:1 Matching Teachers when selected 1:1 admission changes
  useEffect(() => {
    if (!selectedAdmissionId) {
      setMatchingTeachers([])
      return
    }
    const admission = admissions.find(a => a.id === selectedAdmissionId)
    if (!admission || admission.type !== '1:1') {
      setMatchingTeachers([])
      return
    }

    const fetchMatchingTeachers = async () => {
      setIsLoadingTeachers(true)
      setTeacherFetchError(null)
      try {
        const genderPref = admission.genderPreference?.toLowerCase()
        const targetGender = genderPref && (genderPref.includes('male') || genderPref.includes('female'))
          ? (genderPref.includes('female') ? 'female' : 'male')
          : undefined

        const response = await fetch('/api/registrar/teachers?status=Active&teacherType=1:1')
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to fetch matching teachers')

        let data = result.teachers || []
        if (targetGender) {
          data = data.filter((t: any) => t.gender === targetGender)
        }

        const mapped: MatchingTeacherMock[] = data.map((t: any, idx: number) => ({
          id: t.id,
          name: t.full_name,
          gender: t.gender === 'female' ? 'Female' : 'Male',
          matchScore: idx === 0 ? 98 : idx === 1 ? 92 : 85,
          slotUtilization: 'Active',
          availableTimes: admission.preferredTimeSlot || 'Flexible'
        }))

        setMatchingTeachers(mapped)
      } catch (err: any) {
        console.error('Error fetching matching teachers:', err)
        setTeacherFetchError(err.message || 'Failed to load matching teachers.')
      } finally {
        setIsLoadingTeachers(false)
      }
    }

    fetchMatchingTeachers()
  }, [selectedAdmissionId, admissions])

  // Fetch Group Classes when selected Group admission changes
  useEffect(() => {
    if (!selectedAdmissionId) {
      setMatchingGroupClasses([])
      return
    }
    const admission = admissions.find(a => a.id === selectedAdmissionId)
    if (!admission || admission.type !== 'Group') {
      setMatchingGroupClasses([])
      return
    }

    const fetchMatchingClasses = async () => {
      setIsLoadingClasses(true)
      setClassesFetchError(null)
      try {
        const { data, error } = await supabase
          .from('group_classes')
          .select(`
            id,
            class_name,
            year_level,
            max_capacity,
            enrolled_count,
            teacher_id,
            profiles:teacher_id ( full_name ),
            courses:course_id ( title )
          `)

        if (error) throw error

        const filtered = (data || [])
          .filter((cls: any) => {
            const courseTitle = cls.courses?.title || ''
            const classYear = cls.year_level?.toString() || ''
            return (
              courseTitle.toLowerCase() === admission.courseName.toLowerCase() &&
              classYear === admission.yearLevel?.replace(/\D/g, '')
            )
          })
          .map((cls: any) => ({
            id: cls.id,
            className: cls.class_name,
            courseName: cls.courses?.title || admission.courseName,
            yearLevel: `Year ${cls.year_level}`,
            teacherName: cls.profiles?.full_name || 'Unassigned Teacher',
            studentCount: cls.enrolled_count,
            maxStudents: cls.max_capacity,
            timeSlot: 'Scheduled Slot'
          }))

        setMatchingGroupClasses(filtered)
      } catch (err: any) {
        console.error('Error fetching matching group classes:', err)
        setClassesFetchError(err.message || 'Failed to load group classes.')
      } finally {
        setIsLoadingClasses(false)
      }
    }

    fetchMatchingClasses()
  }, [selectedAdmissionId, admissions])

  const selectedAdmission = admissions.find(a => a.id === selectedAdmissionId)

  // --- Admission Action Handlers ---
  const handleAssignTrial = async (teacherId: string, teacherName: string) => {
    if (!selectedAdmission) return

    setAdmissionSuccessMsg(null)
    setIsLoadingTeachers(true)

    try {
      const response = await fetch('/api/registrar/assign-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentRequestId: selectedAdmission.id,
          teacherId: teacherId,
          studentName: selectedAdmission.studentName,
          parentEmail: (selectedAdmission as any).parentEmail || `${selectedAdmission.id}@test.com`,
          timezone: selectedAdmission.timezone,
          gender: selectedAdmission.genderPreference
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Server request failed')
      }

      setAdmissionSuccessMsg({
        studentName: selectedAdmission.studentName,
        portalId: result.studentId || 'PENDING',
        teacherName: teacherName,
        type: 'TRIAL',
        pendingSupervisor: false
      })

      setSelectedAdmissionId(null)
      await fetchAdmissions()

    } catch (err: any) {
      console.error('Trial assignment failed:', err)
      alert(`Assignment failed: ${err.message}`)
    } finally {
      setIsLoadingTeachers(false)
    }
  }

  const handleAssignGroup = async (groupClassId: string, className: string, teacherName: string) => {
    if (!selectedAdmission) return

    setAdmissionSuccessMsg(null)
    setIsLoadingClasses(true)

    try {
      const response = await fetch('/api/registrar/assign-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentRequestId: selectedAdmission.id,
          groupClassId: groupClassId,
          studentName: selectedAdmission.studentName,
          parentEmail: (selectedAdmission as any).parentEmail || `${selectedAdmission.id}@test.com`,
          timezone: selectedAdmission.timezone,
          gender: selectedAdmission.genderPreference
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Server request failed')
      }

      setAdmissionSuccessMsg({
        studentName: selectedAdmission.studentName,
        portalId: result.studentId || 'PENDING',
        teacherName: teacherName,
        type: 'REGULAR',
        className: className
      })

      setSelectedAdmissionId(null)
      await fetchAdmissions()

    } catch (err: any) {
      console.error('Group assignment failed:', err)
      alert(`Assignment failed: ${err.message}`)
    } finally {
      setIsLoadingClasses(false)
    }
  }

  // --- Trial Action Handlers ---
  const handleConvertToRegular = async (trialId: string, studentId: string, studentName: string) => {
    const confirmed = window.confirm(`Are you sure you want to convert ${studentName} to a regular student?`)
    if (!confirmed) return

    setTrialSuccessMsg(null)
    setIsLoadingTrials(true)
    try {
      const { error: trialErr } = await supabase
        .from('trial_requests')
        .update({ status: 'converted', is_converted_active: true })
        .eq('id', trialId)

      if (trialErr) throw trialErr

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ status: 'Active' })
        .eq('id', studentId)

      if (profileErr) throw profileErr

      // Trigger 3: Trial converted to Regular
      try {
        await fetch('/api/notifications/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: studentId,
            role: 'student',
            title: 'Trial Converted to Regular',
            message: 'Congratulations! Your trial has been converted to regular enrollment.'
          })
        })
      } catch (err: any) {
        console.error('Failed to create notification on trial conversion (non-fatal):', err.message)
      }

      setTrialSuccessMsg(`Student ${studentName} successfully converted to Regular student.`)
      setActiveTrialSelection(null)
      setSelectedTeacherForConvert('')
      await fetchTrials()

    } catch (err: any) {
      console.error('Error converting student to regular:', err)
      alert(`Conversion failed: ${err.message}`)
    } finally {
      setIsLoadingTrials(false)
    }
  }

  const handleRejectTrial = async (trialId: string, studentId: string, studentName: string) => {
    const reason = window.prompt(`Please provide a reason for ending/rejecting the trial for ${studentName}:`)
    if (reason === null) return
    if (!reason.trim()) {
      alert('A reason is required to reject the trial.')
      return
    }

    setTrialSuccessMsg(null)
    setIsLoadingTrials(true)
    try {
      const { error: trialErr } = await supabase
        .from('trial_requests')
        .update({ status: 'rejected', feedback: reason })
        .eq('id', trialId)

      if (trialErr) throw trialErr

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ status: 'Removed' })
        .eq('id', studentId)

      if (profileErr) throw profileErr

      const trialObj = trialStudents.find(s => s.id === trialId) as any
      if (trialObj) {
        const { error: enrollErr } = await supabase
          .from('enrollment_requests')
          .update({ status: 'pending' })
          .eq('student_name', trialObj.studentName)

        if (enrollErr) {
          console.warn('Reverting enrollment status warning:', enrollErr.message)
        }
      }

      setTrialSuccessMsg(`Trial ended. Student ${studentName} was rejected/archived.`)
      setActiveTrialSelection(null)
      await fetchTrials()

    } catch (err: any) {
      console.error('Error rejecting trial:', err)
      alert(`Rejection failed: ${err.message}`)
    } finally {
      setIsLoadingTrials(false)
    }
  }

  // --- Onboarding Form Handlers ---
  const handleLanguageToggle = (lang: string) => {
    if (onboardLanguages.includes(lang)) {
      setOnboardLanguages(onboardLanguages.filter(l => l !== lang))
    } else {
      setOnboardLanguages([...onboardLanguages, lang])
    }
  }

  const handleClassAssignmentToggle = (cls: string) => {
    if (onboardAssignedClasses.includes(cls)) {
      setOnboardAssignedClasses(onboardAssignedClasses.filter(c => c !== cls))
    } else {
      setOnboardAssignedClasses([...onboardAssignedClasses, cls])
    }
  }

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onboardName || !onboardQualifications) return

    setOnboardSuccessMsg(null)
    setIsLoadingTeachersList(true)

    try {
      const response = await fetch('/api/registrar/create-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: onboardName,
          gender: onboardGender,
          qualifications: onboardQualifications,
          teacherType: onboardType
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Server registration request failed')
      }

      setOnboardSuccessMsg({
        id: result.teacherId,
        name: onboardName,
        email: result.email,
        password: result.password
      })

      // Reset form states
      setOnboardName('')
      setOnboardQualifications('')
      setOnboardLanguages([])
      setOnboardAssignedClasses([])

      // Refresh roster list below
      await fetchTeachers()

    } catch (err: any) {
      console.error('Teacher onboarding failed:', err)
      alert(`Registration failed: ${err.message}`)
    } finally {
      setIsLoadingTeachersList(false)
    }
  }

  // --- Makeup Scheduling Handler ---
  const handleMakeupConfirm = async (e: React.FormEvent, reqId: string, studentName: string) => {
    e.preventDefault()
    if (!makeupDate || !makeupTime) return

    setMakeupSuccessMsg(null)
    setIsLoadingMakeups(true)

    try {
      const response = await fetch('/api/registrar/assign-makeup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makeupId: reqId,
          proposedDate: makeupDate,
          proposedTime: makeupTime
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to schedule makeup slot')

      setMakeupSuccessMsg(`Makeup class scheduled successfully for ${studentName} on ${makeupDate} at ${makeupTime} PKT.`)
      
      // Clear form states
      setActiveMakeupId(null)
      setMakeupDate('')
      setMakeupTime('')

      // Refresh the ledger
      await fetchMakeups()

    } catch (err: any) {
      console.error('Error scheduling makeup class:', err)
      alert(`Scheduling failed: ${err.message}`)
    } finally {
      setIsLoadingMakeups(false)
    }
  }

  const handleLogout = async () => {
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    await supabase.auth.signOut()
    window.location.href = '/staff/login'
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <BackToFounderBanner />
      <div className="flex-1 flex bg-[#FAFAF7] text-zinc-800 font-sans relative overflow-hidden">
      
      {/* ========================================== */}
      {/* PERSISTENT LEFT SIDEBAR                    */}
      {/* ========================================== */}
      <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="flex border-b border-zinc-100 px-6 py-5 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className="text-sm font-bold font-serif text-zinc-900 leading-tight block">Virtual Zawiyah</span>
              <span className="block text-[9px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">REGISTRAR PORTAL</span>
            </div>
          </div>
          <NotificationBell align="left" />
        </div>

        {/* Portal Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          
          <button 
            onClick={() => {
              setActiveTab('admissions')
              setAdmissionSuccessMsg(null)
              setTrialSuccessMsg(null)
              setMakeupSuccessMsg(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'admissions' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserPlus className="h-4.5 w-4.5" />
              <span>Pending Admissions</span>
            </div>
            {admissions.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'admissions' ? 'bg-[#1B6B3A] text-white' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {admissions.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => {
              setActiveTab('trials')
              setAdmissionSuccessMsg(null)
              setTrialSuccessMsg(null)
              setMakeupSuccessMsg(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'trials' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="h-4.5 w-4.5" />
              <span>Trial Management</span>
            </div>
            {trialStudents.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'trials' ? 'bg-[#1B6B3A] text-white' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {trialStudents.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => {
              setActiveTab('onboarding')
              setAdmissionSuccessMsg(null)
              setTrialSuccessMsg(null)
              setMakeupSuccessMsg(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'onboarding' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-4.5 w-4.5" />
              <span>Teacher Onboarding</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setActiveTab('makeups')
              setAdmissionSuccessMsg(null)
              setTrialSuccessMsg(null)
              setMakeupSuccessMsg(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'makeups' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4.5 w-4.5" />
              <span>Makeup Requests</span>
            </div>
            {makeupRequests.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'makeups' ? 'bg-[#1B6B3A] text-white' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {makeupRequests.length}
              </span>
            )}
          </button>

        </nav>

        {/* User profile bottom bar */}
        <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 shrink-0 mt-auto">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm shrink-0 font-bold text-xs">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-zinc-800 font-sans">
                Sister Ayesha
              </p>
              <p className="truncate text-[10px] text-zinc-550">
                ayesha.registrar@virtualzawiyah.com
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-[10px] font-bold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-[0.98] transition-all duration-150"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN WORKSPACE CONTENT AREA                */}
      {/* ========================================== */}
      <main className="flex-1 bg-[#FAFAF7] flex overflow-hidden h-full">

        {/* --- PENDING ADMISSIONS TAB --- */}
        {activeTab === 'admissions' && (
          <div className="flex-1 flex overflow-hidden h-full">
            {/* Admissions List Panel */}
            <div className="w-1/2 border-r border-zinc-200 p-8 overflow-y-auto h-full space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                  Admissions Ledger
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Manage new student admission applications and execute time-slot class matching.
                </p>
              </div>

              {admissionSuccessMsg && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-50/70 p-4 text-xs text-emerald-800 shadow-xs">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      {admissionSuccessMsg.pendingSupervisor 
                        ? 'Assignment Recommendation Submitted!' 
                        : 'Student Assigned Successfully!'}
                    </p>
                    <p className="mt-1 leading-relaxed">
                      {admissionSuccessMsg.pendingSupervisor 
                        ? `Teacher assignment recommendation (${admissionSuccessMsg.teacherName}) has been submitted. Status is now Pending Supervisor Approval.`
                        : `Student ${admissionSuccessMsg.studentName} has been created with Portal ID ${admissionSuccessMsg.portalId}.`}
                    </p>
                    {!admissionSuccessMsg.pendingSupervisor && (
                      <p className="mt-0.5 leading-relaxed">
                        Status: <span className="font-bold uppercase tracking-wider">{admissionSuccessMsg.type}</span> 
                        {admissionSuccessMsg.type === 'TRIAL' 
                          ? ` (1:1 Trial assigned to ${admissionSuccessMsg.teacherName})`
                          : ` (Regular student in ${admissionSuccessMsg.className} under ${admissionSuccessMsg.teacherName})`
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isLoadingAdmissions ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B6B3A] border-t-transparent"></div>
                  <p className="text-xs text-zinc-550 font-semibold">Fetching admissions ledger...</p>
                </div>
              ) : admissionsFetchError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  <p className="font-bold">Failed to load admissions</p>
                  <p className="mt-1">{admissionsFetchError}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {admissions.map(item => {
                    const isSelected = selectedAdmissionId === item.id
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedAdmissionId(item.id)
                          setAdmissionSuccessMsg(null)
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 flex justify-between items-center ${
                          isSelected 
                            ? 'bg-[#1B6B3A]/5 border-[#1B6B3A] shadow-xs' 
                            : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-xs'
                        }`}
                      >
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-zinc-900 leading-tight">{item.studentName}</h3>
                          <p className="text-xs text-zinc-500 mt-1">{item.courseName}</p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-1">Submitted: {item.submissionDate}</p>
                          {item.status && (
                            <p className={`text-[9px] font-bold mt-1.5 uppercase tracking-wide inline-block px-2 py-0.5 rounded border ${
                              item.status === 'Pending Supervisor Approval' 
                                ? 'bg-amber-55 text-amber-800 border-amber-200' 
                                : 'bg-emerald-55 text-[#1B6B3A] border-emerald-200'
                            }`}>
                              {item.status}
                            </p>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          item.type === '1:1'
                            ? 'bg-emerald-50 text-[#1B6B3A] border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    )
                  })}
                  {admissions.length === 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-2">
                      <Inbox className="h-8 w-8 text-zinc-300 mx-auto" />
                      <p className="text-xs text-zinc-400 italic">No pending admissions left.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admissions Detail View Panel */}
            <div className="w-1/2 p-8 overflow-y-auto h-full bg-white">
              {selectedAdmission ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Student Summary Info */}
                  <div className="border-b border-zinc-150 pb-5">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                      selectedAdmission.type === '1:1' 
                        ? 'bg-emerald-50 text-[#1B6B3A] border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {selectedAdmission.type} Admission Request
                    </span>
                    <h2 className="text-xl font-serif font-bold text-zinc-900 mt-2">{selectedAdmission.studentName}</h2>
                    <p className="text-xs text-zinc-650 mt-1">Requested Course: <strong className="font-semibold text-zinc-800">{selectedAdmission.courseName}</strong></p>
                  </div>

                  {/* 1:1 Preferences & Teacher Matchings */}
                  {selectedAdmission.type === '1:1' && (
                    <div className="space-y-6">
                      
                      {/* Preferences Block */}
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-[#1B6B3A] uppercase tracking-wider">Preferences submitted</h4>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                          <div>
                            <span className="text-[10px] text-zinc-400 block uppercase">Teacher Gender</span>
                            <span className="text-zinc-700 font-semibold">{selectedAdmission.genderPreference}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block uppercase">Student Timezone</span>
                            <span className="text-zinc-700 font-semibold">{selectedAdmission.timezone}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block uppercase">Time slots preferred</span>
                            <span className="text-zinc-700 font-semibold">{selectedAdmission.preferredTimeSlot}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block uppercase">Available Days</span>
                            <span className="text-zinc-700 font-semibold">{selectedAdmission.availableDays?.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Matching Teachers List */}
                      {selectedAdmission.status === 'Pending Supervisor Approval' ? (
                        <div className="bg-amber-50 border border-amber-250 p-5 rounded-2xl text-center space-y-2">
                          <Clock className="h-8 w-8 text-amber-600 mx-auto animate-pulse" />
                          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Supervisor Approval</h4>
                          <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                            Teacher recommendation (<strong className="font-semibold">{selectedAdmission.assignedTeacher}</strong>) has been submitted. Waiting for Supervisor approval.
                          </p>
                        </div>
                      ) : selectedAdmission.status === 'Trial Started' ? (
                        <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-2xl text-center space-y-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Trial Started</h4>
                          <p className="text-[11px] text-emerald-950 leading-relaxed font-sans">
                            Supervisor has approved. The student status is now <span className="font-bold">TRIAL</span> under teacher <strong className="font-semibold">{selectedAdmission.assignedTeacher}</strong>.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-[#1B6B3A]" /> Ranked Matching Teachers
                          </h4>

                          {isLoadingTeachers ? (
                            <div className="flex flex-col items-center justify-center py-6 space-y-2 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-250">
                              <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#1B6B3A] border-t-transparent"></div>
                              <p className="text-[10px] text-zinc-500 font-medium">Finding available teachers...</p>
                            </div>
                          ) : teacherFetchError ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[11px] text-red-700">
                              <p className="font-bold">Failed to load teachers</p>
                              <p className="mt-1">{teacherFetchError}</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {matchingTeachers.map((teacher, index) => (
                                <div 
                                  key={teacher.id}
                                  className="border border-zinc-200 rounded-2xl p-4 hover:border-zinc-300 transition-all bg-zinc-50/30 flex justify-between items-start gap-4"
                                >
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-zinc-900">{teacher.name}</span>
                                      <span className="text-[9px] font-bold text-zinc-400 border border-zinc-200 px-1 rounded">
                                        {teacher.gender}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-mono">Available: {teacher.availableTimes}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono">Util: {teacher.slotUtilization}</p>
                                  </div>

                                  <div className="text-right shrink-0 space-y-2">
                                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                                      index === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-700'
                                    }`}>
                                      {teacher.matchScore}% Match
                                    </span>
                                    <button
                                      onClick={() => handleAssignTrial(teacher.id, teacher.name)}
                                      className="block w-full py-1 px-3 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-lg text-[10px] transition-all active:scale-[0.98]"
                                    >
                                      Assign & Start Trial
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {matchingTeachers.length === 0 && (
                                <p className="text-xs text-zinc-450 italic py-2 text-center">No active 1:1 teachers found matching this preference.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                  {/* Group Year Batch & Class Assignments */}
                  {selectedAdmission.type === 'Group' && (
                    <div className="space-y-6">
                      
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2">
                        <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Group Admission Level</h4>
                        <div className="text-xs font-semibold text-zinc-700">
                          Assigned Level: <span className="font-bold text-zinc-900">{selectedAdmission.yearLevel}</span>
                        </div>
                      </div>

                      {/* Class Matchings */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                          Existing Year-Batch Classes
                        </h4>

                        {isLoadingClasses ? (
                          <div className="flex flex-col items-center justify-center py-6 space-y-2 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-250">
                            <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#1B6B3A] border-t-transparent"></div>
                            <p className="text-[10px] text-zinc-500 font-medium">Finding matching classes...</p>
                          </div>
                        ) : classesFetchError ? (
                          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[11px] text-red-700">
                            <p className="font-bold">Failed to load classes</p>
                            <p className="mt-1">{classesFetchError}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {matchingGroupClasses.map(item => {
                              const isFull = item.studentCount >= item.maxStudents
                              return (
                                <div 
                                  key={item.id}
                                  className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/30 flex justify-between items-center gap-4"
                                >
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-zinc-900">{item.className}</h4>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">Teacher: {item.teacherName}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-1">Schedule: {item.timeSlot}</p>
                                  </div>

                                  <div className="text-right shrink-0 space-y-2">
                                    <span className="block text-[10px] text-zinc-650 font-semibold font-mono">
                                      {item.studentCount} / {item.maxStudents} Students
                                    </span>
                                    <button
                                      disabled={isFull}
                                      onClick={() => handleAssignGroup(item.id, item.className, item.teacherName)}
                                      className={`py-1 px-3 font-bold rounded-lg text-[10px] transition-all text-white active:scale-[0.98] ${
                                        isFull 
                                          ? 'bg-zinc-350 cursor-not-allowed' 
                                          : 'bg-[#1B6B3A] hover:bg-[#1B6B3A]/90'
                                      }`}
                                    >
                                      {isFull ? 'Class Full' : 'Assign to Class'}
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                            {matchingGroupClasses.length === 0 && (
                              <p className="text-xs text-zinc-450 italic py-2 text-center">No available group classes found matching this course & level.</p>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-3 p-8 text-zinc-400">
                  <BookOpen className="h-10 w-10 text-zinc-300" />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-700">No Student Selected</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Select a pending admission from the ledger panel to match preferences and assign slots.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TRIAL MANAGEMENT TAB --- */}
        {activeTab === 'trials' && (
          <div className="flex-1 p-8 overflow-y-auto h-full space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                Trial Student Management
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Monitor 1:1 active trial classes, collect teacher feedback notes, and process transitions to Regular status.
              </p>
            </div>

            {trialSuccessMsg && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-50/70 p-4 text-xs text-emerald-800 shadow-xs max-w-2xl">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>{trialSuccessMsg}</span>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              
              {/* Active Trials List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Active Trial Roster
                </h3>

                <div className="space-y-3">
                  {isLoadingTrials ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white border border-zinc-200 rounded-2xl">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B6B3A] border-t-transparent"></div>
                      <p className="text-xs text-zinc-550 font-semibold">Fetching trial roster...</p>
                    </div>
                  ) : trialsFetchError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                      <p className="font-bold">Failed to load trials</p>
                      <p className="mt-1">{trialsFetchError}</p>
                    </div>
                  ) : (
                    <>
                      {trialStudents.map(student => {
                        const isSelected = activeTrialSelection === student.id
                        return (
                          <div 
                            key={student.id}
                            className={`rounded-2xl border p-5 transition-all shadow-xs space-y-3 cursor-pointer ${
                              isSelected 
                                ? 'border-[#1B6B3A] bg-[#1B6B3A]/5' 
                                : 'border-zinc-200 bg-white hover:border-zinc-300'
                            }`}
                            onClick={() => {
                              setActiveTrialSelection(student.id)
                              setTrialSuccessMsg(null)
                            }}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="text-sm font-bold text-zinc-900">{student.studentName}</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">{student.courseName}</p>
                                <p className="text-[10px] text-zinc-500 mt-1 font-mono">Assigned Teacher: {(student as any).teacherName}</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">Date Created: {(student as any).createdDate}</p>
                                <p className="text-[10px] mt-1.5"><span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">{student.status || 'Active'}</span></p>
                              </div>
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 rounded">
                                Trial attempts: {student.trialsCount} of {student.maxTrials}
                              </span>
                            </div>

                            {/* Expand Tried History list if selected */}
                            {student.history.length > 0 && (
                              <div className="pt-2 border-t border-zinc-150 space-y-2">
                                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Teacher Trials History</span>
                                <div className="space-y-2">
                                  {student.history.map((h, i) => (
                                    <div key={i} className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5">
                                      <span className="font-bold text-zinc-700 block">{h.teacherName}</span>
                                      <span className="text-zinc-550 block italic mt-0.5">&quot;{h.feedback}&quot;</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {student.history.length === 0 && (
                              <p className="text-[10px] text-zinc-450 italic mt-1.5">No teachers tried yet. Trial class scheduled.</p>
                            )}
                          </div>
                        )
                      })}
                      {trialStudents.length === 0 && (
                        <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-2">
                          <Inbox className="h-8 w-8 text-zinc-300 mx-auto" />
                          <p className="text-xs text-zinc-400 italic">No students in trial status currently.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Conversion Action Controls */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Roster Action Console
                </h3>

                {activeTrialSelection ? (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs animate-fade-in">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-850">
                        Manage Status for {trialStudents.find(s => s.id === activeTrialSelection)?.studentName}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Transition the student to permanent status or end the trial sequence.
                      </p>
                    </div>

                    {/* Convert Form */}
                    <div className="space-y-3 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-bold text-[#1B6B3A] uppercase tracking-wider">
                        Option A: Convert to Regular Student
                      </h5>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                          Select trial teacher to continue
                        </label>
                        <select
                          value={selectedTeacherForConvert}
                          onChange={(e) => setSelectedTeacherForConvert(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] focus:border-[#1B6B3A]"
                        >
                          <option value="">-- Choose Teacher --</option>
                          {trialStudents.find(s => s.id === activeTrialSelection)?.history.map((h, i) => (
                            <option key={i} value={h.teacherName}>{h.teacherName}</option>
                          ))}
                          <option value="Ustadh Hammad Ali">Ustadh Hammad Ali (External Match)</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          const student = trialStudents.find(s => s.id === activeTrialSelection)
                          if (student) handleConvertToRegular(student.id, (student as any).studentId, student.studentName)
                        }}
                        disabled={!selectedTeacherForConvert}
                        className={`w-full py-2 font-bold rounded-xl text-xs text-white transition-all active:scale-[0.98] ${
                          selectedTeacherForConvert 
                            ? 'bg-[#1B6B3A] hover:bg-[#1B6B3A]/90' 
                            : 'bg-zinc-300 cursor-not-allowed'
                        }`}
                      >
                        Convert to Regular
                      </button>
                    </div>

                    {/* Reject Block */}
                    <div className="space-y-3 bg-rose-50/50 border border-rose-200/50 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                        Option B: End Trial and Reject
                      </h5>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        Ends the trial cycle. The student profile will be archived and the trial marked unsuccessful.
                      </p>
                      <button
                        onClick={() => {
                          const student = trialStudents.find(s => s.id === activeTrialSelection)
                          if (student) handleRejectTrial(student.id, (student as any).studentId, student.studentName)
                        }}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 font-bold rounded-xl text-xs transition-all active:scale-95"
                      >
                        End Trial / Reject student
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 space-y-2 shadow-xs">
                    <Sliders className="h-8 w-8 text-zinc-300 mx-auto" />
                    <p className="text-xs text-zinc-500 italic">Select a student from the active trial roster to configure status parameters.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- TEACHER ONBOARDING TAB --- */}
        {activeTab === 'onboarding' && (
          <div className="flex-1 p-8 overflow-y-auto h-full space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                Teacher Onboarding Hub
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Register new teachers into the system catalog, establish qualification parameters, and configure permanent type roles.
              </p>
            </div>

            {onboardSuccessMsg && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-50/70 p-5 text-xs text-emerald-800 shadow-xs max-w-2xl space-y-2 flex-col">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="font-bold text-sm">Teacher Registered Successfully!</p>
                </div>
                <div className="leading-relaxed space-y-1">
                  <p>
                    Ustadh/Ustadha <strong>{onboardSuccessMsg.name}</strong> has been onboarded with Teacher Portal ID: <strong className="font-mono text-zinc-950 bg-white px-1.5 py-0.5 border border-emerald-250 rounded">{onboardSuccessMsg.id}</strong>.
                  </p>
                  {onboardSuccessMsg.email && (
                    <div className="bg-white/80 border border-emerald-200/50 p-3 rounded-xl space-y-1 font-mono text-[11px] text-zinc-700 mt-2">
                      <p><strong>Email:</strong> {onboardSuccessMsg.email}</p>
                      <p><strong>Temp Password:</strong> {onboardSuccessMsg.password}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-emerald-900/80 italic mt-2">
                    Please share the portal email and password credentials with the teacher.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3 items-start">
              
              {/* Registration Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 mb-4 pb-2 border-b border-zinc-150">
                  New Teacher Profile Form
                </h3>

                <form onSubmit={handleOnboardSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text"
                        value={onboardName}
                        onChange={(e) => setOnboardName(e.target.value)}
                        placeholder="e.g. Ustadh Khalid Rahman"
                        required
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all bg-zinc-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Gender</label>
                      <div className="flex gap-4 pt-2">
                        <label className="inline-flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="gender" 
                            checked={onboardGender === 'Male'} 
                            onChange={() => setOnboardGender('Male')}
                            className="text-[#1B6B3A] focus:ring-[#1B6B3A]" 
                          />
                          Male
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="gender" 
                            checked={onboardGender === 'Female'} 
                            onChange={() => setOnboardGender('Female')}
                            className="text-[#1B6B3A] focus:ring-[#1B6B3A]" 
                          />
                          Female
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Languages Spoken</label>
                    <div className="flex gap-4 flex-wrap text-xs">
                      {['Urdu', 'English', 'Arabic', 'Pashto', 'Punjabi'].map(lang => {
                        const isChecked = onboardLanguages.includes(lang)
                        return (
                          <label key={lang} className="inline-flex items-center gap-1.5 text-zinc-700 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleLanguageToggle(lang)}
                              className="rounded text-[#1B6B3A] focus:ring-[#1B6B3A]"
                            />
                            {lang}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Qualifications & Background</label>
                    <textarea 
                      value={onboardQualifications}
                      onChange={(e) => setOnboardQualifications(e.target.value)}
                      placeholder="Degrees, certifications, memorization centers, teaching experience..."
                      rows={3}
                      required
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  {/* Teacher Type Choice */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1B6B3A] uppercase tracking-wider">Teacher Type Role Allocation</label>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">Select a permanent role mapping for this teacher. This cannot be multi-selected.</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3 text-xs">
                      {[
                        { value: '1:1', desc: '1:1 Custom slots' },
                        { value: 'Dars-e-Nizami', desc: 'Dars-e-Nizami course' },
                        { value: 'Tajweed 2-Year', desc: 'Tajweed batch classes' }
                      ].map(role => (
                        <label key={role.value} className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 bg-white cursor-pointer hover:border-zinc-350 transition-colors">
                          <input 
                            type="radio" 
                            name="typeRole"
                            checked={onboardType === role.value}
                            onChange={() => {
                              setOnboardType(role.value as '1:1' | 'Dars-e-Nizami' | 'Tajweed 2-Year')
                              setOnboardAssignedClasses([])
                            }}
                            className="text-[#1B6B3A] focus:ring-[#1B6B3A]"
                          />
                          <span className="font-semibold">{role.desc}</span>
                        </label>
                      ))}
                    </div>

                    {/* Conditional Class Assignments list */}
                    {onboardType !== '1:1' && (
                      <div className="pt-2 border-t border-zinc-200 space-y-2 animate-fade-in">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          Assign to Class Batch(es) ({onboardType})
                        </label>
                        <div className="flex gap-2.5 flex-wrap text-xs">
                          {(onboardType === 'Dars-e-Nizami' 
                            ? ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8']
                            : ['Year 1', 'Year 2']
                          ).map(cls => {
                            const isAssigned = onboardAssignedClasses.includes(cls)
                            return (
                              <label key={cls} className="inline-flex items-center gap-1.5 p-1.5 rounded-lg border border-zinc-200 bg-white cursor-pointer hover:border-zinc-300">
                                <input 
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => handleClassAssignmentToggle(cls)}
                                  className="rounded text-[#1B6B3A] focus:ring-[#1B6B3A]"
                                />
                                <span className="font-mono text-[10px] font-semibold">{cls}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs transition-all active:scale-[0.99] shadow-xs"
                  >
                    Complete Onboarding Registry
                  </button>
                </form>
              </div>

              {/* Onboarded Reference table list */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#1B6B3A]" /> Registered Faculty Ledger
                </h3>

                {isLoadingTeachersList ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#1B6B3A] border-t-transparent"></div>
                    <p className="text-[10px] text-zinc-550 font-medium">Loading faculty roster...</p>
                  </div>
                ) : teachersListFetchError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[10px] text-red-700">
                    <p className="font-bold">Failed to load faculty</p>
                    <p className="mt-0.5">{teachersListFetchError}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-150 text-xs space-y-3">
                    {onboardedTeachers.map(teacher => (
                      <div key={teacher.id} className="pt-3 first:pt-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-zinc-900">{teacher.fullName}</span>
                          <span className="font-mono text-[10px] bg-zinc-100 text-zinc-650 px-1.5 py-0.5 rounded">
                            {teacher.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-550">
                          Type: <span className="font-semibold text-zinc-700">{teacher.type}</span>
                        </p>
                        <p className="text-[10px] text-zinc-550">
                          Gender: <span className="text-zinc-700 font-medium capitalize">{teacher.gender}</span>
                        </p>
                        <p className="text-[10px] text-zinc-550">
                          Status: <span className="font-bold text-[#1B6B3A]">{teacher.status}</span>
                        </p>
                        <p className="text-[9px] text-zinc-450 font-mono">
                          Joined: {teacher.createdDate}
                        </p>
                      </div>
                    ))}
                    {onboardedTeachers.length === 0 && (
                      <p className="text-xs text-zinc-400 italic text-center py-4">No onboarded teachers found.</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- MAKEUP REQUESTS TAB --- */}
        {activeTab === 'makeups' && (
          <div className="flex-1 p-8 overflow-y-auto h-full space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                Makeup Scheduling Desk
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Process pending makeup request tickets for students affected by faculty leave or absences.
              </p>
            </div>

            {makeupSuccessMsg && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-50/70 p-4 text-xs text-emerald-800 shadow-xs max-w-2xl animate-fade-in">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>{makeupSuccessMsg}</span>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              
              {/* Requests Ledger list */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Pending Missed Sessions
                </h3>

                <div className="space-y-3">
                  {isLoadingMakeups ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white border border-zinc-200 rounded-2xl shadow-xs">
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#1B6B3A] border-t-transparent"></div>
                      <p className="text-xs text-zinc-500 font-medium">Querying pending tickets...</p>
                    </div>
                  ) : makeupsFetchError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-750 shadow-xs">
                      <p className="font-bold">Failed to load makeup requests</p>
                      <p className="mt-1 font-mono text-[10px]">{makeupsFetchError}</p>
                    </div>
                  ) : (
                    <>
                      {makeupRequests.map(req => {
                        const isSelected = activeMakeupId === req.id
                        return (
                          <div 
                            key={req.id}
                            className={`rounded-2xl border p-4 transition-all shadow-xs flex justify-between items-center cursor-pointer ${
                              isSelected 
                                ? 'border-[#1B6B3A] bg-[#1B6B3A]/5' 
                                : 'border-zinc-200 bg-white hover:border-zinc-300'
                            }`}
                            onClick={() => {
                              setActiveMakeupId(req.id)
                              setMakeupSuccessMsg(null)
                            }}
                          >
                            <div>
                              <h4 className="text-xs font-bold text-zinc-900">{req.studentName}</h4>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{req.courseName}</p>
                              <p className="text-[10px] text-rose-600 font-mono mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Missed: {req.missedDate} (Absence: {req.originalTeacher})
                              </p>
                            </div>
                            
                            <button
                              className="rounded-lg bg-zinc-100 hover:bg-[#1B6B3A]/10 hover:text-[#1B6B3A] text-zinc-700 text-[10px] font-bold px-3 py-1.5 border border-zinc-200 transition-all"
                            >
                              Schedule Slot
                            </button>
                          </div>
                        )
                      })}
                      {makeupRequests.length === 0 && (
                        <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-2 shadow-xs">
                          <Inbox className="h-8 w-8 text-zinc-300 mx-auto" />
                          <p className="text-xs text-zinc-400 italic">All makeup classes successfully scheduled.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Slot Scheduling Widget */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Slot Assigner Panel
                </h3>

                {activeMakeupId ? (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs animate-fade-in">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-850">
                        Schedule Makeup for {makeupRequests.find(r => r.id === activeMakeupId)?.studentName}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Select an alternative date and time to host the makeup class slot.
                      </p>
                    </div>

                    <form onSubmit={(e) => {
                      const req = makeupRequests.find(r => r.id === activeMakeupId)
                      if (req) handleMakeupConfirm(e, req.id, req.studentName)
                    }} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Alternative Class Date</label>
                        <input 
                          type="date"
                          value={makeupDate}
                          onChange={(e) => setMakeupDate(e.target.value)}
                          required
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] focus:border-[#1B6B3A] bg-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Alternative Time (PKT)</label>
                        <input 
                          type="time"
                          value={makeupTime}
                          onChange={(e) => setMakeupTime(e.target.value)}
                          required
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] focus:border-[#1B6B3A] bg-zinc-50"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs transition-all active:scale-[0.98]"
                      >
                        Confirm Makeup Slot
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 space-y-2 shadow-xs">
                    <Calendar className="h-8 w-8 text-zinc-300 mx-auto" />
                    <p className="text-xs text-zinc-500 italic">Select a missed session request from the roster to schedule an alternative class slot.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      </div>
    </div>
  )
}
