export type PostHogCaptureProps = Record<string, number | string>;

export type PostHogClient = {
  capture: (eventName: string, properties?: PostHogCaptureProps) => void;
};

export function capturePostHog(
  client: PostHogClient | undefined,
  eventName: string,
  properties?: PostHogCaptureProps
): void {
  if (!client) return;
  if (arguments.length === 2) {
    client.capture(eventName);
    return;
  }
  client.capture(eventName, properties);
}
