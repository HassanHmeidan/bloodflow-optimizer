
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <Heart className="h-6 w-6 text-bloodRed-600 mr-2" />
              <span className="text-xl font-semibold">LifeFlow</span>
            </Link>
            <p className="text-gray-600 text-sm">
              Connecting donors with those in need through innovative technology and compassionate care.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-bloodRed-600 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-bloodRed-600 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-bloodRed-600 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-500 hover:text-bloodRed-600 transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about' },
                { label: 'Donate Blood', href: '/donate' },
                { label: 'Request Blood', href: '/request' },
                { label: 'FAQs', href: '/faqs' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-gray-600 hover:text-bloodRed-600 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Donor Guidelines', href: '/guidelines' },
                { label: 'Blood Types', href: '/blood-types' },
                { label: 'Health Information', href: '/health-info' },
                { label: 'Donation Process', href: '/process' },
                { label: 'Research', href: '/research' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-gray-600 hover:text-bloodRed-600 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-bloodRed-500 mr-3 flex-shrink-0" />
                <span className="text-gray-600 text-sm">
                  123 Medical Center Ave, Suite 500<br />
                  San Francisco, CA 94143
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-bloodRed-500 mr-3 flex-shrink-0" />
                <span className="text-gray-600 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-bloodRed-500 mr-3 flex-shrink-0" />
                <span className="text-gray-600 text-sm">contact@lifeflow.org</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} LifeFlow Blood Bank. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-500 hover:text-bloodRed-600 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-bloodRed-600 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-500 hover:text-bloodRed-600 text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
