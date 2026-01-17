import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const resultCode = searchParams.get("resultCode");
  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message");

  const isSuccess = resultCode === "0";

  useEffect(() => {
    // Simulate checking payment status
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (isSuccess) {
      navigate("/customer/order-status-tracking");
    } else {
      navigate("/customer/shopping-cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment Result - Smart Restaurant</title>
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-card border border-border rounded-lg shadow-warm p-8 text-center">
            {isSuccess ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
                  <Icon name="CheckCircle" size={48} className="text-success" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground mb-6">
                  Your payment has been processed successfully. Thank you for
                  your order!
                </p>
                {orderId && (
                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground mb-1">
                      Order ID
                    </p>
                    <p className="text-foreground font-mono font-semibold">
                      {orderId}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/10 mb-6">
                  <Icon name="XCircle" size={48} className="text-error" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Payment Failed
                </h1>
                <p className="text-muted-foreground mb-6">
                  {message || "Something went wrong with your payment. Please try again."}
                </p>
              </>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleContinue}
              className="mb-3"
            >
              {isSuccess ? "View Order Status" : "Try Again"}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate("/customer/menu-browse")}
            >
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentResult;
