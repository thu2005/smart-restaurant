import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const EmptyCartState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20 px-4">
      <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-muted rounded-full flex items-center justify-center mb-6 md:mb-8">
        <Icon name="ShoppingCart" size={48} className="text-muted-foreground" />
      </div>

      <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3 md:mb-4 text-center">
        Your Cart is Empty
      </h2>

      <p className="text-sm md:text-base lg:text-lg text-muted-foreground text-center max-w-md mb-6 md:mb-8">
        Looks like you haven't added any items to your cart yet. Browse our
        delicious menu and start ordering!
      </p>

      <Button
        variant="default"
        size="lg"
        iconName="UtensilsCrossed"
        iconPosition="left"
        onClick={() => navigate("/customer/menu-browse")}
      >
        Browse Menu
      </Button>

      <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl">
        <div className="flex flex-col items-center text-center p-4 bg-card rounded-lg border border-border">
          <Icon name="Clock" size={32} className="text-primary mb-3" />
          <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
            Quick Service
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Orders ready in 20-25 minutes
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-4 bg-card rounded-lg border border-border">
          <Icon name="Star" size={32} className="text-primary mb-3" />
          <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
            Fresh Ingredients
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Made with quality ingredients
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-4 bg-card rounded-lg border border-border">
          <Icon name="Shield" size={32} className="text-primary mb-3" />
          <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
            Secure Payment
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Safe and encrypted transactions
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyCartState;
