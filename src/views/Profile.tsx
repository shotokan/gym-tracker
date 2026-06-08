import { useProfile } from "../hooks/useProfile";

interface ProfileProps {
  onLogout: () => void;
}

export default function Profile({ onLogout }: ProfileProps) {
  const { profile, loading, error, refetch } = useProfile();

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Perfil</h1>
      </div>

      {/* Profile card */}
      <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-violet-700 flex items-center justify-center text-2xl flex-shrink-0">
          👤
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-700 rounded-lg w-32 animate-pulse" />
            <div className="h-3 bg-gray-700 rounded-lg w-48 animate-pulse" />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex-1">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={refetch}
              className="text-violet-400 text-sm mt-1 font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Profile data */}
        {!loading && profile && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{profile.name}</p>
            <p className="text-gray-400 text-sm truncate">{profile.email}</p>
            <p className="text-gray-600 text-xs mt-0.5">
              Miembro desde {profile.created_at}
            </p>
          </div>
        )}
      </div>

      {/* Status badge */}
      {profile && (
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${profile.active ? "bg-emerald-400" : "bg-red-400"}`}
          />
          <span className="text-gray-400 text-sm">
            {profile.active ? "Cuenta activa" : "Cuenta inactiva"}
          </span>
        </div>
      )}

      {/* Menu items */}
      <div className="space-y-2">
        {["Configuración", "Notificaciones", "Acerca de"].map((label) => (
          <div
            key={label}
            className="bg-gray-800 rounded-xl px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <span className="text-white">{label}</span>
            <span className="text-gray-600 text-lg">›</span>
          </div>
        ))}
      </div>

      {/* Logout */}
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
