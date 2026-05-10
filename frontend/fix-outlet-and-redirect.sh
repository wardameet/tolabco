#!/bin/bash
# Remove duplicate imports and ensure clean App.jsx
sed -i '/import OutletDashboard/d' src/App.jsx
sed -i '/import AdminPanel/a import OutletDashboard from "./pages/OutletDashboard";' src/App.jsx
# Add route if not present
grep -q 'outlet-dashboard' src/App.jsx || sed -i '/<Route path="\/admin"/a \        <Route path="/outlet-dashboard" element={<OutletDashboard />} />' src/App.jsx
# Update Layout navigation
grep -q 'Outlet Dashboard' src/components/Layout.jsx || sed -i '/{ name: "Admin Panel",/a \    { name: "Outlet Dashboard", path: "/outlet-dashboard", roles: ["outlet"] },' src/components/Layout.jsx
# Role-based redirection in Login.jsx
sed -i '/navigate(. /);/c\      if (data.user.role === "student") navigate("/jobs"); else if (data.user.role === "employer") navigate("/employer-dashboard"); else if (data.user.role === "outlet") navigate("/outlet-dashboard"); else if (data.user.role === "admin") navigate("/admin"); else navigate("/");' src/pages/Login.jsx
# Rebuild
npm run build && sudo systemctl reload nginx
