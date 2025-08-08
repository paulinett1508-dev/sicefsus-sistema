// Arquivo: src/utils/DisableConsole.jsx
// Adicione este import no seu main.jsx ou App.jsx

export const disableConsoleInProduction = () => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENV === "production") {
    const noop = () => {};

    // Desabilitar todos os métodos do console
    console.log = noop;
    console.info = noop;
    console.warn = noop;
    console.error = noop;
    console.debug = noop;
    console.trace = noop;
    console.table = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.group = noop;
    console.groupEnd = noop;
    console.groupCollapsed = noop;
    console.assert = noop;
    console.clear = noop;
    console.count = noop;
    console.countReset = noop;
    console.dir = noop;
    console.dirxml = noop;
    console.profile = noop;
    console.profileEnd = noop;
    console.timeLog = noop;
    console.timeStamp = noop;

    // Também desabilitar no window.console
    if (window.console) {
      Object.keys(window.console).forEach((key) => {
        if (typeof window.console[key] === "function") {
          window.console[key] = noop;
        }
      });
    }
  }
};

// Como usar no main.jsx:
// import { disableConsoleInProduction } from './utils/DisableConsole';
// disableConsoleInProduction();
