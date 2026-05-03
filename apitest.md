# API Testing Guide - AI Customer Support Platform

BASE URL: `http://localhost:3000`

All protected routes need:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## 0. Backend Pre-Check

Run from `Backend` folder before Postman/API testing:

```powershell
npm.cmd install
npm.cmd run check
npm.cmd audit --omit=dev
npm.cmd start
```

Expected:

- `npm.cmd run check` passes ESLint + Prettier
- `npm.cmd audit --omit=dev` returns `found 0 vulnerabilities`
- server starts without env validation failure
- MongoDB connects
- Redis connects if Redis env is correct
- Socket.io initializes

Health check:

```http
GET {{baseUrl}}/health
```

Expected:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## Environment Variables In Postman

Set these in Postman:

```text
baseUrl         = http://localhost:3000
adminToken      = login/register se milega
agentToken      = login se milega
customerToken   = customer session se milega
superAdminToken = super admin login se milega
businessId      = register/login response mein user.businessId
ticketId        = ticket create ke baad ticket._id
agentId         = GET /agents response se kisi agent ka _id
inviteToken     = email ya DB se invited user ka inviteToken
```

Important security change:

```text
Invite API ab inviteToken response mein nahi bhejti.
Invite token email mein jayega. Local testing ke liye MongoDB/Compass se invited user ka inviteToken copy karo.
```

---

# AUTH APIS

## A-1 - Register Business

```http
POST {{baseUrl}}/api/auth/register-business
```

Body:

```json
{
  "businessName": "Test Company",
  "email": "test@company.com",
  "password": "test1234",
  "industry": "E-Commerce"
}
```

Expected:

- `201`
- `accessToken`
- `user` object

Save:

```text
adminToken = response.accessToken
businessId = response.user.businessId
```

## A-2 - Duplicate Email Check

```http
POST {{baseUrl}}/api/auth/register-business
```

Body:

```json
{
  "businessName": "Test Company",
  "email": "test@company.com",
  "password": "test1234",
  "industry": "E-Commerce"
}
```

Expected:

```text
409 - Email already registered
```

## A-3 - Validation Error

```http
POST {{baseUrl}}/api/auth/register-business
```

Body:

```json
{
  "businessName": "T",
  "email": "notanemail",
  "password": "123"
}
```

Expected:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "businessName", "message": "Business name must be 2-100 characters" },
    { "field": "email", "message": "Valid email is required" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

## A-4 - Login Business Admin

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "admin@zomato.demo.com",
  "password": "demo1234"
}
```

Expected:

- `200`
- `accessToken`
- `user.role = business_admin`

Save:

```text
adminToken = response.accessToken
businessId = response.user.businessId
```

## A-5 - Login Agent

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "arjun@zomato.demo.com",
  "password": "demo1234"
}
```

Expected:

- `200`
- `user.role = agent`

Save:

```text
agentToken = response.accessToken
```

## A-6 - Login Super Admin

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "superadmin@demo.com",
  "password": "super1234"
}
```

Expected:

- `200`
- `user.role = super_admin`
- `user.businessId = null`

Save:

```text
superAdminToken = response.accessToken
```

## A-7 - Wrong Password

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "admin@zomato.demo.com",
  "password": "wrongpassword"
}
```

Expected:

```text
401 - Invalid credentials
```

## A-8 - Customer Session

```http
POST {{baseUrl}}/api/auth/customer-session
```

Body:

```json
{
  "name": "Riya Sharma",
  "email": "riya@test.com",
  "businessId": "{{businessId}}"
}
```

Expected:

- `200`
- `user.role = customer`
- `accessToken`

Save:

```text
customerToken = response.accessToken
```

## A-9 - Invite Agent

```http
POST {{baseUrl}}/api/auth/invite-agent
Authorization: Bearer {{adminToken}}
```

Body:

```json
{
  "name": "New Agent",
  "email": "newagent@zomato.com"
}
```

Expected:

```json
{
  "success": true,
  "message": "Invite sent",
  "agentId": "..."
}
```

Important:

```text
inviteToken response mein nahi aayega. This is intentional security hardening.
Testing ke liye email inbox se token lo, ya MongoDB/Compass mein users collection se:
email = newagent@zomato.com
field = inviteToken
```

Save:

