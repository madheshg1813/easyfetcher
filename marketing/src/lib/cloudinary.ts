const CLOUD = "dbsdu7dk5";

function cdnUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/${publicId}`;
}

export const IMAGES = {
  logo: cdnUrl("easyfetcher/logo/logo"),
  claudeIcon: cdnUrl("easyfetcher/connectors/claude-color"),
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
  },
} as const;
