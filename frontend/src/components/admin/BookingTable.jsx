const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function BookingTable({ bookings, onCancel, cancellingId }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">No bookings found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Venue</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Slot</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map((b) => (
            <tr
              key={b._id}
              className={`hover:bg-gray-50 transition-colors ${b.status === 'cancelled' ? 'opacity-60' : ''}`}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{b.user?.name ?? '—'}</p>
                <p className="text-xs text-gray-400">{b.user?.mobile ?? ''}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{b.venue?.name ?? '—'}</p>
                <p className="text-xs text-gray-400">{b.venue?.sportsType ?? ''}</p>
              </td>
              <td className="px-4 py-3 text-gray-700">{b.date}</td>
              <td className="px-4 py-3 text-gray-700 font-mono text-xs">{b.slot}</td>
              <td className="px-4 py-3">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {b.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {b.status === 'confirmed' ? (
                  <button
                    onClick={() => onCancel(b._id)}
                    disabled={cancellingId === b._id}
                    className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingId === b._id ? 'Cancelling…' : 'Cancel'}
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
