import type { IntegrationConnection, Platform } from "./types";
import crypto from "crypto";

interface PublishResult {
  success: boolean;
  message: string;
  externalId?: string;
}

export async function publishToIntegration(
  connection: IntegrationConnection,
  outputType: string,
  content: string,
  metadata?: Record<string, string>
): Promise<PublishResult> {
  const publishers: Record<Platform, () => Promise<PublishResult>> = {
    gohighlevel: () => publishToGHL(connection, outputType, content, metadata),
    postiz: () => publishToPostiz(connection, outputType, content, metadata),
    buffer: () => publishToBuffer(connection, content, metadata),
    mailchimp: () => publishToMailchimp(connection, outputType, content, metadata),
    webhook: () => publishToWebhook(connection, outputType, content, metadata),
  };

  const publisher = publishers[connection.platform];
  if (!publisher) {
    return { success: false, message: "Unsupported platform: " + connection.platform };
  }

  try {
    return await publisher();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[publish] " + connection.platform + " failed:", msg);
    return { success: false, message: msg };
  }
}

async function publishToGHL(
  connection: IntegrationConnection,
  outputType: string,
  content: string,
  metadata?: Record<string, string>
): Promise<PublishResult> {
  const { apiKey, locationId } = connection.credentials;
  const baseUrl = "https://services.leadconnectorhq.com";

  if (outputType === "email_sequence") {
    // Create an email template via GHL API
    const res = await fetch(baseUrl + "/emails/builder", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        locationId,
        name: metadata?.title || "Codify Email",
        type: "html",
        html: "<div>" + content.replace(/\n/g, "<br>") + "</div>",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, message: "GHL API error: " + res.status + " " + errText };
    }

    const data = await res.json();
    console.log("[publish] GHL email created:", data);
    return {
      success: true,
      message: "Email template created in GoHighLevel",
      externalId: data.id || data.templateId,
    };
  }

  // Default: create a conversation message
  const res = await fetch(baseUrl + "/conversations/messages", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      type: "Email",
      locationId,
      message: content,
      subject: metadata?.title || "From Codify",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, message: "GHL API error: " + res.status + " " + errText };
  }

  const data = await res.json();
  return {
    success: true,
    message: "Content sent to GoHighLevel",
    externalId: data.messageId || data.id,
  };
}

async function publishToPostiz(
  connection: IntegrationConnection,
  outputType: string,
  content: string,
  metadata?: Record<string, string>
): Promise<PublishResult> {
  const { apiKey, instanceUrl } = connection.credentials;
  const base = (instanceUrl || "https://app.postiz.com").replace(/\/$/, "");

  const res = await fetch(base + "/api/posts", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      type: outputType === "social_post" ? "social" : "post",
      title: metadata?.title || "Codify Post",
      scheduledAt: metadata?.scheduledAt || undefined,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, message: "Postiz API error: " + res.status + " " + errText };
  }

  const data = await res.json();
  return {
    success: true,
    message: metadata?.scheduledAt ? "Post scheduled in Postiz" : "Post created in Postiz",
    externalId: data.id,
  };
}

async function publishToBuffer(
  connection: IntegrationConnection,
  content: string,
  metadata?: Record<string, string>
): Promise<PublishResult> {
  const { accessToken } = connection.credentials;

  // First get profiles to post to
  const profilesRes = await fetch("https://api.bufferapp.com/1/profiles.json?access_token=" + accessToken);
  if (!profilesRes.ok) {
    return { success: false, message: "Buffer API error fetching profiles: " + profilesRes.status };
  }

  const profiles = await profilesRes.json();
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return { success: false, message: "No Buffer profiles found. Connect a social account in Buffer first." };
  }

  // Post to first profile
  const profileId = profiles[0].id;
  const res = await fetch("https://api.bufferapp.com/1/updates/create.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      access_token: accessToken,
      text: content.slice(0, 2000),
      profile_ids: profileId,
      ...(metadata?.scheduledAt ? { scheduled_at: metadata.scheduledAt } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, message: "Buffer API error: " + res.status + " " + errText };
  }

  const data = await res.json();
  return {
    success: true,
    message: "Post added to Buffer queue",
    externalId: data.updates?.[0]?.id,
  };
}

