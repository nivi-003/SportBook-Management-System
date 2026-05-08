import { useEffect } from 'react'

const TYPE_STYLES = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
}

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[260px] max-w-sm animate-fade-in ${TYPE_STYLES[type] ?? TYPE_STYLES.info}`}
      role="alert"
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white text-lg leading-none font-bold flex-shrink-0"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  )
}

export default Toast