```text
inviteToken = invited user ka inviteToken from email/DB
```

## A-10 - Invite Agent Wrong Role

```http
POST {{baseUrl}}/api/auth/invite-agent
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "name": "Another Agent",
  "email": "another@zomato.com"
}
```

Expected:

```text
403 - Role 'agent' is not authorized for this route
```

## A-11 - Set Password Agent Activation

```http
POST {{baseUrl}}/api/auth/set-password
```

Body:

```json
{
  "token": "{{inviteToken}}",
  "password": "newagent123"
}
```

Expected:

- `200`
- `message = Account activated`
- `accessToken`
- refresh cookie set

## A-12 - Refresh Token

```http
POST {{baseUrl}}/api/auth/refresh-token
```

No body, no Authorization header. Cookie automatically jayegi if Postman cookie jar enabled hai.

Expected:

```text
200 - new accessToken
```

## A-13 - Logout

```http
POST {{baseUrl}}/api/auth/logout
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - Logged out
```

## A-14 - Refresh After Logout Should Fail

```http
POST {{baseUrl}}/api/auth/refresh-token
```

Expected:

```text
401 - Invalid refresh token
```

## A-15 - Access Token Blacklist After Logout

Use the same old `adminToken` after logout:

```http
GET {{baseUrl}}/api/tickets
Authorization: Bearer {{adminToken}}
```

Expected if Redis connected:

```text
401 - Token has been revoked
```

Expected if Redis unavailable:

```text
Old access token may work until expiry because blacklist storage depends on Redis.
```

## A-16 - Rate Limit Test

