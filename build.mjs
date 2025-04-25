import * as esbuild from "esbuild";
import { mkdirSync, existsSync } from "fs";

// Ensure browser output directory exists
if (!existsSync("./dist")) {
  mkdirSync("./dist");
}

// Build non-minified IIFE bundle
async function buildNonMinified() {
  await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "iife",
    globalName: "isInSubnet",
    sourcemap: true,
    target: ["es2015"],
    outfile: "dist/index.js",
    write: true,
  });
  console.log("Built non-minified IIFE bundle: dist/index.js");
}

// Build ESM bundle
async function buildESM() {
  await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "esm",
    sourcemap: true,
    target: ["es2020"],
    outfile: "dist/index.esm.js",
    write: true,
  });
  console.log("Built ESM bundle: dist/index.esm.js");
}

// Build CommonJS bundle
async function buildCJS() {
  await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "cjs",
    sourcemap: true,
    target: ["es2020"],
    outfile: "dist/index.cjs.js",
    write: true,
  });
  console.log("Built CommonJS bundle: dist/index.cjs.js");
}

// We'll skip minification since CDNs will handle it for us.

// Run builds
async function build() {
  try {
    await buildNonMinified();
    await buildESM();
    await buildCJS();
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
