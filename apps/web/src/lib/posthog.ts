import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new PostHog(key, {
      host: "https://us.i.posthog.com",
      flushAt: 1,    // send immediately in serverless
      flushInterval: 0,
    });
  }
  return _client;
}

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function track(distinctId: string, event: string, props?: EventProps) {
  const ph = getClient();
  if (!ph) return;
  ph.capture({ distinctId, event, properties: props });
}

export function identify(distinctId: string, props: EventProps) {
  const ph = getClient();
  if (!ph) return;
  ph.identify({ distinctId, properties: props });
}
