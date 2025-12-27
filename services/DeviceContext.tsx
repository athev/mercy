import React, { createContext, useContext, ReactNode } from 'react';
import { IDeviceService } from '../types';
import { deviceSdk, MockDeviceService } from './deviceSdk';

// Context Definition
interface DeviceContextType {
  deviceService: IDeviceService;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// Provider Component
interface DeviceProviderProps {
  children: ReactNode;
  // Optional: Allows injecting a different service (e.g., RealDeviceService) for testing or prod
  serviceOverride?: IDeviceService; 
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children, serviceOverride }) => {
  // Default to the mock singleton, or use the override
  const service = serviceOverride || deviceSdk;

  return (
    <DeviceContext.Provider value={{ deviceService: service }}>
      {children}
    </DeviceContext.Provider>
  );
};

// Hook for consuming the service
export const useDeviceService = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceService must be used within a DeviceProvider');
  }
  return context.deviceService;
};