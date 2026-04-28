import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const TMP_DIR = join(import.meta.dir, ".test-postprocess-tmp");

beforeEach(() => {
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TMP_DIR, { recursive: true, force: true });
});

function runPostprocess(extraArgs: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execFileSync(
      "bun",
      [join(import.meta.dir, "postprocess.ts"), ...extraArgs],
      { encoding: "utf-8", timeout: 15000, cwd: TMP_DIR },
    );
    return { exitCode: 0, stdout: stdout.trim() };
  } catch (e: any) {
    return { exitCode: e.status || 1, stdout: (e.stdout || "").trim() };
  }
}

function createTestStructure(tmpDir: string, files: Record<string, string>) {
  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(tmpDir, path);
    mkdirSync(join(fullPath, ".."), { recursive: true });
    writeFileSync(fullPath, content, "utf-8");
  }
}

function writeExtend(path: string, content: string) {
  writeFileSync(path, content, "utf-8");
}

function makeExtend(opts: {
  mdDir?: string;
  assetDir?: string;
  link?: string;
  download?: string;
}): string {
  const mdDir = opts.mdDir || join(TMP_DIR, "out/md");
  const assetDir = opts.assetDir || join(TMP_DIR, "out/assets");
  const link = opts.link || "short";
  const download = opts.download ?? "- image";
  return `---
tmp_dir: .tmp
markdown:
  dir: ${mdDir}/{platform}
  link: ${link}
assets:
  download:
    ${download}
  dir: ${assetDir}/{type}/{article_name}
---`;
}

