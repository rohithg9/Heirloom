/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['Playfair Display', 'Georgia', 'serif'],
                sans: ['Manrope', 'system-ui', 'sans-serif'],
                handwriting: ['Caveat', 'cursive'],
            },
            colors: {
                // Heirloom Palette
                ivory: {
                    DEFAULT: '#F9F7F2',
                    50: '#FDFBF7',
                    100: '#F9F7F2',
                    200: '#F0EBE0',
                    300: '#E5E0D6',
                },
                charcoal: {
                    DEFAULT: '#2C2420',
                    light: '#5D5550',
                    muted: '#8C8580',
                },
                sage: {
                    DEFAULT: '#6B8E7D',
                    light: '#8AAA9C',
                    dark: '#4A6B5A',
                },
                emerald: {
                    DEFAULT: '#2E5C55',
                    dark: '#244A44',
                    light: '#3A746B',
                },
                amber: {
                    DEFAULT: '#D4A373',
                    light: '#E5C4A8',
                },
                rose: {
                    DEFAULT: '#A55F5F',
                    light: '#C08080',
                },
                // Shadcn compatibility
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                organic: '2rem 1rem 2rem 1rem',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(44, 36, 32, 0.08)',
                'deep': '0 20px 40px -4px rgba(44, 36, 32, 0.12)',
                'glow': '0 0 30px rgba(46, 92, 85, 0.2)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'pulse-slow': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.8, transform: 'scale(1.05)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'fade-in': {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'fade-in': 'fade-in 0.5s ease-out forwards',
            },
        }
    },
    plugins: [require("tailwindcss-animate")],
};
