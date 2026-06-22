/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta RDPR OS
        brand: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d5fe",
          300: "#a5b8fc",
          400: "#8193f9",
          500: "#6570f3",  // Principal
          600: "#5254e7",
          700: "#4540cd",
          800: "#3836a5",
          900: "#312f82",
          950: "#1e1c4e",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted:   "#f8f9fc",
          border:  "#e8eaf0",
        },
        text: {
          primary:   "#111827",
          secondary: "#6b7280",
          muted:     "#9ca3af",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg:      "0.75rem",
        xl:      "1rem",
      },
      boxShadow: {
        card:  "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        modal: "0 20px 60px -10px rgb(0 0 0 / 0.15)",
      },
    },
  },
  plugins: [],
}
