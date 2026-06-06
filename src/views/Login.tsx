import { useState } from "react";
import { Input, Btn } from "../components/ui";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const go = () => {
    if (!email || !pw) {
      setErr("Completa los campos");
      return;
    }
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🏋️</div>
          <h1 className="text-3xl font-bold text-white">GymTracker</h1>
          <p className="text-gray-400 text-sm mt-1">
            Tu entrenamiento, tu progreso
          </p>
        </div>
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
          <Input
            label="Contraseña"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && go()}
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <Btn onClick={go} className="w-full py-3 text-base">
            Iniciar sesión
          </Btn>
        </div>
        <p className="text-gray-500 text-xs text-center">
          Demo: cualquier email y contraseña
        </p>
      </div>
    </div>
  );
}
