# Project Aura demo SMS checklist

## Before the demo
- [ ] Configure `SMS_PROVIDER=twilio` and the three `TWILIO_*` variables in the deployment environment; never commit credentials.
- [ ] In Twilio Console, add and verify every demo recipient (citizen, emergency contacts, responder) under **Verified Caller IDs**. Trial accounts generally deliver only to verified recipient numbers and may prepend a trial-account message.
- [ ] Confirm the configured sender is the Twilio trial number and that the account has trial credit.
- [ ] Ensure the recipient can receive SMS and has consented to receive test messages.

## Five-minute test
1. Submit a login OTP request for a verified demo number. Confirm the SMS arrives and verify with the code.
2. Request a code for an unverified number. Confirm the API does not claim delivery; check server logs for only the Twilio error code/status.
3. Create a test incident and dispatch it from the responder console. Confirm a verified contact receives the alert.
4. Check `audit_log` for `contact_sms_sent` or `contact_sms_failed`; details must contain only contact ID and error code.
5. Cancel/resolve the test incident and confirm the UI stops tracking.

Do not use real emergencies during demo tests. Console SMS mode is a development simulator, not real delivery.
