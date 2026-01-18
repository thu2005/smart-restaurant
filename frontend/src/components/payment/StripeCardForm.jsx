import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Icon from "../AppIcon";

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    },
    hidePostalCode: true
};

const StripeCardForm = ({ clientSecret, amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardholderName, setCardholderName] = useState('');
    const [saveCard, setSaveCard] = useState(false);
    const [cardError, setCardError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!cardholderName.trim()) {
            setCardError('Please enter cardholder name');
            return;
        }

        setIsProcessing(true);
        setCardError('');

        try {
            const cardElement = elements.getElement(CardElement);

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: cardholderName,
                    },
                },
            });

            if (error) {
                setCardError(error.message);
                onError(error);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent);
            }
        } catch (err) {
            setCardError('Payment failed. Please try again.');
            onError(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCardChange = (event) => {
        if (event.error) {
            setCardError(event.error.message);
        } else {
            setCardError('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cardholder Name */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Cardholder Name
                </label>
                <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Mori"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isProcessing}
                />
            </div>

            {/* Card Details */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Card Details
                </label>
                <div className="px-4 py-3 border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary/50">
                    <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardChange}
                    />
                </div>
            </div>

            {/* Card Error */}
            {cardError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Icon name="AlertCircle" size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{cardError}</p>
                </div>
            )}

            {/* Save Card Checkbox */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="save-card"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/50"
                    disabled={isProcessing}
                />
                <label htmlFor="save-card" className="text-sm text-muted-foreground">
                    Save this card for future orders
                </label>
            </div>

            {/* Secure Note */}
            <div className="flex items-start gap-2 p-3 bg-success/5 rounded-lg border border-success/10">
                <Icon name="Shield" size={18} className="text-success flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                    Your payment information is encrypted and secure. We use Stripe for payment processing.
                </p>
            </div>

            {/* Pay Button */}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        Pay {amount.toLocaleString('vi-VN')}₫
                        <Icon name="ArrowRight" size={18} />
                    </>
                )}
            </button>
        </form>
    );
};

export default StripeCardForm;
