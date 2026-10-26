# Android manifest requirements

After `npx cap add android`, merge these attributes/permissions into `android/app/src/main/AndroidManifest.xml` (do not replace the generated manifest wholesale):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<application android:allowBackup="false" ...>
```

The app only collects location while open. Background tracking is not implemented. `FLAG_SECURE` is not enabled globally because it could interfere with the stealth planner; assess sensitive-screen screenshot protection separately.
