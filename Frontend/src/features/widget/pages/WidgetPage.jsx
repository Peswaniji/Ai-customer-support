import { useMemo } from "react";
import widgetAPI from "../services/widget.api.js";

const WidgetPage = () => {
  const businessId = new URLSearchParams(window.location.search).get("businessId");
  const panelUrl = useMemo(
    () => (businessId ? widgetAPI.getPanelUrl(businessId) : ""),
    [businessId]
  );

  if (!businessId) {
    return <div style={{ padding: 24 }}>Missing businessId</div>;
  }

  return (
    <iframe
      title="Customer Support Widget"
      src={panelUrl}
      style={{ width: "100vw", height: "100vh", border: 0 }}
    />
  );
};

export default WidgetPage;
