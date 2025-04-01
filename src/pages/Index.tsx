
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BloodInventory } from "@/components/BloodInventory";
import { 
  Heart, 
  Search, 
  ArrowRight, 
  UserPlus,
  Droplet,
  BarChart3,
  Activity,
  MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { getTargetedDonorRecommendations } from '@/lib/predictiveDemand';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [donorRecommendation, setDonorRecommendation] = useState('');
  const [filteredLatestDonations, setFilteredLatestDonations] = useState([]);
  const [filteredPendingRequests, setFilteredPendingRequests] = useState([]);
  const [showAllTables, setShowAllTables] = useState(false);
  
  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const recommendation = await getTargetedDonorRecommendations(null);
        setDonorRecommendation(recommendation);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      }
    };
    
    fetchRecommendation();
  }, []);

  const latestDonations = [
    { id: 1, donor: 'John Smith', bloodType: 'O+', amount: '450ml', date: '2023-06-15' },
    { id: 2, donor: 'Maria Garcia', bloodType: 'A-', amount: '450ml', date: '2023-06-14' },
    { id: 3, donor: 'Robert Chen', bloodType: 'B+', amount: '450ml', date: '2023-06-13' },
  ];

  const pendingRequests = [
    { id: 1, hospital: 'General Hospital', bloodType: 'O-', units: 3, urgency: 'High', status: 'Pending' },
    { id: 2, hospital: 'St. Mary\'s', bloodType: 'AB+', units: 1, urgency: 'Medium', status: 'Approved' },
    { id: 3, hospital: 'Community Medical', bloodType: 'B-', units: 2, urgency: 'Low', status: 'Needed' },
  ];

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredLatestDonations([]);
      setFilteredPendingRequests([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Filter donations
    const donations = latestDonations.filter(
      donation => 
        donation.donor.toLowerCase().includes(query) || 
        donation.bloodType.toLowerCase().includes(query)
    );
    
    // Filter requests
    const requests = pendingRequests.filter(
      request => 
        request.hospital.toLowerCase().includes(query) || 
        request.bloodType.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query)
    );

    setFilteredLatestDonations(donations);
    setFilteredPendingRequests(requests);
    
    if (donations.length === 0 && requests.length === 0) {
      toast({
        title: "No results found",
        description: "Try a different search term",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Search results",
        description: `Found ${donations.length} donations and ${requests.length} requests`,
      });
    }
  };

  // Handle button clicks
  const handleButtonClick = (action) => {
    switch (action) {
      case 'registerDonor':
        window.location.href = '/donate';
        break;
      case 'requestBlood':
        window.location.href = '/request';
        break;
      case 'viewInventory':
        window.location.href = '/dashboard/inventory';
        break;
      case 'donationHistory':
        window.location.href = '/dashboard/donors';
        break;
      default:
        break;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 10 }
    }
  };

  // Toggle for authenticated users or admin to see tables
  const toggleTables = () => {
    setShowAllTables(!showAllTables);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <section className="py-12 bg-gradient-to-r from-bloodRed-500 to-bloodRed-700 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-full md:w-1/2">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl font-bold mb-4">
                  Donate Blood, Save Lives
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-xl text-white/90 mb-6">
                  {donorRecommendation || "Join our network of donors and help save lives. One donation can save up to three lives."}
                </motion.p>
                
                <div className="relative w-full max-w-md">
                  <Input
                    type="text"
                    placeholder="Search for blood availability, donors, or requests..."
                    className="pr-10 w-full border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:border-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button 
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <motion.div 
                className="w-full md:w-1/2 space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-xl font-semibold mb-2">Quick Action Buttons</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.div variants={itemVariants}>
                    <Button 
                      className="w-full justify-start bg-white text-bloodRed-600 hover:bg-gray-100"
                      onClick={() => handleButtonClick('registerDonor')}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register as Donor
                    </Button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button 
                      className="w-full justify-start bg-white text-bloodRed-600 hover:bg-gray-100"
                      onClick={() => handleButtonClick('requestBlood')}
                    >
                      <Droplet className="mr-2 h-4 w-4" />
                      Request Blood
                    </Button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                      onClick={() => handleButtonClick('viewInventory')}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Blood Inventory
                    </Button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                      onClick={() => handleButtonClick('donationHistory')}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Donation History
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Search Results */}
        {(filteredLatestDonations.length > 0 || filteredPendingRequests.length > 0) && (
          <section className="py-6 bg-white border-b">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-4">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredLatestDonations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Matching Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Donor</TableHead>
                            <TableHead>Blood Type</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLatestDonations.map((donation) => (
                            <TableRow key={donation.id}>
                              <TableCell className="font-medium">{donation.donor}</TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center justify-center bg-bloodRed-100 text-bloodRed-800 font-medium rounded-full px-2 py-1 text-xs">
                                  {donation.bloodType}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
                
                {filteredPendingRequests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Matching Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Hospital</TableHead>
                            <TableHead>Blood Type</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPendingRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">{request.hospital}</TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center justify-center bg-bloodRed-100 text-bloodRed-800 font-medium rounded-full px-2 py-1 text-xs">
                                  {request.bloodType}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium
                                  ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                    request.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                                    'bg-blue-100 text-blue-800'}`}>
                                  {request.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        )}
        
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Blood Stock Overview</h2>
              <Button
                variant="outline"
                size="sm"
                className="text-bloodRed-600 border-bloodRed-200 hover:bg-bloodRed-50"
                onClick={() => handleButtonClick('viewInventory')}
              >
                View Detailed Inventory <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
            <BloodInventory simpleView={true} />
          </div>
        </section>
        
        {/* Only show tables for authenticated users or admin */}
        <div className="container mx-auto px-4 py-4 flex justify-center">
          <Button 
            variant="ghost" 
            onClick={toggleTables}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showAllTables ? "Hide Detailed Information" : "Show Detailed Information"}
          </Button>
        </div>
        
        {showAllTables && (
          <section className="py-8 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Donations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Donor</TableHead>
                          <TableHead>Blood Type</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestDonations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell className="font-medium">{donation.donor}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center bg-bloodRed-100 text-bloodRed-800 font-medium rounded-full px-2 py-1 text-xs">
                                {donation.bloodType}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 text-right">
                      <Link to="/dashboard" className="text-sm text-bloodRed-600 hover:text-bloodRed-800 font-medium">
                        View all donations <ArrowRight className="inline h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Blood Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hospital</TableHead>
                          <TableHead>Blood Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.hospital}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center bg-bloodRed-100 text-bloodRed-800 font-medium rounded-full px-2 py-1 text-xs">
                                {request.bloodType}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium
                                ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                  request.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                                  'bg-blue-100 text-blue-800'}`}>
                                {request.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 text-right">
                      <Link to="/dashboard/requests" className="text-sm text-bloodRed-600 hover:text-bloodRed-800 font-medium">
                        View all requests <ArrowRight className="inline h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}
        
        <section className="py-16 bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Heart className="h-16 w-16 mx-auto mb-4 text-white" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Save Lives?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Your donation can save up to three lives. Join our community of donors today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/donate">
                  <Button className="bg-white text-bloodRed-600 hover:bg-gray-100 font-medium px-6 py-2">
                    Become a Donor
                  </Button>
                </Link>
                <Link to="/request">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-bloodRed-700/50 font-medium px-6 py-2">
                    Request Blood
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
