import React from "react";
import Routes from "./Routes";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <CartProvider>
      <Routes />
    </CartProvider>
  );
}

export default App;
