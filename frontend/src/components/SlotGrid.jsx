export default function SlotGrid({ slots = [], selectedSlot, onSelect }) {
  if (slots.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No slots configured for this venue</p>
    )
  }

  return (
    <div>
      {/* Slot buttons grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slots.map(({ slot, status }) => {
          const isBooked = status === 'booked'
          const isSelected = selectedSlot === slot

          const baseClasses =
            'px-3 py-2 text-sm font-medium rounded border transition-all'

          const stateClasses = isBooked
            ? 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed opacity-70'
            : 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer'

          const selectedClasses = isSelected && !isBooked ? 'ring-2 ring-blue-500' : ''

          return (
            <button
              key={slot}
              disabled={isBooked}
              onClick={() => !isBooked && onSelect(slot)}
              className={`${baseClasses} ${stateClasses} ${selectedClasses}`}
              aria-pressed={isSelected && !isBooked}
              aria-label={`${slot} - ${status}`}
            >
              {slot}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <span className="text-green-600">●</span> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-500">●</span> Booked
        </span>
      </div>
    </div>
  )
}
