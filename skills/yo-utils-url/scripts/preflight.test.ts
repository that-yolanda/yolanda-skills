import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

function runPreflight(extraArgs: string[] = [], timeout = 20000): { exitCode: number; stdout: string } {
  try {
    const stdout = execFileSync(
      "bun",
      [join(import.meta.dir, "preflight.ts"), ...extraArgs],
      { encoding: "utf-8", timeout },
    );
    return { exitCode: 0, stdout: stdout.trim() };
  } catch (e: any) {
    return { exitCode: e.status || 1, stdout: (e.stdout || "").trim() };
  }
}

describe("preflight", () => {
  test("--need-browser false returns ok without browser", () => {
    const { stdout, exitCode } = runPreflight(["--need-browser", "false"]);
    expect(exitCode).toBe(0);
    const json = JSON.parse(stdout);
    expect(json.status).toBe("ok");
    expect(json.browser_needed).toBe(false);
  });

  test("--need-browser true returns valid JSON structure", () => {
    const { stdout } = runPreflight(["--need-browser", "true"], 20000);
    const json = JSON.parse(stdout);
    expect(json).toHaveProperty("status");
    expect(["ok", "error"]).toContain(json.status);

    if (json.status === "ok") {
      expect(json.browser_needed).toBe(true);
    } else {
      expect(json).toHaveProperty("step");
      expect(json).toHaveProperty("message");
      expect(["opencli", "launch", "extension"]).toContain(json.step);
    }
  }, 20000);

  test("--config with nonexistent file uses defaults", () => {
    const { stdout } = runPreflight(["--need-browser", "true", "--config", "/nonexistent/path"], 20000);
    const json = JSON.parse(stdout);
    expect(json).toHaveProperty("status");
  }, 20000);

  test("error responses contain step and message", () => {
    const { exitCode, stdout } = runPreflight(["--need-browser", "true"], 20000);
    if (exitCode !== 0) {
      const json = JSON.parse(stdout);
      expect(json.status).toBe("error");
      expect(json).toHaveProperty("step");
      expect(json).toHaveProperty("message");
      expect(["opencli", "launch", "extension"]).toContain(json.step);
    }
  }, 20000);
});
