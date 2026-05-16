import { useState, useEffect } from 'react'

export default function LiveBar() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // updates every minute
    return () => clearInterval(timer)
  }, [])

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className="mx-4 mb-2 px-4 py-2.5 bg-gray-50 rounded-lg flex items-center justify-between">
      <div>
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          Happening now
        </div>
        <div className="text-sm font-medium text-gray-900">
          Panel: Future of work
        </div>
      </div>
      <div className="text-sm text-[#b69088]">{timeString}</div>
    </div>
  )
}