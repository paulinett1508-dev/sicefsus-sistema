import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";

  console.log("🔍 Modo atual:", mode);
  console.log("🔍 Variáveis Firebase carregadas:", {
    VITE_FIREBASE_PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY
      ? "***carregada***"
      : "❌ não encontrada",
  });

  return {
    plugins: [react()],

    // 🚀 PROXY PARA ADMIN API
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.log("🔌 [PROXY ERROR]:", err.message);
            });
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log("🔌 [PROXY]:", req.method, req.url);
            });
          },
        },
      },
    },

    // 🚀 PROXY TAMBÉM NO PREVIEW (PRODUÇÃO)
    preview: {
      port: 4173,
      host: true,
      // ✅ CORREÇÃO: SPA routing para deploy estático
      historyApiFallback: true,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      sourcemap: false,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          },
        },
      },
    },
  };
});
