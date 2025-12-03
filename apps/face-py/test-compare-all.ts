#!/usr/bin/env tsx
/**
 * Test script to compare all images with each other using the face-py docker service.
 * Generates a distance matrix showing similarity between all image pairs.
 *
 * Usage:
 *   1. Start the face-py docker service: docker compose up -d face
 *   2. Run this script: npx tsx apps/face-py/test-compare-all.ts
 */

import { readFileSync, readdirSync, writeFileSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8000";
const IMAGES_DIR = join(__dirname, "..", "api", "images");

interface CompareResult {
  ok: boolean;
  distance: number;
  threshold: number;
  match: boolean;
  meta: {
    a: { faces: number; bbox?: number[]; det_score?: number };
    b: { faces: number; bbox?: number[]; det_score?: number };
  };
}

interface TestResult {
  image1: string;
  image2: string;
  distance: number | null;
  match: boolean;
  threshold?: number;
  meta?: any;
  error?: string;
}

interface SummaryResult {
  total_images: number;
  total_comparisons: number;
  matches: number;
  no_matches: number;
  errors: number;
  results: TestResult[];
}

function encodeImage(imagePath: string): string {
  const buffer = readFileSync(imagePath);
  return buffer.toString("base64");
}

async function compareImages(
  img1B64: string,
  img2B64: string,
  threshold: number = 0.4
): Promise<CompareResult> {
  const response = await fetch(`${FACE_SERVICE_URL}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a_b64: img1B64, b_b64: img2B64, threshold }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

function getImageFiles(): string[] {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const files = readdirSync(IMAGES_DIR);

  return files
    .filter((f) => {
      const fullPath = join(IMAGES_DIR, f);
      return (
        statSync(fullPath).isFile() &&
        imageExtensions.includes(extname(f).toLowerCase())
      );
    })
    .sort();
}

async function main() {
  console.log(`Face Service URL: ${FACE_SERVICE_URL}`);
  console.log(`Images Directory: ${IMAGES_DIR}\n`);

  // Check face service health
  try {
    const healthResponse = await fetch(`${FACE_SERVICE_URL}/health`);
    const health = await healthResponse.json();
    if (!health.ok) {
      console.log(
        "⚠️  Face service is not healthy. Please start it with: docker compose up -d face"
      );
      return;
    }
    console.log("✓ Face service is running\n");
  } catch (e) {
    console.log(`✗ Cannot connect to face service: ${e}`);
    console.log("Please start it with: docker compose up -d face");
    return;
  }

  // Get all image files
  const imageFiles = getImageFiles();
  if (imageFiles.length === 0) {
    console.log(`No image files found in ${IMAGES_DIR}`);
    return;
  }

  console.log(`Found ${imageFiles.length} images:\n`);
  imageFiles.forEach((img, i) => {
    console.log(`  ${i + 1}. ${img}`);
  });
  console.log();

  // Load all images
  console.log("Loading images...");
  const images: Record<string, string> = {};
  for (const imgFile of imageFiles) {
    try {
      const imgPath = join(IMAGES_DIR, imgFile);
      images[imgFile] = encodeImage(imgPath);
    } catch (e) {
      console.log(`  ✗ Failed to load ${imgFile}: ${e}`);
    }
  }

  if (Object.keys(images).length === 0) {
    console.log("No images could be loaded");
    return;
  }

  console.log(`✓ Loaded ${Object.keys(images).length} images\n`);

  // Compare all pairs
  console.log("Comparing all image pairs...");
  const results: TestResult[] = [];
  const imageNames = Object.keys(images).sort();
  const totalComparisons = (imageNames.length * (imageNames.length - 1)) / 2;
  let completed = 0;

  for (let i = 0; i < imageNames.length; i++) {
    for (let j = 0; j < imageNames.length; j++) {
      if (j <= i) continue; // Skip diagonal and duplicate pairs

      const name1 = imageNames[i];
      const name2 = imageNames[j];
      completed++;

      process.stdout.write(`\r  Progress: ${completed}/${totalComparisons}`);

      try {
        const result = await compareImages(images[name1], images[name2]);
        const distance = result.distance;
        const match = result.match;

        results.push({
          image1: name1,
          image2: name2,
          distance,
          match,
          threshold: result.threshold,
          meta: result.meta,
        });
      } catch (e: any) {
        const errorMsg = e.message || String(e);
        const errorDetail =
          errorMsg.includes("422") || errorMsg.toLowerCase().includes("no face")
            ? "No face detected"
            : errorMsg;

        results.push({
          image1: name1,
          image2: name2,
          distance: null,
          match: false,
          error: errorDetail,
        });
      }
    }
  }
  console.log("\n");

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80) + "\n");

  const matches = results.filter((r) => r.match);
  const noMatches = results.filter((r) => !r.match && r.distance !== null);
  const errors = results.filter((r) => r.error);

  console.log(`Total comparisons: ${results.length}`);
  console.log(`  Matches:         ${matches.length}`);
  console.log(`  No matches:      ${noMatches.length}`);
  console.log(`  Errors:          ${errors.length}\n`);

  if (matches.length > 0) {
    console.log("MATCHES (distance ≤ threshold):");
    matches
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .forEach((r) => {
        console.log(
          `  ${r.image1.padEnd(20)} ↔ ${r.image2.padEnd(20)} | distance: ${r.distance?.toFixed(
            4
          )}`
        );
      });
    console.log();
  }

  // Save results to JSON
  const outputFile = join(__dirname, "test-results.json");
  const summaryResult: SummaryResult = {
    total_images: imageNames.length,
    total_comparisons: results.length,
    matches: matches.length,
    no_matches: noMatches.length,
    errors: errors.length,
    results,
  };

  writeFileSync(outputFile, JSON.stringify(summaryResult, null, 2));
  console.log(`✓ Full results saved to: ${outputFile}`);

  // Print distance matrix
  console.log("\n" + "=".repeat(80));
  console.log("DISTANCE MATRIX");
  console.log("=".repeat(80) + "\n");

  // Create distance matrix
  const matrix = new Map<string, number>();
  for (const r of results) {
    if (r.distance !== null) {
      matrix.set(`${r.image1}:${r.image2}`, r.distance);
      matrix.set(`${r.image2}:${r.image1}`, r.distance);
    }
  }

  // Build table object for console.table
  const tableData: Record<string, Record<string, string>> = {};
  for (const name1 of imageNames) {
    tableData[name1] = {};
    for (const name2 of imageNames) {
      if (name1 === name2) {
        tableData[name1][name2] = "─";
      } else {
        const key = `${name1}:${name2}`;
        if (matrix.has(key)) {
          const dist = matrix.get(key)!;
          tableData[name1][name2] = dist.toFixed(4);
        } else {
          tableData[name1][name2] = "ERR";
        }
      }
    }
  }

  console.table(tableData);
  console.log();
}

main().catch(console.error);
