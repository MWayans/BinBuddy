/* import { spawn } from "child_process";
import { existsSync } from "fs";
import path from "path";
import type { CvClassification } from "@/lib/classify/types";
import {
  getCvCheckpointPath,
  getCvConfigPath,
  getCvPythonPath,
  getMlRoot,
} from "@/lib/config/env";

function runPythonClassifier(
  args: string[],
  stdin?: string
): Promise<string> {
  const pythonPath = getCvPythonPath();
  const mlRoot = getMlRoot();

  return new Promise((resolve, reject) => {
    const child = spawn(pythonPath, args, {
      cwd: mlRoot,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            stderr.trim() || stdout.trim() || `Classifier exited with code ${code}`
          )
        );
        return;
      }
      resolve(stdout.trim());
    });

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

export function isCvModelAvailable(): boolean {
  return existsSync(getCvCheckpointPath());
}

export async function classifyImageBuffer(
  imageBuffer: Buffer
): Promise<CvClassification> {
  if (!isCvModelAvailable()) {
    throw new Error(
      `CNN checkpoint not found at ${getCvCheckpointPath()}. Train the model in ml/ first.`
    );
  }

  const encoded = imageBuffer.toString("base64");
  const output = await runPythonClassifier(
    [
      "-m",
      "ecoscan_ml.inference.predict",
      "--stdin-base64",
      "--config",
      path.relative(getMlRoot(), getCvConfigPath()),
      "--checkpoint",
      path.relative(getMlRoot(), getCvCheckpointPath()),
    ],
    encoded
  );

  const parsed = JSON.parse(output) as CvClassification & { error?: string };
  if (parsed.error) {
    throw new Error(parsed.error);
  }
  if (!parsed.category || parsed.confidence === undefined) {
    throw new Error("Classifier returned an invalid response");
  }

  return parsed;
}
 */

// lib/classify/runner.ts
// CHANGED: replaces child_process.spawn() with HTTP fetch to Railway CNN service

import type { CvClassification } from "@/lib/classify/types";
import { getInferenceMode } from "@/lib/config/env";

const CNN_SERVICE_URL = process.env.CNN_SERVICE_URL;

/**
 * Previously checked for best_model.pt on disk.
 * Now checks that the CNN_SERVICE_URL env var is set.
 */
export function isCvModelAvailable(): boolean {
  return Boolean(CNN_SERVICE_URL);
}

/**
 * Previously spawned a Python subprocess.
 * Now forwards the image buffer to the Railway FastAPI service.
 */
export async function classifyImageBuffer(
  imageBuffer: Buffer
): Promise<CvClassification> {
  if (!CNN_SERVICE_URL) {
    throw new Error(
      "CNN_SERVICE_URL is not set. Add your Railway service URL to environment variables."
    );
  }

  // Build the same multipart/form-data your route.ts already sends
  const formData = new FormData();
  const blob = new Blob([imageBuffer.buffer as ArrayBuffer], { type: "image/jpeg" });
  formData.append("image", blob, "image.jpg"); // field name must be "image"

  const response = await fetch(`${CNN_SERVICE_URL}/classify`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`CNN service error ${response.status}: ${detail}`);
  }

  const result = await response.json() as CvClassification & { error?: string };

  if (result.error) {
    throw new Error(result.error);
  }
  if (!result.category || result.confidence === undefined) {
    throw new Error("CNN service returned an invalid response");
  }

  return result;
}