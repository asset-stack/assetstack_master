// Standalone marketing-site entry point.
// Mounts ONLY the public marketing pages (no dashboard, no auth gate).
// Build with:  vite build --config vite.marketing.config.js
// Output:      dist-marketing/  (deploy this behind WordPress)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/index.css';

import Landing from '@/pages/Landing';
import Product from '@/pages/Product';
import Solutions from '@/pages/Solutions';
import Industries from '@/pages/Industries';
import LandingCompliance from '@/pages/LandingCompliance.jsx';
import Contact from '@/pages/Contact';

function MarketingApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Landing" element={<Landing />} />
        <Route path="/Product" element={<Product />} />
        <Route path="/Solutions" element={<Solutions />} />
        <Route path="/Industries" element={<Industries />} />
        <Route path="/LandingCompliance" element={<LandingCompliance />} />
        <Route path="/Contact" element={<Contact />} />
        {/* Anything else falls back to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MarketingApp />);