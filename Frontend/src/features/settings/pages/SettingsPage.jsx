import { useEffect, useState } from "react";
import useSettings from "../hooks/useSettings.js";
import "../styles/SettingsPage.scss";

const SettingsPage = () => {
  const { business, widgetCode, loading, updateLoading, updateSuccess, error, update, resetSuccess } =
    useSettings();

  const [form, setForm] = useState({
    name: "",
    industry: "",
    widgetConfig: {
      color: "#1E40AF",
      welcomeMessage: "",
      autoReplyEnabled: true,
      confidenceThreshold: 80,
    },
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!business) return;
    const t = setTimeout(() => {
      setForm({
        name: business.name || "",
        industry: business.industry || "",
        widgetConfig: {
          color: business.widgetConfig?.color || "#1E40AF",
          welcomeMessage: business.widgetConfig?.welcomeMessage || "",
          autoReplyEnabled: business.widgetConfig?.autoReplyEnabled ?? true,
          confidenceThreshold: business.widgetConfig?.confidenceThreshold ?? 80,
        },
      });
    }, 0);
    return () => clearTimeout(t);
  }, [business]);

  useEffect(() => {
    if (updateSuccess) {
      const t = setTimeout(() => resetSuccess(), 3000);
      return () => clearTimeout(t);
    }
  }, [updateSuccess]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWidgetChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      widgetConfig: {
        ...form.widgetConfig,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await update(form);
    } catch {
      // Error is stored in Redux and rendered below the form.
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="settings-page__loading">Loading settings...</div>;

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage your business and widget settings</p>
      </div>

      <div className="settings-page__body">
        <form onSubmit={handleSubmit} className="settings-page__form">

          <div className="settings-card">
            <h3 className="settings-card__title">Business Info</h3>
            <div className="settings-card__field">
              <label>Business Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your Business Name" />
            </div>
            <div className="settings-card__field">
              <label>Industry</label>
              <input type="text" name="industry" value={form.industry} onChange={handleChange} placeholder="e.g. Technology, Retail" />
            </div>
          </div>

          <div className="settings-card">
            <h3 className="settings-card__title">Widget Configuration</h3>

            <div className="settings-card__field">
              <label>Widget Color</label>
              <div className="settings-card__color-row">
                <input type="color" name="color" value={form.widgetConfig.color} onChange={handleWidgetChange} className="settings-card__color-picker" />
                <input type="text" name="color" value={form.widgetConfig.color} onChange={handleWidgetChange} placeholder="#1E40AF" pattern="^#[0-9A-Fa-f]{6}$" maxLength={7} className="settings-card__color-text" />
              </div>
            </div>

            <div className="settings-card__field">
              <label>Welcome Message</label>
              <textarea name="welcomeMessage" value={form.widgetConfig.welcomeMessage} onChange={handleWidgetChange} placeholder="Hi! How can we help you today?" rows={3} />
            </div>

            <div className="settings-card__field">
              <label>AI Confidence Threshold ({form.widgetConfig.confidenceThreshold}%)</label>
              <input type="range" name="confidenceThreshold" min={50} max={100} value={form.widgetConfig.confidenceThreshold} onChange={handleWidgetChange} className="settings-card__range" />
              <div className="settings-card__range-labels">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="settings-card__field settings-card__field--row">
              <label>Auto Reply Enabled</label>
              <label className="settings-card__toggle">
                <input type="checkbox" name="autoReplyEnabled" checked={form.widgetConfig.autoReplyEnabled} onChange={handleWidgetChange} />
                <span className="settings-card__toggle-slider" />
              </label>
            </div>
          </div>

          {updateSuccess && (
            <div className="settings-page__success">✅ Settings updated successfully!</div>
          )}

          {error && <div className="settings-page__error">{error}</div>}

          <button type="submit" className="btn-primary settings-page__save-btn" disabled={updateLoading}>
            {updateLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="settings-page__widget">
          <div className="settings-card">
            <h3 className="settings-card__title">Widget Embed Code</h3>
            <p className="settings-card__sub">Paste this in your website before closing body tag.</p>
            <div className="settings-card__code-box">
              <pre>{widgetCode || "Loading..."}</pre>
            </div>
            <button className="btn-primary settings-card__copy-btn" onClick={handleCopy}>
              {copied ? "✅ Copied!" : "Copy Code"}
            </button>
          </div>

          <div className="settings-card">
            <h3 className="settings-card__title">Plan Info</h3>
            <div className="settings-card__plan">
              <span className="settings-card__plan-badge">
                {business?.plan?.toUpperCase() ?? "FREE"} Plan
              </span>
            </div>
            <div className="settings-card__plan-details">
              {[
                ["Max Agents", business?.planLimits?.maxAgents ?? 2],
                ["Max Chats/Month", business?.planLimits?.maxChatsPerMonth ?? 100],
                ["Chats Used", business?.usage?.chatsThisMonth ?? 0],
              ].map(([label, value]) => (
                <div className="settings-card__plan-item" key={label}>
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
