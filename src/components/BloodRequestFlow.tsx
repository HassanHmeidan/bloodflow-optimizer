
import React from "react";
import { BloodRequestStatus } from "@/types/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, X, AlertCircle, Truck } from "lucide-react";

interface BloodRequestFlowProps {
  requestId: string;
  hospitalName: string;
  bloodType: string;
  units: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: BloodRequestStatus;
  requestDate: string;
  approvalDate?: string;
  fulfillmentDate?: string;
}

export const BloodRequestFlow = ({
  requestId,
  hospitalName,
  bloodType,
  units,
  priority,
  status,
  requestDate,
  approvalDate,
  fulfillmentDate,
}: BloodRequestFlowProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: BloodRequestStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'fulfilled':
        return <Truck className="h-5 w-5 text-green-700" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-gray-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusStep = () => {
    switch (status) {
      case 'pending': return 1;
      case 'approved': return 2;
      case 'fulfilled': return 3;
      case 'cancelled': case 'rejected': return -1;
      default: return 0;
    }
  };

  const statusStep = getStatusStep();
  const isTerminalNegative = status === 'cancelled' || status === 'rejected';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>Request #{requestId.slice(0, 8)}</div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(priority)}`}>
            {priority.toUpperCase()} PRIORITY
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                {getStatusIcon(status)}
                {status.toUpperCase()}
              </span>
              <span className="text-sm">
                {bloodType} • {units} unit{units > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div style={{ width: isTerminalNegative ? "100%" : `${(statusStep / 3) * 100}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    isTerminalNegative ? "bg-red-500" : "bg-green-500"
                  }`}>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${statusStep >= 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-xs mt-1">Requested</span>
                <span className="text-xs text-gray-500">{new Date(requestDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${statusStep >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-xs mt-1">Approved</span>
                {approvalDate && <span className="text-xs text-gray-500">{new Date(approvalDate).toLocaleDateString()}</span>}
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${statusStep >= 3 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-xs mt-1">Fulfilled</span>
                {fulfillmentDate && <span className="text-xs text-gray-500">{new Date(fulfillmentDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
          
          <div className="text-sm mt-4">
            <p className="text-gray-500">Requested by</p>
            <p className="font-medium">{hospitalName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodRequestFlow;
