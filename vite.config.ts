import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            solana: ["@solana/web3.js", "@solana/wallet-adapter-react"],
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
      include: [
        "@solana/web3.js",
        "@solana/wallet-adapter-react",
        "@solana/wallet-adapter-base",
        "@solana/wallet-adapter-react-ui",
      ],
    },
    define: {
      "process.env": env,
    },
  };
});
