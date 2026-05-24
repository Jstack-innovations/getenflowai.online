import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import './index.css'

import App from './App.tsx'


import TrialSignup from "./Admin/Plans/TrialSignup.tsx";
import CheckoutPage from "./Admin/Plans/CheckoutPage.tsx";
import SubscriptionPayment from "./Admin/Plans/SubscriptionPayment.tsx";
import SubscriptionSuccess from "./Admin/Plans/SubscriptionSuccess.tsx";


const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<App />} />

          <Route path="/trial-signup" element={<TrialSignup />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/subscription-payment" element={<SubscriptionPayment />} />
          <Route path="/subscriptionSuccess" element={<SubscriptionSuccess />} />
          
          
          
          <Route path="/kds" element={<Kds />} />


        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
          }
