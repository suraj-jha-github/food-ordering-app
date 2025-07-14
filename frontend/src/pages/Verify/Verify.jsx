import React, { useContext, useEffect, useState } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from "react-toastify";

const Verify = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const verifyPayment = async () => {
        try {
            console.log("Verifying payment with:", { success, orderId });
            
            const response = await axios.post(url + "/api/order/verify", 
                { success, orderId },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            
            console.log("Verify response:", response.data);
            
            if (response.data.success) {
                toast.success("Order Placed Successfully!");
                setTimeout(() => {
                    navigate("/myorders");
                }, 2000);
            } else {
                toast.error(response.data.message || "Payment verification failed");
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }
        } catch (error) {
            console.error("Verify payment error:", error);
            toast.error("Something went wrong with payment verification");
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (success && orderId) {
            verifyPayment();
        } else {
            toast.error("Invalid payment verification parameters");
            setTimeout(() => {
                navigate("/");
            }, 2000);
        }
    }, [success, orderId]);

    return (
        <div className='verify'>
            <div className="verify-container">
                <div className="spinner"></div>
                <p>Verifying your payment...</p>
                {loading && <p>Please wait while we process your order...</p>}
            </div>
        </div>
    )
}

export default Verify
