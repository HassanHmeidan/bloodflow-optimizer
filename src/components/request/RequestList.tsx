
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Search, Building, Users } from "lucide-react";

import {
  BloodRequest,
  BloodRequestStatus,
  PriorityLevel,
  BloodType
} from '@/types/status';

interface RequestListProps {
  requests: BloodRequest[];
  isLoading: boolean;
  onSelectRequest: (id: string) => void;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onFulfillRequest: (id: string) => void;
  onFindDonors: (request: BloodRequest) => void;
}

export const RequestList = ({
  requests,
  isLoading,
  onSelectRequest,
  onApproveRequest,
  onRejectRequest,
  onFulfillRequest,
  onFindDonors
}: RequestListProps) => {
  const [currentTab, setCurrentTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredRequests, setFilteredRequests] = React.useState<BloodRequest[]>([]);

  React.useEffect(() => {
    let filtered = [...requests];
    
    // Filter by tab
    if (currentTab === 'pending') {
      filtered = filtered.filter(req => req.status === 'pending');
    } else if (currentTab === 'approved') {
      filtered = filtered.filter(req => req.status === 'approved');
    } else if (currentTab === 'fulfilled') {
      filtered = filtered.filter(req => req.status === 'fulfilled');
    } else if (currentTab === 'cancelled') {
      filtered = filtered.filter(req => req.status === 'cancelled' || req.status === 'rejected');
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        req => 
          req.blood_type.toLowerCase().includes(query) ||
          req.hospital_name.toLowerCase().includes(query) ||
          req.id.toLowerCase().includes(query) ||
          req.status.toLowerCase().includes(query)
      );
    }
    
    setFilteredRequests(filtered);
  }, [requests, currentTab, searchQuery]);

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'low':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Low</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Medium</span>;
      case 'high':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">High</span>;
      case 'critical':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Critical</span>;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: BloodRequestStatus) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"><Clock className="h-3 w-3" /> Pending</span>;
      case 'approved':
        return <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
      case 'fulfilled':
        return <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"><CheckCircle2 className="h-3 w-3" /> Fulfilled</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"><XCircle className="h-3 w-3" /> Cancelled</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"><AlertTriangle className="h-3 w-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  const renderDonorMatchingButton = (request: BloodRequest) => {
    return (
      <Button 
        size="sm" 
        variant="outline"
        className="flex items-center gap-1"
        onClick={(e) => {
          e.stopPropagation();
          onFindDonors(request);
        }}
      >
        <Users className="h-3.5 w-3.5" />
        Find Donors
      </Button>
    );
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Blood Requests</CardTitle>
            <CardDescription>Manage and track blood requests</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search requests..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Tabs defaultValue="all" onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-bloodRed-600 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No requests found</h3>
            <p className="mt-1 text-muted-foreground">
              {searchQuery ? "Try adjusting your search" : "There are no blood requests that match your criteria"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card 
                key={request.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectRequest(request.id)}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-medium">{request.hospital_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Request #{request.id.substring(0, 8)} • {new Date(request.request_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-bloodRed-50 border border-bloodRed-200 rounded-lg px-3 py-1.5">
                          <span className="text-bloodRed-600 font-semibold">{request.blood_type}</span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Units:</span>{" "}
                          <span className="font-medium">{request.units}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                onApproveRequest(request.id);
                              }}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRejectRequest(request.id);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFulfillRequest(request.id);
                            }}
                          >
                            Mark Fulfilled
                          </Button>
                        )}
                        {(request.priority === 'high' || request.priority === 'critical') && (
                          renderDonorMatchingButton(request)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestList;
