import React, { useEffect, useState } from "react";

interface MenuItem {
  code: string;
  icon: string;
  isActive: boolean;
  menuID: number;
  order: number;
  parentID: number | null;
  title: string;
  url: string;
}

const ApiResponsePage: React.FC = () => {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]); // To track expanded menus

  useEffect(() => {
    const storedData = sessionStorage.getItem("menuTitles");
    console.log("Raw Data from sessionStorage:", storedData);
    if (storedData) {
      try {
        const parsedData: MenuItem[] = JSON.parse(storedData);
        console.log("Parsed Menu Data:", parsedData);
        setMenuData(parsedData);
      } catch (error) {
        console.error("Error parsing menu data:", error);
      }
    } else {
      console.warn("No menu data found in sessionStorage.");
    }
  }, []);

  // Toggle visibility of submenus
  const toggleMenu = (menuID: number) => {
    setExpandedMenus((prev) =>
      prev.includes(menuID) ? prev.filter((id) => id !== menuID) : [...prev, menuID]
    );
  };

  const renderMenu = (parentID: number | null): JSX.Element[] => {
    const childMenus = menuData.filter((menu) => menu.parentID === parentID);

    return childMenus.map((menu) => (
      <div key={menu.menuID} style={{ marginLeft: parentID ? "20px" : "0" }}>
        {/* Main Menu or Submenu */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "10px",
            margin: "5px 0",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => toggleMenu(menu.menuID)}
        >
          <div>
            <strong>{menu.title}</strong>
          </div>
          {/* Dropdown indicator */}
          {menuData.some((child) => child.parentID === menu.menuID) && (
            <span>{expandedMenus.includes(menu.menuID) ? "▼" : "▶"}</span>
          )}
        </div>
        {/* Render Submenus if Expanded */}
        {expandedMenus.includes(menu.menuID) && renderMenu(menu.menuID)}
      </div>
    ));
  };

  return (
    <div style={{ padding: "20px" }}>
     
      {menuData.length > 0 ? (
        renderMenu(null) // Start with null for main menus
      ) : (
        <p>No menu data available to display.</p>
      )}
    </div>
  );
};

export default ApiResponsePage;
