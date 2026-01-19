import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCardForm from './StripeCardForm';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

const StripePaymentWrapper = ({ clientSecret, amount, onSuccess, onError }) => {
    if (!clientSecret) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                Loading payment form...
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret, locale: 'en' }}>
            <StripeCardForm
                clientSecret={clientSecret}
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
            />
        </Elements>
    );
};

export default StripePaymentWrapper;
