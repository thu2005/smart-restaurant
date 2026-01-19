import React from "react";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/ui/Input";

const SpecialInstructions = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
        {t("customer.itemDetail.specialInstructions.title")}
      </h3>
      <Input
        type="text"
        placeholder={t("customer.itemDetail.specialInstructions.placeholder")}
        value={value}
        onChange={(e) => onChange(e?.target?.value)}
        description={t("customer.itemDetail.specialInstructions.description")}
        className="w-full"
      />
    </div>
  );
};

export default SpecialInstructions;
