import { useState, useEffect } from 'react'

const SPORTS_TYPES = ['Football Turf', 'Cricket Ground', 'Badminton Court', 'Tennis Court']

const DEFAULT_SLOTS = [
  '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
  '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00',
]

export default function VenueForm({ initialValues, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    sportsType: SPORTS_TYPES[0],
    location: '',
    description: '',
    pricePerHour: '',
    slots: [],
    imageUrl: '',
    image: null,
  })
  const [errors, setErrors] = useState({})
  const [imageUploading, setImageUploading] = useState(false)

  // Populate form when editing
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
      image: null,
      })
    }
  }, [initialValues])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
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
    if (!form.name.trim()) errs.name = 'Venue name is required.'
    if (!form.sportsType) errs.sportsType = 'Sports type is required.'
    if (!form.location.trim()) errs.location = 'Location is required.'
    if (!form.pricePerHour || isNaN(form.pricePerHour) || Number(form.pricePerHour) < 0)
      errs.pricePerHour = 'Enter a valid price per hour.'
    return errs
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageUploading(true)
    try {
      // Upload directly to Cloudinary from frontend
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'sportbook_unsigned')
      formData.append('cloud_name', 'dpsg0eocw')

      const res = await fetch('https://api.cloudinary.com/v1_1/dpsg0eocw/image/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.secure_url) {
        setForm((prev) => ({ ...prev, imageUrl: data.secure_url, image: null }))
      } else {
        alert('Image upload failed. Please try pasting an image URL instead.')
      }
    } catch (err) {
      alert('Image upload failed. Please try pasting an image URL instead.')
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

    // Always send as JSON — image is already uploaded to Cloudinary as a URL
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Green Field Turf"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Sports Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sports Type *</label>
        <select
          name="sportsType"
          value={form.sportsType}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SPORTS_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Chennai, Tamil Nadu"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description of the venue..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (₹) *</label>
        <input
          name="pricePerHour"
          type="number"
          min="0"
          step="0.01"
          value={form.pricePerHour}
          onChange={handleChange}
          placeholder="e.g. 500"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pricePerHour ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.pricePerHour && <p className="mt-1 text-xs text-red-500">{errors.pricePerHour}</p>}
      </div>

      {/* Image — file upload OR URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Venue Image</label>

        {/* File upload — uploads directly to Cloudinary */}
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageFileChange}
          disabled={imageUploading}
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2 disabled:opacity-50"
        />
        {imageUploading && <p className="text-xs text-blue-500 mb-2">⏳ Uploading image...</p>}

        <p className="text-xs text-gray-400 mb-1">— OR paste an image URL —</p>

        {/* Image URL */}
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          disabled={imageUploading}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />

        {/* Preview */}
        {form.imageUrl && (
          <img src={form.imageUrl} alt="Preview" className="mt-2 h-28 w-full object-cover rounded-lg" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        )}
      </div>

      {/* Slots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {DEFAULT_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => toggleSlot(slot)}
              className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                form.slots.includes(slot)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">{form.slots.length} slot(s) selected</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving…' : initialValues ? 'Update Venue' : 'Add Venue'}
        </button>
      </div>
    </form>
  )
}

const DEFAULT_SLOTS = [
  '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
  '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00',
]

export default function VenueForm({ initialValues, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    sportsType: SPORTS_TYPES[0],
    location: '',
    description: '',
    pricePerHour: '',
    slots: [],
    image: null,
  })
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)

  // Populate form when editing
  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name ?? '',
        sportsType: initialValues.sportsType ?? SPORTS_TYPES[0],
        location: initialValues.location ?? '',
        description: initialValues.description ?? '',
        pricePerHour: initialValues.pricePerHour ?? '',
        slots: initialValues.slots ?? [],
        image: null,
      })
    }
  }, [initialValues])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm((prev) => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
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
    if (!form.name.trim()) errs.name = 'Venue name is required.'
    if (!form.sportsType) errs.sportsType = 'Sports type is required.'
    if (!form.location.trim()) errs.location = 'Location is required.'
    if (!form.pricePerHour || isNaN(form.pricePerHour) || Number(form.pricePerHour) < 0)
      errs.pricePerHour = 'Enter a valid price per hour.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const formData = new FormData()
    formData.append('name', form.name.trim())
    formData.append('sportsType', form.sportsType)
    formData.append('location', form.location.trim())
    formData.append('description', form.description.trim())
    formData.append('pricePerHour', form.pricePerHour)
    formData.append('slots', JSON.stringify(form.slots))
    if (form.image) formData.append('image', form.image)

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Green Field Turf"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Sports Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sports Type *</label>
        <select
          name="sportsType"
          value={form.sportsType}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SPORTS_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Chennai, Tamil Nadu"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description of the venue..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (₹) *</label>
        <input
          name="pricePerHour"
          type="number"
          min="0"
          step="0.01"
          value={form.pricePerHour}
          onChange={handleChange}
          placeholder="e.g. 500"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pricePerHour ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.pricePerHour && <p className="mt-1 text-xs text-red-500">{errors.pricePerHour}</p>}
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Venue Image</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="mt-2 h-28 w-full object-cover rounded-lg" />
        )}
      </div>

      {/* Slots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {DEFAULT_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => toggleSlot(slot)}
              className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                form.slots.includes(slot)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">{form.slots.length} slot(s) selected</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving…' : initialValues ? 'Update Venue' : 'Add Venue'}
        </button>
      </div>
    </form>
  )
}
