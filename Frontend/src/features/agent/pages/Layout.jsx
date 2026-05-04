import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../auth/state/auth.slice.js";
import { getMe } from "../../auth/services/auth.api.js";
import AgentSidebar from "../components/AgentSidebar";
import "../styles/agentLayout.scss";

const Layout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    getMe()
      .then((data) => {
        if (data.user) dispatch(setUser(data.user));
      })
      .catch(() => {});
  }, [dispatch]);

  return (
    <div className="agent-layout">
      <aside className="agent-layout__sidebar">
        <AgentSidebar />
      </aside>

      <main className="agent-layout__main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
