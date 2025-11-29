import { useState, useRef, useEffect } from 'react'

interface LongPressButtonProps {
  onLongPress: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  duration?: number // Duration in milliseconds
}

/**
 * Button that requires long press to trigger action
 * Shows progress animation and provides haptic feedback
 */
export default function LongPressButton({
  onLongPress,
  children,
  className = '',
  disabled = false,
  duration = 1000, // 2 seconds default
}: LongPressButtonProps) {
  const [isPressing, setIsPressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const pressTimerRef = useRef<number | null>(null)
  const progressTimerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hapticFiredRef = useRef<{ at50: boolean; at75: boolean }>({ at50: false, at75: false })

  // Haptic feedback helper
  const triggerHaptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Clear all timers
  const clearTimers = () => {
    if (pressTimerRef.current !== null) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
    if (progressTimerRef.current !== null) {
      cancelAnimationFrame(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }

  // Start pressing
  const handleStart = () => {
    if (disabled) return

    setIsPressing(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    hapticFiredRef.current = { at50: false, at75: false }

    // Initial haptic feedback
    triggerHaptic(10)

    // Start progress animation
    const animateProgress = () => {
      if (!startTimeRef.current) return

      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      // Trigger haptic feedback at 50% and 75% (once each)
      if (newProgress >= 50 && !hapticFiredRef.current.at50) {
        hapticFiredRef.current.at50 = true
        triggerHaptic(20)
      }
      if (newProgress >= 75 && !hapticFiredRef.current.at75) {
        hapticFiredRef.current.at75 = true
        triggerHaptic(30)
      }

      if (newProgress < 100) {
        progressTimerRef.current = requestAnimationFrame(animateProgress)
      }
    }
    progressTimerRef.current = requestAnimationFrame(animateProgress)

    // Set timeout for long press completion
    pressTimerRef.current = window.setTimeout(() => {
      // Strong haptic feedback on completion
      triggerHaptic([50, 30, 50])
      onLongPress()
      setIsPressing(false)
      setProgress(0)
      clearTimers()
    }, duration)
  }

  // Cancel pressing
  const handleCancel = () => {
    clearTimers()
    setIsPressing(false)
    setProgress(0)
    startTimeRef.current = null
    hapticFiredRef.current = { at50: false, at75: false }
    // Light haptic feedback on cancel if user had made progress
    if (progress > 10) {
      triggerHaptic(5)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  // Prevent context menu on long press
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <button
      ref={buttonRef}
      className={`relative overflow-hidden ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isPressing ? 'scale-95' : ''} transition-transform duration-100`}
      disabled={disabled}
      onMouseDown={handleStart}
      onMouseUp={handleCancel}
      onMouseLeave={handleCancel}
      onTouchStart={(e) => {
        e.preventDefault()
        handleStart()
      }}
      onTouchEnd={handleCancel}
      onTouchCancel={handleCancel}
      onContextMenu={handleContextMenu}
    >
      {/* Subtle progress background fill */}
      {isPressing && (
        <div
          className="absolute inset-0 bg-blue-600 opacity-20"
          style={{
            width: `${progress}%`,
            transition: 'none',
          }}
        />
      )}

      {/* Content */}
      <span className={`relative z-10 flex items-center justify-center transition-opacity ${isPressing ? 'opacity-90' : ''}`}>
        {children}
      </span>
    </button>
  )
}

