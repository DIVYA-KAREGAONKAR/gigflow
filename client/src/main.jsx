import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App'
import './index.css'
// client/src/main.jsx
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const initialOptions = {
  "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: "USD", // Use "USD" for sandbox testing
  intent: "capture",
};



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
     <PayPalScriptProvider options={initialOptions}>
    <App />
  </PayPalScriptProvider>
    </BrowserRouter>
  </React.StrictMode>
)
