import { useState, useEffect } from 'react'

const SPORTS_TYPES = [
  'Football Turf',
  'Cricket Ground',
  'Badminton Court',
  'Tennis Court',
]

const DEFAULT_SLOTS = [
  '06:00-07:00',
  '07:00-08:00',
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
  '20:00-21:00',
  '21:00-22:00',
]

export default function VenueForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    name: '',
    sportsType: SPORTS_TYPES[0],
    location: '',
    description: '',
    pricePerHour: '',
    slots: [],
    imageUrl: '',
  })

  const [errors, setErrors] = useState({})
  const [imageUploading, setImageUploading] = useState(false)

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name ?? '',
        sportsType: initialValues.sportsType ?? SPORTS_TYPES[0],
        location: initialValues.location ?? '',
        description: initialValues.description ?? '',
        pricePerHour: initialValues.pricePerHour ?? '',
        slots: initialValues.slots ?? [],
        imageUrl: initialValues.imageUrl ?? '',
      })
    }
  }, [initialValues])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const toggleSlot = (slot) => {
    setForm((prev) => ({
      ...prev,
      slots: prev.slots.includes(slot)
        ? prev.slots.filter((s) => s !== slot)
        : [...prev.slots, slot],
    }))
  }

  const validate = () => {
    const errs = {}

    if (!form.name.trim()) {
      errs.name = 'Venue name is required.'
    }

    if (!form.location.trim()) {
      errs.location = 'Location is required.'
    }

    if (
      !form.pricePerHour ||
      isNaN(form.pricePerHour) ||
      Number(form.pricePerHour) < 0
    ) {
      errs.pricePerHour = 'Enter a valid price per hour.'
    }

    if (!form.imageUrl.trim()) {
      errs.imageUrl =
        'Venue image is required. Upload a file or paste image URL.'
    }

    return errs
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0]

    if (!file) return

    setImageUploading(true)

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append('upload_preset', 'sportbook_unsigned')

      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dpsg0eocw/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await res.json()

      if (data.secure_url) {
        setForm((prev) => ({
          ...prev,
          imageUrl: data.secure_url,
        }))
      } else {
        alert('Image upload failed')
      }
    } catch (error) {
      alert('Image upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const errs = validate()

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    onSubmit({
      name: form.name.trim(),
      sportsType: form.sportsType,
      location: form.location.trim(),
      description: form.description.trim(),
      pricePerHour: form.pricePerHour,
      slots: form.slots,
      imageUrl: form.imageUrl.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Venue Name *
        </label>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Green Field Turf"
          className={`w-full border rounded-lg px-3 py-2 text-sm ${
            errors.name ? 'border-red-400' : 'border-gray-300'
          }`}
        />

        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Sports Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sports Type *
        </label>

        <select
          name="sportsType"
          value={form.sportsType}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {SPORTS_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Chennai"
          className={`w-full border rounded-lg px-3 py-2 text-sm ${
            errors.location ? 'border-red-400' : 'border-gray-300'
          }`}
        />

        {errors.location && (
          <p className="mt-1 text-xs text-red-500">{errors.location}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price per Hour (₹) *
        </label>

        <input
          type="number"
          name="pricePerHour"
          value={form.pricePerHour}
          onChange={handleChange}
          placeholder="500"
          className={`w-full border rounded-lg px-3 py-2 text-sm ${
            errors.pricePerHour ? 'border-red-400' : 'border-gray-300'
          }`}
        />

        {errors.pricePerHour && (
          <p className="mt-1 text-xs text-red-500">
            {errors.pricePerHour}
          </p>
        )}
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Venue Image *
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          disabled={imageUploading}
          className="block w-full text-sm text-gray-500 mb-2"
        />

        <p className="text-xs text-gray-400 mb-2 text-center">
          — OR paste image URL —
        </p>

        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className={`w-full border rounded-lg px-3 py-2 text-sm ${
            errors.imageUrl ? 'border-red-400' : 'border-gray-300'
          }`}
        />

        {errors.imageUrl && (
          <p className="mt-1 text-xs text-red-500">
            {errors.imageUrl}
          </p>
        )}

        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="mt-3 h-32 w-full object-cover rounded-lg"
          />
        )}
      </div>

      {/* Slots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Time Slots
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {DEFAULT_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => toggleSlot(slot)}
              className={`text-xs px-2 py-1.5 rounded border ${
                form.slots.includes(slot)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || imageUploading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {loading
            ? 'Saving...'
            : imageUploading
            ? 'Uploading...'
            : initialValues
            ? 'Update Venue'
            : 'Add Venue'}
        </button>
      </div>
    </form>
  )
}

