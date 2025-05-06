
import React from 'react';
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { BloodRequestFlow } from '@/components/BloodRequestFlow';
import { BloodRequest } from '@/types/status';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodRequest | null;
}

export const RequestDetailModal = ({ isOpen, onClose, request }: RequestDetailModalProps) => {
  if (!isOpen || !request) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold">Request Details</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400"
              onClick={onClose}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <BloodRequestFlow 
              requestId={request.id}
              hospitalName={request.hospital_name}
              bloodType={request.blood_type}
              units={request.units}
              priority={request.priority}
              status={request.status}
              requestDate={request.request_date}
              approvalDate={request.approval_date}
              fulfillmentDate={request.fulfillment_date}
            />
            
            {request.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Additional Notes:</h3>
                <div className="bg-muted p-4 rounded-md text-sm">
                  {request.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
