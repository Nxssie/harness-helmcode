import type { DesktopAutoUpdateTarget } from './desktop-auto-update-environment.mjs'

/**
 * Build target names the build-path model accepts.
 * `linux-x64` is a local build and launch target with no release automation of its own.
 */
export type DesktopBuildTarget = DesktopAutoUpdateTarget | 'linux-x64'

/** Mutable target directories plus the shared immutable download cache. */
export interface DesktopTargetBuildPaths {
  readonly root: string
  readonly artifacts: string
  readonly unsignedArtifacts: string
  readonly runtime: string
  readonly packageSet: string
  readonly dsh: string
  readonly dshPnpm: string
  readonly electron: string
  readonly packedDsh: string
  readonly packedVendor: string
  readonly packedLandlock: string
  readonly downloads: string
}

/**
 * Resolve the fixed build target selected by a packaging environment.
 * @param env - Packaging environment.
 * @param hostPlatform - Build-host platform used when no target override exists.
 * @param hostArch - Build-host architecture used when no target override exists.
 * @returns Supported Desktop target name.
 */
export function resolveDesktopBuildTarget(
  env?: NodeJS.ProcessEnv,
  hostPlatform?: NodeJS.Platform,
  hostArch?: string,
): DesktopBuildTarget

/**
 * Return the mutable preparation and artifact directories owned by one release target.
 * @param target - Supported Desktop target name.
 * @returns Target paths plus the shared immutable download cache.
 */
export function desktopTargetBuildPaths(target: DesktopBuildTarget): DesktopTargetBuildPaths

/**
 * Return the platform and architecture of the payload one release target prepares.
 * Windows is prepared as x64 only, so this differs from the build host on an arm64 Windows machine.
 * @param target - Supported Desktop target name.
 * @returns Platform and architecture of the prepared payload.
 */
export function desktopTargetPlatform(target: DesktopBuildTarget): {
  readonly platform: 'darwin' | 'win32' | 'linux'
  readonly arch: 'arm64' | 'x64'
}

/**
 * Resolve the executable inside the Electron distribution extracted for one release target.
 * Windows and Linux extract a single executable; macOS extracts an application bundle.
 * @param target - Supported Desktop target name.
 * @returns Executable path inside the target's own `electron` directory.
 */
export function electronExecutablePath(target: DesktopBuildTarget): string

/**
 * Resolve the paths owned by the target selected in a packaging environment.
 * @param env - Packaging environment.
 * @param hostPlatform - Build-host platform used when no target override exists.
 * @param hostArch - Build-host architecture used when no target override exists.
 * @returns Selected target paths.
 */
export function resolveDesktopTargetBuildPaths(
  env?: NodeJS.ProcessEnv,
  hostPlatform?: NodeJS.Platform,
  hostArch?: string,
): DesktopTargetBuildPaths

/**
 * Resolve the primary-runtime directory an unpackaged development launch uses.
 * @param env - Packaging environment.
 * @param hostPlatform - Build-host platform used when no target override exists.
 * @param hostArch - Build-host architecture used when no target override exists.
 * @returns Primary-runtime directory prepared for the selected target.
 */
export function developmentRuntimeDirectory(
  env?: NodeJS.ProcessEnv,
  hostPlatform?: NodeJS.Platform,
  hostArch?: string,
): string
