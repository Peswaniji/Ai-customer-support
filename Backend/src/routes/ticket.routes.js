import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createTicketValidator, getTicketsValidator, ticketIdValidator,
  updateStatusValidator, assignTicketValidator,
  updatePriorityValidator, rateTicketValidator,
} from "../validators/ticket.validator.js";
import {
  createTicket, getTickets, getTicketById,
  updateTicketStatus, assignTicket, updatePriority, rateTicket,
} from "../controllers/ticket.controller.js";

const router = express.Router();

router.post("/",                    protect, authorize("customer"),                            createTicketValidator,    validate, createTicket);
router.get("/",                     protect, authorize("agent","business_admin","super_admin"),getTicketsValidator,      validate, getTickets);
router.get("/:ticketId",            protect,                                                  ticketIdValidator,        validate, getTicketById);
router.patch("/:ticketId/status",   protect, authorize("agent","business_admin"),             updateStatusValidator,    validate, updateTicketStatus);
router.patch("/:ticketId/assign",   protect, authorize("business_admin"),                     assignTicketValidator,    validate, assignTicket);
router.patch("/:ticketId/priority", protect, authorize("agent","business_admin"),             updatePriorityValidator,  validate, updatePriority);
router.post("/:ticketId/rate",      protect, authorize("customer"),                           rateTicketValidator,      validate, rateTicket);

export default router;