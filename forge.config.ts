import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    appBundleId: "com.photobooth.app",
    name: "Photobooth",
    appCategoryType: "public.app-category.photography",
      // Remove CSP configuration as shown in working example
    // contentSecurityPolicy: false, // Disable CSP entirely as shown in working example
    extendInfo: {
      NSCameraUsageDescription: "This photobooth application needs camera access to capture photos and enable the photobooth experience.",
      NSMicrophoneUsageDescription: "This application may need microphone access for video recording features.",
      "com.apple.security.device.camera": true,
      "com.apple.security.device.audio-input": true,
    },
    // Windows-specific permissions
    win32metadata: {
      CompanyName: "Photobooth App",
      FileDescription: "Photobooth - Interactive Photo Application",
      InternalName: "photobooth.exe",
      OriginalFilename: "photobooth.exe",
      ProductName: "Photobooth",
      ProductVersion: "1.0.0",
      "requested-execution-level": "asInvoker",
      FileVersion: "1.0.0",
      LegalCopyright: "Copyright © 2025 Photobooth App"
    },
    hardenedRuntime: false,
    // Ignore node_modules to reduce bundle size
    ignore: [
      /^\/src\//,
      /^\/\.git/,
      /^\/node_modules\/(?!(@libsql|@google-cloud|sharp))/,
    ],
    // osxSign: {
    //   identity: "Developer ID Application",
    //   "hardened-runtime": true,
    //   entitlements: "entitlements.plist",
    //   "entitlements-inherit": "entitlements.plist",
    //   "signature-flags": "library"
    // },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      // Windows Squirrel installer configuration
      setupExe: "photobooth-setup.exe",
      name: "photobooth",
      // Note: setupIcon requires .ico format - will add later when available
      // loadingGif: "public/start.png", // Remove for now as it may also cause issues
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),

    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.mts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.mts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts",
        },
      ],
    }),

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
