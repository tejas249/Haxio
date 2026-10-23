/** Haxio Tailwind preset — add to tailwind.config.js: presets: [require('./brand/colors/tailwind.preset.js')] */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0b0f1a', 700: '#1e2433' },
        flare: { DEFAULT: '#ff6b2c', deep: '#c2410c', 'deep-hover': '#9a3412', tint: '#fff1e8' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Geist', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
};
