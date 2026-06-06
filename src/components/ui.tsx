import type { CSSProperties, ReactNode, InputHTMLAttributes } from "react";

// ── Card ──────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}
export const Card = ({ children, className = "", style }: CardProps) => (
  <div className={`bg-gray-800 rounded-2xl p-4 ${className}`} style={style}>
    {children}
  </div>
);

// ── Button ────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "danger" | "ghost";
interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}
const btnStyles: Record<BtnVariant, string> = {
  primary: "bg-violet-600 hover:bg-violet-700 text-white",
  secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200",
  danger: "bg-red-900 text-red-300",
  ghost: "bg-transparent text-gray-400",
};
export const Btn = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  style,
  disabled,
}: BtnProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={style}
    className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${btnStyles[variant]} ${className}`}
  >
    {children}
  </button>
);

// ── Input ─────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input = ({ label, ...props }: InputProps) => (
  <div>
    {label && (
      <label className="block text-xs text-gray-300 mb-1 font-medium">
        {label}
      </label>
    )}
    <input
      {...props}
      className={`w-full bg-gray-700 text-white rounded-xl px-4 py-2.5 outline-none
        focus:ring-2 focus:ring-violet-500 text-sm
        placeholder:text-gray-400
        ${props.className ?? ""}`}
    />
  </div>
);
// ── ProgressBar ───────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  color?: string;
}
export const ProgressBar = ({
  value,
  color = "bg-violet-500",
}: ProgressBarProps) => (
  <div className="w-full bg-gray-700 rounded-full h-1.5">
    <div
      className={`h-1.5 rounded-full transition-all ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
