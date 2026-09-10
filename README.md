# Redesign furniture capture demo

Static browser prototype. Serve `dist/` with any local HTTP server.

## Working capabilities
- JPEG/PNG/WebP photo selection, mobile camera file capture where supported.
- Four-point photo ruler: mark a known reference then the measured span. Centimeters = measured pixels / reference pixels × reference centimeters.
- Independent width, depth, height values and dimension provenance.
- RoomPlan `CapturedRoom` JSON import: local X/Y/Z dimensions in meters mapped to width/height/depth in centimeters. Furniture transforms are retained, not displayed.
- Manual entry, tape-measure confirmation, manually supplied listing URL and variant confirmation.
- Rectangular 2D fit check with rotation and a user-chosen clearance allowance.
- JSON export/reimport. Photos remain only in browser memory and are excluded from export.

## Limitations
No real-time LiDAR scanning, automatic photo dimension inference, perspective correction, automated search, listing extraction, or Blender rendering. Photo ratios require coplanar lengths and a frontal photo. A different photo and reference are needed for a different plane. RoomPlan confidence is not treated as a dimensional error bound. The fit check does not model doors, height, access, or pose uncertainty.

The initial desk is explicitly illustrative. Imported scans and photo measurements remain estimates. Marking tape or listing sources records the user's assertion, not independent verification. Changes are held in memory; export before reloading.

## Verification
Run `node --test test/core.test.mjs` for geometry and import checks. No external APIs, credentials, runtime dependencies, or remote photo storage.
