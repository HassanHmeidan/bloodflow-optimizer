
import { useState, useEffect } from 'react';
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: string;
};

type ContactInfo = {
  address: string;
  city: string;
  phone: string;
  email: string;
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: "Martyrs' Square, Downtown Beirut",
    city: "Beirut, Lebanon",
    phone: "+961 1 123 456",
    email: "contact@lifeflow.lb"
  });
  
  useEffect(() => {
    // Fetch contact information and social links from Supabase
    const fetchFooterData = async () => {
      try {
        // Try to get app settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('app_settings')
          .select('*')
          .eq('setting_name', 'contact_info')
          .single();
        
        if (!settingsError && settingsData) {
          setContactInfo(settingsData.setting_value as ContactInfo);
        }
        
        // Try to get social links
        const { data: socialData, error: socialError } = await supabase
          .from('app_settings')
          .select('*')
          .eq('setting_name', 'social_links')
          .single();
        
        if (!socialError && socialData && socialData.setting_value) {
          setSocialLinks(socialData.setting_value as SocialLink[]);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
        // Fallback to default social links if database fetch fails
        setSocialLinks([
          { id: '1', platform: 'Facebook', url: '#', icon: 'facebook' },
          { id: '2', platform: 'Twitter', url: '#', icon: 'twitter' },
          { id: '3', platform: 'Instagram', url: '#', icon: 'instagram' },
          { id: '4', platform: 'LinkedIn', url: '#', icon: 'linkedin' }
        ]);
      }
    };

    fetchFooterData();
  }, []);
  
  // Helper function to render the appropriate icon
  const renderSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'facebook':
        return <Facebook size={18} />;
      case 'twitter':
        return <Twitter size={18} />;
      case 'instagram':
        return <Instagram size={18} />;
      case 'linkedin':
        return <Linkedin size={18} />;
      default:
        return <Heart size={18} />;
    }
  };
  
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
              Connecting donors with those in need through innovative technology and compassionate care across Lebanon.
            </p>
            <div className="flex space-x-4">
              {socialLinks.length > 0 ? (
                socialLinks.map(link => (
                  <a 
                    key={link.id}
                    href={link.url} 
                    className="text-gray-500 hover:text-bloodRed-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {renderSocialIcon(link.icon)}
                  </a>
                ))
              ) : (
                <>
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
                </>
              )}
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
                { label: 'FAQs', href: '/about#faqs' },
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
                { label: 'Donor Guidelines', href: '/about#guidelines' },
                { label: 'Blood Types', href: '/about#blood-types' },
                { label: 'Health Information', href: '/about#health-info' },
                { label: 'Donation Process', href: '/donate#process' },
                { label: 'Research', href: '/about#research' },
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
                  {contactInfo.address}<br />
                  {contactInfo.city}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-bloodRed-500 mr-3 flex-shrink-0" />
                <span className="text-gray-600 text-sm">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-bloodRed-500 mr-3 flex-shrink-0" />
                <span className="text-gray-600 text-sm">{contactInfo.email}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} LifeFlow Blood Bank Lebanon. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/about#privacy" className="text-gray-500 hover:text-bloodRed-600 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about#terms" className="text-gray-500 hover:text-bloodRed-600 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/about#cookies" className="text-gray-500 hover:text-bloodRed-600 text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
