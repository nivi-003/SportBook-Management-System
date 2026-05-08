import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { getDashboard } from '../../services/adminService'

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-6 flex items-center gap-5 border-l-4 ${color}`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-0.5">
        {value ?? <LoadingSpinner size="sm" />}
      </p>
    </div>
  </div>
)

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getDashboard()
        setStats(res.data)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of the SportBook system</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              icon="👥"
              color="border-blue-500"
            />
            <StatCard
              label="Total Venues"
              value={stats.totalVenues}
              icon="🏟️"
              color="border-green-500"
            />
            <StatCard
              label="Total Bookings"
              value={stats.totalBookings}
              icon="📅"
              color="border-purple-500"
            />
          </div>
        )}
      </main>
    </div>
  )
}
