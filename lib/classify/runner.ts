import { spawn } from "child_process";
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
