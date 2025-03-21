
// This is a placeholder for actual ML models in the future
// In a real implementation, this would connect to a Python backend with ML models

import { toast } from "sonner";

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

type DemandForecast = {
  bloodType: BloodType;
  shortTermDemand: number; // Expected demand in next 7 days
  mediumTermDemand: number; // Expected demand in next 30 days
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
};

type InventoryLevel = {
  bloodType: BloodType;
  currentUnits: number;
  optimalUnits: number;
  expiringWithin7Days: number;
};

// Simulated AI forecast (in a real system, this would call a Python ML model)
export const getPredictiveDemand = async (): Promise<DemandForecast[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real system, this would be the result of a machine learning model
  // analyzing historical data, seasonal patterns, upcoming surgeries, etc.
  return [
    {
      bloodType: 'O-',
      shortTermDemand: 45,
      mediumTermDemand: 180,
      urgencyLevel: 'critical',
      lastUpdated: new Date()
    },
    {
      bloodType: 'O+',
      shortTermDemand: 65,
      mediumTermDemand: 240,
      urgencyLevel: 'high',
      lastUpdated: new Date()
    },
    {
      bloodType: 'A+',
      shortTermDemand: 55,
      mediumTermDemand: 210,
      urgencyLevel: 'medium',
      lastUpdated: new Date()
    },
    {
      bloodType: 'A-',
      shortTermDemand: 25,
      mediumTermDemand: 100,
      urgencyLevel: 'medium',
      lastUpdated: new Date()
    },
    {
      bloodType: 'B+',
      shortTermDemand: 30,
      mediumTermDemand: 120,
      urgencyLevel: 'low',
      lastUpdated: new Date()
    },
    {
      bloodType: 'B-',
      shortTermDemand: 15,
      mediumTermDemand: 60,
      urgencyLevel: 'medium',
      lastUpdated: new Date()
    },
    {
      bloodType: 'AB+',
      shortTermDemand: 10,
      mediumTermDemand: 40,
      urgencyLevel: 'low',
      lastUpdated: new Date()
    },
    {
      bloodType: 'AB-',
      shortTermDemand: 5,
      mediumTermDemand: 20,
      urgencyLevel: 'high',
      lastUpdated: new Date()
    }
  ];
};

export const getCurrentInventory = async (): Promise<InventoryLevel[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real system, this would come from a database
  return [
    { bloodType: 'O-', currentUnits: 15, optimalUnits: 50, expiringWithin7Days: 3 },
    { bloodType: 'O+', currentUnits: 45, optimalUnits: 70, expiringWithin7Days: 8 },
    { bloodType: 'A+', currentUnits: 50, optimalUnits: 60, expiringWithin7Days: 12 },
    { bloodType: 'A-', currentUnits: 20, optimalUnits: 30, expiringWithin7Days: 5 },
    { bloodType: 'B+', currentUnits: 35, optimalUnits: 35, expiringWithin7Days: 7 },
    { bloodType: 'B-', currentUnits: 10, optimalUnits: 20, expiringWithin7Days: 2 },
    { bloodType: 'AB+', currentUnits: 15, optimalUnits: 15, expiringWithin7Days: 3 },
    { bloodType: 'AB-', currentUnits: 5, optimalUnits: 10, expiringWithin7Days: 1 }
  ];
};

// Generate donor recommendations based on inventory and predicted demand
export const getTargetedDonorRecommendations = async (bloodType: BloodType | null): Promise<string> => {
  try {
    const inventory = await getCurrentInventory();
    const demand = await getPredictiveDemand();
    
    if (!bloodType) {
      // Find the most needed blood type
      const criticalTypes = demand
        .filter(d => d.urgencyLevel === 'critical' || d.urgencyLevel === 'high')
        .sort((a, b) => {
          const aInv = inventory.find(i => i.bloodType === a.bloodType);
          const bInv = inventory.find(i => i.bloodType === b.bloodType);
          
          if (!aInv || !bInv) return 0;
          
          // Calculate inventory-to-demand ratio (lower is more critical)
          const aRatio = aInv.currentUnits / a.shortTermDemand;
          const bRatio = bInv.currentUnits / b.shortTermDemand;
          
          return aRatio - bRatio;
        });
      
      if (criticalTypes.length > 0) {
        bloodType = criticalTypes[0].bloodType;
      } else {
        bloodType = 'O-'; // Default to universal donor if nothing is critical
      }
    }
    
    const targetDemand = demand.find(d => d.bloodType === bloodType);
    const targetInventory = inventory.find(i => i.bloodType === bloodType);
    
    if (!targetDemand || !targetInventory) {
      return "We need donors of all blood types. Please consider donating today!";
    }
    
    if (targetInventory.currentUnits < targetInventory.optimalUnits * 0.3) {
      return `We urgently need ${bloodType} donors. Our inventory is critically low and patients' lives depend on these donations.`;
    } else if (targetInventory.currentUnits < targetInventory.optimalUnits * 0.7) {
      return `${bloodType} blood is in high demand. Your donation would help us meet patient needs in the coming days.`;
    } else if (targetInventory.expiringWithin7Days > targetInventory.currentUnits * 0.3) {
      return `We have ${bloodType} units that will expire soon. New fresh donations would help maintain our supply.`;
    } else {
      return `Our ${bloodType} supply is currently stable, but regular donations help us stay prepared for emergencies.`;
    }
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return "We always need blood donors of all types. Your donation can save up to three lives!";
  }
};

// Function to notify donors based on AI recommendations
export const notifyEligibleDonors = async (bloodType: BloodType): Promise<void> => {
  try {
    // In a real system, this would filter donors by blood type and eligibility date
    // and send them personalized notifications via email/SMS/push
    
    const message = await getTargetedDonorRecommendations(bloodType);
    
    // Simulate success
    toast.success(`Notifications sent to eligible ${bloodType} donors`, {
      description: `Message: ${message.substring(0, 60)}...`,
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    toast.error("Failed to send donor notifications", {
      description: "Please try again later.",
    });
  }
};
