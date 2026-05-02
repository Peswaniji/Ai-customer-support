import { body } from "express-validator";

export const suggestRepliesValidator = [
  body("ticketId")
    .isMongoId()
    .withMessage("Invalid ticket ID"),
]; 