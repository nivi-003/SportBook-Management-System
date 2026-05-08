const SIZE_CLASSES = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading">
      <div
        className={`${sizeClass} rounded-full border-gray-200 border-t-blue-600 animate-spin`}
      />
    </div>
  )
}

export default LoadingSpinner
