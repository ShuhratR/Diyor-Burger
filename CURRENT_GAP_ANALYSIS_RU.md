# DIYOR BURGER — фактические расхождения с двумя спецификациями

**Дата проверки:** 25 сентября 2026  
**Сопоставлены документы:**

1. [`PROJECT_GUIDE_RU.md`](./PROJECT_GUIDE_RU.md) — заявленная структура, бизнес-логика, безопасность и существующие маршруты.
2. [`FINAL_SCREEN_DESIGN_SPEC_RU.md`](./FINAL_SCREEN_DESIGN_SPEC_RU.md) — обязательный вид и структура 23 экранов из `screens/`.

> Это список задач по фактическому состоянию исходников и сохранённому browser pixel-comparison. Он не утверждает, что работа завершена: наоборот, фиксирует, что необходимо переделать, прежде чем называть публичный интерфейс соответствующим референсам.

---

## 1. Краткий вердикт

### Что уже существует и должно быть сохранено

- Next.js public routes, каталог, варианты, cart, favorites, checkout draft, server-side checkout validation и WhatsApp-ready flow.
- Supabase/RLS, admin boundary, админские CRUD-модули и media layer.
- Данные доставки/самовывоза остаются data-driven: нельзя подменять их статичными значениями из изображений.
- В `screens/` есть все 23 референса; пакет иконок уже добавлен в проект.

### Главная проблема

Публичные страницы существуют функционально, но визуально пока собраны как **общая базовая UI-система**, а не как 23 конкретных мобильных экрана. Один header, один product grid и один page hero используются слишком широко, хотя референсы требуют разные композиции для home, меню, категорий, комбо, поиска, details, cart, checkout, favorites и contacts.

### Подтверждённые значения pixel comparison

Снимки сделаны в правильном физическом размере `941×1672`, но совпадение не достигнуто:

| Проверенный маршрут | Несовпадение пикселей |
|---|---:|
| `/` | **50,92%** |
| `/menu` | **65,34%** |
| `/combos` | **75,23%** |
| `/favorites` | **46,28%** |
| `/cart` | **46,72%** |
| `/checkout` | **41,43%** |
| `/contacts` | **34,53%** |

Это означает, что ни один из семи сравниваемых экранов нельзя считать визуально принятым. Для остальных 16 reference-состояний visual test ещё вообще не настроен.

---

## 2. Сквозные расхождения — сначала исправлять их

### P0 — обязательные основы

1. **Header не соответствует reference-набору.**
   - Сейчас это единый `SiteHeader` с самодельной текстовой маркой `D` + `B`, статичным «Душанбе» и одинаковым набором action-icons.
   - В референсах нужны разные варианты: hamburger, back, центрированный logo, screen title, location, search, cart; их порядок отличается по сценарию.
   - Нужен компонент `PublicHeader` с явными вариантами (`home`, `listing`, `detail`, `utility`, `checkout`) вместо одного универсального layout.

2. **Нижняя навигация имеет неверную информационную архитектуру.**
   - Сейчас: Главная / Меню / Комбо / Избранное / Корзина.
   - В основных референсах: Главная / Меню / Комбо / Корзина / Профиль; на Favorites и Contacts есть screen-specific версии.
   - Нужно определить одну реальную public navigation map, добавить доступный профиль либо корректную пятую destination, а не подменять её `favorites` на всех страницах. Active state обязан соответствовать маршруту, а не случайно копировать цвет на screenshot.

3. **Mobile CSS чрезмерно уменьшает интерфейс.**
   - В `home-visual.css` на mobile установлены body-элементы до `0.38–0.62rem`, плюс-кнопки `18–19px`, nav-icons `18px`, hero `145px`.
   - Это противоречит reference-масштабу и минимальным touch targets `44×44px`; визуально превращает экран в уменьшенную миниатюру.
   - Требуется удалить «сжатие ради уместимости», восстановить нормальный мобильный scale и строить секции реальной высоты.

