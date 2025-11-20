/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#050507",
                card: "rgba(255, 255, 255, 0.03)",
                primary: "#8b5cf6",
                secondary: "#3b82f6",
                risk: "#ef4444",
                success: "#22c55e",
            }
        },
    },
    plugins: [],
}
