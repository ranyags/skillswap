import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, logout, checkTokenExpiration, checkServerConnection } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  login: (token: string, userData: any) => void;
  logoutUser: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();

    // Listen for logout events
    const handleLogout = () => {
      console.log("🔄 Logout event received in AuthContext");
      setIsLoggedIn(false);
      setUser(null);
      navigate('/'); // Redirect to homepage instead of login
    };

    window.addEventListener('logout', handleLogout);

    // Check token expiration every minute
    const tokenCheckInterval = setInterval(() => {
      const timeLeft = checkTokenExpiration();
      if (timeLeft !== false && timeLeft <= 0) {
        logoutUser();
      } else if (timeLeft !== false && timeLeft <= 300) { // 5 minutes warning
        console.warn('⚠️ Session will expire in', Math.floor(timeLeft / 60), 'minutes');
      }
    }, 60000); // Check every minute

    // Check server connection every 30 seconds
    const connectionCheckInterval = setInterval(async () => {
      if (isLoggedIn) {
        const isConnected = await checkServerConnection();
        if (!isConnected) {
          console.warn('⚠️ Server connection lost, logging out...');
          logoutUser();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('logout', handleLogout);
      clearInterval(tokenCheckInterval);
      clearInterval(connectionCheckInterval);
    };
  }, [isLoggedIn, navigate]);

  const checkAuth = () => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    
    if (authenticated) {
      // Try to get user data from localStorage
      const storedUserData = localStorage.getItem("user_data");
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
        } catch (error) {
          // Fallback to basic user data if JSON parsing fails
          const userId = localStorage.getItem("user_id");
          const userRole = localStorage.getItem("user_role");
          if (userId) {
            setUser({ 
              id: userId, 
              role: userRole || 'user'
            });
          }
        }
      } else {
        // Fallback to basic user data
        const userId = localStorage.getItem("user_id");
        const userRole = localStorage.getItem("user_role");
        if (userId) {
          setUser({ 
            id: userId, 
            role: userRole || 'user'
          });
        }
      }
    } else {
      // Clear user state if not authenticated
      setUser(null);
    }
    
    return authenticated;
  };

  const login = (token: string, userData: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user_id", userData.id.toString());
    localStorage.setItem("user_role", userData.role);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logoutUser = () => {
    console.log("🔄 Logout initiated");
    // Clear state immediately
    setIsLoggedIn(false);
    setUser(null);
    
    logout(); // This will also dispatch the logout event and clear localStorage
    
    // Redirect to homepage instead of login page
    navigate('/', { replace: true });
  };

  const value = {
    isLoggedIn,
    user,
    login,
    logoutUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 