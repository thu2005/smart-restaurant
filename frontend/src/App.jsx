import React from "react";
import Routes from "./Routes";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "sonner";

function App() {
  return (
    <CartProvider>
      <Toaster position="top-right" richColors />
      <Routes />
    </CartProvider>
  );
}

export default App;
