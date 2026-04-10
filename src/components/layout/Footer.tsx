import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand & Social */}
          <div className="space-y-8 text-center md:text-left">
            <Link
              to="/"
              className="flex items-center justify-center md:justify-start"
            >
              <span className="text-2xl font-bold gradient-text">
                Visiondrill
              </span>
            </Link>
            <p className="text-gray-500 text-base">
              Navigate your career journey with confidence and clarity. Discover
              opportunities that align with your skills and aspirations.
            </p>
            <div className="flex space-x-6 justify-center md:justify-start">
              {/* Facebook */}
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Section */}
          <nav aria-label="Footer navigation" className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:mt-0 lg:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Platform */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  Platform
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/jobs" className="text-base text-gray-500 hover:text-gray-900">
                      Browse Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-base text-gray-500 hover:text-gray-900">
                      Post a Job
                    </Link>
                  </li>
                </ul>
              </div>
              {/* Account */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  Account
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/login" className="text-base text-gray-500 hover:text-gray-900">
                      Log In
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-base text-gray-500 hover:text-gray-900">
                      Sign Up
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-base text-gray-500 hover:text-gray-900">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-500 text-center">
              &copy; {new Date().getFullYear()} Visiondrill. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
