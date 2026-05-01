import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./db.js";
import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import Ticket from "../models/ticket.model.js";
import Message from "../models/message.model.js";

const seed = async () => {
  await connectDB();

  // wipe existing demo data
  await User.deleteMany({ email: /@demo\.com$/ });
  await Business.deleteMany({ email: /@demo\.com$/ });
  await Ticket.deleteMany({});
  await Message.deleteMany({});

  console.log("🧹 Cleared old demo data");

  // ── Super Admin ─────────────────────────────────────────
  await User.create({
    name: "Super Admin",
    email: "superadmin@demo.com",
    password: "super1234",
    role: "super_admin",
    isActive: true,
  });
  console.log("👑 Super Admin created — superadmin@demo.com / super1234");

  // ── Business 1 — Zomato ─────────────────────────────────
  const zomato = await Business.create({
    name: "Zomato Support",
    email: "admin@zomato.demo.com",
    industry: "E-Commerce",
    plan: "pro",
    planLimits: { maxAgents: 10, maxChatsPerMonth: 1000 },
    usage: { chatsThisMonth: 80 },
  });

  const zomatoAdmin = await User.create({
    name: "Zomato Admin",
    email: "admin@zomato.demo.com",
    password: "demo1234",
    role: "business_admin",
    businessId: zomato._id,
    isActive: true,
  });

  const agent1 = await User.create({
    name: "Arjun Singh",
    email: "arjun@zomato.demo.com",
    password: "demo1234",
    role: "agent",
    businessId: zomato._id,
    isActive: true,
    availabilityStatus: "available",
  });

  const agent2 = await User.create({
    name: "Priya Mehta",
    email: "priya@zomato.demo.com",
    password: "demo1234",
    role: "agent",
    businessId: zomato._id,
    isActive: true,
    availabilityStatus: "busy",
  });

  const customer1 = await User.create({
    name: "Riya Sharma",
    email: "riya@customer.demo.com",
    role: "customer",
    businessId: zomato._id,
    isActive: true,
  });

  const customer2 = await User.create({
    name: "Rahul Verma",
    email: "rahul@customer.demo.com",
    role: "customer",
    businessId: zomato._id,
    isActive: true,
  });

  console.log("🏢 Zomato business + users created");

  // ── Tickets ──────────────────────────────────────────────
  const t1 = await Ticket.create({
    businessId: zomato._id,
    customerId: customer1._id,
    assignedAgentId: agent1._id,
    subject: "Order #4521 not delivered",
    description: "My order was supposed to arrive at 6 PM, it is now 9 PM and no update.",
    category: "delivery",
    priority: "high",
    status: "in_progress",
    aiHandled: false,
    aiConfidenceScore: 45,
  });

  const t2 = await Ticket.create({
    businessId: zomato._id,
    customerId: customer2._id,
    assignedAgentId: agent1._id,
    subject: "Payment deducted twice",
    description: "I was charged twice for order #4488. Please refund the extra amount.",
    category: "billing",
    priority: "critical",
    status: "open",
    aiHandled: false,
    aiConfidenceScore: 30,
  });

  const t3 = await Ticket.create({
    businessId: zomato._id,
    customerId: customer1._id,
    subject: "What are your delivery hours?",
    description: "I want to know until what time you deliver in the evening.",
    category: "general",
    priority: "low",
    status: "auto_resolved",
    aiHandled: true,
    aiConfidenceScore: 94,
    aiSummary: "Customer asked about delivery hours. AI responded with operating hours (10 AM - 11 PM). Resolved instantly.",
    customerRating: 5,
    resolvedAt: new Date(),
  });

  const t4 = await Ticket.create({
    businessId: zomato._id,
    customerId: customer2._id,
    assignedAgentId: agent2._id,
    subject: "Wrong item delivered",
    description: "I ordered Paneer Butter Masala but received Chicken Curry.",
    category: "complaint",
    priority: "high",
    status: "resolved",
    aiHandled: false,
    aiConfidenceScore: 40,
    aiSummary: "Customer received wrong item. Agent arranged a re-delivery. Issue resolved in 22 minutes.",
    customerRating: 4,
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });

  const t5 = await Ticket.create({
    businessId: zomato._id,
    customerId: customer1._id,
    subject: "App crashing on Android",
    description: "The Zomato app keeps crashing when I try to open my order history.",
    category: "technical",
    priority: "medium",
    status: "open",
    aiHandled: false,
  });

  console.log("🎫 5 tickets created");

  // ── Messages ─────────────────────────────────────────────
  await Message.insertMany([
    // Ticket 1 — in progress
    { ticketId: t1._id, businessId: zomato._id, senderId: customer1._id, senderRole: "customer", content: "Hi, my order #4521 hasn't arrived. It was supposed to come at 6 PM." },
    { ticketId: t1._id, businessId: zomato._id, senderId: "ai", senderRole: "ai", content: "I checked your order. It's out for delivery and should arrive by 8:30 PM due to traffic." },
    { ticketId: t1._id, businessId: zomato._id, senderId: customer1._id, senderRole: "customer", content: "It is 9 PM now and still nothing!" },
    { ticketId: t1._id, businessId: zomato._id, senderId: agent1._id, senderRole: "agent", content: "Hi Riya, I'm Arjun. I'm escalating this to our logistics team right now and will update you in 10 minutes." },

    // Ticket 2 — open
    { ticketId: t2._id, businessId: zomato._id, senderId: customer2._id, senderRole: "customer", content: "I was charged twice for my order. Please check and refund." },

    // Ticket 3 — auto resolved
    { ticketId: t3._id, businessId: zomato._id, senderId: customer1._id, senderRole: "customer", content: "What are your delivery hours?" },
    { ticketId: t3._id, businessId: zomato._id, senderId: "ai", senderRole: "ai", content: "We deliver from 10 AM to 11 PM every day including weekends and holidays! Is there anything else I can help you with?" },

    // Ticket 4 — resolved
    { ticketId: t4._id, businessId: zomato._id, senderId: customer2._id, senderRole: "customer", content: "I ordered Paneer Butter Masala but got Chicken Curry. I am vegetarian!" },
    { ticketId: t4._id, businessId: zomato._id, senderId: agent2._id, senderRole: "agent", content: "I sincerely apologize for this! I am arranging an immediate re-delivery of your correct order. It will arrive within 30 minutes." },
    { ticketId: t4._id, businessId: zomato._id, senderId: customer2._id, senderRole: "customer", content: "Thank you, received the correct order." },
  ]);

  console.log("💬 Messages seeded");

  // ── Business 2 — Razorpay (for super admin view) ─────────
  const razorpay = await Business.create({
    name: "Razorpay Support",
    email: "admin@razorpay.demo.com",
    industry: "Fintech",
    plan: "pro",
    planLimits: { maxAgents: 10, maxChatsPerMonth: 1000 },
    usage: { chatsThisMonth: 43 },
  });
  await User.create({
    name: "Razorpay Admin",
    email: "admin@razorpay.demo.com",
    password: "demo1234",
    role: "business_admin",
    businessId: razorpay._id,
    isActive: true,
  });

  console.log("🏢 Razorpay business created");

  console.log("\n✅ Seed complete! Demo credentials:");
  console.log("─────────────────────────────────────");
  console.log("👑 Super Admin  : superadmin@demo.com  / super1234");
  console.log("🏢 Zomato Admin : admin@zomato.demo.com / demo1234");
  console.log("🎧 Agent Arjun  : arjun@zomato.demo.com / demo1234");
  console.log("🎧 Agent Priya  : priya@zomato.demo.com / demo1234");
  console.log("🏢 Razorpay Admin: admin@razorpay.demo.com / demo1234");
  console.log("─────────────────────────────────────");

  mongoose.connection.close();
};

seed().catch(err => {
  console.error("Seed failed:", err);
  mongoose.connection.close();
  process.exit(1);
});