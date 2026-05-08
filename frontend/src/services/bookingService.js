import axios from 'axios'
const API = import.meta.env.VITE_API_URL
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export const getSlots = (venueId, date) => axios.get(`${API}/api/bookings/slots/${venueId}`, { params: { date }, headers: getHeaders() })
export const createBooking = (data) => axios.post(`${API}/api/bookings`, data, { headers: getHeaders() })
export const getMyBookings = () => axios.get(`${API}/api/bookings/my`, { headers: getHeaders() })
