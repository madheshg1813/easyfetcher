const CLOUD = "dbsdu7dk5";

function cdnUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/${publicId}`;
}

export const IMAGES = {
  logo: cdnUrl("easyfetcher/logo/logo"),
  claudeIcon: cdnUrl("easyfetcher/connectors/claude-color"),
  // Face-centered square crop for the round avatar.
  authorMadhesh: `https://res.cloudinary.com/${CLOUD}/image/upload/c_fill,g_face,w_400,h_400,f_auto,q_auto/easyfetcher/author/madhesh`,
  destinations: {
    claude: cdnUrl("easyfetcher/destinations/claude"),
    chatgpt: cdnUrl("easyfetcher/destinations/chatgpt"),
    perplexity: cdnUrl("easyfetcher/destinations/perplexity"),
    gemini: cdnUrl("easyfetcher/destinations/gemini"),
  },
  connectors: {
    gsc: cdnUrl("easyfetcher/connectors/gsc"),
    ga4: cdnUrl("easyfetcher/connectors/google-analytics"),
    gmb: cdnUrl("easyfetcher/connectors/google-my-business"),
    pagespeed: cdnUrl("easyfetcher/connectors/pagespeed"),
    facebook: cdnUrl("easyfetcher/connectors/facebook"),
    instagram: cdnUrl("easyfetcher/connectors/instagram"),
    shopify: cdnUrl("easyfetcher/connectors/shopify"),
    googleAds: cdnUrl("easyfetcher/connectors/icons8-google-ads"),
    linkedin: cdnUrl("easyfetcher/connectors/linkedin"),
    reddit: cdnUrl("easyfetcher/connectors/reddit"),
    tiktok: cdnUrl("easyfetcher/connectors/tiktok"),
    bing: cdnUrl("easyfetcher/connectors/bing"),
    claude: cdnUrl("easyfetcher/connectors/claude"),
    googleTrends: cdnUrl("easyfetcher/connectors/google-trends"),
    // AI assistants (for the AI Traffic Report)
    chatgpt: cdnUrl("easyfetcher/connectors/chatgpt"),
    gemini: cdnUrl("easyfetcher/connectors/gemini"),
    perplexity: cdnUrl("easyfetcher/connectors/perplexity"),
    grok: cdnUrl("easyfetcher/connectors/grok"),
    copilot: cdnUrl("easyfetcher/connectors/copilot"),
    meta: cdnUrl("easyfetcher/connectors/meta"),
  },
} as const;

// AI assistants EasyFetcher's MCP connects to (with brand accent colors).
export const DESTINATIONS = [
  { name: "Claude", img: IMAGES.destinations.claude, color: "#D97757" },
  { name: "ChatGPT", img: IMAGES.destinations.chatgpt, color: "#10A37F" },
  { name: "Perplexity", img: IMAGES.destinations.perplexity, color: "#20808D" },
] as const;
