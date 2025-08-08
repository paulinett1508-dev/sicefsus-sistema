import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import { UserProvider } from "./context/UserContext.jsx";
import { configureConsole } from "./utils/DisableConsole.jsx";

// Configurar sistema de logs antes de tudo
configureConsole();

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<UserProvider>
			<App />
		</UserProvider>
	</React.StrictMode>,
);
