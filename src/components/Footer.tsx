
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-cityblue-dark text-white p-6 mt-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Smart City</h3>
            <p className="text-sm">
              Helping communities report and solve urban problems together.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/report" className="hover:underline">Report an Issue</Link>
              </li>
              <li>
                <Link to="/my-issues" className="hover:underline">My Issues</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-sm">
              <p>Email: info@smartcity.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-4 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Smart City Issue Detection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
