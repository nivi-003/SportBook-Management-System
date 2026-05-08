import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import VenueForm from '../../components/admin/VenueForm'
import { useToast } from '../../context/ToastContext'
import { getVenues, createVenue, updateVenue, deleteVenue } from '../../services/venueService'

const API_URL = import.meta.env.VITE_API_URL

export default function VenueManagementPage() {
  const { showToast } = useToast()

  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form modal state
  const [showForm, setShowForm] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null) // null = add mode
  const [formLoading, setFormLoading] = useState(false)

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const fetchVenues = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getVenues()
      setVenues(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load venues.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVenues()
  }, [fetchVenues])

  const handleOpenAdd = () => {
    setEditingVenue(null)
    setShowForm(true)
  }

  const handleOpenEdit = (venue) => {
    setEditingVenue(venue)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingVenue(null)
  }

  const handleFormSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingVenue) {
        await updateVenue(editingVenue._id, formData)
        showToast('Venue updated successfully!', 'success')
      } else {
        await createVenue(formData)
        showToast('Venue added successfully!', 'success')
      }
      handleCloseForm()
      fetchVenues()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save venue.', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteConfirm = (id) => {
    setConfirmDeleteId(id)
  }

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    setConfirmDeleteId(null)
    try {
      await deleteVenue(id)
      showToast('Venue deleted.', 'success')
      fetchVenues()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete venue.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
            <p className="text-sm text-gray-500 mt-1">Add, edit, or remove sports venues</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Venue
          </button>
        </div>

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
            <button onClick={fetchVenues} className="text-sm text-blue-600 hover:underline">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && venues.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No venues yet. Add your first venue.</p>
          </div>
        )}

        {/* Venue grid */}
        {!loading && !error && venues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Image */}
                {venue.imageUrl ? (
                  <img
                    src={`${API_URL}${venue.imageUrl}`}
                    alt={venue.name}
                    className="h-40 w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-sm">No image</span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{venue.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{venue.sportsType} · {venue.location}</p>
                  <p className="text-sm font-bold text-green-600 mt-1">₹{venue.pricePerHour}/hr</p>
                  <p className="text-xs text-gray-400 mt-0.5">{venue.slots?.length ?? 0} slot(s)</p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleOpenEdit(venue)}
                      className="flex-1 text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(venue._id)}
                      disabled={deletingId === venue._id}
                      className="flex-1 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === venue._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editingVenue ? 'Edit Venue' : 'Add New Venue'}
            </h2>
            <VenueForm
              initialValues={editingVenue}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseForm}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Venue?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
