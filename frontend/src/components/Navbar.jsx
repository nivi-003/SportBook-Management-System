import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
          SportBook
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {user?.role === 'admin' ? (
            <>
              <Link
                to="/admin/dashboard"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/venues"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Venues
              </Link>
              <Link
                to="/admin/bookings"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Bookings
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : user ? (
            <>
              <Link
                to="/"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/profile"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
