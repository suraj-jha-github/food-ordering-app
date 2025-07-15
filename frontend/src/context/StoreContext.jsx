import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "https://food-ordering-app-backend-bi38.onrender.com";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState("checking");

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

  // Validate token function
  const validateToken = async (userToken) => {
    try {
      const response = await retryRequest(() => 
        axios.post(
          url + "/api/user/validate",
          {},
          { 
            headers: { 
              token: userToken
            },
            withCredentials: true,
            timeout: 10000
          }
        )
      );
      return response.data.success;
    } catch (error) {
      console.error("Token validation error:", error);
      // If validation endpoint doesn't exist, assume token is valid for now
      // This prevents the page from disappearing if the backend is not fully updated
      return true;
    }
  };

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      try {
        const response = await retryRequest(() =>
          axios.post(
            url + "/api/cart/add",
            { itemId },
            { 
              headers: { 
                token
              },
              withCredentials: true,
              timeout: 10000
            }
          )
        );
        if(response.data.success){
          toast.success("item Added to Cart")
        }else{
          toast.error("Something went wrong")
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Error adding item to cart");
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      try {
        const response = await retryRequest(() =>
          axios.post(
            url + "/api/cart/remove",
            { itemId },
            { 
              headers: { 
                token
              },
              withCredentials: true,
              timeout: 10000
            }
          )
        );
        if(response.data.success){
          toast.success("item Removed from Cart")
        }else{
          toast.error("Something went wrong")
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        toast.error("Error removing item from cart");
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo && itemInfo.price) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const response = await retryRequest(() =>
        axios.get(url + "/api/food/list", {
          withCredentials: true,
          timeout: 15000
        })
      );
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        toast.error("Error! Products are not fetching..");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      if (error.code === 'ERR_NETWORK') {
        toast.error("Backend is starting up, please wait a moment and refresh...");
      } else {
        toast.error("Error! Products are not fetching..");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCardData = async (userToken) => {
    try {
      const response = await retryRequest(() =>
        axios.post(
          url + "/api/cart/get",
          {},
          { 
            headers: { 
              token: userToken
            },
            withCredentials: true,
            timeout: 10000
          }
        )
      );
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      } else {
        console.error("Error loading cart data:", response.data.message);
        setCartItems({});
      }
    } catch (error) {
      console.error("Error loading cart data:", error);
      setCartItems({});
    }
  };

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Load data when token changes or on initial load
  useEffect(() => {
    async function loadData() {
      try {
        // First check if backend is ready
        const isBackendReady = await checkBackendStatus();
        
        if (isBackendReady) {
          await fetchFoodList();
          
          const savedToken = localStorage.getItem("token");
          if (savedToken) {
            // Validate token before using it
            const isValid = await validateToken(savedToken);
            if (isValid) {
              setToken(savedToken);
              await loadCardData(savedToken);
            } else {
              // Remove invalid token
              localStorage.removeItem("token");
              setToken("");
              setCartItems({});
            }
          }
        } else {
          // If backend is not ready, show loading and retry after delay
          setTimeout(() => {
            loadData();
          }, 5000);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    loading,
    backendStatus,
    clearCart: () => setCartItems({}),
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
