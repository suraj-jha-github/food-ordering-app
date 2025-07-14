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
    const { url, token, clearCart } = useContext(StoreContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState('');

    const verifyPayment = async () => {
        try {
            console.log("Verifying payment with:", { success, orderId });
            setVerificationStatus('Verifying payment...');
            
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
                setVerificationStatus('Payment verified successfully!');
                toast.success("Order Placed Successfully!");
                
                // Clear cart after successful payment
                clearCart();
                localStorage.removeItem("cartItems");
                
                // Redirect to myorders after a short delay
                setTimeout(() => {
                    console.log("Redirecting to myorders...");
                    navigate("/myorders", { replace: true });
                }, 1500);
            } else {
                setVerificationStatus('Payment verification failed');
                toast.error(response.data.message || "Payment verification failed");
                setTimeout(() => {
                    navigate("/", { replace: true });
                }, 2000);
            }
        } catch (error) {
            console.error("Verify payment error:", error);
            setVerificationStatus('Error verifying payment');
            toast.error("Something went wrong with payment verification");
            setTimeout(() => {
                navigate("/", { replace: true });
            }, 2000);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        console.log("Verify page loaded with:", { success, orderId });
        
        if (success && orderId) {
            verifyPayment();
        } else {
            console.log("Invalid parameters:", { success, orderId });
            setVerificationStatus('Invalid payment verification parameters');
            toast.error("Invalid payment verification parameters");
            setTimeout(() => {
                navigate("/", { replace: true });
            }, 2000);
        }
    }, [success, orderId]);

    // Check if user is logged in
    useEffect(() => {
        if (!token) {
            console.log("User not logged in, redirecting to home");
            toast.error("Please login to view your orders");
            navigate("/", { replace: true });
        }
    }, [token, navigate]);

    return (
        <div className='verify'>
            <div className="verify-container">
                <div className="spinner"></div>
                <p>Verifying your payment...</p>
                {verificationStatus && <p className="status-message">{verificationStatus}</p>}
                {loading && <p>Please wait while we process your order...</p>}
            </div>
        </div>
    )
}

export default Verify
