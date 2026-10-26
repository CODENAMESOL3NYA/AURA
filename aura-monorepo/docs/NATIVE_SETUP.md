# Native wrapper setup

The Capacitor configuration is a placeholder. Change `appId` to the publisher's reverse-domain identifier before release.

## Commands

From repository root:

```sh
npm install
npm --prefix frontend-webapp install
npm --prefix frontend-webapp run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
npx cap open ios
```

Do not commit generated `android/` or `ios/` folders as part of this prototype. Backend `ALLOWED_ORIGINS` must include `capacitor://localhost` and `https://localhost` (plus the exact web origin used in development).

## Android manifest review

Before a release, set `android:allowBackup="false"` and `android:usesCleartextTraffic="false"` on the application element. Add only the location permissions actually required: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`; add `ACCESS_BACKGROUND_LOCATION` only if a reviewed, implemented background-location feature needs it. The current prototype does not implement reliable background location. Verify that the merged manifest retains cleartext traffic disabled.

## iOS Info.plist purpose strings

Add clear user-facing strings for `NSLocationWhenInUseUsageDescription` (current location is needed to send the location selected by the user with a task/incident) and, only if motion-trigger quick exit is enabled, `NSMotionUsageDescription` (motion is used to detect a deliberate shake shortcut). Do not claim background location or recording if it is not implemented.

## Plugin map

- `@capacitor/app`: app state/minimize support
- `@capacitor/geolocation`: device location
- `@capacitor/motion`: motion capability (permission behaviour must be tested on device)
- `@capacitor/haptics`: haptic feedback
- `@capacitor/status-bar`, `@capacitor/splash-screen`: native chrome
- `capacitor-secure-storage-plugin`: native token storage

Verify each plugin's current API and platform requirements against the installed version before release. Browser storage fallback is not native secure storage.

**Store review:** the Daily Planner disguise must be disclosed to Apple App Review and Google Play review. Do not submit without explaining the safety use case, consent, and how reviewers can test it.
