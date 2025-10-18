import { useState } from "react";

export default function ImagePreview({ file, currentImageUrl, onRemove }) {
  const [preview, setPreview] = useState(null);

  // Generar preview si hay un archivo nuevo
  if (file && !preview) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const imageToShow = preview || currentImageUrl;

  if (!imageToShow) {
    return (
      <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">Sin imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 group">
      <img
        src={imageToShow}
        alt="Preview"
        className="w-full h-full object-cover"
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
          title="Quitar imagen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
    </div>
  );
}