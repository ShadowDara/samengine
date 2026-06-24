#!/usr/bin/env node
'use strict'

const PLATFORMS = {
  darwin: {
    arm64: '@shadowdara/samtool-darwin-arm64/samtool',
    x64: '@shadowdara/samtool-darwin-x64/samtool',
  },
  linux: {
    x64: '@shadowdara/samtool-linux-x64/samtool',
  },
  win32: {
    x64: '@shadowdara/samtool-win32-x64/samtool.exe',
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