4. **Нет полного design-token слоя.**
   - Палитра частично копируется raw CSS значениями; типографика, радиусы, тени, icon-size, section spacing и z-index не выражены едиными semantic tokens.
   - Из-за этого разные страницы не смогут стабильно совпадать с reference и будут дрейфовать после каждого изменения.

5. **Icon language смешан.**
   - Сейчас в header/nav присутствует локальный inline SVG и текстовые символы; в проект добавлен `DiyorIcon`, но он не стал единственным источником пиктограмм.
   - Нужно заменить structural icons на согласованный `DiyorIcon`/настоящие SVG из pack. Не использовать буквенные псевдологотипы, emoji или произвольные glyphs.

6. **Нет route-by-route pixel acceptance.**
   - `scripts/visual-compare.mjs` проверяет только 7 из 23 экранов.
   - Не сравниваются: drawer, suggestions, results, filters, все category layouts, обе detail-версии, add sheet, filled cart, review/WhatsApp, а также состояния data/empty.
   - Нужно расширить suite до 23 reference cases, фиксировать имя route/state/fixture и сохранять diff-image для каждого случая.

### P1 — обязательные для честного UI

7. **Референсные фото не равны реальным production-asset.**
   - В `public/images/` есть временные/сгенерированные food images; они не подтверждены как финальные товарные фото владельца.
   - Нужна одна media стратегия: hero/banner/image URL редактируются из admin/Storage; placeholder не имитирует товар под видом настоящего фото.

8. **Статичная локация в header.**
   - Текущий header выводит «Душанбе» напрямую.
   - География должна приходить из settings/выбранного delivery context или быть нейтрально скрыта до реализации выбора. Нельзя делать reference-текст бизнес-фактом.

9. **Адаптация ширин не доказана.**
   - Сейчас есть один screenshot viewport в visual script. Нет проверок `320/360/375/390/430px`, нет landscape и safe-area check.
   - Нужна короткая automated/manual acceptance матрица, особенно для sticky cart/checkout CTA и bottom nav.

10. **Accessibility не проверена как часть visual pass.**
    - Иконки имеют часть `aria-label`, но нет единого аудита всех icon-only buttons, drawer focus trap, Escape, selected states, form error focus, `prefers-reduced-motion`.
    - Это важно не только для качества, но и для идентичной управляемости mobile UI.

---

## 3. Поэкранный список расхождений

Статусы:

- **P0** — нет ключевой структуры или screen-state.
- **P1** — структура есть, но визуальный/интерактивный контракт reference не выполнен.
- **P2** — полировка, QA или недостающая проверка; делать после P0/P1.

### 01. Главная `/` — P0

**Подтверждено:** visual mismatch **50,92%**.

- Текущая home-верстка сжимается до очень малых значений и не держит пропорции iPhone-reference.
- Hero не воспроизводит полноценную композицию: крупный burger/fries/cola справа, рукописный акцент, crown, CTA с white arrow disk, slider dots и требуемую высоту.
- Benefit cards, category cards, combo carousel, popular cards и финальный pizza gift banner не собраны с референсными размерами/типами карточек.
- Требуются screen-specific: `HomeHero`, `BenefitStrip`, `HomeCategoryRail`, `DarkComboRail`, `PopularRail`, `PizzaGiftBanner`.

### 02. Mobile drawer — P0

**Подтверждено исходником:** drawer содержит только пять ссылок `home/menu/combos/contacts/favorites`, текстовой DB-brand и X.

- Нет композиции reference: широкая brand area, handwritten line/crown, active gold row, расширенного списка (delivery/about/orders/settings), контактного блока и нижнего food collage.
- Нет подтверждённой focus management / Escape обработки; backdrop закрытие есть, но полного modal behavior нет.
- Нет отдельного visual test case.

### 03. Поиск — фокус и подсказки `/search` — P0

**Подтверждено исходником:** current route выводит `h1`, `SearchBox` и общий `ProductGrid`.

- Нет reference search header (back/logo/cart), yellow outlined focused search field, product suggestion list с thumbnails/chevrons.
- Нет state с нативной клавиатурой (её не нужно рисовать, но field должен корректно получать mobile focus).
- Нет visual test для screenshot `14_12_51 (3)`.

