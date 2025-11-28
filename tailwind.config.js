const colors = require('./src/components/ui/colors');

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
      fontFamily: {
        inter: ['Inter-Regular'],
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-bold': ['Inter-Bold'],
      },

      // --------------------------
      // Colors
      // --------------------------
      colors,

      // --------------------------
      // Optional: consistent spacing scale (mobile → tablet)
      // --------------------------
      spacing: {
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
      },

      // --------------------------
      // Optional: responsive typography
      // --------------------------
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
      },
    },
  },
  plugins: [],
};
