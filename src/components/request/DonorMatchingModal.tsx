
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { XCircle, Bell, CircleAlert, Users } from "lucide-react";
import {
  MatchedDonor,
  BloodRequest,
  BloodType,
  PriorityLevel
} from '@/types/status';

// Priority display mapping for UI
const PRIORITY_DISPLAY: Record<PriorityLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

interface DonorMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: BloodRequest | null;
  matchedDonors: MatchedDonor[];
  isMatching: boolean;
  error: string | null;
  onNotifyDonors: (donorIds: string[]) => void;
  onRetryFinding: () => void;
}

export const DonorMatchingModal = ({
  isOpen,
  onClose,
  selectedRequest,
  matchedDonors,
  isMatching,
  error,
  onNotifyDonors,
  onRetryFinding
}: DonorMatchingModalProps) => {
  if (!isOpen || !selectedRequest) return null;

  const renderDonorRow = (donor: MatchedDonor) => {
    return (
      <tr key={donor.id} className="border-t hover:bg-muted/50">
        <td className="px-4 py-3">
          <div className="font-medium">{donor.name}</div>
          {donor.email && (
            <div className="text-xs text-muted-foreground">{donor.email}</div>
          )}
        </td>
        <td className="px-4 py-3">
          <span className="font-mono">{donor.bloodType}</span>
        </td>
        <td className="px-4 py-3">
          {donor.lastDonation === 'Never' 
            ? <span className="text-green-600">Never donated</span> 
            : donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Unknown'}
        </td>
        <td className="px-4 py-3">
          {donor.distance ? `${donor.distance} km` : 'Unknown'}
        </td>
        <td className="px-4 py-3">
          {donor.score}
        </td>
        <td className="px-4 py-3">
          {donor.eligibilityLevel === 'high' && (
            <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">High</span>
          )}
          {donor.eligibilityLevel === 'medium' && (
            <span className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded-full">Medium</span>
          )}
          {donor.eligibilityLevel === 'low' && (
            <span className="bg-red-100 text-red-800 text-xs py-1 px-2 rounded-full">Low</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">Donor Matching</h2>
              <p className="text-muted-foreground">
                Find suitable donors for blood request
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400"
              onClick={onClose}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Request details */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">Request Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Hospital:</span>
                  <span className="font-medium">
                    {selectedRequest.hospital_name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Blood Type:</span>
                  <span className="font-medium">
                    {selectedRequest.blood_type}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Units:</span>
                  <span className="font-medium">
                    {selectedRequest.units}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Priority:</span>
                  <span className="font-medium">
                    {PRIORITY_DISPLAY[selectedRequest.priority]}
                  </span>
                </div>
              </div>
            </div>
            
            {isMatching ? (
              <div className="py-12 text-center">
                <div className="animate-spin h-12 w-12 border-2 border-bloodRed-600 rounded-full border-t-transparent mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Finding matching donors...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <CircleAlert className="h-12 w-12 text-red-500 mx-auto" />
                <h3 className="mt-2 text-lg font-medium">Error finding donors</h3>
                <p className="mt-1 text-muted-foreground">{error}</p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={onRetryFinding}
                >
                  Try Again
                </Button>
              </div>
            ) : matchedDonors.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <h3 className="mt-2 text-lg font-medium">No matching donors found</h3>
                <p className="mt-1 text-muted-foreground">
                  Try expanding your search criteria or check back later
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Matching Donors</h3>
                  <div className="text-sm text-muted-foreground">
                    {matchedDonors.length} donors found
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Donor Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Blood Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Last Donation
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Distance
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Match Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Eligibility
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                      {matchedDonors.map((donor) => renderDonorRow(donor))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => onNotifyDonors(matchedDonors.map(d => d.id))}
                    className="bg-bloodRed-600 hover:bg-bloodRed-700"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notify All Donors
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorMatchingModal;
