# Community Guardian Nearby Alerts — Short Threat Model (STRIDE)

## Assets and trust boundaries

Assets: victim safety and location, guardian presence, verified account identity, device push tokens, incident lifecycle, and consent records. Trust boundaries are the authenticated API, PostgreSQL, the user's device, and Firebase Cloud Messaging. The feature is disabled by default with `GUARDIAN_ALERTS_ENABLED=false`.

| STRIDE threat | Controls in this implementation | Residual risk / review needed |
|---|---|---|
| Spoofing: abuser registers as a guardian | Authenticated account; verified-phone check before opt-in; explicit consent; recipient-only alert API | A determined attacker can obtain multiple verified numbers or compromise an account. Phone verification is not proof of benign intent. |
| Tampering: fake presence / trilateration | Server rounds guardian position to 3 decimals; rejects jumps above 200 km/h; stores only grid-centre incident area and distance band; no arbitrary location lookup | The velocity check is heuristic and can be evaded by gradual movement or multiple accounts. Repeated blurred alerts can still reveal an approximate area. |
| Repudiation / audit gaps | Adds `nearby_alerts_created` audit event with incident id and recipient count only; consent timestamp retained | Audit entry does not identify recipients by design; operational investigation may be limited. Incident id is sensitive metadata and needs access control/retention review. |
| Information disclosure: victim identity/location leaks | Alert response contains only id/time/grid-centre/band; push text and data are neutral and contain no coordinates; recipient scoped queries; presence TTL/purge | Grid-centre coordinates remain location information. A 250 m grid is not anonymity, particularly in sparse areas or repeated observations. POPIA impact assessment and field testing are required before real use. |
| Denial of service / flooding / false SOS | Per-guardian hourly alert cap, per-victim hourly incident cap, recipient cap, global and route rate limits; incident close retracts open alerts | Hourly caps use transaction-scoped PostgreSQL advisory locks and transactional inserts; monitor lock contention and keep this behavior covered by concurrency tests when scaling to multiple API instances. Existing SOS abuse controls remain essential. |
| Elevation: stolen push token / invalid device | Token is tied to authenticated user; invalid FCM registration tokens are removed; token is not logged | Token theft can redirect notices until revoked. Secure device storage, account logout token cleanup, and FCM project/IAM review are required. |
| Stale presence | 30-minute freshness filter; app reports only while foregrounded; opt-out deletes presence; purge deletes presence older than 24 hours | Users who haven't opened the app recently will not be notified. This is intentionally foreground-only; no background tracking is implemented. |

## Data minimisation and POPIA considerations

- Guardian presence is rounded before storage and purged after 24 hours; alert rows are purged after 30 days.
- No victim name, phone, SA ID, exact incident coordinate, or exact distance is copied into alert rows, push payloads, or the new audit details.
- Explicit opt-in is required and can be revoked; disabling removes presence immediately.
- Obtain legal/privacy review, establish controller/operator responsibilities and lawful basis, document user notices, test retention jobs, and complete a threat-model review before production use.

## Operational limits

This is a prototype. Foreground-only presence limits coverage; Firebase credentials are external configuration; low user density means few guardians may be found. The feature does not replace SAPS/emergency services. Privacy controls reduce but do not eliminate probing or abuse risk. Nearby alerts do not send SMS.
