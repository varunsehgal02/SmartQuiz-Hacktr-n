"use client"

import { useEffect, useState } from "react"

interface CheatEvent {
  type: string
  timestamp: number
  details?: any
}

interface AntiCheatTrackerProps {
  studentId: string
  quizCode: string
  isActive: boolean
}

export function AntiCheatTracker({ studentId, quizCode, isActive }: AntiCheatTrackerProps) {
  const [cheatEvents, setCheatEvents] = useState<CheatEvent[]>([])
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 })
  const [mouseIdleTime, setMouseIdleTime] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)

  useEffect(() => {
    if (!isActive) return

    // Initialize the activity log in localStorage
    const logKey = `quiz_activity_log_${quizCode}_${studentId}`
    
    // Initialize the log if it doesn't exist
    if (!localStorage.getItem(logKey)) {
      const initialLog = {
        studentId,
        quizCode,
        startTime: Date.now(),
        events: [],
        tabSwitchCount: 0,
      }
      localStorage.setItem(logKey, JSON.stringify(initialLog))
    }

    // Log an event
    const logEvent = (eventType: string, details?: any) => {
      const event: CheatEvent = {
        type: eventType,
        timestamp: Date.now(),
        details
      }
      
      // Add to local state
      setCheatEvents(prev => [...prev, event])
      
      // Update localStorage
      try {
        const logKey = `quiz_activity_log_${quizCode}_${studentId}`
        const currentLog = JSON.parse(localStorage.getItem(logKey) || '{}')
        currentLog.events = [...(currentLog.events || []), event]
        localStorage.setItem(logKey, JSON.stringify(currentLog))
        
        // Also broadcast the event to teacher
        try {
          const channel = new BroadcastChannel('smartquiz_anticheat_channel')
          channel.postMessage({
            type: 'cheat_event',
            studentId,
            quizCode,
            event
          })
          channel.close()
        } catch (err) {
          console.error('Failed to broadcast cheat event:', err)
        }
      } catch (err) {
        console.error('Failed to log cheat event:', err)
      }
    }

    // Mouse movement tracking
    const handleMouseMove = (e: MouseEvent) => {
      const currentPosition = { x: e.clientX, y: e.clientY }
      
      // Check if mouse has moved significantly
      const distance = Math.sqrt(
        Math.pow(currentPosition.x - lastMousePosition.x, 2) +
        Math.pow(currentPosition.y - lastMousePosition.y, 2)
      )
      
      if (distance > 50) {
        setLastMousePosition(currentPosition)
        setMouseIdleTime(0)
      }
    }

    // Track tab visibility changes
    const handleVisibilityChange = () => {
      const isNowVisible = document.visibilityState === 'visible'
      
      // If visibility changed from visible to hidden
      if (isVisible && !isNowVisible) {
        logEvent('tab_switch', { from: 'visible', to: 'hidden' })
        setTabSwitchCount(prev => prev + 1)
        
        // Update the tab switch count in localStorage
        try {
          const logKey = `quiz_activity_log_${quizCode}_${studentId}`
          const currentLog = JSON.parse(localStorage.getItem(logKey) || '{}')
          currentLog.tabSwitchCount = (currentLog.tabSwitchCount || 0) + 1
          localStorage.setItem(logKey, JSON.stringify(currentLog))
        } catch (err) {
          console.error('Failed to update tab switch count:', err)
        }
      }
      
      // If visibility changed from hidden to visible
      if (!isVisible && isNowVisible) {
        logEvent('tab_return', { from: 'hidden', to: 'visible' })
      }
      
      setIsVisible(isNowVisible)
    }

    // Copy/paste detection
    const handleCopy = (e: ClipboardEvent) => {
      logEvent('copy_content', { text: e.clipboardData?.getData('text') || '' })
    }
    
    const handlePaste = (e: ClipboardEvent) => {
      logEvent('paste_content', { text: e.clipboardData?.getData('text') || '' })
    }

    // Right-click prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      logEvent('right_click', { x: e.clientX, y: e.clientY })
      return false
    }

    // Window blur/focus events
    const handleWindowBlur = () => {
      logEvent('window_blur')
    }
    
    const handleWindowFocus = () => {
      logEvent('window_focus')
    }

    // Print prevention
    const handleBeforePrint = () => {
      logEvent('print_attempt')
    }

    // Setup idle time checker
    const idleTimeInterval = setInterval(() => {
      setMouseIdleTime(prev => prev + 1)
      if (mouseIdleTime > 15) { // 15 seconds of mouse inactivity
        logEvent('mouse_idle', { seconds: mouseIdleTime })
        setMouseIdleTime(0) // Reset so we don't log continuously
      }
    }, 1000)

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('beforeprint', handleBeforePrint)

    // Initial log entry
    logEvent('tracking_started')

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('beforeprint', handleBeforePrint)
      clearInterval(idleTimeInterval)
      
      // Final log entry
      logEvent('tracking_ended')
    }
  }, [isActive, quizCode, studentId, isVisible, lastMousePosition, mouseIdleTime, tabSwitchCount])

  // This component doesn't render anything
  return null
} 