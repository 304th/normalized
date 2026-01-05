import type { CloudProvider } from "./types";
import { TimewebCloudProvider } from "./timeweb";

export * from "./types";
export { TimewebCloudProvider };

let provider: CloudProvider | null = null;

export function getCloudProvider(): CloudProvider {
  if (!provider) {
    const token = process.env.TIMEWEB_API_TOKEN;
    if (!token) {
      throw new Error("TIMEWEB_API_TOKEN not configured");
    }
    provider = new TimewebCloudProvider({
      apiToken: token,
      defaultPresetId: Number(process.env.TIMEWEB_PRESET_ID) || undefined,
    });
  }
  return provider;
}

export function setCloudProvider(p: CloudProvider): void {
  provider = p;
}
