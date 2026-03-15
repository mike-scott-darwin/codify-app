export type Platform = "gohighlevel" | "postiz" | "buffer" | "mailchimp" | "webhook";

export interface PlatformConfig {
  platform: Platform;
  label: string;
  description: string;
  icon: string;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "password" | "url";
    placeholder: string;
    required: boolean;
  }>;
  supportedOutputTypes: string[];
}

export interface IntegrationConnection {
  id?: string;
  platform: Platform;
  credentials: Record<string, string>;
  enabled: boolean;
  label?: string;
}

export interface PublishLogEntry {
  platform: Platform;
  publishedAt: string;
  externalId?: string;
  success: boolean;
  message?: string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  gohighlevel: {
    platform: "gohighlevel",
    label: "GoHighLevel",
    description: "Email sequences, SMS campaigns, CRM workflows",
    icon: "⚡",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "eyJhbGciOi...",
        required: true,
      },
      {
        key: "locationId",
        label: "Location ID",
        type: "text",
        placeholder: "loc_abc123...",
        required: true,
      },
    ],
    supportedOutputTypes: ["email_sequence", "ad_copy", "vsl_script"],
  },
  postiz: {
    platform: "postiz",
    label: "Postiz",
    description: "Schedule and publish social media posts",
    icon: "📮",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "pz_...",
        required: true,
      },
      {
        key: "instanceUrl",
        label: "Instance URL",
        type: "url",
        placeholder: "https://app.postiz.com",
        required: false,
      },
    ],
    supportedOutputTypes: ["social_post", "ad_copy"],
  },
  buffer: {
    platform: "buffer",
    label: "Buffer",
    description: "Schedule social media posts across platforms",
    icon: "📊",
    fields: [
      {
        key: "accessToken",
        label: "Access Token",
        type: "password",
        placeholder: "1/abc123...",
        required: true,
      },
    ],
    supportedOutputTypes: ["social_post", "ad_copy"],
  },
  mailchimp: {
    platform: "mailchimp",
    label: "Mailchimp",
    description: "Email campaigns and newsletter automation",
    icon: "📧",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "abc123-us21",
        required: true,
      },
      {
        key: "serverPrefix",
        label: "Server Prefix",
        type: "text",
        placeholder: "us21",
        required: true,
      },
    ],
    supportedOutputTypes: ["email_sequence", "landing_page"],
  },
  webhook: {
    platform: "webhook",
    label: "Webhook",
    description: "Send content to any URL as JSON payload",
    icon: "🔗",
    fields: [
      {
        key: "url",
        label: "Webhook URL",
        type: "url",
        placeholder: "https://example.com/webhook",
        required: true,
      },
      {
        key: "secret",
        label: "HMAC Secret",
        type: "password",
        placeholder: "Optional signing secret",
        required: false,
      },
    ],
    supportedOutputTypes: [
      "ad_copy",
      "social_post",
      "email_sequence",
      "vsl_script",
      "landing_page",
    ],
  },
};

export const ALL_PLATFORMS: Platform[] = Object.keys(PLATFORM_CONFIGS) as Platform[];
