/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Vazirmatn', 'system-ui', '-apple-system', 'sans-serif'],
			},
			colors: {
				brand: {
					pink: "#F2A3B3",
					blue: "#4663FF",
					teal: "#0EA5A5",
				},
			},
			boxShadow: {
				card: "0 12px 30px -15px rgba(0,0,0,0.25)",
			},
			borderRadius: {
				pill: "9999px",
			},
		},
	},
	plugins: [require('tailwind-scrollbar-hide')],
};

