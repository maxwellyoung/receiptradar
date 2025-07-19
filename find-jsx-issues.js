#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Function to check if a file might have JSX issues
function checkFileForJSXIssues(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Look for potential JSX syntax issues
    const jsxPatterns = [
      { pattern: /</g, name: "JSX opening tag" },
      { pattern: /</g, name: "JSX closing tag" },
      { pattern: /\w+\s*=\s*{/g, name: "JSX attribute with expression" },
      { pattern: /\w+\s*=\s*"/g, name: "JSX attribute with string" },
      { pattern: />\s*{/g, name: "JSX with embedded expression" },
    ];

    // Count lines to identify potential problematic areas
    const lines = content.split("\n");
    const totalLines = lines.length;

    // Check for large files that might cause bundling issues
    if (totalLines > 1000) {
      console.log(`⚠️  [LARGE FILE] ${filePath} (${totalLines} lines)`);
    }

    // Check for complex JSX patterns
    let jsxComplexity = 0;
    jsxPatterns.forEach(({ pattern }) => {
      const matches = (content.match(pattern) || []).length;
      jsxComplexity += matches;
    });

    if (jsxComplexity > 100) {
      console.log(
        `🔍 [COMPLEX JSX] ${filePath} (complexity: ${jsxComplexity})`
      );

      // Find lines with potential JSX issues
      lines.forEach((line, i) => {
        if (
          line.includes("<") &&
          line.includes(">") &&
          line.includes("{") &&
          line.includes("}")
        ) {
          if (line.length > 100) {
            console.log(
              `   Line ${i + 1}: ${line.substring(0, 50)}... (${
                line.length
              } chars)`
            );
          }
        }
      });
    }

    return { path: filePath, lines: totalLines, jsxComplexity };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

// Main function to scan directories
async function scanForJSXIssues() {
  console.log("🔍 Scanning for potential JSX issues...");

  // Get all TypeScript/React files
  const tsxFiles = execSync(
    'find . -type f -name "*.tsx" | grep -v "node_modules"'
  )
    .toString()
    .split("\n")
    .filter(Boolean);

  console.log(`Found ${tsxFiles.length} TSX files to scan`);

  // Check each file
  const results = [];
  for (const file of tsxFiles) {
    const result = checkFileForJSXIssues(file);
    if (result) results.push(result);
  }

  // Sort by complexity
  results.sort((a, b) => b.jsxComplexity - a.jsxComplexity);

  console.log("\n🔍 Top 5 most complex JSX files:");
  results.slice(0, 5).forEach((result, i) => {
    console.log(
      `${i + 1}. ${result.path} (${result.lines} lines, JSX complexity: ${
        result.jsxComplexity
      })`
    );
  });

  console.log("\n🔍 Largest files:");
  results.sort((a, b) => b.lines - a.lines);
  results.slice(0, 5).forEach((result, i) => {
    console.log(`${i + 1}. ${result.path} (${result.lines} lines)`);
  });
}

// Run the scanner
scanForJSXIssues().catch(console.error);
