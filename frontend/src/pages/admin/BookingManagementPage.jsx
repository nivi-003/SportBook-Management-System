import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import BookingTable from '../../components/admin/BookingTable'
import { useToast } from '../../context/ToastContext'
import { getAllBookings, cancelBooking } from '../../services/adminService'

export default function BookingManagementPage() {
  const { showToast } = useToast()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [confirmCancelId, setConfirmCancelId] = useState(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllBookings()
      setBookings(res.data.bookings)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancelRequest = (id) => {
    setConfirmCancelId(id)
  }

  const handleCancelConfirm = async () => {
    const id = confirmCancelId
    setConfirmCancelId(null)
    setCancellingId(id)
    try {
      await cancelBooking(id)
      showToast('Booking cancelled successfully.', 'success')
      fetchBookings()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to cancel booking.', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  const handleCancelDismiss = () => {
    setConfirmCancelId(null)
  }

  // Stats summary
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all bookings across venues</p>
        </div>

        {/* Summary pills */}
        {!loading && !error && bookings.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <span className="text-sm bg-white border border-gray-200 rounded-full px-4 py-1.5 text-gray-600">
              Total: <strong>{bookings.length}</strong>
            </span>
            <span className="text-sm bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-green-700">
              Confirmed: <strong>{confirmed}</strong>
            </span>
            <span className="text-sm bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-red-600">
              Cancelled: <strong>{cancelled}</strong>
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium mb-3">{error}</p>
            <button onClick={fetchBookings} className="text-sm text-blue-600 hover:underline">Retry</button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <BookingTable
              bookings={bookings}
              onCancel={handleCancelRequest}
              cancellingId={cancellingId}
            />
          </div>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {confirmCancelId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Booking?</h3>
            <p className="text-sm text-gray-500 mb-6">
              The slot will become available again for other users.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDismiss}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
