import Business from "../models/business.model.js";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildLoaderScript = (businessId, panelUrl, color, welcomeMessage) => `(() => {
  const currentScript = document.currentScript;
  const launcherColor = currentScript?.dataset?.color || ${JSON.stringify(color)};
  const welcomeText = currentScript?.dataset?.welcome || ${JSON.stringify(welcomeMessage)};
  const panelSource = ${JSON.stringify(panelUrl)};

  const mountWidget = () => {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", mountWidget, { once: true });
      return;
    }

  if (document.getElementById("ai-csp-widget-root")) return;

  const root = document.createElement("div");
  root.id = "ai-csp-widget-root";
  root.style.position = "fixed";
  root.style.right = "20px";
  root.style.bottom = "20px";
  root.style.zIndex = "2147483647";
  root.style.fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Chat with us";
  button.style.border = "none";
  button.style.borderRadius = "999px";
  button.style.padding = "14px 18px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 14px 35px rgba(15, 23, 42, 0.24)";
  button.style.background = launcherColor;
  button.style.color = "#fff";
  button.style.fontWeight = "700";
  button.style.fontSize = "14px";

  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.right = "0";
  panel.style.bottom = "64px";
  panel.style.width = "380px";
  panel.style.maxWidth = "calc(100vw - 32px)";
  panel.style.height = "620px";
  panel.style.borderRadius = "20px";
  panel.style.overflow = "hidden";
  panel.style.boxShadow = "0 24px 70px rgba(15, 23, 42, 0.28)";
  panel.style.background = "#fff";
  panel.style.display = "none";

  const iframe = document.createElement("iframe");
  iframe.src = panelSource;
  iframe.title = "Customer support widget";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.setAttribute("allow", "clipboard-write");
  iframe.setAttribute("sandbox", "allow-scripts allow-forms allow-same-origin");

  panel.appendChild(iframe);
  root.appendChild(button);
  root.appendChild(panel);
  document.body.appendChild(root);

  button.addEventListener("click", () => {
    const isOpen = panel.style.display === "block";
    panel.style.display = isOpen ? "none" : "block";
  });

  window.addEventListener("message", (event) => {
    if (!event.data || event.data.type !== "ai-csp-widget-close") return;
    panel.style.display = "none";
  });

  };

  mountWidget();
})();`;

