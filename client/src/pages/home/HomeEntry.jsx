import { useAuth } from "../../hooks/useAuth";
import Home from "./Home.jsx";
import PublicHome from "./PublicHome.jsx";

export default function HomeEntry() {
  const { user } = useAuth();
  return user ? <Home /> : <PublicHome />;
}
