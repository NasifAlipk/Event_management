import { Route, Routes } from "react-router-dom";

import { adminRoutes } from "./routes/admin/AdminRoutes.jsx";
import { authRoutes } from "./routes/auth/AuthRoutes.jsx";
import { userRoutes } from "./routes/user/UserRoutes.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PublicHome from "./pages/home/PublicHome.jsx";

export default function App() {
  return (
    <Routes>
      {authRoutes}
      {adminRoutes}
      {userRoutes}
      <Route path="/" element={<PublicHome />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
