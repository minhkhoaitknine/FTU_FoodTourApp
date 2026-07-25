import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        clay: {
          50: "#fff8ed",
          100: "#ffefcf",
          500: "#d97b28",
          700: "#8b451a"
        },
        leaf: {
          500: "#348f50",
          700: "#1f6c3b"
        },
        ink: "#2c241f"
      },
      boxShadow: {
        panel: "0 18px 60px rgba(62, 39, 20, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;

