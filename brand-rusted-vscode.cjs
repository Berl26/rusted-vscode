'use strict';

// Sprint 1: independent Windows identity for the Code - OSS fork.
// Run from the root of rusted-vscode: node brand-rusted-vscode.cjs
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const productPath = path.join(root, 'product.json');
const packagePath = path.join(root, 'package.json');
if (!fs.existsSync(productPath) || !fs.existsSync(packagePath)) {
  console.error('ERROR: Run this script from the rusted-vscode repository root (product.json + package.json).');
  process.exit(1);
}

// Stable GUIDs for this fork. Do not regenerate them after distributing builds.
const changes = {
  nameShort: 'Rusted VSCode',
  nameLong: 'Rusted VSCode',
  applicationName: 'rusted-vscode',
  dataFolderName: '.rusted-vscode',
  sharedDataFolderName: '.rusted-vscode-shared',
  win32MutexName: 'rustedvscode',
  win32DirName: 'Rusted VSCode',
  win32NameVersion: 'Rusted VSCode',
  win32RegValueName: 'RustedVSCode',
  win32x64AppId: '{{98A928A3-F12D-481F-8DCA-04EC34D3223F}',
  win32arm64AppId: '{{365C72BC-B095-4B61-849B-04D33BEA781F}',
  win32x64UserAppId: '{{F133C520-BB02-4D3A-801B-AB29DF5CFB25}',
  win32arm64UserAppId: '{{D5CFF1C5-46AC-41A9-A127-43F1C1115755}',
  win32AppUserModelId: 'Berl26.RustedVSCode',
  win32ShellNameShort: 'Rusted VS&Code',
  win32TunnelServiceMutex: 'rustedvscode-tunnelservice',
  win32TunnelMutex: 'rustedvscode-tunnel',
  urlProtocol: 'rusted-vscode',
  serverApplicationName: 'rusted-vscode-server',
  serverDataFolderName: '.rusted-vscode-server',
  tunnelApplicationName: 'rusted-vscode-tunnel',
};

let original = fs.readFileSync(productPath, 'utf8');
let parsed;
try {
  parsed = JSON.parse(original);
} catch (error) {
  console.error('ERROR: product.json is not valid JSON:', error.message);
  process.exit(1);
}
const missing = Object.keys(changes).filter(key => !Object.hasOwn(parsed, key) || typeof parsed[key] !== 'string');
if (missing.length) {
  console.error('ERROR: product.json schema differs; no changes written. Missing or non-string fields:', missing.join(', '));
  process.exit(1);
}

// Replace just the string value of each existing field, preserving the rest of
// product.json verbatim. This keeps Git diffs small and easy to review.
let updated = original;
for (const [key, value] of Object.entries(changes)) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp('(^[ \\t]*"' + escaped + '"[ \\t]*:[ \\t]*)"(?:[^"\\\\]|\\\\.)*"', 'gm');
  let count = 0;
  updated = updated.replace(pattern, (_match, prefix) => {
    count += 1;
    return prefix + JSON.stringify(value);
  });
  if (count !== 1) {
    console.error(`ERROR: Expected exactly one ${key} field, found ${count}. No changes written.`);
    process.exit(1);
  }
}

let result;
try { result = JSON.parse(updated); }
catch (error) {
  console.error('ERROR: Generated product.json did not parse; no changes written:', error.message);
  process.exit(1);
}
for (const [key, value] of Object.entries(changes)) {
  if (result[key] !== value) {
    console.error(`ERROR: Validation failed for ${key}. No changes written.`);
    process.exit(1);
  }
}
if (original === updated) {
  console.log('Rusted VSCode branding is already applied. No changes needed.');
} else {
  fs.writeFileSync(productPath, updated, 'utf8');
  console.log('Updated product.json (Windows app identity, folders, URL protocol and server names).');
  console.log('Review changes with: git diff -- product.json');
}
console.log('Note: This does not build the editor or establish extension marketplace access.');
