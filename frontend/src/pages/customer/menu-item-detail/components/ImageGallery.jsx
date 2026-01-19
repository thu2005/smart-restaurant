import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "../../../../components/AppImage";
import Icon from "../../../../components/AppIcon";

const ImageGallery = ({ images }) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images?.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images?.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9] bg-muted rounded-lg md:rounded-xl overflow-hidden mb-3 md:mb-4">
        <Image
          src={images?.[selectedIndex]?.url}
          alt={images?.[selectedIndex]?.alt}
          className="w-full h-full object-cover"
        />

        {images?.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-background/90 hover:bg-background rounded-full flex items-center justify-center transition-smooth shadow-warm touch-target"
              aria-label={t("customer.itemDetail.gallery.previous", "Previous image")}
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-background/90 hover:bg-background rounded-full flex items-center justify-center transition-smooth shadow-warm touch-target"
              aria-label={t("customer.itemDetail.gallery.next", "Next image")}
            >
              <Icon name="ChevronRight" size={20} />
            </button>

            <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-background/90 rounded-full">
              <span className="text-xs md:text-sm font-medium text-foreground data-text">
                {selectedIndex + 1} / {images?.length}
              </span>
            </div>
          </>
        )}
      </div>
      {images?.length > 1 && (
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
          {images?.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-md md:rounded-lg overflow-hidden border-2 transition-smooth
                ${selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
                }
              `}
              aria-label={t("customer.itemDetail.gallery.viewImage", { index: index + 1 })}
            >
              <Image
                src={image?.url}
                alt={image?.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
