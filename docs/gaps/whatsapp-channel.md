# Gap: WhatsApp notifications channel
**Status:** Partial (feature SMS/WhatsApp)
## Current state
- SMS done: Africa's Talking gateway (`AfricaTalkingGateway.php` 58 lines real HTTP integration), SmsChannel, dispatcher architecture, per-category preferences UI. Ships disabled by default (`NOTIFICATION_CHANNEL_SMS=false`). WhatsApp exists ONLY as a wa.me social link in Footer.
## What's missing
- WhatsApp Business provider channel (Meta Cloud API or Twilio).
## Suggested approach
- Add `WhatsappChannel` implementing existing Contracts/NotificationChannel interface + Meta Cloud API gateway (graph.facebook.com messages endpoint, template messages for first-contact); config block alongside africastalking; env flag NOTIFICATION_CHANNEL_WHATSAPP.
## Dependencies
- None; amplifies CRM follow-ups once CRM lands.
