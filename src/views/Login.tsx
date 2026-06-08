import { useState } from "react";
import { Btn, Input } from "../components/ui";

interface LoginProps {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export default function Login({ onSubmit, loading, error }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  // Inline validation — only shown after first submit attempt
  const emailMissing = touched && !email.trim();
  const passwordMissing = touched && !password;

  const handleSubmit = async () => {
    setTouched(true);
    if (!email.trim() || !password) return;
    await onSubmit(email.trim(), password);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">🏋️</div>
          <h1 className="text-3xl font-bold text-white">GymTracker</h1>
          <p className="text-gray-400 text-sm mt-1">
            Tu entrenamiento, tu progreso
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {emailMissing && (
              <p className="text-red-400 text-xs mt-1">
                El email es requerido.
              </p>
            )}
          </div>

          <div>
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {passwordMissing && (
              <p className="text-red-400 text-xs mt-1">
                La contraseña es requerida.
              </p>
            )}
          </div>

          {/* API error */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Btn
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 text-base"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
