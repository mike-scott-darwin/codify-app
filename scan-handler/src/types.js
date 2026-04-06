// Type definitions (JSDoc style for plain Node.js)
// ScanJob matches the payload from Vercel's /api/lead route

/**
 * @typedef {Object} Contact
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} ghlContactId
 */

/**
 * @typedef {Object} BusinessAnswers
 * @property {string} business
 * @property {string} audience
 * @property {string} differentiator
 * @property {string} challenge
 */

/**
 * @typedef {Object} ScanJob
 * @property {string} id
 * @property {string} created
 * @property {string} status
 * @property {Contact} contact
 * @property {{ answers: BusinessAnswers, uploads: Array, voiceNote: Object|null, inputMode: string }} input
 */

/**
 * @typedef {Object} ScannerOutput
 * @property {string} scanner - "google" | "claude" | "codex"
 * @property {Object} findings
 * @property {number} durationMs
 */

/**
 * @typedef {Object} Opportunity
 * @property {string} title
 * @property {string} explanation
 * @property {string} whyItMatters
 * @property {string} firstStep
 */

/**
 * @typedef {Object} AssessorOutput
 * @property {string} summary
 * @property {Opportunity[]} topOpportunities
 * @property {string} emailHtml
 */

export {};
