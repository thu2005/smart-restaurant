import React, { useState } from "react";
import Icon from "../AppIcon";
import Button from "../ui/Button";
import Select from "../ui/Select";

const KitchenDisplayNav = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const filterOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
  ];

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleNavVisibility = () => {
    setIsHidden(!isHidden);
  };

  return (
    <>
      <nav className={`kitchen-nav-bar ${isHidden ? "hidden" : ""}`}>
        <div className="kitchen-nav-bar-content">
          <div className="kitchen-nav-section">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <Icon name="ChefHat" size={20} color="var(--color-primary)" />
              </div>
              <span className="text-lg font-heading font-semibold text-foreground">
                Kitchen Display
              </span>
            </div>

            <div className="hidden md:block ml-8">
              <Select
                options={filterOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Filter orders"
                className="w-48"
              />
            </div>
          </div>

          <div className="kitchen-nav-section">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-foreground">Live</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              iconName={soundEnabled ? "Volume2" : "VolumeX"}
              onClick={toggleSound}
              className="touch-target"
              aria-label={
                soundEnabled ? "Mute notifications" : "Unmute notifications"
              }
            />

            <Button
              variant="ghost"
              size="icon"
              iconName="Settings"
              className="touch-target"
              aria-label="Settings"
            />
          </div>
        </div>
      </nav>

      <button
        onClick={toggleNavVisibility}
        className="fixed top-2 right-2 z-[101] p-2 bg-card rounded-md shadow-warm hover:bg-muted transition-smooth touch-target"
        aria-label={isHidden ? "Show navigation" : "Hide navigation"}
      >
        <Icon name={isHidden ? "ChevronDown" : "ChevronUp"} size={20} />
      </button>

      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-card rounded-full shadow-warm-lg px-4 py-2">
        <Select
          options={filterOptions}
          value={filterStatus}
          onChange={setFilterStatus}
          placeholder="Filter"
          className="w-32"
        />
      </div>
    </>
  );
};

export default KitchenDisplayNav;
