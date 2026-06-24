#!/usr/bin/env node
'use strict'

const PLATFORMS = {
  darwin: {
    arm64: '@shadowdara/seg-darwin-arm64/seg',
    x64: '@shadowdara/seg-darwin-x64/seg',
  },
  linux: {
    x64: '@shadowdara/seg-linux-x64/seg',
  },
  win32: {
    x64: '@shadowdara/seg-win32-x64/seg.exe',
  },
}

const binPath = PLATFORMS[process.platform]?.[process.arch]

if (!binPath) {
  console.error(`Unsupported platform: ${process.platform} ${process.arch}`)
  process.exit(1)
}

const bin = require.resolve(binPath)
const result = require('child_process').spawnSync(bin, process.argv.slice(2), { stdio: 'inherit' })
if (result.error) {
  throw result.error
}
process.exitCode = result.status ?? 1
