import { createContext, useContext, useMemo, useState } from "react";

const BrowseContext = createContext(null);

export function BrowseProvider({ children }) {
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("price-low");

  const value = useMemo(() => ({
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
  }), [searchText, categoryFilter, sortOrder]);

  return (
    <BrowseContext.Provider value={value}>
      {children}
    </BrowseContext.Provider>
  );
}

export function useBrowse() {
  const context = useContext(BrowseContext);
  if (!context) {
    throw new Error("useBrowse must be used within a BrowseProvider.");
  }
  return context;
}
