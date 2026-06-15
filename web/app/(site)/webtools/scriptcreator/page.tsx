'use client';

import { useState } from "react";

export default function ScriptCreator() {
  const [programName, setProgramName] = useState("");
  const [scriptName, setScriptName] = useState("");

  const [shellOutput, setShellOutput] = useState("");
  const [batchOutput, setBatchOutput] = useState("");

  function generateScriptBatch(name: string, scriptname: string) {
    return `@echo off

REM Created by Script Generator
REM https://shadowdara.github.io/script-creator

REM Get the Directory of the Batch Script
set SCRIPT_DIR=%~dp0

REM Start the Python Script in the same Folder
${name} "%SCRIPT_DIR%${scriptname}" %*`;
  }

  function generateScriptShell(name: string, scriptname: string) {
    return `#!/bin/bash

# Created by Script Generator
# https://shadowdara.github.io/script-creator

# Get Directory of the Shell Script
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

# Start the Python Script in the Same Folder
${name} "$SCRIPT_DIR/${scriptname}" "$@"`;
  }

  function generateScripts() {
    setShellOutput(generateScriptShell(programName, scriptName));
    setBatchOutput(generateScriptBatch(programName, scriptName));
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch (err) {
      console.error("Error while copying:", err);
    }
  }

  return (
    <div className="script-creator">
      <h1>Script Creator</h1>

      <input
        type="text"
        placeholder="Program Name"
        value={programName}
        onChange={(e) => setProgramName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Script Name"
        value={scriptName}
        onChange={(e) => setScriptName(e.target.value)}
      />

      <button onClick={generateScripts}>Generate</button>

      <h2>Shell</h2>
      <pre>{shellOutput}</pre>

      <button onClick={() => copyText(shellOutput)}>
        Copy Shell Content
      </button>

      <h2>Batch</h2>
      <pre>{batchOutput}</pre>

      <button onClick={() => copyText(batchOutput)}>
        Copy Batch Content
      </button>
    </div>
  );
}
