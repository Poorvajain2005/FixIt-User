
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 to-black">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