Run login with wrong password 11 times rapidly:

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "admin@zomato.demo.com",
  "password": "wrongpassword"
}
```

Expected:

```text
11th request - 429 Too many attempts. Please try again after 15 minutes.
```

---

# BUSINESS APIS

## B-1 - Get My Business

```http
GET {{baseUrl}}/api/business/me
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - business object with widgetConfig, usage, planLimits
```

## B-2 - Update Widget Config

```http
PATCH {{baseUrl}}/api/business/me
Authorization: Bearer {{adminToken}}
```

Body:

```json
{
  "widgetConfig": {
    "color": "#7C3AED",
    "welcomeMessage": "Hello! How can we help you today?",
    "autoReplyEnabled": true,
    "confidenceThreshold": 75
  }
}
```

Expected:

```text
200 - updated business object
```

## B-3 - Validation Error On Update

```http
PATCH {{baseUrl}}/api/business/me
Authorization: Bearer {{adminToken}}
```

Body:

```json
{
  "widgetConfig": {
    "color": "notacolor",
    "confidenceThreshold": 200
  }
}
```

Expected:

```text
400 - validation errors array
```

## B-4 - Get Widget Embed Code

```http
GET {{baseUrl}}/api/business/widget-code
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - snippet field with script tag
```

## B-5 - Get All Businesses Super Admin Only

```http
GET {{baseUrl}}/api/business/all
Authorization: Bearer {{superAdminToken}}
```

Expected:

```text
200 - array of all businesses with agentCount
```

## B-6 - Business Route With Agent Token Should Fail

```http
GET {{baseUrl}}/api/business/me
Authorization: Bearer {{agentToken}}
```

Expected:

```text
403 - Role 'agent' is not authorized for this route
```

## B-7 - Usage Stats

```http
GET {{baseUrl}}/api/business/usage
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - usage object with chatsThisMonth, maxAgents, maxChatsPerMonth, percentUsed, resetsOn, plan
```

---

# AGENT APIS

## AG-1 - Get All Agents

```http
GET {{baseUrl}}/api/agents
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - agents array scoped to this business only
```

Save:

```text
agentId = response.agents[0]._id
```

## AG-2 - Toggle Availability To Busy

```http
PATCH {{baseUrl}}/api/agents/availability
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "availabilityStatus": "busy"
}
```

Expected:

```json
{
  "success": true,
  "availabilityStatus": "busy"
}
```

## AG-3 - Toggle Availability Back To Available

```http
PATCH {{baseUrl}}/api/agents/availability
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "availabilityStatus": "available"
}
```

Expected:

```json
{
  "success": true,
  "availabilityStatus": "available"
}
```

## AG-4 - Availability Validation Error

```http
PATCH {{baseUrl}}/api/agents/availability
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "availabilityStatus": "offline"
}
```

Expected:

```text
400 - Must be 'available' or 'busy'
```

## AG-5 - Deactivate Agent

```http
PATCH {{baseUrl}}/api/agents/{{agentId}}/status
Authorization: Bearer {{adminToken}}
```

Body:

```json
{
  "isActive": false
}
```

Expected:

```text
200 - agent.isActive false
```

## AG-6 - Reactivate Agent

```http
PATCH {{baseUrl}}/api/agents/{{agentId}}/status
Authorization: Bearer {{adminToken}}
```

Body:

```json
{
  "isActive": true
}
```

Expected:

```text
200 - agent.isActive true
```

## AG-7 - Agent Trying To Deactivate Should Fail

```http
PATCH {{baseUrl}}/api/agents/{{agentId}}/status
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "isActive": false
}
```

Expected:

```text
403 - Role 'agent' is not authorized
```

## AG-8 - Invalid Agent ID Format

```http
PATCH {{baseUrl}}/api/agents/invalidid123/status
Authorization: Bearer {{adminToken}}
```

Body:

```json
{
  "isActive": false
}
```

Expected:

```text
400 - Invalid agent ID
```

---

# TICKET APIS

## T-1 - Create Ticket

```http
POST {{baseUrl}}/api/tickets
Authorization: Bearer {{customerToken}}
```

Body:

```json
{
  "subject": "My order #9999 has not arrived",
  "description": "I placed an order 3 hours ago and it still has not arrived."
}
```

Expected:

```text
201 - ticket created with status open
```

Save:

```text
ticketId = response.ticket._id
```

After 3-5 seconds, run T-3. AI may update `category`, `priority`, `aiConfidenceScore`, `status`, or `assignedAgentId`.

## T-2 - Create Auto-Resolvable Ticket AI Test

```http
POST {{baseUrl}}/api/tickets
Authorization: Bearer {{customerToken}}
```

Body:

```json
{
  "subject": "What are your business hours?",
  "description": "I want to know what time your support team is available."
}
```

Expected:

```text
201 - ticket created
```

After 5-8 seconds:

```text
GET single ticket may show status auto_resolved, aiHandled true, aiConfidenceScore set
```

Note: AI output can vary. If AI does not auto-resolve, ticket should still remain safely open/in_progress.

## T-3 - Get Single Ticket

```http
GET {{baseUrl}}/api/tickets/{{ticketId}}
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - full ticket with populated customerId and assignedAgentId
```

## T-4 - Get All Tickets Admin

```http
GET {{baseUrl}}/api/tickets
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - all business tickets with pagination
```

## T-5 - Get Tickets With Filters

```http
GET {{baseUrl}}/api/tickets?status=open
Authorization: Bearer {{adminToken}}
```

```http
GET {{baseUrl}}/api/tickets?priority=high
Authorization: Bearer {{adminToken}}
```

```http
GET {{baseUrl}}/api/tickets?status=open&page=1&limit=5
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - filtered results
```

## T-6 - Get Tickets Agent Sees Only Assigned

```http
GET {{baseUrl}}/api/tickets
Authorization: Bearer {{agentToken}}
```

Expected:

```text
200 - only tickets assigned to this agent
```

## T-7 - Assign Ticket

```http
PATCH {{baseUrl}}/api/tickets/{{ticketId}}/assign
Authorization: Bearer {{adminToken}}
```

Body:

```json
{
  "agentId": "{{agentId}}"
}
```

Expected:

```text
200 - status in_progress, assignedAgentId set
```

## T-8 - Update Status To In Progress

```http
PATCH {{baseUrl}}/api/tickets/{{ticketId}}/status
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "status": "in_progress"
}
```

Expected:

```text
200
```

## T-9 - Resolve Ticket AI Summary Trigger

```http
PATCH {{baseUrl}}/api/tickets/{{ticketId}}/status
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "status": "resolved"
}
```

Expected:

```text
200 - resolvedAt set
```

After 5-8 seconds:

```http
GET {{baseUrl}}/api/tickets/{{ticketId}}
Authorization: Bearer {{adminToken}}
```

Expected:

```text
aiSummary may be filled if GEMINI_API_KEY is configured and AI request succeeds
```

## T-10 - Update Priority

```http
PATCH {{baseUrl}}/api/tickets/{{ticketId}}/priority
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "priority": "high"
}
```

Expected:

```text
200 - priority high
```

## T-11 - Rate Ticket

```http
POST {{baseUrl}}/api/tickets/{{ticketId}}/rate
Authorization: Bearer {{customerToken}}
```

Body:

```json
{
  "rating": 5
}
```

Expected:

```text
200 - Rating saved
```

## T-12 - Rate Open Ticket Should Fail

```http
POST {{baseUrl}}/api/tickets/<openTicketId>/rate
Authorization: Bearer {{customerToken}}
```

Body:

```json
{
  "rating": 4
}
```

Expected:

```text
400 - Can only rate resolved tickets
```

## T-13 - Cross-Tenant Access Should Fail

Step 1: Login as Razorpay admin:

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "admin@razorpay.demo.com",
  "password": "demo1234"
}
```

