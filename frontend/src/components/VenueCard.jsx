import { Link } from 'react-router-dom';

export default function VenueCard({ venue }) {
  const { _id, name, sportsType, location, pricePerHour, imageUrl } = venue;

  const imageSrc = imageUrl
    ? `http://localhost:5000${imageUrl}`
    : '/placeholder.jpg';

  return (
    <Link
      to={`/venues/${_id}`}
      className="block bg-white rounded-2xl shadow-md overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-xl"
    >
      <img
        src={imageSrc}
        alt={name}
        className="object-cover h-48 w-full"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.jpg';
        }}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{name}</h3>

        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
          {sportsType}
        </span>

        <div className="flex items-center text-gray-500 text-sm mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">{location}</span>
        </div>

        <p className="text-green-600 font-bold text-base">
          ₹{pricePerHour}
          <span className="text-gray-400 font-normal text-sm"> / hour</span>
        </p>
      </div>
    </Link>
  );
}
