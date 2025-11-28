const colors = require('./src/components/ui/tokens/colors');
const spacing = require('./src/components/ui/tokens/spacing');
const fontSize = require('./src/components/ui/tokens/font-size');
const fontFamily = require('./src/components/ui/tokens/font-family');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    // 🔥 Industry-standard responsive breakpoints for React Native
    screens: {
      xs: '360px', // Small phones (older Androids, iPhone SE)
      sm: '414px', // Regular phones (iPhone 12-15, Pixel, Samsung)
      md: '768px', // Tablets (iPad Mini, Samsung Tab)
      lg: '1024px', // Large tablets (iPad Pro 11+)
      xl: '1280px', // Foldables, desktop web
    },

    extend: {
      // --------------------------
      // Typography
      // --------------------------
      fontFamily,

      // --------------------------
      // Colors
      // --------------------------
      colors,

      // --------------------------
      // Optional: consistent spacing scale (mobile → tablet)
      // --------------------------
      spacing,

      // --------------------------
      // Optional: responsive typography
      // --------------------------
      fontSize,
    },
  },
  plugins: [],
};
