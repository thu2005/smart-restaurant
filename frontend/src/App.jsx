import React from "react";
import Routes from "./Routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { CartProvider } from "./contexts/CartContext";
import "./i18n/config";
import { Toaster } from "sonner";
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <CartProvider>
            <Toaster position="top-right" richColors />
            <Routes />
          </CartProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