Step 2: Use Razorpay token to access Zomato ticket:

```http
GET {{baseUrl}}/api/tickets/{{ticketId}}
Authorization: Bearer <razorpayAdminToken>
```

Expected:

```text
403 - Access denied
```

This is important multi-tenancy proof.

## T-14 - Usage Limit Counter

```http
GET {{baseUrl}}/api/business/usage
Authorization: Bearer {{adminToken}}
```

Create a ticket with `customerToken`, then hit usage again.

Expected:

```text
chatsThisMonth increments by 1
```

This reviews the atomic usage increment change.

---

# MESSAGE APIS

## M-1 - Get Messages

```http
GET {{baseUrl}}/api/messages/{{ticketId}}
Authorization: Bearer {{agentToken}}
```

Expected:

```text
200 - messages array sorted by createdAt
```

## M-2 - Send Message Agent

```http
POST {{baseUrl}}/api/messages/{{ticketId}}
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "content": "Hi, I am looking into your issue right now.",
  "isInternal": false
}
```

Expected:

```text
201 - message.senderRole agent
```

## M-3 - Send Message Business Admin

```http
POST {{baseUrl}}/api/messages/{{ticketId}}
Authorization: Bearer {{adminToken}}
```

Body:

```json
{
  "content": "Admin message test after senderRole fix.",
  "isInternal": false
}
```

Expected:

```text
201 - message.senderRole business_admin
```

This specifically reviews the `Message.senderRole` schema fix.

## M-4 - Internal Note Agent/Admin

```http
POST {{baseUrl}}/api/messages/{{ticketId}}
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "content": "Customer seems frustrated, escalate if not resolved in 10 min.",
  "isInternal": true
}
```

Expected:

```text
201 - isInternal true
```

## M-5 - Customer Cannot See Internal Notes

```http
GET {{baseUrl}}/api/messages/{{ticketId}}
Authorization: Bearer {{customerToken}}
```

Expected:

```text
200 - response mein isInternal true messages nahi honge
```

## M-6 - Customer Cannot Send Internal Note

```http
POST {{baseUrl}}/api/messages/{{ticketId}}
Authorization: Bearer {{customerToken}}
```

Body:

```json
{
  "content": "Trying to create internal note.",
  "isInternal": true
}
```

Expected:

```text
403 - Customers cannot send internal notes
```

---

# AI APIS

## AI-1 - Get AI Suggestions

```http
POST {{baseUrl}}/api/ai/suggest
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "ticketId": "{{ticketId}}"
}
```

Expected:

```json
{
  "success": true,
  "suggestions": ["reply1", "reply2", "reply3"]
}
```

## AI-2 - AI Suggest Customer Token Should Fail

```http
POST {{baseUrl}}/api/ai/suggest
Authorization: Bearer {{customerToken}}
```

Body:

```json
{
  "ticketId": "{{ticketId}}"
}
```

Expected:

```text
403 - Role 'customer' is not authorized
```

---

# ANALYTICS APIS

## AN-1 - Overview With Redis Cache Test

```http
GET {{baseUrl}}/api/analytics/overview
Authorization: Bearer {{adminToken}}
```

Expected first hit:

```text
200 - success true, data object
```

Hit same request again.

Expected second hit if Redis connected:

```text
fromCache: true
```

If Redis unavailable:

```text
No fromCache. API should still work.
```

## AN-2 - Cache Invalidation After Write