const buildWidgetPanelHtml = (business) => {
  const color = business.widgetConfig?.color || "#1E40AF";
  const welcomeMessage = business.widgetConfig?.welcomeMessage || "Hi! How can we help you today?";
  const businessName = business.name || "Support";
  const title = `${businessName} Support`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --accent: ${escapeHtml(color)};
      --bg: #f8fafc;
      --text: #0f172a;
      --muted: #64748b;
      --card: #ffffff;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #fff 0%, var(--bg) 100%);
      color: var(--text);
    }
    .header {
      padding: 18px 18px 14px;
      background: var(--accent);
      color: #fff;
    }
    .header h1 { margin: 0; font-size: 18px; }
    .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.9; line-height: 1.5; }
    .content { padding: 16px; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 14px;
      margin-bottom: 14px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; }
    input, textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      font: inherit;
      outline: none;
      background: #fff;
    }
    textarea { min-height: 120px; resize: vertical; }
    input:focus, textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 12px; }
    button {
      border: 0;
      border-radius: 12px;
      padding: 12px 16px;
      font-weight: 700;
      cursor: pointer;
      background: var(--accent);
      color: #fff;
    }
    .ghost {
      background: #e2e8f0;
      color: #0f172a;
    }
    .status { font-size: 13px; color: var(--muted); line-height: 1.5; }
    .success { color: #15803d; font-weight: 700; }
    .error { color: #b91c1c; font-weight: 700; }
    .small { font-size: 12px; color: var(--muted); }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(welcomeMessage)}</p>
  </div>

  <div class="content">
    <div class="card">
      <div class="grid">
        <div>
          <label for="name">Name</label>
          <input id="name" type="text" placeholder="Your name" />
        </div>
        <div>
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" />
        </div>
      </div>
      <div style="margin-top: 10px;">
        <label for="subject">Subject</label>
        <input id="subject" type="text" placeholder="What do you need help with?" />
      </div>
      <div style="margin-top: 10px;">
        <label for="description">Describe your issue</label>
        <textarea id="description" placeholder="Write a few details..."></textarea>
      </div>
      <div class="actions">
        <button id="submitBtn" type="button">Create ticket</button>
        <button id="closeBtn" type="button" class="ghost">Close</button>
      </div>
      <div id="status" class="status" style="margin-top: 12px;">Fill the form and create a support ticket.</div>
    </div>

    <div class="card">
      <div class="small"><strong>Support info</strong></div>
      <div class="small" style="margin-top: 6px;">Powered by ${escapeHtml(title)}. Tickets are created directly in your support dashboard.</div>
    </div>
  </div>

  <script>
    const businessId = ${JSON.stringify(String(business._id))};
    const apiBase = window.location.origin;
    const statusEl = document.getElementById('status');
    const submitBtn = document.getElementById('submitBtn');
    const closeBtn = document.getElementById('closeBtn');

    const setStatus = (message, type = 'info') => {
      statusEl.className = 'status' + (type === 'success' ? ' success' : type === 'error' ? ' error' : '');
      statusEl.textContent = message;
    };

    closeBtn.addEventListener('click', () => {
      window.parent.postMessage({ type: 'ai-csp-widget-close' }, '*');
    });

    submitBtn.addEventListener('click', async () => {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const description = document.getElementById('description').value.trim();

      if (!name || !email || !subject || !description) {
        setStatus('Please fill name, email, subject and description.', 'error');
        return;
      }

      submitBtn.disabled = true;
      setStatus('Creating your ticket...');

      try {
        const sessionResponse = await fetch(apiBase + '/api/auth/customer-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, businessId }),
        });
        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok) {
          throw new Error(sessionData.message || 'Failed to create customer session');
        }

        const ticketResponse = await fetch(apiBase + '/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + sessionData.accessToken,
          },
          body: JSON.stringify({ subject, description }),
        });
        const ticketData = await ticketResponse.json();

        if (!ticketResponse.ok) {
          throw new Error(ticketData.message || 'Failed to create ticket');
        }

        setStatus(
          ticketData.ticket?.status === 'auto_resolved'
            ? 'Ticket created and auto-resolved. Ticket ID: ' + ticketData.ticket._id
            : 'Ticket created successfully. Ticket ID: ' + ticketData.ticket._id,
          'success'
        );
      } catch (error) {
        setStatus(error.message || 'Something went wrong.', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;
};

export const getWidgetConfig = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.json({
      success: true,
      business: {
        id: business._id,
        name: business.name,
        email: business.email,
        widgetConfig: business.widgetConfig,
        embedUrl: `${baseUrl}/api/widget/${business._id}/loader.js`,
        panelUrl: `${baseUrl}/api/widget/${business._id}/panel`,
      },
    });
  } catch (err) {
    console.error("getWidgetConfig:", err);
    res.status(500).json({ success: false, message: "Failed to load widget config" });
  }
};

export const getWidgetLoader = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) {
      return res.status(404).send("Business not found");
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const panelUrl = `${baseUrl}/api/widget/${business._id}/panel`;
    const script = buildLoaderScript(
      business._id,
      panelUrl,
      business.widgetConfig?.color,
      business.widgetConfig?.welcomeMessage
    );

    res.type("application/javascript").send(script);
  } catch (err) {
    console.error("getWidgetLoader:", err);
    res.status(500).type("application/javascript").send("console.error('Failed to load widget');");
  }
};

export const getWidgetPanel = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) {
      return res.status(404).send("Business not found");
    }

    res.type("html").send(buildWidgetPanelHtml(business));
  } catch (err) {
    console.error("getWidgetPanel:", err);
    res.status(500).send("Failed to load widget panel");
  }
};