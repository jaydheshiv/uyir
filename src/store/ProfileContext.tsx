import React, { createContext, useContext, useState, ReactNode } from 'react';

type ProfileContextType = {
  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfileContext must be used within ProfileProvider');
  return context;
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  return (
    <ProfileContext.Provider value={{ acceptedTerms, setAcceptedTerms }}>
      {children}
    </ProfileContext.Provider>
  );
};