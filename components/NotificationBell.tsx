'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  link: string | null
  created_at: string
}

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    if (diffMs < 0) return 'just now'
    
    const seconds = Math.floor(diffMs / 1000)
    if (seconds < 60) return 'just now'
    
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    if (days === 1) return 'yesterday'
    return `${days}d ago`
  } catch {
    return ''
  }
}

interface NotificationBellProps {
  align?: 'left' | 'right'
}

export default function NotificationBell({ align = 'right' }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(true)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const updateCoords = () => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const isMobileSize = window.innerWidth < 640
      if (isMobileSize) {
        setCoords(null)
      } else {
        const top = rect.bottom + window.scrollY
        const left = align === 'left' 
          ? rect.left + window.scrollX
          : rect.right + window.scrollX - 384 // 384px is w-96 width
        setCoords({ top, left })
      }
    } else {
      setCoords(null)
    }
  }

  useEffect(() => {
    updateCoords()
  }, [isOpen, align])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
      updateCoords()
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', updateCoords, true)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', updateCoords, true)
    }
  }, [isOpen])

  const fetchNotifications = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchNotifications()

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string, link: string | null, title?: string) => {
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id, action: 'mark_read' })
      })
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }

    const targetLink = link || (title === 'Profile Edit Request' ? '/content-manager/dashboard' : null)
    if (targetLink) {
      router.push(targetLink)
      setIsOpen(false)
    }
  }

  const markAllRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      })
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-500 hover:text-primary hover:bg-primary/5 transition-all outline-none"
        aria-label="View notifications"
        id="btn-notification-bell"
      >
        <Bell className="w-5.5 h-5.5" />
        {unreadCount > 0 && (
          <span 
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse"
            id="notification-badge"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && mounted && createPortal(
        <div 
          className="fixed w-[calc(100vw-2rem)] sm:w-96 max-w-[380px] sm:max-w-none rounded-xl border border-gray-150 bg-white shadow-xl z-50 overflow-hidden animate-fade-in-up"
          style={{ 
            position: 'fixed',
            top: coords ? `${coords.top}px` : '4rem',
            left: coords ? `${coords.left}px` : '1rem',
            right: coords ? 'auto' : '1rem',
            transformOrigin: align === 'left' ? 'top left' : 'top right' 
          }}
          id="notification-dropdown"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                id="btn-mark-all-read"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[calc(100vh-160px)] sm:max-h-[360px] overflow-y-auto divide-y divide-gray-100" id="notification-list">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id, notif.link, notif.title)}
                  className={`px-4 py-3.5 hover:bg-gray-50/85 transition-colors cursor-pointer relative ${
                    !notif.is_read ? 'bg-primary/[0.02]' : ''
                  }`}
                  id={`notification-item-${notif.id}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-xs sm:text-sm font-semibold text-gray-900 ${
                      !notif.is_read ? 'pr-3' : ''
                    }`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0 font-medium mt-0.5">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed break-words whitespace-normal">
                    {notif.message}
                  </p>
                  {!notif.is_read && (
                    <span className="absolute top-4.5 right-4 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
