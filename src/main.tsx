import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import './index.css'

import App from './App.tsx'
import EditOrder from "./Admin/EditOrder.tsx"
import AddOrder from "./Admin/AddOrder.tsx"      
import Tables from "./Admin/Tables.tsx"
import Tax from "./Admin/Tax.tsx"
import MenuPage from "./Admin/MenuPage.tsx"
import ReservationsPage from "./Admin/ReservationsPage.tsx"
import AdminLogin from "./Admin/AdminLogin.tsx"
import Logout from "./Admin/Logout.tsx";
import AdminUsers from "./Admin/AdminUsers.tsx";
import OrderScanner from "./Admin/OrderScanner.tsx";
import Offers from "./Admin/Offers.tsx";
import Banner from "./Admin/Banner.tsx";
import BusinessAnalytics from "./Admin/BusinessAnalytics.tsx";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<App />} />

          {/* FIXED: no wrapper needed */}
          <Route path="/edit-order/:id" element={<EditOrder />} />

          <Route path="/add-order" element={<AddOrder />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/tax" element={<Tax />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/check-reservations" element={<ReservationsPage />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/scanner" element={<OrderScanner />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/banners" element={<Banner />} />
          <Route path="/analytics" element={<BusinessAnalytics />} />

        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
          }
