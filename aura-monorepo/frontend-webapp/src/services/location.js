export class LocationError extends Error {
  constructor(message = "Unable to get your current location.") {
    super(message);
    this.name = "LocationError";
  }
}
export async function getFix(options = {}) {
  try {
    let geo = navigator.geolocation;
    if (window.Capacitor?.isNativePlatform?.()) {
      const { Geolocation } = await import("@capacitor/geolocation");
      const perm = await Geolocation.requestPermissions();
      if (perm.location === "denied" || perm.coarseLocation === "denied")
        throw new Error("Location permission denied");
      const p = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.highAccuracy !== false,
        timeout: 15000,
        maximumAge: 0,
      });
      return {
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
        accuracy: p.coords.accuracy,
      };
    }
    if (!geo) throw new Error("Location is not supported");
    const p = await new Promise((resolve, reject) =>
      geo.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: options.highAccuracy !== false,
        timeout: 15000,
        maximumAge: 0,
      }),
    );
    if (
      !Number.isFinite(p.coords.latitude) ||
      !Number.isFinite(p.coords.longitude)
    )
      throw new Error("Invalid location fix");
    return {
      latitude: p.coords.latitude,
      longitude: p.coords.longitude,
      accuracy: p.coords.accuracy,
    };
  } catch (e) {
    throw new LocationError(
      e?.message || "Unable to get your current location.",
    );
  }
}
export function watchFix(onFix, onError, options = {}) {
  if (window.Capacitor?.isNativePlatform?.()) {
    let handle;
    import("@capacitor/geolocation")
      .then(async ({ Geolocation }) => {
        handle = await Geolocation.watchPosition(
          {
            enableHighAccuracy: options.highAccuracy !== false,
            timeout: 15000,
          },
          (p) => {
            if (p)
              onFix({
                latitude: p.coords.latitude,
                longitude: p.coords.longitude,
                accuracy: p.coords.accuracy,
              });
          },
        );
      })
      .catch(onError);
    return () => {
      if (handle)
        import("@capacitor/geolocation").then(({ Geolocation }) =>
          Geolocation.clearWatch({ id: handle }),
        );
    };
  }
  if (!navigator.geolocation) {
    onError(new LocationError());
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (p) =>
      onFix({
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
        accuracy: p.coords.accuracy,
      }),
    onError,
    { enableHighAccuracy: options.highAccuracy !== false, maximumAge: 0 },
  );
  return () => navigator.geolocation.clearWatch(id);
}
