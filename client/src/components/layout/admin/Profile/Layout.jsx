import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f0c29] px-5 py-12 text-white sm:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin"
          className="mb-6 inline-block text-sm text-[#00ff85] hover:underline"
        >
          ← Admin dashboard
        </Link>
        {children}
      </div>
    </div>
  );
}
