/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: "#1F4E45",
          dark: "#163A33",
          light: "#2A685D",
        },
        ivory: "#FBF7EF",
        sage: {
          DEFAULT: "#D7E4D2",
          deep: "#AFC7A8",
          light: "#EBF2E8",
        },
        marigold: {
          DEFAULT: "#E2A63B",
          deep: "#C98A22",
          light: "#F7D58B",
        },
        clay: {
          DEFAULT: "#C1613F",
          dark: "#A34C2D",
          light: "#FBEAE2",
        },
        ink: {
          DEFAULT: "#22302B",
          soft: "#5A6B63",
          muted: "#8A9B93",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Fraunces", "serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        gentle: "0 2px 12px rgba(31, 78, 69, 0.08)",
        card: "0 4px 20px rgba(31, 78, 69, 0.06)",
        floating: "0 10px 30px rgba(31, 78, 69, 0.12)",
      },
    },
  },
  plugins: [],
};
