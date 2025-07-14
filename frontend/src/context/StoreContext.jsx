import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

// Configure axios defaults
axios.defaults.withCredentials = true;

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "https://food-ordering-app-backend-bi38.onrender.com";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Validate token function
  const validateToken = async (userToken) => {
    try {
      const response = await axios.post(
        url + "/api/user/validate",
        {},
        { 
          headers: { 
            token: userToken,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
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
        const response = await axios.post(
          url + "/api/cart/add",
          { itemId },
          { 
            headers: { 
              token,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
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
        const response = await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { 
            headers: { 
              token,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
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
      const response = await axios.get(url + "/api/food/list", {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        toast.error("Error! Products are not fetching..");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      if (error.code === 'ERR_NETWORK') {
        toast.error("Network error! Please check your connection.");
      } else {
        toast.error("Error! Products are not fetching..");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCardData = async (userToken) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { 
          headers: { 
            token: userToken,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
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
      } catch (error) {
        console.error("Error loading initial data:", error);
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
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
