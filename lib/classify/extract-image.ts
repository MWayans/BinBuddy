import type { UIMessage } from "ai";

export function extractImageBufferFromMessages(
  messages: UIMessage[]
): Buffer | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;

    for (const part of message.parts) {
      if (part.type !== "file") continue;
      const filePart = part as { mediaType?: string; url?: string };
      if (!filePart.mediaType?.startsWith("image/") || !filePart.url) {
        continue;
      }

      if (filePart.url.startsWith("data:")) {
        const base64 = filePart.url.split(",")[1];
        if (base64) {
          return Buffer.from(base64, "base64");
        }
      }
    }
  }

  return null;
}
