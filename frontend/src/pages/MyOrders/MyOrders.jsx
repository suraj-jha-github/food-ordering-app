import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { 
          headers: { 
            token,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      if (response.data.success) {
        setData(response.data.data);
        console.log("Orders fetched successfully:", response.data.data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      toast.error("Please login to view your orders");
      navigate("/");
    }
  }, [token]);

  const handleTrackOrder = (orderId) => {
    toast.info("Order tracking feature coming soon!");
  };

  if (loading) {
    return (
      <div className="my-orders">
        <h2>Orders</h2>
        <div className="container">
          <div className="loading-message">Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.length === 0 ? (
          <div className="no-orders">
            <p>No orders found</p>
            <button onClick={() => navigate("/")}>Start Shopping</button>
          </div>
        ) : (
          data.map((order, index) => {
            return (
              <div key={index} className="my-orders-order">
                <img src={assets.parcel_icon} alt="" />
                <p>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return item.name + " X " + item.quantity;
                    } else {
                      return item.name + " X " + item.quantity + ",";
                    }
                  })}
                </p>
                <p>${order.amount}.00</p>
                <p>items: {order.items.length}</p>
                <p>
                  <span>&#x25cf;</span>
                  <b> {order.status}</b>
                </p>
                <button onClick={() => handleTrackOrder(order._id)}>Track Order</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyOrders;
