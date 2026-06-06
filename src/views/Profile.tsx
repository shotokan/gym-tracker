export default function Profile({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Perfil</h1>
      </div>
      <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-violet-700 flex items-center justify-center text-2xl flex-shrink-0">
          👤
        </div>
        <div>
          <p className="text-white font-semibold">Ivan</p>
          <p className="text-gray-500 text-sm">ivan@gymtracker.app</p>
        </div>
      </div>
      <div className="space-y-2">
        {["Configuración", "Notificaciones", "Acerca de"].map((l) => (
          <div
            key={l}
            className="bg-gray-800 rounded-xl px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <span className="text-white">{l}</span>
            <span className="text-gray-600 text-lg">›</span>
          </div>
        ))}
      </div>
      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl font-semibold text-red-400 border-2"
        style={{
          borderColor: "rgba(239,68,68,0.3)",
          background: "rgba(239,68,68,0.08)",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
