import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 🔧 CARREGAMENTO CORRETO DAS VARIÁVEIS DE AMBIENTE
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";

  console.log("🔍 Modo atual:", mode);
  console.log("🔍 Variáveis Firebase carregadas:", {
    VITE_FIREBASE_PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY
      ? "***carregada***"
      : "não encontrada",
  });

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },

    // 🔧 CONFIGURAÇÃO CRÍTICA: Definir variáveis explicitamente
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      // 🚨 IMPORTANTE: Forçar inclusão das variáveis Firebase
      __VITE_FIREBASE_PROJECT_ID__: JSON.stringify(
        env.VITE_FIREBASE_PROJECT_ID,
      ),
      __VITE_FIREBASE_API_KEY__: JSON.stringify(env.VITE_FIREBASE_API_KEY),
      __VITE_FIREBASE_AUTH_DOMAIN__: JSON.stringify(
        env.VITE_FIREBASE_AUTH_DOMAIN,
      ),
      __VITE_FIREBASE_STORAGE_BUCKET__: JSON.stringify(
        env.VITE_FIREBASE_STORAGE_BUCKET,
      ),
      __VITE_FIREBASE_MESSAGING_SENDER_ID__: JSON.stringify(
        env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      ),
      __VITE_FIREBASE_APP_ID__: JSON.stringify(env.VITE_FIREBASE_APP_ID),
    },

    build: {
      sourcemap: false,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction
            ? [
                "console.log",
                "console.info",
                "console.debug",
                "console.warn",
                "console.error",
                "console.trace",
                "console.table",
                "console.time",
                "console.timeEnd",
              ]
            : [],
          passes: 2,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
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
    server: {
      port: 5173,
      host: true,
    },
    esbuild: {
      drop: isProduction ? ["console", "debugger"] : [],
      legalComments: "none",
    },

    // 🔧 CONFIGURAÇÃO ADICIONAL: Garantir que .env seja lido
    envDir: "./",
    envPrefix: "VITE_",
  };
});
