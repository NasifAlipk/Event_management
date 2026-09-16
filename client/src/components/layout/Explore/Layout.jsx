import Header from "../../home/Header";

export default function ExploreLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0d1418] text-white">
      <Header />
      {children}
    </div>
  );
}
