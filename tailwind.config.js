/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ddp-orange': '#FF5D01',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [{
      ddp: {
        "primary": "#B00000", // Pepperoni red for buttons and forms
        "primary-focus": "#8B0000", // Darker pepperoni red for hover
        "primary-content": "#ffffff",
        "secondary": "#FFA500", // Pizza crust orange
        "accent": "#B00000", // Pepperoni red accent
        "neutral": "#3d4451",
        "base-100": "#FFF5E1", // Mozzarella off-white background
        "base-200": "#FFE4B5", // Light cheese color background
        "base-300": "#FFD700", // Golden cheese color background
        "base-content": "#4A2511", // Dark brown text for pizza theme
        "info": "#2094f3",
        "success": "#009485",
        "warning": "#ff9900",
        "error": "#B00000",
      },
    }],
    darkTheme: "ddp",
  },
}
