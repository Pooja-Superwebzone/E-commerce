"use client";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const baseStyles = "font-semibold rounded-lg transition-all duration-200 cursor-pointer border";
  
  const variants = {
    primary: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700",
    secondary: "bg-white text-gray-900 border-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 text-white border-red-600 hover:bg-red-700",
    outline: "bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
