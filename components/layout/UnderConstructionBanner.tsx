'use client'

export function UnderConstructionBanner() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div 
      className="border-b py-3"
      style={{
        backgroundColor: 'rgba(89, 131, 146, 0.1)',
        borderColor: 'rgba(89, 131, 146, 0.2)',
      }}
    >
      <div className="container-wide">
        <p className="text-center text-sm" style={{ color: 'var(--color-text-body)' }}>
          <span className="font-semibold">{currentDate}</span> — Pardon the dust, check back in a couple of weeks for the final product
        </p>
      </div>
    </div>
  )
}
