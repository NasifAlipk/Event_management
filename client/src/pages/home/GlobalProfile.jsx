import { useAuth } from "../../hooks/useAuth";
import UserProfile from "./UserProfile";
import OrganizerProfile from "./OrganizerProfile";

export default function GlobalProfile() {
  const { user } = useAuth();
  return user?.role === "ORGANIZER" ? <OrganizerProfile /> : <UserProfile />;
}
