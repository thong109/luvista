# Script restoration notes

Saved on 2026-11-03 before the user replaces `src/js/scripts.js`.
After replacement, merge the custom behavior into the NEW script; do not overwrite it with the full backup.

## Saved files

- `scripts-before-replacement.js`: complete current source for reference.
- `scripts-custom-additions.txt`: exact implementation of the three custom additions below.
- `scripts-before-replacement.patch`: current source diff against Git HEAD.

## Restore these additions

1. `initLocationIconsReveal()` and its startup call. Desktop visibility follows the section's `is-active` class; tablet/mobile follows IntersectionObserver on `.location-map`. Sets `is-icons-visible`. SVG groups use `data-index` and `--icon-index` for staggered fade/scale, beginning at 0.65 seconds plus 0.1 seconds per icon. Logo and route stay static. Color cycling applies ONLY to the rectangle path filled by `paint4_linear_2002_608`; CSS and SVG already contain this behavior.
2. The location-specific block inside `inlineSvg()`: prepend an SVG `image` using `.location-background.src` at 0,0 with dimensions 1288 x 1080 and `preserveAspectRatio="none"`. Hide the fallback PNG image. This keeps PNG and icons within the same coordinate system. Keep the root SVG's `xMidYMid slice` attribute.
3. `initAmenitiesFloors()` and its startup call: accessible tabs for floors 1 and 4, keyboard arrows/Home/End, switch legend panels and `is-floor-four`. Images are `amenities-img-01.jpg` / `amenities-img-02.jpg`, marked `data-amenities-floor`. Images must NEVER use hidden/display:none during switching. Both remain mounted; CSS fades the upper floor-4 image over the floor-1 base. Decode images on initialization. Only legend panels use hidden. Animate legend fade/12px slide and mobile/tablet wrapper height, respecting reduced motion and cancelling prior content animations on rapid clicks.

## Existing behaviors to preserve if the replacement omits them

- `initCanvasWaves()` and startup call, including reduced-motion handling and visibility-aware rendering of every `canvas[data-wave-src]`. Overview, certificate and location use this.
- Existing inline SVG initialization and other site features from the replacement script.
- `initAmenitiesDrawers()` is retained in the saved source for other existing markup, but the current floor legend uses `initAmenitiesFloors()`.

## Final synchronization

Run `node --check src/js/scripts.js`, verify floor tabs including rapid switching, and copy the final source to `dist/js/scripts.js`. Keep current Pug, SCSS and SVG assets; their custom classes and animations are already present.
