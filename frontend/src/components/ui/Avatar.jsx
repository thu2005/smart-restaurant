import React from "react";

const Avatar = ({ user, size = "md", className = "", showBorder = false }) => {
  // Size configurations
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const getUserInitials = (user) => {
    if (!user) return "U";
    const name = user.fullName || user.name || "User";
    return name.charAt(0).toUpperCase();
  };

  const baseClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    bg-primary/10 
    flex items-center justify-center 
    text-primary 
    font-bold 
    overflow-hidden
    ${showBorder ? "border border-primary-200" : ""}
    ${className}
  `;

  return (
    <div className={baseClasses.trim()}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.fullName || user.name || "User"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.parentElement.querySelector('.avatar-initials').classList.remove('hidden');
            e.target.remove();
          }}
        />
      ) : null}
      <div
        className={`
        avatar-initials
        w-full h-full flex items-center justify-center 
        ${textSizeClasses[size]} 
        ${user?.avatar ? "hidden" : ""}
      `}
      >
        {getUserInitials(user)}
      </div>
    </div>
  );
};

export default Avatar;
