export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp <= now) {
        // Token expired, clear localStorage
        logout();
        return false;
      }
      
      return true;
    } catch (e) {
      // Invalid token, clear localStorage
      logout();
      return false;
    }
  };
  export const getToken = () => {
    return localStorage.getItem("token");
  };
  
  export const getUserId = () => {
    return localStorage.getItem("user_id");
  };
  
  export const logout = () => {
    console.log("🔄 Logout function called - clearing all data");
    
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
    
    // Clear any other cached data
    sessionStorage.clear();
    
    // Force clear any cached user data
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    
    // Dispatch custom event to notify components about logout
    console.log("🔄 Dispatching logout event");
    window.dispatchEvent(new CustomEvent('logout'));
    
    // Force a small delay to ensure all components receive the event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('auth-change'));
    }, 100);
  };
  
  export const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      
      // Return time left in seconds (negative if expired)
      return payload.exp - now;
    } catch (e) {
      return -1; // Invalid token
    }
  };
  
  // Check if user is still connected to server
  export const checkServerConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/health", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };
  
  