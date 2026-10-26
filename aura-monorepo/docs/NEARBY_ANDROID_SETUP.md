# Android push setup for Community Guardian

The supplied repository did not contain an `android/` directory or Firebase credentials. Native push build and delivery therefore remain **NOT RUN** until a developer configures the Android toolchain and Firebase project.

1. Create/sync the Capacitor Android project from the repository root:
   ```sh
   npm install
   npm --prefix frontend-webapp ci
   npm --prefix frontend-webapp run build
   npx cap add android   # only if android/ does not exist
   npx cap sync android
   ```
2. Create a Firebase project, register the Android application using the package/application ID from `capacitor.config.ts` and generated Android Gradle configuration, enable Firebase Cloud Messaging, then download `google-services.json`.
3. Place `google-services.json` at `android/app/google-services.json`. **Do not commit it.** Confirm `.gitignore` excludes this file before committing.
4. Apply the Google Services Gradle plugin using the syntax appropriate to the generated Capacitor/Gradle version. Do not copy legacy Gradle snippets blindly; verify the generated Gradle plugin DSL first.
5. Add this permission to `android/app/src/main/AndroidManifest.xml` if the generated/plugin manifest does not already merge it:
   ```xml
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```
   Android 13+ requires runtime notification permission. The app asks through `@capacitor/push-notifications` after guardian opt-in.
6. Configure the backend, not the client, with `GUARDIAN_ALERTS_ENABLED=true`, `PUSH_PROVIDER=fcm`, `FCM_PROJECT_ID`, and `FCM_SERVICE_ACCOUNT_B64` (base64-encoded service-account JSON). Use a least-privilege service account and a secret manager in production. Never put service-account credentials in Vite environment variables.
7. Build and verify on a real Android device:
   ```sh
   npm run build:android
   ```
   Opt in, allow notifications, verify registration reaches `POST /api/v1/devices`, trigger a development incident, and verify the neutral notification tap refreshes the in-app alert list.

Push token registration is only attempted on Android and is tied to the authenticated user. Push text is neutral and carries no location or incident identifiers. FCM delivery and tap behavior must be verified with the actual Firebase project before production use.
