
/**
 * AURA e-SAPS — Vendel SMS transport.
 *
 * Requirements:
 *   Node.js 18+
 *   npm install vendel-sdk
 *
 * Security:
 *   - Never log message bodies, phone numbers, OTPs, or API keys.
 *   - A successful API response means accepted, not necessarily delivered.
 */

import { VendelClient, VendelAPIError, VendelQuotaError } from "vendel-sdk";

const VENDEL_API_KEY = process.env.VENDEL_API_KEY;
const VENDEL_BASE_URL =
  process.env.VENDEL_BASE_URL || "https://app.vendel.cc";

let vendelClient;

function getVendelClient() {
  if (!VENDEL_API_KEY) {
    const error = new Error("Vendel API key is not configured");
    error.kind = "provider_not_configured";
    throw error;
  }

  if (!VENDEL_BASE_URL.startsWith("https://")) {
    const error = new Error("Vendel must use HTTPS");
    error.kind = "invalid_provider_configuration";
    throw error;
  }

  if (!vendelClient) {
    vendelClient = new VendelClient({
      baseUrl: VENDEL_BASE_URL,
      apiKey: VENDEL_API_KEY,
    });
  }

  return vendelClient;
}

function validatePhoneNumber(phoneNumber) {
  // International E.164 format, e.g. +27821234567.
  if (
    typeof phoneNumber !== "string" ||
    !/^\+[1-9]\d{7,14}$/.test(phoneNumber)
  ) {
    const error = new Error(
      "Phone number must be in international E.164 format"
    );
    error.kind = "invalid_recipient";
    throw error;
  }
}

function normalizeResponse(response) {
  return {
    success: true,
    provider: "vendel",
    status: response?.status ?? "accepted",
    batchId: response?.batch_id ?? null,
    messageIds: response?.message_ids ?? [],
  };
}

function logProviderError(error) {
  const status =
    error instanceof VendelAPIError
      ? error.statusCode
      : Number.isInteger(error?.statusCode)
        ? error.statusCode
        : null;

  const kind =
    error instanceof VendelQuotaError
      ? "quota_exceeded"
      : status === 401 || status === 403
        ? "provider_authentication_failed"
        : status === 429
          ? "provider_rate_limited"
          : status !== null
            ? "provider_error"
            : "provider_request_failed";

  // Deliberately omit the raw error, message, recipient and credentials.
  console.warn(
    "[VENDEL SMS FAILURE]",
    JSON.stringify({ status, kind })
  );

  const safeError = new Error("Vendel SMS delivery request failed");
  safeError.kind = kind;
  safeError.status = status;
  throw safeError;
}

async function sendMessage(phoneNumber, message) {
  validatePhoneNumber(phoneNumber);

  if (typeof message !== "string" || !message.trim()) {
    throw new Error("SMS message must not be empty");
  }

  try {
    const response = await getVendelClient().sendSms(
      [phoneNumber],
      message
    );

    console.info(
      "[VENDEL SMS ACCEPTED]",
      JSON.stringify({
        provider: "vendel",
        status: response?.status ?? "accepted",
        messageCount: response?.message_ids?.length ?? 0,
      })
    );

    return normalizeResponse(response);
  } catch (error) {
    logProviderError(error);
  }
}

async function sendTemplate(phoneNumber, templateId, variables) {
  validatePhoneNumber(phoneNumber);

  if (typeof templateId !== "string" || !templateId.trim()) {
    const error = new Error("Vendel template ID is not configured");
    error.kind = "template_not_configured";
    throw error;
  }

  try {
    const response = await getVendelClient().sendSmsTemplate(
      [phoneNumber],
      templateId,
      { variables }
    );

    console.info(
      "[VENDEL TEMPLATE ACCEPTED]",
      JSON.stringify({
        provider: "vendel",
        status: response?.status ?? "accepted",
        messageCount: response?.message_ids?.length ?? 0,
      })
    );

    return normalizeResponse(response);
  } catch (error) {
    logProviderError(error);
  }
}

export const smsService = {
  async sendOtp(phoneNumber, code) {
    if (
      (typeof code !== "string" && typeof code !== "number") ||
      !/^\d{4,10}$/.test(String(code))
    ) {
      throw new Error("OTP must contain between 4 and 10 digits");
    }

    const templateId = process.env.VENDEL_OTP_TEMPLATE_ID;

    if (templateId) {
      return sendTemplate(phoneNumber, templateId, {
        code: String(code),
        expiry: "10 minutes",
      });
    }

    const message =
      `[AURA e-SAPS] Your emergency verification code is ${code}. ` +
      "Valid for 10 minutes. Do not share this code with anyone.";

    return sendMessage(phoneNumber, message);
  },

  async notifyContact(
    contactPhone,
    contactName,
    citizenName,
    locationData,
    incidentId
  ) {
    const hasLocation =
      Number.isFinite(locationData?.lat) &&
      Number.isFinite(locationData?.lng) &&
      locationData.lat >= -90 &&
      locationData.lat <= 90 &&
      locationData.lng >= -180 &&
      locationData.lng <= 180;

    const location = hasLocation
      ? `https://maps.google.com/?q=${locationData.lat},${locationData.lng}`
      : "Location unavailable";

    const reference =
      incidentId && incidentId !== "unavailable"
        ? String(incidentId)
        : "Unavailable";

    const templateId = process.env.VENDEL_ALERT_TEMPLATE_ID;

    if (templateId) {
      return sendTemplate(contactPhone, templateId, {
        contactName: String(contactName || "Emergency contact"),
        citizenName: String(citizenName || "A citizen"),
        location,
        incidentId: reference,
        emergencyNumber: "10111",
      });
    }

    const message =
      `[AURA EMERGENCY ALERT] ${citizenName || "A citizen"} ` +
      "triggered a verified emergency distress signal. " +
      `Last known location: ${location}. ` +
      `e-SAPS dispatch ref: ${reference}. ` +
      "If unable to reach them, call SAPS 10111.";

    return sendMessage(contactPhone, message);
  },

  async getMessageStatus(messageId) {
    if (typeof messageId !== "string" || !messageId.trim()) {
      throw new Error("A message ID is required");
    }

    try {
      return await getVendelClient().getMessageStatus(messageId);
    } catch (error) {
      logProviderError(error);
    }
  },

  async getBatchStatus(batchId) {
    if (typeof batchId !== "string" || !batchId.trim()) {
      throw new Error("A batch ID is required");
    }

    try {
      return await getVendelClient().getBatchStatus(batchId);
    } catch (error) {
      logProviderError(error);
    }
  },

  async getQuota() {
    try {
      return await getVendelClient().getQuota();
    } catch (error) {
      logProviderError(error);
    }
  },
};

export default smsService;
