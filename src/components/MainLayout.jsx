import { Outlet } from "react-router-dom";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

export default function MainLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <div className="app-orb app-orb-one" />
      <div className="app-orb app-orb-two" />
      <div className="app-orb app-orb-three" />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
