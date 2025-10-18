export default function ProductoBreadcrumbs({ items, onNavigate }) {
  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      {items.map((item, idx) => (
        <div key={item.key} className="flex items-center">
          {idx > 0 && (
            <svg
              className="w-4 h-4 text-gray-400 mx-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          <button
            onClick={() => onNavigate(idx)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              idx === items.length - 1
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
}