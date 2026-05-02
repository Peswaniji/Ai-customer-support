import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { messageParamValidator, sendMessageValidator } from "../validators/message.validator.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:ticketId",  protect, messageParamValidator,  validate, getMessages);
router.post("/:ticketId", protect, sendMessageValidator,   validate, sendMessage);

export default router;