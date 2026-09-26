# DIYOR BURGER — план внедрения ассетов

Источник: `папка иконок` — 54 SVG-иконки, category/ingredient PNG, 18 reference-экранов, manifest и tokens.

## Нормализованные токены

- Brown: `#2B0E03`; medium brown: `#4A1E09`
- Active orange: `#FF6A00`; CTA yellow: `#FFC229`; alternative yellow: `#FFB800`
- Primary text: `#0B0B0B`; secondary text: `#6B6B73`; inactive nav: `#6F7178`
- Success: `#25B84B`; WhatsApp: `#25D366`; danger/favorite: `#FF3B3B`
- Icon sizes: topbar 30px, bottom navigation 28px, plus glyph 28px in 48px circle, heart 30px, success check 72px.
- Interactive targets: at least 44px; bottom nav at least 48px.

## Asset handling rules

1. Copy vector icons into `public/assets/icons`; preserve the supplied SVG file contents.
2. Render icons through a reusable `DiyorIcon` component, using `currentColor` SVG assets and semantic labels.
3. Keep product/category/ingredient photos data-driven. Fixture images are only development fallback; Supabase/admin image URLs remain the production source of truth.
4. Do not treat screenshots or reference crops as live UI images. Use them only to compare rendered output.
5. Keep the existing checkout, cart, order validation, WhatsApp and admin behavior intact while changing visuals.

## Screen order and icon map

1. **Home** — `menu-hamburger`, `location-pin`, `chevron-down`, `search`, `cart`, `scooter`, `leaf`, `shield-check`, `whatsapp`, `plus`, `home`, `utensils`, `burger-nav`, `user`.
2. **Cart empty / filled** — `arrow-left`, `cart`, `search`, `trash`, `minus`, `plus`, `arrow-right`, `gift`, `home`, `whatsapp`.
3. **Checkout / review / WhatsApp ready** — `arrow-left`, `location-pin`, `scooter`, `storefront`, `check`, `user`, `phone`, `message-square`, `radio-on`, `radio-off`, `arrow-right`, `whatsapp`.
4. **Order success** — `check-circle`, `hash`, `user`, `phone`, `truck`, `location-pin`, `credit-card`, `clock`, `document`, `chef-hat`, `home`.
5. **Favorites** — `arrow-left`, `cart`, `heart-filled`, `plus`, `home`, `utensils`, `discount-badge`, `user`.
6. **Contacts** — `arrow-left`, `phone`, `whatsapp`, `instagram`, `external-link`, `location-pin`, `navigation`, `clock`, `map-fold`, `headset`, `chevron-right`.
7. **Menu/search/filter/catalog/product/combo** — `arrow-left`, `search`, `filter-sliders`, `close-x`, all category icons, `plus`, `minus`, `cart`, `gift`, `crown`, `radio-on`, `radio-off`.

## Implementation sequence

1. Add a reusable icon layer and token CSS without changing routes or business logic.
2. Replace header, bottom navigation, product action and benefit-row icons on all public screens.
3. Apply the reference palette, target sizes, card radius/shadow and bottom safe-area rules globally.
4. Wire category and ingredient photo assets to their respective data-driven display components.
5. Restyle each public route against its corresponding reference, beginning with home, then menu/product, cart, checkout/review, favorites, contacts and success.
6. Verify at mobile viewport, capture a screenshot, compare with each supplied screen and iterate.
7. Run typecheck, lint, tests and production build; commit only verified changes; deploy only after the visual pass is accepted.
