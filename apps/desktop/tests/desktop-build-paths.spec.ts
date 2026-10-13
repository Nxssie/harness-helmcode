import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  desktopTargetBuildPaths,
  desktopTargetPlatform,
  developmentRuntimeDirectory,
  electronExecutablePath,
  resolveDesktopBuildTarget,
  type DesktopBuildTarget,
} from '../scripts/desktop-build-paths.mjs'

describe('desktop build paths', () => {
  it('isolates every mutable build directory by complete target', () => {
    const arm64 = desktopTargetBuildPaths('mac-arm64')
    const x64 = desktopTargetBuildPaths('mac-x64')
    const windows = desktopTargetBuildPaths('win-x64')
    const mutableKeys = [
      'root',
      'artifacts',
      'unsignedArtifacts',
      'runtime',
      'packageSet',
      'dsh',
      'dshPnpm',
      'electron',
      'packedDsh',
      'packedVendor',
      'packedLandlock',
    ] as const

    for (const key of mutableKeys) {
      expect(new Set([arm64[key], x64[key], windows[key]]).size).toBe(3)
    }
    expect(arm64.artifacts).toContain(join('targets', 'mac-arm64', 'artifacts'))
    expect(x64.dsh).toContain(join('targets', 'mac-x64', 'dsh'))
    expect(windows.runtime).toContain(join('targets', 'win-x64', 'runtime'))
  })

  it('shares only the immutable upstream download cache', () => {
    const arm64 = desktopTargetBuildPaths('mac-arm64')
    const x64 = desktopTargetBuildPaths('mac-x64')
    expect(arm64.downloads).toBe(x64.downloads)
    expect(arm64.downloads).not.toContain(`${sep}targets${sep}`)
  })

  it('resolves the development primary runtime from the build target rather than the host architecture', () => {
    expect(developmentRuntimeDirectory({}, 'darwin', 'arm64'))
      .toContain(join('targets', 'mac-arm64', 'runtime', 'primary-runtime'))
    expect(developmentRuntimeDirectory({}, 'darwin', 'x64'))
      .toContain(join('targets', 'mac-x64', 'runtime', 'primary-runtime'))
    expect(developmentRuntimeDirectory({}, 'win32', 'arm64'))
      .toContain(join('targets', 'win-x64', 'runtime', 'primary-runtime'))
  })

  it('maps every target to the platform and architecture of the payload it prepares', () => {
    expect(desktopTargetPlatform('mac-arm64')).toEqual({ platform: 'darwin', arch: 'arm64' })
    expect(desktopTargetPlatform('mac-x64')).toEqual({ platform: 'darwin', arch: 'x64' })
    expect(desktopTargetPlatform('win-x64')).toEqual({ platform: 'win32', arch: 'x64' })
    expect(desktopTargetPlatform('linux-x64')).toEqual({ platform: 'linux', arch: 'x64' })
  })

  it('isolates the Linux target directories under the target root', () => {
    const linux = desktopTargetBuildPaths('linux-x64')
    expect(linux.root).toContain(join('.desktop-build', 'targets', 'linux-x64'))
    expect(linux.artifacts).toContain(join('targets', 'linux-x64', 'artifacts'))
    expect(linux.packedDsh).toContain(join('targets', 'linux-x64', 'packed', 'dsh'))
  })

  it('resolves environment overrides and rejects unsupported targets', () => {
    expect(resolveDesktopBuildTarget({
      DSH_DESKTOP_TARGET_PLATFORM: 'darwin',
      DSH_DESKTOP_TARGET_ARCH: 'x64',
    }, 'darwin', 'arm64')).toBe('mac-x64')
    expect(resolveDesktopBuildTarget({}, 'win32', 'x64')).toBe('win-x64')
    expect(() => resolveDesktopBuildTarget({}, 'linux', 'arm64')).toThrow(/unsupported target linux-arm64/u)
    expect(() => resolveDesktopBuildTarget({}, 'freebsd', 'x64')).toThrow(/unsupported target freebsd-x64/u)
  })

  it('resolves each target Electron executable inside that target own electron directory', () => {
    const windows = electronExecutablePath('win-x64')
    const macArm64 = electronExecutablePath('mac-arm64')
    const macX64 = electronExecutablePath('mac-x64')
    const linux = electronExecutablePath('linux-x64')

    expect(relative(desktopTargetBuildPaths('win-x64').electron, windows)).toBe('electron.exe')
    expect(relative(desktopTargetBuildPaths('mac-arm64').electron, macArm64))
      .toBe(join('Electron.app', 'Contents', 'MacOS', 'Electron'))
    expect(relative(desktopTargetBuildPaths('mac-x64').electron, macX64))
      .toBe(join('Electron.app', 'Contents', 'MacOS', 'Electron'))
    expect(relative(desktopTargetBuildPaths('linux-x64').electron, linux)).toBe('electron')
    expect(windows).toContain(join('targets', 'win-x64', 'electron'))
    expect(macArm64).toContain(join('targets', 'mac-arm64', 'electron'))
    expect(macX64).toContain(join('targets', 'mac-x64', 'electron'))
    expect(linux).toContain(join('targets', 'linux-x64', 'electron'))
  })

  it('rejects an unsupported target when resolving the Electron executable', () => {
    expect(() => electronExecutablePath('linux-arm64' as DesktopBuildTarget))
      .toThrow(/unsupported target linux-arm64/u)
  })

  it('resolves a Linux x64 host and a Linux platform override to the linux-x64 target', () => {
    expect(resolveDesktopBuildTarget({}, 'linux', 'x64')).toBe('linux-x64')
    expect(resolveDesktopBuildTarget({
      DSH_DESKTOP_TARGET_PLATFORM: 'linux',
      DSH_DESKTOP_TARGET_ARCH: 'x64',
    }, 'darwin', 'arm64')).toBe('linux-x64')
  })
})
