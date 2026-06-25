import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  type = "text",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full bg-neutral-900 border ${
          error ? "border-red-500 focus:ring-red-500" : "border-neutral-800 focus:ring-blue-500"
        } rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
