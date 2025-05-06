
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useAIDonorMatching } from '@/hooks/useAIDonorMatching';

// Import refactored components
import RequestForm from './request/RequestForm';
import BloodAvailability from './request/BloodAvailability';
import RequestList from './request/RequestList';
import RequestDetailModal from './request/RequestDetailModal';
import DonorMatchingModal from './request/DonorMatchingModal';

// Import types
import { 
  BloodRequestStatus, 
  BloodType, 
  PriorityLevel, 
  Hospital, 
  BloodRequest
} from '@/types/status';

export const HospitalRequestDashboard = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showDonorMatching, setShowDonorMatching] = useState(false);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    findMatchingDonors, 
    matchedDonors, 
    notifyDonors, 
    isLoading: isMatching, 
    error 
  } = useAIDonorMatching();
  
  // Fetch hospitals and blood requests
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch hospitals
        const { data: hospitalsData, error: hospitalsError } = await supabase
          .from('hospitals')
          .select('id, name')
          .eq('status', 'active');
          
        if (hospitalsError) throw hospitalsError;
        setHospitals(hospitalsData);
        
        // Fetch blood requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('blood_requests')
          .select(`
            id,
            hospital_id,
            blood_type,
            units,
            priority,
            status,
            request_date,
            approval_date,
            fulfillment_date,
            notes
          `)
          .order('request_date', { ascending: false });
          
        if (requestsError) throw requestsError;
        
        // Get hospital names
        const requestsWithHospitals = await Promise.all(requestsData.map(async (request) => {
          const { data: hospital } = await supabase
            .from('hospitals')
            .select('name')
            .eq('id', request.hospital_id)
            .single();
            
          return {
            ...request,
            hospital_name: hospital?.name || 'Unknown Hospital',
            blood_type: request.blood_type as BloodType,
            priority: request.priority as PriorityLevel,
            status: request.status as BloodRequestStatus
          } as BloodRequest;
        }));
        
        setRequests(requestsWithHospitals);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up realtime subscription for requests
    const channel = supabase
      .channel('blood-requests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'blood_requests' 
      }, () => {
        fetchData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({
          status: 'approved',
          approval_date: new Date().toISOString(),
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success("Request approved");
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as BloodRequestStatus, approval_date: new Date().toISOString() } 
          : req
      ));
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };
  
  const handleFulfillRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({
          status: 'fulfilled',
          fulfillment_date: new Date().toISOString(),
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success("Request fulfilled");
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'fulfilled' as BloodRequestStatus, fulfillment_date: new Date().toISOString() } 
          : req
      ));
    } catch (error) {
      console.error("Error fulfilling request:", error);
      toast.error("Failed to fulfill request");
    }
  };
  
  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({
          status: 'rejected',
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success("Request rejected");
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as BloodRequestStatus } 
          : req
      ));
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const handleFindDonors = (request: BloodRequest) => {
    // Fix the deep instantiation error by explicitly typing the parameters
    const params = {
      bloodType: request.blood_type,
      location: { latitude: 0, longitude: 0 },
      unitsNeeded: request.units
    };
    
    findMatchingDonors(params);
    
    setSelectedRequest(request.id);
    setShowDonorMatching(true);
    setShowRequestDetail(false);
  };

  const handleViewRequestDetails = (requestId: string) => {
    setSelectedRequest(requestId);
    setShowRequestDetail(true);
    setShowDonorMatching(false);
  };

  const handleNotifySelectedDonors = async (selectedDonorIds: string[]) => {
    if (!selectedRequest) return;
    
    const request = requests.find(r => r.id === selectedRequest);
    if (!request) return;
    
    try {
      const success = await notifyDonors(selectedDonorIds, {
        requestId: request.id,
        bloodType: request.blood_type,
        units: request.units,
        urgency: request.priority,
        hospitalName: request.hospital_name
      });
      
      if (success) {
        setShowDonorMatching(false);
        toast.success("Notifications sent to selected donors");
      }
    } catch (error) {
      console.error("Error notifying donors:", error);
      toast.error("Failed to notify donors", {
        description: "Please try again later."
      });
    }
  };

  const handleRequestSubmitted = (
    requestId: string, 
    priority: PriorityLevel, 
    bloodType: BloodType, 
    units: number, 
    hospitalId: string
  ) => {
    // If high or critical priority, find matching donors immediately
    if (priority === 'high' || priority === 'critical') {
      // Find the hospital name
      const hospital = hospitals.find(h => h.id === hospitalId);
      
      // Fix the deep instantiation error by explicitly typing the parameters
      const params = {
        bloodType: bloodType,
        location: { latitude: 0, longitude: 0 },
        unitsNeeded: units
      };
      
      findMatchingDonors(params);
      
      // Show AI matching dialog
      setSelectedRequest(requestId);
      setShowDonorMatching(true);
    }
  };

  const selectedRequestDetails = selectedRequest ? requests.find(r => r.id === selectedRequest) || null : null;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* New Request Form */}
        <RequestForm 
          hospitals={hospitals} 
          onRequestSubmitted={handleRequestSubmitted} 
        />
        
        {/* Blood Type Availability Card */}
        <BloodAvailability />
      </div>
      
      {/* Blood Request List */}
      <RequestList 
        requests={requests}
        isLoading={isLoading}
        onSelectRequest={handleViewRequestDetails}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
        onFulfillRequest={handleFulfillRequest}
        onFindDonors={handleFindDonors}
      />
      
      {/* Request Detail Modal */}
      <RequestDetailModal 
        isOpen={showRequestDetail} 
        onClose={() => setShowRequestDetail(false)} 
        request={selectedRequestDetails}
      />

      {/* Donor Matching Modal */}
      <DonorMatchingModal 
        isOpen={showDonorMatching}
        onClose={() => setShowDonorMatching(false)}
        selectedRequest={selectedRequestDetails}
        matchedDonors={matchedDonors}
        isMatching={isMatching}
        error={error}
        onNotifyDonors={handleNotifySelectedDonors}
        onRetryFinding={() => {
          if (selectedRequestDetails) {
            // Fix the deep instantiation error by explicitly typing the parameters
            const params = {
              bloodType: selectedRequestDetails.blood_type,
              location: { latitude: 0, longitude: 0 },
              unitsNeeded: selectedRequestDetails.units
            };
            
            findMatchingDonors(params);
          }
        }}
      />
    </div>
  );
};
