import { useEffect, useState } from "react";

export default function MarcaForm({ initialData, onSubmit }) {
  // marca: string, foto: File opcional
  const [marca, setMarca] = useState("");
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setMarca(initialData.marca || "");
      // La foto existente es string, no la cargamos al input file
    }
  }, [initialData]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!marca.trim()) return setError("La marca es obligatoria");

    // Si backend de marcas acepta FormData por la foto:
    const formData = new FormData();
    formData.append("marca", marca.trim());
    if (foto) formData.append("foto", foto);

    await onSubmit(formData);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Marca *</label>
        <input
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Foto</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
          Guardar
        </button>
      </div>
    </form>
  );
}
