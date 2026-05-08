import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SlotGrid from '../components/SlotGrid'
import BookingConfirmModal from '../components/BookingConfirmModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { getVenue } from '../services/venueService'
import { getSlots, createBooking } from '../services/bookingService'
import { useToast } from '../context/ToastContext'

const API_URL = import.meta.env.VITE_API_URL

function todayString() {
  return new Date().toISOString().split('T')[0]
}

export default function VenueDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [venue, setVenue] = useState(null)
  const [venueLoading, setVenueLoading] = useState(true)
  const [venueError, setVenueError] = useState(null)

  const [date, setDate] = useState(todayString())
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState(null)

  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  // Fetch venue details
  useEffect(() => {
    const fetchVenue = async () => {
      setVenueLoading(true)
      setVenueError(null)
      try {
        const res = await getVenue(id)
        setVenue(res.data)
      } catch (err) {
        setVenueError(err?.response?.data?.message || 'Failed to load venue details.')
      } finally {
        setVenueLoading(false)
      }
    }
    fetchVenue()
  }, [id])

  // Fetch slots whenever date changes
  const fetchSlots = useCallback(async () => {
    if (!id || !date) return
    setSlotsLoading(true)
    setSlotsError(null)
    setSelectedSlot(null)
    try {
      const res = await getSlots(id, date)
      setSlots(res.data.slots)
    } catch (err) {
      setSlotsError(err?.response?.data?.message || 'Failed to load slot availability.')
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [id, date])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot)
    setShowModal(true)
  }

  const handleConfirmBooking = async () => {
    setBookingLoading(true)
    try {
      await createBooking({ venueId: id, date, slot: selectedSlot })
      showToast('Booking confirmed!', 'success')
      setShowModal(false)
      setSelectedSlot(null)
      fetchSlots() // refresh slot availability
    } catch (err) {
      showToast(err?.response?.data?.message || 'Booking failed. Please try again.', 'error')
      setShowModal(false)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelModal = () => {
    setShowModal(false)
    setSelectedSlot(null)
  }

  if (venueLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (venueError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <p className="text-red-500 text-lg font-medium mb-4">{venueError}</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const imageSrc = venue?.imageUrl
    ? `${API_URL}${venue.imageUrl}`
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to venues
        </button>

        {/* Venue image */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={venue.name}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8 shadow"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-64 sm:h-80 bg-gray-200 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image available</span>
          </div>
        )}

        {/* Venue info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
              <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {venue.sportsType}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{venue.pricePerHour}</p>
              <p className="text-xs text-gray-400">per hour</p>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-4 text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {venue.location}
          </div>

          {venue.description && (
            <p className="mt-4 text-gray-600 text-sm leading-relaxed">{venue.description}</p>
          )}
        </div>

        {/* Booking section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Book a Slot</h2>

          {/* Date picker */}
          <div className="mb-6">
            <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              id="booking-date"
              type="date"
              value={date}
              min={todayString()}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Slots */}
          {slotsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : slotsError ? (
            <div className="text-center py-6">
              <p className="text-red-500 text-sm mb-3">{slotsError}</p>
              <button
                onClick={fetchSlots}
                className="text-sm text-blue-600 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <SlotGrid
              slots={slots}
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
            />
          )}
        </div>
      </main>

      {/* Booking confirmation modal */}
      {showModal && (
        <BookingConfirmModal
          venue={venue}
          date={date}
          slot={selectedSlot}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelModal}
          loading={bookingLoading}
        />
      )}
    </div>
  )
}
