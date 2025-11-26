import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import liff from '@line/liff';

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LiffContextType {
  isLiffInitialized: boolean;
  isLoggedIn: boolean;
  isInLiffClient: boolean;
  profile: LiffProfile | null;
  error: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const LiffContext = createContext<LiffContextType | undefined>(undefined);

const LIFF_ID = import.meta.env.VITE_LIFF_ID || '';

export function LiffProvider({ children }: { children: ReactNode }) {
  const [isLiffInitialized, setIsLiffInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInLiffClient, setIsInLiffClient] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      if (!LIFF_ID) {
        console.warn('LIFF_ID is not set. LIFF features will be disabled.');
        setIsLoading(false);
        return;
      }

      try {
        await liff.init({ liffId: LIFF_ID });
        setIsLiffInitialized(true);
        setIsInLiffClient(liff.isInClient());

        // Check if user is logged in
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
          await fetchProfile();
        } else if (liff.isInClient()) {
          // Auto login if in LIFF client (LINE app)
          liff.login();
        }
      } catch (err) {
        console.error('LIFF initialization failed:', err);
        setError(err instanceof Error ? err.message : 'LIFF initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, []);

  const fetchProfile = async () => {
    try {
      const liffProfile = await liff.getProfile();
      setProfile({
        userId: liffProfile.userId,
        displayName: liffProfile.displayName,
        pictureUrl: liffProfile.pictureUrl,
        statusMessage: liffProfile.statusMessage,
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  };

  const login = () => {
    if (isLiffInitialized && !isLoggedIn) {
      liff.login();
    }
  };

  const logout = () => {
    if (isLiffInitialized && isLoggedIn) {
      liff.logout();
      setIsLoggedIn(false);
      setProfile(null);
      window.location.reload();
    }
  };

  return (
    <LiffContext.Provider
      value={{
        isLiffInitialized,
        isLoggedIn,
        isInLiffClient,
        profile,
        error,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider');
  }
  return context;
}
