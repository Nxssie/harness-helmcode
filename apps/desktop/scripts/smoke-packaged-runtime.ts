/** Validate the assembled application, including native Office conversion outside ASAR. */
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { resolveDesktopBuildTarget, resolveDesktopTargetBuildPaths } from './desktop-build-paths.mjs'
import { readDesktopRuntime, verifyDesktopRuntime } from '../src/runtime-tree.ts'
import { verifyWindowsCode } from './windows-runtime-signature.mjs'
import { smokePreparedRuntime } from './smoke-prepared-runtime.ts'
import { resolveDesktopPackageTarget } from './package-target.ts'

const paths = resolveDesktopTargetBuildPaths()
const { values } = parseArgs({ options: { unsigned: { type: 'boolean', default: false } }, allowPositionals: false })
const target = resolveDesktopBuildTarget()
const windows = target === 'win-x64'
const darwin = target === 'mac-arm64' || target === 'mac-x64'
const linux = target === 'linux-x64'
if (values.unsigned && !windows && !darwin && !linux) throw new Error('desktop smoke: unsigned artifacts require Windows, macOS, or Linux')
const artifacts = values.unsigned ? paths.unsignedArtifacts : paths.artifacts
const application = windows ? join(artifacts, 'win-unpacked')
  : darwin ? join(artifacts, target === 'mac-arm64' ? 'mac-arm64' : 'mac', 'Helmcode.app', 'Contents')
    : join(artifacts, 'linux-unpacked')
const resources = join(application, darwin ? 'Resources' : 'resources')
const executable = windows ? join(application, 'Helmcode.exe')
  : darwin ? join(application, 'MacOS', 'Helmcode')
    : join(application, 'Helmcode')
const descriptor = await verifyDesktopRuntime(paths.dsh, readDesktopRuntime(paths.dsh).release.version,
  resolveDesktopPackageTarget(target))
if (windows && !values.unsigned) await verifyWindowsCode(application)
await smokePreparedRuntime(join(resources, 'app.asar', 'dsh'), executable, join(resources, 'runtime'), descriptor)
