import React from "react";
import Routes from "./Routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import "./i18n/config";
import { Toaster } from "sonner";
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <Toaster position="top-right" richColors />
          <Routes />
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
