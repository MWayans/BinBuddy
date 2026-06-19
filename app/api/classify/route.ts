import { classifyImageBuffer, isCvModelAvailable } from "@/lib/classify/runner";
import { getInferenceMode } from "@/lib/config/env";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (getInferenceMode() !== "hybrid") {
      return Response.json(
        { error: "Classification is only available in hybrid inference mode" },
        { status: 400 }
      );
    }

    if (!isCvModelAvailable()) {
      return Response.json(
        {
          error:
            "CNN checkpoint not found. Train the model in ml/ or set CV_CHECKPOINT_PATH.",
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof Blob)) {
      return Response.json({ error: "image file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const result = await classifyImageBuffer(buffer);

    return Response.json(result);
  } catch (error) {
    console.error("Classify route error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Classification failed",
      },
      { status: 500 }
    );
  }
}
