// web/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3194A0",
        border: "var(--color-border)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      }
    }
  }
}