import { Outlet } from "react-router-dom";
import AgentSidebar from "../components/AgentSidebar";

const Layout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{ width: "250px", flexShrink: 0 }}>
        <AgentSidebar />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", paddingInline: "2.5rem"  }}>
        <Outlet />
      </div>

    </div>
  );
};

export default Layout;