### 04. Результаты поиска `/search?q=` — P0

- Нет тёмных горизонтальных result cards с image-left, белой типографикой, gold price, outline plus.
- Нет clear button и отдельной filter action в требуемой компоновке.
- Нет category filter chips «Все / Бургеры / Комбо / Другое» в reference-стиле.
- Базовый `ProductGrid` нельзя использовать как финальную замену result-list.

### 05. Фильтры — P0

**Подтверждено исходником:** route/search код не реализует filter sheet/route.

- Нет hero «Фильтры», category-grid, double price range, pizza-size pills, radio sort list и CTA «Показать результаты».
- Нет URL/state contract для price range/category/variant/sort.
- Нет visual test и отсутствует keyboard/backdrop behavior для filter panel.

### 06. Общее меню `/menu` — P0

**Подтверждено:** visual mismatch **65,34%**; source использует generic `page-hero`, general `CategoryStrip`, `filter-row` и `ProductGrid`.

- Reference требует компактный white menu screen: heading + right slogan, icon category tabs и 2-column food cards, а не generic hero/сортировочные текстовые links.
- Product cards не имеют правильной топовой photo region, white body, price pill и large gold plus в масштабе референса.
- Текстовые filter links «Популярные / Дешевле / Дороже / А–Я» не заменяют визуальный фильтр reference.

### 07. Комбо `/combos` — P0

**Подтверждено:** visual mismatch **75,23%** — самый большой из проверенных.

- Current route — общий page hero + `ProductGrid`; reference — отдельный title/subtitle, horizontal combo filters и 2-column dark combo cards.
- Нет специфической dark-card hierarchy (food top, white text, gold price, outline orange plus).
- Нет visual test для filter states и item detail transition.

### 08. Деталь комбо `/product/[slug]` — P0

**Подтверждено исходником:** generic product page выводит photo, `h1`, text sections и стандартный purchase control.

- Нет dark combo hero с большим meal, white/gold copy, price pill, handwritten/crown accent.
- Combo components сейчас представлены простой нумерованной list, а не тремя image component cards.
- Нет info card «Напиток можно выбрать в корзине», sticky reference purchase bar и visual test.

### 09. Категория «Бургеры» `/menu/burgers` — P0

- Current category route показывает только heading, category strip и generic grid.
- Нет burger hero; нет 2×2 regular card pattern; нет wide featured «Диёр Бургер» dark card.
- Нет route-specific nav/header composition и visual case.

### 10. Категория «Хот-доги» `/menu/hot-dogs` — P0

- Нет dedicated hot-dog hero.
- Нет vertical horizontal row-card template image-left / copy / price / brown plus.
- Generic grid не соответствует reference layout.

### 11. Категория «Роллы» `/menu/rolls` — P0

- Нет dedicated rolls hero и трёх white horizontal product rows.
- Нет food crop, title/description rhythm и action placement из reference.

### 12. Категория «Пицца» `/menu/pizza` — P0

- Нет pizza hero с large pizza / CTA / hand-drawn accent.
- Нет 2-column card pattern с корректной высотой описаний и «от …» price pill.
- Нужен вариант-переход при add, а не случайное добавление pizza без размера.

### 13. Категория «Гарниры» `/menu/sides` — P0

- Нет garnish hero и списка из пяти horizontal rows.
- Нет типографической и фото-иерархии, отличающей этот list от menu-grid.

### 14. Категория «Напитки» `/menu/drinks` — P0

- Нет drink hero с CTA.
- Нет asymmetric grid: 3 compact cards сверху + 2 large cards ниже.
- Проверить права/источник брендовых изображений до размещения Coca-Cola/Fanta/Sprite media.

### 15. Деталь обычного товара `/product/[slug]` — P0

**Подтверждено исходником:** current page — generic photo + title + text ingredients + price/purchase.

- Нет high dark visual hero, large description surface, ingredient thumbnails, benefit row и structured sticky purchase panel.
- `ingredientsText` выводится plain text: требуется data format для individual ingredients/photo tiles либо честное скрытие секции без данных.
- Нет отдельной desktop/mobile responsive composition и visual test.

