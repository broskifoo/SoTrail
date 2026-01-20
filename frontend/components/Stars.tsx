'use client'

export default function Stars() {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 3
        const top = Math.random() * 100
        const left = Math.random() * 100
        const opacity = Math.random() * 0.7
        const duration = Math.random() * 3 + 2
        
        return (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${top}%`,
              left: `${left}%`,
              opacity: opacity,
              animation: `twinkle ${duration}s infinite`
            }}
          />
        )
      })}
      
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
