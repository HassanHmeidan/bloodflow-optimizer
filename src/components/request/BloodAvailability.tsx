
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { BloodType, BLOOD_TYPES } from '@/types/status';

interface BloodAvailabilityProps {
  // Optional inventory data prop that would come from an API call
  inventory?: Record<BloodType, number>;
}

export const BloodAvailability = ({ inventory }: BloodAvailabilityProps) => {
  // If no inventory is provided, use mock data
  const bloodInventory = inventory || BLOOD_TYPES.reduce((acc, type) => {
    acc[type] = Math.floor(Math.random() * 20);
    return acc;
  }, {} as Record<BloodType, number>);

  const getBloodLevelClass = (units: number) => {
    if (units >= 10) return "bg-green-500";
    if (units >= 5) return "bg-yellow-500";
    if (units > 0) return "bg-red-500";
    return "bg-gray-300";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Blood Availability</CardTitle>
        <CardDescription>Available units by blood type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BLOOD_TYPES.map((type) => (
            <div key={type} className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-bloodRed-600">{type}</div>
              <div className="text-3xl font-bold mt-2">
                {bloodInventory[type]}
              </div>
              <div className="text-sm text-gray-500 mt-1">units</div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Legend:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Sufficient (10+ units)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span>Low (5-9 units)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>Critical (&lt;5 units)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
              <span>No units available</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </CardFooter>
    </Card>
  );
};

export default BloodAvailability;
