import React, { createContext, useContext, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../store/hooks';
import { setIsSidebarCollapsed as reduxSetSidebar, setIsNavbarHidden as reduxSetNavbar } from '../store/uiSlice';

interface UIContextType {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isNavbarHidden: boolean;
  setIsNavbarHidden: (hidden: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { isSidebarCollapsed, isNavbarHidden } = useAppSelector((state) => state.ui);

  const setIsSidebarCollapsed = (collapsed: boolean) => dispatch(reduxSetSidebar(collapsed));
  const setIsNavbarHidden = (hidden: boolean) => dispatch(reduxSetNavbar(hidden));

  return (
    <UIContext.Provider value={{ 
      isSidebarCollapsed, 
      setIsSidebarCollapsed, 
      isNavbarHidden, 
      setIsNavbarHidden 
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