### 16. Деталь пиццы `/product/[slug]` — P0

- Variant selector существует функционально, но нет pizza-specific presentation: hero, description block, visual ingredient tiles, size cards `28/30/36`, separate price pills и bottom purchase row.
- Нужно сохранить server-side variant validation; визуальная переделка не должна изменить cart identity.

### 17. Bottom sheet «Товар добавлен» — P0

- В reference есть самостоятельное UI-state: scrim, sheet, success check, product summary, quantity controls, basket summary и две CTA.
- В текущем public component set не подтверждён route/state component, который создаёт этот exact sheet после add.
- Нужны dialog accessibility, focus restore и one visual case с предзаполненной cart fixture.

### 18. Заполненная корзина `/cart` — P0

**Подтверждённый visual mismatch:** **46,72%**, но сохранённый test использует пустую cart state, поэтому он не покрывает этот reference.

- Filled cart current layout функционально выводит line items, quantity и summary, но отсутствуют dark hero, card-specific trash icon placement, correct price pills, total panel и WhatsApp secondary CTA из reference.
- Текущая строка «Доставка рассчитываем при оформлении» честна по логике, но визуально не соответствует expected checkout-aware summary. Нужен чёткий preview label, а canonical total — только далее в checkout/review.
- Нужен отдельный visual fixture с тремя товарами, иначе  `14_15_04 (8)` не проверяется.

### 19. Пустая корзина `/cart` — P0

**Подтверждённый visual mismatch:** **46,72%**.

- Есть текст empty state и переход в меню, но нет большой cart/burger/fries illustration, handwritten slogan/crown/rays, secondary «На главную» и нижнего chocolate promo banner.
- Header не соответствует reference variant.
- Visual test есть, но current percent подтверждает, что данный экран ещё не принят.

### 20. Checkout `/checkout` — P0

**Подтверждённый visual mismatch:** **41,43%**.

- Функциональная form/draft/delivery logic существует и должна сохраняться.
- Current page — title + notice + form; нет checkout hero, delivery/pickup selection cards, two-column/stacked order preview, thank-you banner, WhatsApp notice и large reference CTA layout.
- Порядок и semantics form уже полезны, но нужны iconized large fields, nearby error presentation, preview delivery/threshold structure и responsive composition.
- Проверка должна использовать реальные active zones/settings, а не sample reference names/prices.

### 21. WhatsApp-ready `/checkout/whatsapp` — P0

**Подтверждено исходником:** current component функционально честный, но это простой section с heading, text и CTA.

- Нет reference visual hierarchy: green success mark, details card, timeline «Что дальше?», secondary action group, branded header/nav.
- Текст reference «Ваш заказ успешно оформлен!» опасен без реальной отправки. Текущий честный текст **«Заказ готов к отправке»** нужно сохранить, применив к нему visual design reference.
- Нет visual test и validated-state fixture.

### 22. Избранное `/favorites` — P0

**Подтвержденный visual mismatch:** **46,28%**.

- Текущий FavoritesList использует generic page hero + generic ProductGrid.
- Нет compact list rows с red heart / gold plus на правой оси, count subtitle в ref-scale, warm tip-card с heart/spark rays и reference navigation state.
- Нужен empty favorites state в том же design language.

### 23. Контакты `/contacts` — P0

**Подтвержденный visual mismatch:** **34,53%** — лучший, но всё ещё неприемлемый результат.

- Current route корректно читает settings, но визуально это generic `page-hero` и minimal contact rows без нужных icon circles, action buttons, hero food banner, map preview, help card и branded nav state.
- В current code WhatsApp row отсутствует, хотя WhatsApp destination есть в restaurant settings и задан reference.
- Map — только text/CTA block; нет map surface с pin/label.
- Не придумывать pickup address или карту при отсутствии settings: вместо этого корректно скрыть dependent card.

---

## 4. Логика: что не нужно ломать ради дизайна

Следующие пункты из `PROJECT_GUIDE_RU.md` не являются визуальными проблемами и должны быть сохранены при редизайне:

