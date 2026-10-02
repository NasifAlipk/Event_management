import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-5 text-center">
      <div>
        <p className="text-sm font-bold text-brand-600">
          404
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Page not found
        </h1>

        <Link
          to="/"
          className="mt-5 inline-block text-brand-600 underline"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}