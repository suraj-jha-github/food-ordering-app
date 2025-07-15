import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const StoreContextProvider = (props) => {
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const url = "https://food-ordering-app-backend-bi38.onrender.com";

  // Retry function for API calls
  const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && (error.code === 'ERR_NETWORK' || error.response?.status >= 500)) {
        console.log(`Request failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  };

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(url + "/ping", {
        timeout: 5000,
        withCredentials: true
      });
      setBackendStatus("online");
      return true;
    } catch (error) {
      console.log("Backend not ready, will retry...");
      setBackendStatus("offline");
      return false;
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        // Check backend status first
        await checkBackendStatus();
        
        if (localStorage.getItem("token")) {
          setToken(localStorage.getItem("token"));
        }
        if (localStorage.getItem("admin")) {
          setAdmin(localStorage.getItem("admin"));
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    token,
    setToken,
    admin,
    setAdmin,
    backendStatus,
    url,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