Step 1: Hit AN-1 twice and confirm second response has `fromCache: true`.

Step 2: Update a ticket:

```http
PATCH {{baseUrl}}/api/tickets/{{ticketId}}/priority
Authorization: Bearer {{agentToken}}
```

Body:

```json
{
  "priority": "critical"
}
```

Step 3: Hit overview again:

```http
GET {{baseUrl}}/api/analytics/overview
Authorization: Bearer {{adminToken}}
```

Expected:

```text
Cache should be invalidated after write. Response should not be stale.
```

This reviews Redis `SCAN` based invalidation.

## AN-3 - Trends Last 30 Days

```http
GET {{baseUrl}}/api/analytics/trends
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - trends array
```

## AN-4 - Agent Stats

```http
GET {{baseUrl}}/api/analytics/agents
Authorization: Bearer {{adminToken}}
```

Expected:

```text
200 - per agent stats: totalTickets, resolvedTickets, avgResolutionMin, avgRating
```

## AN-5 - Platform Stats Super Admin Only

```http
GET {{baseUrl}}/api/analytics/all
Authorization: Bearer {{superAdminToken}}
```

Expected:

```text
200 - totalBusinesses, totalTickets, totalAgents, aiRate
```

## AN-6 - Analytics With Agent Token Should Fail

```http
GET {{baseUrl}}/api/analytics/overview
Authorization: Bearer {{agentToken}}
```

Expected:

```text
403 - unauthorized
```

---

# SOCKET.IO TEST

Tool: Postman Socket.IO request

URL:

```text
http://localhost:3000
```

Header:

```http
Authorization: Bearer {{agentToken}}
```

Client version: v4

Events to listen:

```text
new_message
new_internal_note
ai_suggestion_ready
agent_typing
customer_typing
typing_stop
messages_read
ticket:created
ticket:assigned
```

## S-1 - Connect Agent Socket

Connect with `agentToken`.

Expected server console:

```text
Socket connected: agent - <userId>
```

## S-2 - Join Ticket Room

Event:

```text
join_ticket
```

Body:

```json
{
  "ticketId": "{{ticketId}}"
}
```

Expected server console:

```text
agent joined ticket_<ticketId>
```

Expected socket event:

```text
ai_suggestion_ready may arrive with 3 suggestions
```

## S-3 - Send Normal Message

Event:

```text
send_message
```

Body:

```json
{
  "ticketId": "{{ticketId}}",
  "content": "Hello, how can I help you today?",
  "isInternal": false
}
```

Expected:

```text
new_message event received
ai_suggestion_ready may refresh
```

## S-4 - Internal Note Isolation

Open second Socket.IO connection as customer:

```http
Authorization: Bearer {{customerToken}}
```

Customer also emits `join_ticket` for same ticket.

Agent emits:

```text
send_message
```

Body:
 
```json
{
  "ticketId": "{{ticketId}}",
  "content": "Private staff-only note.",
  "isInternal": true
}
```

Expected:

```text
Agent/admin staff socket receives new_internal_note.
Customer socket must NOT receive new_internal_note.
```

This is important security proof for the Socket.io room fix.

## S-5 - Typing Indicator

Event:

```text
typing_start
```

Body:

```json
{
  "ticketId": "{{ticketId}}"
}
```

Expected:

```text
Other socket in same authorized ticket room receives agent_typing/customer_typing.
```

## S-6 - Mark Read

Event:

```text
mark_read
```

Body:

```json
{
  "ticketId": "{{ticketId}}"
}
```

Expected:

```text
Other party receives messages_read
```

## S-7 - Unauthorized Join Should Fail

Use Razorpay admin/customer token and try to join Zomato ticket:

```text
join_ticket
```

Body:

```json
{
  "ticketId": "{{ticketId}}"
}
```

Expected:

```text
error event - Access denied to this ticket
```

---

# WIDGET TEST

## W-1 - Get Widget Config

```http
GET {{baseUrl}}/api/widget/{{businessId}}/config
```

No auth needed.

Expected:

```text
200 - business info + embedUrl + panelUrl
```

## W-2 - Widget Panel Embeddable HTML

Open in browser:

```text
http://localhost:3000/api/widget/{{businessId}}/panel
```

Expected:

```text
Chat form visible with business colors and welcome message
```

