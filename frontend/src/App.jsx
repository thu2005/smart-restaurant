import React from "react";
import Routes from "./Routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./i18n/config"; // Initialize i18n

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
