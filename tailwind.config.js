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
        "primary": "#FF5D01",
        "primary-focus": "#E65300",
        "primary-content": "#ffffff",
        "secondary": "#f6d860",
        "accent": "#37cdbe",
        "neutral": "#3d4451",
        "base-100": "#1f2937",
        "base-200": "#1a1b26",
        "base-300": "#16171d",
        "base-content": "#ffffff",
        "info": "#2094f3",
        "success": "#009485",
        "warning": "#ff9900",
        "error": "#ff5724",
      },
    }],
    darkTheme: "ddp",
  },
}
