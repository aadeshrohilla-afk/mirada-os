import type { Config } from "tailwindcss";
const config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { mirada: { purple: "#522b78", "purple-dark": "#3d1f5a", "purple-light": "#c49ec8" } } } },
  plugins: [],
};
export default config;