async function publishToMailchimp(
  connection: IntegrationConnection,
  outputType: string,
  content: string,
  metadata?: Record<string, string>
): Promise<PublishResult> {
  const { apiKey, serverPrefix } = connection.credentials;
  const baseUrl = "https://" + serverPrefix + ".api.mailchimp.com/3.0";
  const authHeader = "Basic " + Buffer.from("codify:" + apiKey).toString("base64");

  // Create a campaign draft
  const campaignRes = await fetch(baseUrl + "/campaigns", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "regular",
      settings: {
        subject_line: metadata?.title || "Codify Campaign",
        title: metadata?.title || "Codify Campaign " + new Date().toISOString().split("T")[0],
        from_name: metadata?.fromName || "Codify",
        reply_to: metadata?.replyTo || "",
      },
    }),
  });

  if (!campaignRes.ok) {
    const errText = await campaignRes.text();
    return { success: false, message: "Mailchimp API error: " + campaignRes.status + " " + errText };
  }

  const campaign = await campaignRes.json();
  const campaignId = campaign.id;

  // Set campaign content
  const contentRes = await fetch(baseUrl + "/campaigns/" + campaignId + "/content", {
    method: "PUT",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html: "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto;\">" +
        content.replace(/\n/g, "<br>") +
        "</div>",
    }),
  });

  if (!contentRes.ok) {
    const errText = await contentRes.text();
    return { success: false, message: "Mailchimp content error: " + contentRes.status + " " + errText };
  }

  return {
    success: true,
    message: "Campaign draft created in Mailchimp",
    externalId: campaignId,
  };
}

async function publishToWebhook(
  connection: IntegrationConnection,
  outputType: string,
  content: string,
  metadata?: Record<string, string>
): Promise<PublishResult> {
  const { url, secret } = connection.credentials;

  const payload = JSON.stringify({
    outputType,
    content,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
    source: "codify",
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (secret) {
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    headers["X-Codify-Signature"] = "sha256=" + signature;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: payload,
  });

  if (!res.ok) {
    return { success: false, message: "Webhook returned " + res.status };
  }

  return {
    success: true,
    message: "Content delivered to webhook",
  };
}

export async function testIntegrationConnection(
  platform: Platform,
  credentials: Record<string, string>
): Promise<PublishResult> {
  try {
    switch (platform) {
      case "gohighlevel": {
        const res = await fetch("https://services.leadconnectorhq.com/locations/" + credentials.locationId, {
          headers: {
            Authorization: "Bearer " + credentials.apiKey,
            Version: "2021-07-28",
          },
        });
        if (!res.ok) return { success: false, message: "GHL auth failed: " + res.status };
        return { success: true, message: "Connected to GoHighLevel" };
      }
      case "postiz": {
        const base = (credentials.instanceUrl || "https://app.postiz.com").replace(/\/$/, "");
        const res = await fetch(base + "/api/user", {
          headers: { Authorization: "Bearer " + credentials.apiKey },
        });
        if (!res.ok) return { success: false, message: "Postiz auth failed: " + res.status };
        return { success: true, message: "Connected to Postiz" };
      }
      case "buffer": {
        const res = await fetch(
          "https://api.bufferapp.com/1/user.json?access_token=" + credentials.accessToken
        );
        if (!res.ok) return { success: false, message: "Buffer auth failed: " + res.status };
        return { success: true, message: "Connected to Buffer" };
      }
      case "mailchimp": {
        const baseUrl = "https://" + credentials.serverPrefix + ".api.mailchimp.com/3.0";
        const authHeader = "Basic " + Buffer.from("codify:" + credentials.apiKey).toString("base64");
        const res = await fetch(baseUrl + "/ping", {
          headers: { Authorization: authHeader },
        });
        if (!res.ok) return { success: false, message: "Mailchimp auth failed: " + res.status };
        return { success: true, message: "Connected to Mailchimp" };
      }
      case "webhook": {
        // For webhooks, just validate the URL format
        try {
          new URL(credentials.url);
          return { success: true, message: "Webhook URL is valid" };
        } catch {
          return { success: false, message: "Invalid webhook URL" };
        }
      }
      default:
        return { success: false, message: "Unknown platform" };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connection test failed";
    return { success: false, message: msg };
  }
}
