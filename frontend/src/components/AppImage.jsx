import React from "react";

function Image({ src, alt = "Image Name", className = "", ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        // Prevent infinite loop if fallback also fails
        if (e.target.src !== window.location.origin + "/assets/images/no_image.svg") {
          e.target.src = "/assets/images/no_image.svg";
        }
      }}
      {...props}
    />
  );
}

export default Image;
