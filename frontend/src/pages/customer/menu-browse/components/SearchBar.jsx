import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";
import Input from "../../../../components/ui/Input";

const SearchBar = ({ onSearch, placeholder, value }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState(value || "");

  // Sync with parent value if provided (e.g. restored state or reset)
  useEffect(() => {
    if (value !== undefined) {
      setSearchValue(value);
    }
  }, [value]);

  // Use passed placeholder or default translated one
  const inputPlaceholder = placeholder || t("customer.menu.search.placeholder");

  const handleSearch = (e) => {
    const newVal = e?.target?.value;
    setSearchValue(newVal);
    onSearch(newVal);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon name="Search" size={20} color="var(--color-muted-foreground)" />
      </div>
      <Input
        type="search"
        placeholder={inputPlaceholder}
        value={searchValue}
        onChange={handleSearch}
        className="pl-10 pr-10"
      />
      {searchValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-smooth"
          aria-label={t("common.actions.clear", "Clear search")}
        >
          <Icon name="X" size={18} color="var(--color-muted-foreground)" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