- Все деньги в базе/домене — diram; форматирование в сомони только на UI.
- `cart` и `favorites` сохраняют identifiers, а не доверенные цены.
- Checkout draft живёт в `sessionStorage` и не содержит cart totals/prices как источник истины.
- Сервер валидирует customer data, active products, pizza variants, zones, fee, free threshold и total перед созданием WhatsApp link.
- WhatsApp URL генерируется canonical server-side способом; корзина очищается только после явного подтверждения пользователя.
- `requireAdmin()` и RLS не должны ослабляться для того, чтобы «быстро показать данные».
- Админ регулирует content/media/settings/zones; UI не должен содержать rules вида `zone === "Кушониён"`.

---

## 5. Реальный порядок работ

### Этап A — общие primitives (P0)

1. Зафиксировать token layer: palette, typography, radius, elevation, spacing, safe areas, icon sizes, z-index.
2. Пересобрать `PublicHeader` в variants и сделать настоящую brand asset/consistent SVG mark.
3. Пересобрать `BottomNavigation`, определить пятую destination и selected rules.
4. Выделить reusable UI: dark hero, product list row, product grid card, dark combo card, price pill, add/quantity, section heading, promo banner, sheet, contact row.
5. Убрать mobile CSS, уменьшающий controls и шрифт ниже usable sizes.

### Этап B — каталог и discovery (P0)

6. Home (01) → drawer (02) → search suggestions/results/filters (03–05).
7. Menu, combos и все 5 category layouts (06–14), потому что у них разные card recipes.
8. Создать fixtures для stable visual comparisons без зависимости от production data.

### Этап C — conversion screens (P0)

9. Обычный product, pizza, combo details (08, 15, 16).
10. Add-to-cart sheet (17), filled/empty cart (18–19).
11. Checkout / review / WhatsApp-ready (20–21), не переписывая checkout core.
12. Favorites и Contacts (22–23), сохраняя data-driven settings.

### Этап D — визуальная приёмка (P0)

13. Расширить `scripts/visual-compare.mjs` с 7 до всех 23 states.
14. Для каждой страницы: screenshot `390px` → pixel diff → ручная проверка geometry, icon identity, crop, text wrapping, safe-area.
15. После P0: viewport checks `320/360/375/390/430`, keyboard focus, reduced motion, real touch targets.
16. Только затем запускать typecheck/lint/test/build, создавать коммит и публиковать.

---

## 6. Ограничения проверки и честная интерпретация

- Этот файл основан на фактических route/component исходниках и последнем сохранённом visual report; он не заменяет новую browser screenshot-приёмку после будущих правок.
- Visual percent — метрика несовпадения всего растра. Она показывает масштаб расхождения, но не заменяет проверку layout/UX по конкретному reference.
- Для 16 из 23 экранов сейчас нет automated comparison. Это означает **«не проверено»**, а не «совпадает».
- Админские страницы функционально описаны в `PROJECT_GUIDE_RU.md`, но для них владелец не предоставил screenshot reference; их нельзя оценивать как pixel-identical к public mobile set.
- Рабочая директория содержит незакоммиченные визуальные assets/стили. Их нельзя reset/clean/delete во время реализации без отдельного осознанного решения.

---

## 7. Definition of Done для visual phase

Работа по reference UI может считаться завершённой только когда одновременно выполнено всё ниже:

- [ ] все 23 reference-состояния имеют конкретный route/state/fixture;
- [ ] каждый экран визуально собран отдельной screen composition, а не generic card/grid под другим title;
- [ ] header, bottom nav и icon system соответствуют конкретному screen scenario;
- [ ] все данные остаются dynamic и проходят существующую безопасную validation;
- [ ] mobile UI не имеет horizontal overflow и touch targets меньше `44×44px`;
- [ ] 23 screenshot comparisons запущены и рассмотрены; большие расхождения устранены, diff images сохранены;
- [ ] typecheck, lint, tests и build проходят;
- [ ] только после этой приёмки текущий проект можно честно называть визуально соответствующим reference-набору.
