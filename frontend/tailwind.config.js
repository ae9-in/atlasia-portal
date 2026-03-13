/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6C63FF",
          secondary: "#00C2FF",
          accent: "#FF6B6B",
          surface: "#0F172A"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(108,99,255,0.25)"
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(108,99,255,0.35), transparent 30%), radial-gradient(circle at top right, rgba(0,194,255,0.2), transparent 32%), radial-gradient(circle at bottom center, rgba(255,107,107,0.18), transparent 24%)"
      }
    }
  },
  plugins: []
};
