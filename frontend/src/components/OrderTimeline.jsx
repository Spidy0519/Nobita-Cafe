/**
 * Nobita Café — Order Timeline Component
 */

const STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: '📋', color: 'blue' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅', color: 'indigo' },
  { key: 'PREPARING', label: 'Preparing', icon: '👨‍🍳', color: 'yellow' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵', color: 'orange' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', color: 'green' },
]

export default function OrderTimeline({ status }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status)
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 bg-red-50 px-4 py-3 rounded-xl">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-500">This order has been cancelled</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const isCompleted = idx <= currentIndex
        const isCurrent = idx === currentIndex
        const isLast = idx === STEPS.length - 1

        return (
          <div key={step.key} className="flex gap-4">
            {/* Line + Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                           transition-all duration-500 shrink-0
                  ${
                    isCurrent
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110 animate-pulse-soft'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {isCompleted && !isCurrent ? '✓' : step.icon}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-10 transition-colors duration-500 ${
                    isCompleted ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-2 pb-6">
              <p
                className={`font-semibold transition-colors ${
                  isCurrent
                    ? 'text-primary-700'
                    : isCompleted
                    ? 'text-green-700'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-sm text-primary-500 mt-0.5 animate-fade-in">
                  In progress...
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
