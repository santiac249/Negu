import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items = [], onNavigate }) {
  // items: [{label: "Categorías", key: "categorias", id?: number}, ...]
  return (
    <nav className="w-full" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center text-sm text-gray-600 gap-1">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center">
            {idx > 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />}
            {idx < items.length - 1 ? (
              <button
                onClick={() => onNavigate(idx)}
                className="truncate max-w-[140px] md:max-w-none hover:text-indigo-700"
                title={it.label}
              >
                {it.label}
              </button>
            ) : (
              <span className="font-medium text-gray-900 truncate max-w-[140px] md:max-w-none" title={it.label}>
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