describe("postprocess", () => {
  test("no markdown files returns empty summary", () => {
    const tmpData = join(TMP_DIR, "data");
    mkdirSync(tmpData, { recursive: true });

    const { stdout, exitCode } = runPostprocess([
      "--tmp", tmpData,
      "--title", "test",
      "--platform", "web",
    ]);

    expect(exitCode).toBe(0);
    const json = JSON.parse(stdout);
    expect(json.files).toBe(0);
    expect(json.images).toBe(0);
  });

  test("basic markdown processing with short link", () => {
    const tmpData = join(TMP_DIR, "data");
    const extendPath = join(TMP_DIR, "EXTEND.md");

    writeExtend(extendPath, makeExtend({}));

    createTestStructure(tmpData, {
      "article.md": "# Hello World\n\nSome content.\n\n![img](images/photo1.png)\n\nMore text.",
      "images/photo1.png": "fake-image-data",
    });

    const { stdout, exitCode } = runPostprocess([
      "--tmp", tmpData,
      "--title", "测试文章标题",
      "--platform", "web",
      "--config", extendPath,
    ]);

    expect(exitCode).toBe(0);
    const json = JSON.parse(stdout);
    expect(json.files).toBe(1);
    expect(json.images).toBe(1);

    const mdContent = readFileSync(
      join(TMP_DIR, "out/md/web/测试文章标题.md"),
      "utf-8",
    );
    expect(mdContent).toContain("![[测试文章标题-photo1.png]]");
  });

  test("long link uses relative paths", () => {
    const tmpData = join(TMP_DIR, "data");
    const extendPath = join(TMP_DIR, "EXTEND.md");

    writeExtend(extendPath, makeExtend({ link: "long" }));

    createTestStructure(tmpData, {
      "article.md": "# Test\n\n![photo](images/pic.jpg)",
      "images/pic.jpg": "fake-image",
    });

    const { stdout } = runPostprocess([
      "--tmp", tmpData,
      "--title", "My Article",
      "--platform", "web",
      "--config", extendPath,
    ]);

    const json = JSON.parse(stdout);
    expect(json.files).toBe(1);

    const mdContent = readFileSync(join(TMP_DIR, "out/md/web/My Article.md"), "utf-8");
    expect(mdContent).toContain("My Article-pic.jpg");
    expect(mdContent).toMatch(/!\[.*\]\(.*My Article-pic\.jpg\)/);
  });

  test("title truncation to 32 chars", () => {
    const tmpData = join(TMP_DIR, "data");
    const extendPath = join(TMP_DIR, "EXTEND.md");
    const longTitle = "这是一个非常非常长的文章标题用来测试截断功能是否正常工作";

    writeExtend(extendPath, makeExtend({ download: "- image" }));

    createTestStructure(tmpData, {
      "article.md": "# Long title article",
    });

    const { stdout } = runPostprocess([
      "--tmp", tmpData,
      "--title", longTitle,
      "--platform", "web",
      "--config", extendPath,
    ]);

    const json = JSON.parse(stdout);
    expect(json.files).toBe(1);

    const truncated = longTitle.slice(0, 32);
    const mdPath = join(TMP_DIR, "out/md/web", `${truncated}.md`);
    expect(existsSync(mdPath)).toBe(true);
  });

  test("cleans HTML tags from markdown", () => {
    const tmpData = join(TMP_DIR, "data");
    const extendPath = join(TMP_DIR, "EXTEND.md");

    writeExtend(extendPath, makeExtend({ download: "- image" }));

    createTestStructure(tmpData, {
      "article.md":
        "<style>body { color: red; }</style>\n# Title\n\n<script>alert('xss')</script>\n\n<div class=\"wrapper\">Content</div>\n\n<!-- comment -->\n\n\n\nText",
    });

    runPostprocess([
      "--tmp", tmpData,
      "--title", "Clean Test",
      "--platform", "web",
      "--config", extendPath,
    ]);

    const mdContent = readFileSync(join(TMP_DIR, "out/md/web/Clean Test.md"), "utf-8");
    expect(mdContent).not.toContain("<style>");
    expect(mdContent).not.toContain("<script>");
    expect(mdContent).not.toContain("<!--");
    expect(mdContent).toContain("Content");
    expect(mdContent).toContain("# Title");
  });

  test("tmp directory is cleaned up after processing", () => {
    const tmpData = join(TMP_DIR, "data-tmp");
    const extendPath = join(TMP_DIR, "EXTEND.md");

    writeExtend(extendPath, makeExtend({ download: "- image" }));

    createTestStructure(tmpData, {
      "article.md": "# Cleanup test",
    });

    expect(existsSync(tmpData)).toBe(true);

    runPostprocess([
      "--tmp", tmpData,
      "--title", "Cleanup",
      "--platform", "web",
      "--config", extendPath,
    ]);

    expect(existsSync(tmpData)).toBe(false);
  });

  test("chrome.pid without fingerprint is preserved during cleanup", () => {
    const tmpData = join(TMP_DIR, "data-chrome1");
    const extendPath = join(TMP_DIR, "EXTEND.md");

    writeExtend(extendPath, makeExtend({ download: "- image" }));

    createTestStructure(tmpData, {
      "article.md": "# Chrome cleanup test",
      "chrome.pid": JSON.stringify({
        pid: 99999,
        "user-data-dir": "",
      }),
    });

    runPostprocess([
      "--tmp", tmpData,
      "--title", "Chrome Cleanup",
      "--platform", "web",
      "--config", extendPath,
    ]);

    expect(existsSync(join(TMP_DIR, "out/md/web/Chrome Cleanup.md"))).toBe(true);
  });

  test("chrome.pid with fingerprint triggers cleanup", () => {
    const tmpData = join(TMP_DIR, "data-chrome2");
    const extendPath = join(TMP_DIR, "EXTEND.md");

    writeExtend(extendPath, makeExtend({ download: "- image" }));

    createTestStructure(tmpData, {
      "article.md": "# Chrome cleanup test 2",
      "chrome.pid": JSON.stringify({
        pid: 99999,
        "user-data-dir": "/some/isolated/path",
      }),
    });

    runPostprocess([
      "--tmp", tmpData,
      "--title", "Chrome Cleanup 2",
      "--platform", "web",
      "--config", extendPath,
    ]);

    expect(existsSync(join(TMP_DIR, "out/md/web/Chrome Cleanup 2.md"))).toBe(true);
    expect(existsSync(tmpData)).toBe(false);
  });

  test("video assets processed alongside images", () => {
    const tmpData = join(TMP_DIR, "data-video");
    const extendPath = join(TMP_DIR, "EXTEND.md");

    writeExtend(extendPath, makeExtend({ download: "- image\n    - video" }));

    createTestStructure(tmpData, {
      "article.md": "# Video test\n\n![img](images/photo.png)\n\nSome text.",
      "images/photo.png": "fake-image",
      "videos/clip.mp4": "fake-video",
    });

    const { stdout, exitCode } = runPostprocess([
      "--tmp", tmpData,
      "--title", "Video Article",
      "--platform", "web",
      "--config", extendPath,
    ]);

    expect(exitCode).toBe(0);
    const json = JSON.parse(stdout);
    expect(json.files).toBe(1);
    expect(json.images).toBe(1);
    expect(json.videos).toBe(1);

    expect(existsSync(join(TMP_DIR, "out/assets/image/Video Article/Video Article-photo.png"))).toBe(true);
    expect(existsSync(join(TMP_DIR, "out/assets/video/Video Article/Video Article-clip.mp4"))).toBe(true);
  });
});
