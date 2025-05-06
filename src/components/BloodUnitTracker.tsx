
import React from "react";
import { Check, Clock, Droplet, Map, Package, Truck, AlertCircle, X, Heart } from "lucide-react";
import { BloodUnitStatus } from "@/types/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BloodUnitTrackerProps {
  unitId: string;
  status: BloodUnitStatus;
  donationDate: string;
  expiryDate: string;
  currentLocation?: string;
  destinationLocation?: string;
  donor?: string;
  bloodType: string;
}

export const BloodUnitTracker = ({
  unitId,
  status,
  donationDate,
  expiryDate,
  currentLocation,
  destinationLocation,
  donor,
  bloodType,
}: BloodUnitTrackerProps) => {
  const statusSteps: {[key in BloodUnitStatus]: number} = {
    "collected": 1,
    "stored": 2,
    "tested": 3,
    "available": 4,
    "reserved": 5,
    "in_transit": 6,
    "delivered": 7,
    "used": 8,
    "expired": -1,
    "discarded": -1
  };

  const currentStep = statusSteps[status];
  const isTerminalState = currentStep === -1;

  const getStatusIcon = (step: BloodUnitStatus) => {
    switch (step) {
      case "collected":
        return <Droplet className="h-5 w-5" />;
      case "stored":
        return <Package className="h-5 w-5" />;
      case "tested":
        return <Clock className="h-5 w-5" />;
      case "available":
        return <Check className="h-5 w-5" />;
      case "reserved":
        return <Clock className="h-5 w-5" />;
      case "in_transit":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <Map className="h-5 w-5" />;
      case "used":
        return <Heart className="h-5 w-5" />;
      case "expired":
        return <AlertCircle className="h-5 w-5" />;
      case "discarded":
        return <X className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>Blood Unit #{unitId.slice(0, 8)}</div>
          <div className="text-sm font-normal text-gray-500">
            Type: <span className="font-semibold text-bloodRed-600">{bloodType}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status indicator */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Current Status: <span className={`${isTerminalState ? 'text-red-500' : 'text-green-600'}`}>{status.replace('_', ' ').toUpperCase()}</span></div>
              {isTerminalState && <div className="text-xs text-red-500 font-medium">Terminal State</div>}
            </div>
            
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div style={{ width: isTerminalState ? "100%" : `${(currentStep / 8) * 100}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    isTerminalState ? "bg-red-500" : "bg-green-500"
                  }`}>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${status === 'collected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusIcon("collected")}
                </div>
                <span className="text-xs mt-1">Collected</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${status === 'tested' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusIcon("tested")}
                </div>
                <span className="text-xs mt-1">Tested</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${status === 'available' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusIcon("available")}
                </div>
                <span className="text-xs mt-1">Available</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${status === 'in_transit' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusIcon("in_transit")}
                </div>
                <span className="text-xs mt-1">In Transit</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${status === 'used' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusIcon("used")}
                </div>
                <span className="text-xs mt-1">Used</span>
              </div>
            </div>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Donation Date</p>
              <p className="font-medium">{new Date(donationDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Expiry Date</p>
              <p className="font-medium">{new Date(expiryDate).toLocaleDateString()}</p>
            </div>
            {currentLocation && (
              <div>
                <p className="text-gray-500">Current Location</p>
                <p className="font-medium">{currentLocation}</p>
              </div>
            )}
            {destinationLocation && (
              <div>
                <p className="text-gray-500">Destination</p>
                <p className="font-medium">{destinationLocation}</p>
              </div>
            )}
            {donor && (
              <div>
                <p className="text-gray-500">Donor</p>
                <p className="font-medium">{donor}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodUnitTracker;