## W-3 - Widget Loader Script

Open in browser:

```text
http://localhost:3000/api/widget/{{businessId}}/loader.js
```

Expected:

```text
JavaScript loader code visible
```

---

# Recommended Full Test Flow

## Setup

1. A-4 - Login Zomato admin, save `adminToken`, `businessId`
2. A-5 - Login agent, save `agentToken`
3. A-6 - Login super admin, save `superAdminToken`
4. A-8 - Customer session, save `customerToken`
5. AG-1 - Get agents, save `agentId`

## Auth

6. A-1 - Register business
7. A-2 - Duplicate email check
8. A-3 - Validation errors
9. A-7 - Wrong password
10. A-9 - Invite agent
11. Copy `inviteToken` from email or DB
12. A-11 - Set password
13. A-12 - Refresh token
14. A-13 - Logout
15. A-14 - Refresh after logout fail
16. A-15 - Old access token revoked if Redis connected
17. A-16 - Rate limit test

## Business

18. B-1 - Get business
19. B-2 - Update widget config
20. B-3 - Validation error
21. B-4 - Widget code
22. B-5 - All businesses as super admin
23. B-6 - Agent denied
24. B-7 - Usage stats

## Agent

25. AG-2 - Toggle busy
26. AG-3 - Toggle available
27. AG-4 - Validation error
28. AG-5 - Deactivate agent
29. AG-6 - Reactivate agent
30. AG-7 - Agent cannot deactivate
31. AG-8 - Invalid ID format

## Tickets

32. T-1 - Create ticket, save `ticketId`
33. T-3 - Get ticket after AI delay
34. T-2 - Auto-resolve AI ticket
35. T-4 - Get all tickets
36. T-5 - Filter tickets
37. T-6 - Agent sees assigned only
38. T-7 - Assign ticket
39. T-8 - Update status
40. T-9 - Resolve ticket, AI summary
41. T-10 - Update priority
42. T-11 - Rate ticket
43. T-12 - Rate open ticket fail
44. T-13 - Cross-tenant access fail
45. T-14 - Usage counter increments

## Messages

46. M-1 - Get messages
47. M-2 - Agent sends message
48. M-3 - Business admin sends message
49. M-4 - Internal note
50. M-5 - Customer cannot see internal notes
51. M-6 - Customer cannot send internal note

## AI

52. AI-1 - Suggestions
53. AI-2 - Customer denied

## Analytics

54. AN-1 - Overview cache hit twice
55. AN-2 - Cache invalidation after ticket update
56. AN-3 - Trends
57. AN-4 - Agent stats
58. AN-5 - Platform stats
59. AN-6 - Agent denied

## Socket

60. S-1 - Connect
61. S-2 - Join ticket
62. S-3 - Send normal message
63. S-4 - Internal note isolation
64. S-5 - Typing
65. S-6 - Mark read
66. S-7 - Unauthorized join denied

## Widget

67. W-1 - Widget config
68. W-2 - Widget panel
69. W-3 - Loader script

---

# Key Tests For Judges

- T-13 - Cross-tenant access denied: multi-tenancy proof
- AN-1 - `fromCache: true` on second hit: Redis proof
- AN-2 - cache invalidates after write: Redis invalidation proof
- T-2 - auto-resolved or AI-classified ticket: AI proof
- AI-1 - 3 AI suggestions: Gen AI proof
- M-3 - business admin can send message: senderRole fix proof
- M-5 - customer cannot see internal note: data privacy proof
- S-4 - customer socket does not receive internal note: realtime privacy proof
- A-15 - old access token revoked after logout: Redis blacklist proof
- W-2 - widget panel opens in browser: embeddable widget proof

---

# Production Env Checklist Before Git Push / Deploy

Do not commit `.env`.

Required backend env:

```env
MONGODB_URI=...
JWT_ACCESS_SECRET=32+_char_strong_secret
JWT_REFRESH_SECRET=32+_char_strong_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=...
```

Redis, either:

```env
REDIS_URL=redis://default:password@host:6379
```

or:

```env
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
```

For one backend instance:

```text
Socket.io works even without Redis adapter, but Redis is needed for cache/logout blacklist.
```

For multiple backend instances:

```text
All backend instances must use the same Redis so Socket.io events fan out across replicas.
```
