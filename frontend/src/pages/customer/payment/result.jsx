import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentResult = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');
    
    const isSuccess = resultCode === '0';
    
    useEffect(() => {
        // Simulate loading and show toast
        setTimeout(() => {
            setIsLoading(false);
            if (isSuccess) {
                toast.success('Payment Successful!', {
                    description: 'Your payment has been processed successfully.',
                    duration: 5000
                });
            } else {
                toast.error('Payment Failed', {
                    description: message || 'Your payment could not be processed.',
                    duration: 5000
                });
            }
        }, 1000);
    }, [isSuccess, message]);
    
    const handleContinue = () => {
        if (isSuccess) {
            navigate('/customer/order-status-tracking');
        } else {
            navigate('/customer/shopping-cart');
        }
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex items-center justify-center p-4">
                <Helmet>
                    <title>Processing Payment - Smart Restaurant</title>
                </Helmet>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
                    <p className="text-lg text-muted-foreground">Processing your payment...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 flex items-center justify-center p-4">
            <Helmet>
                <title>{isSuccess ? 'Payment Successful' : 'Payment Failed'} - Smart Restaurant</title>
            </Helmet>
            
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                    isSuccess ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                    <Icon 
                        name={isSuccess ? 'CheckCircle' : 'XCircle'} 
                        size={48} 
                        className={isSuccess ? 'text-success' : 'text-destructive'}
                    />
                </div>
                
                {/* Title */}
                <h1 className={`text-3xl font-bold mb-3 ${
                    isSuccess ? 'text-success' : 'text-destructive'
                }`}>
                    {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                </h1>
                
                {/* Message */}
                <p className="text-muted-foreground mb-2">
                    {isSuccess 
                        ? 'Your payment has been processed successfully.'
                        : 'We could not process your payment.'
                    }
                </p>
                
                {message && !isSuccess && (
                    <p className="text-sm text-muted-foreground mb-6 p-3 bg-destructive/5 rounded-lg">
                        {message}
                    </p>
                )}
                
                {orderId && (
                    <p className="text-sm text-muted-foreground mb-6">
                        Order ID: <span className="font-mono font-semibold">{orderId}</span>
                    </p>
                )}
                
                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        onClick={handleContinue}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="lg"
                    >
                        {isSuccess ? (
                            <>
                                <Icon name="ClipboardCheck" size={20} />
                                View Order Status
                            </>
                        ) : (
                            <>
                                <Icon name="ArrowLeft" size={20} />
                                Back to Cart
                            </>
                        )}
                    </Button>
                    
                    <Button
                        onClick={() => navigate('/customer/menu')}
                        variant="outline"
                        className="w-full"
                        size="lg"
                    >
                        <Icon name="UtensilsCrossed" size={20} />
                        Browse Menu
                    </Button>
                </div>
                
                {/* Footer */}
                <p className="mt-6 text-xs text-muted-foreground">
                    Need help? Contact our staff for assistance.
                </p>
            </div>
        </div>
    );
};

export default PaymentResult;
