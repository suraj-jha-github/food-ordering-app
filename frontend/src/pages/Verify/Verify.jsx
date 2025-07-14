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
                
                // Redirect to myorders immediately
                console.log("Redirecting to myorders...");
                navigate("/myorders", { replace: true });
            } else {
                setVerificationStatus('Payment verification failed');
                toast.error(response.data.message || "Payment verification failed");
                navigate("/", { replace: true });
            }
        } catch (error) {
            console.error("Verify payment error:", error);
            setVerificationStatus('Error verifying payment');
            
            // Handle specific error types
            if (error.response) {
                console.error("Error response:", error.response.data);
                toast.error(error.response.data.message || "Payment verification failed");
            } else if (error.request) {
                console.error("No response received:", error.request);
                toast.error("Network error. Please try again.");
            } else {
                console.error("Error setting up request:", error.message);
                toast.error("Something went wrong with payment verification");
            }
            
            navigate("/", { replace: true });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        console.log("Verify page loaded with:", { success, orderId, token });
        
        // Check if user is logged in first
        if (!token) {
            console.log("User not logged in, redirecting to home");
            toast.error("Please login to view your orders");
            navigate("/", { replace: true });
            return;
        }
        
        if (success && orderId) {
            verifyPayment();
        } else {
            console.log("Invalid parameters:", { success, orderId });
            setVerificationStatus('Invalid payment verification parameters');
            toast.error("Invalid payment verification parameters");
            navigate("/", { replace: true });
        }
    }, []); // Empty dependency array to run only once

    return (
        <div className='verify'>
            <div className="verify-container">
                <div className="spinner"></div>
                <p>Verifying your payment...</p>
                {verificationStatus && <p className="status-message">{verificationStatus}</p>}
                {loading && <p>Please wait while we process your order...</p>}
                <div className="debug-info" style={{fontSize: '12px', color: '#999', marginTop: '20px'}}>
                    <p>Debug: success={success}, orderId={orderId}</p>
                </div>
                {!loading && verificationStatus === 'Payment verified successfully!' && (
                    <button 
                        onClick={() => navigate("/myorders", { replace: true })}
                        style={{
                            background: 'tomato',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        Go to My Orders
                    </button>
                )}
            </div>
        </div>
    )
}

export default Verify
