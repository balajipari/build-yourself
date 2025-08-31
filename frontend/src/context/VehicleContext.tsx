import React, { createContext, useContext, useState, useEffect } from 'react';
import type { VehicleType } from '../components/common/GlobalVehicleSelect';

interface VehicleContextType {
  vehicleType: VehicleType;
  setVehicleType: (type: VehicleType) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicleType, setVehicleType] = useState<VehicleType>(() => {
    const saved = localStorage.getItem('selectedVehicleType');
    return (saved as VehicleType) || 'bike';
  });

  useEffect(() => {
    localStorage.setItem('selectedVehicleType', vehicleType);
  }, [vehicleType]);

  return (
    <VehicleContext.Provider value={{ vehicleType, setVehicleType }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};
