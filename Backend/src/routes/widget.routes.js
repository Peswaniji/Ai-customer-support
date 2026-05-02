import express from "express";
import { getWidgetConfig, getWidgetLoader, getWidgetPanel } from "../controllers/widget.controller.js";

const router = express.Router();

// Relax security headers for widget endpoints so they can be embedded on demo sites
router.use((req, res, next) => {
	const allowed = [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:3001", "http://localhost:3000"];
	const origin = req.get('origin') || req.get('referer') || '';
	try {
		if (allowed.includes(origin)) {
			res.setHeader('Access-Control-Allow-Origin', origin);
		} else {
			res.setHeader('Access-Control-Allow-Origin', '*');
		}
	} catch (e) {
		// ignore
	}
	res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
	res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
	res.removeHeader && res.removeHeader('X-Frame-Options');
	// Override CSP frame-ancestors to allow our demo origins
	const frameAncestors = ["'self'", "http://localhost:3001", "http://localhost:5173", "http://localhost:3000"];
	res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors.join(' ')};`);

	if (req.method === 'OPTIONS') return res.sendStatus(204);
	next();
});

router.get("/:businessId/config", getWidgetConfig);
router.get("/:businessId/loader.js", getWidgetLoader);
router.get("/:businessId/panel", getWidgetPanel);

export default router;