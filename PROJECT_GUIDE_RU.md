# DIYOR BURGER — памятка по проекту

Дата составления: 25 сентября 2026.

Этот файл — рабочая карта проекта. Он описывает только то, что реально найдено в репозитории на момент составления, и не заменяет бизнес-решения владельца.

## 1. Что это за проект

DIYOR BURGER — mobile-first веб-приложение ресторана на Next.js.

Основные пользовательские сценарии:

- просмотр меню, категорий, комбо и отдельных блюд;
- поиск и фильтрация блюд;
- добавление обычных товаров и вариантов пиццы в корзину;
- хранение корзины и избранного в браузере;
- оформление доставки либо самовывоза;
- серверная проверка заказа и формирование ссылки WhatsApp;
- ручная отправка сообщения клиентом в WhatsApp;
- защищённая админ-панель для контента ресторана.

Проект не создаёт фиктивный заказ и не утверждает, что заказ уже отправлен: пользователь открывает подготовленное WhatsApp-сообщение и отправляет его сам.

## 2. Технологии

| Область | Используется |
| --- | --- |
| Frontend | Next.js 15, App Router, React 19, TypeScript |
| CSS | Tailwind подключён, основной визуал сейчас задан обычным CSS |
| Валидация | Zod |
| База и Auth | Supabase |
| Хранение медиа | Supabase Storage, bucket `restaurant-media` |
| Тесты | Vitest |
| Визуальная сверка | Playwright, `pixelmatch`, `pngjs` |
| Хостинг | Vercel |

Команды проекта:

```text
npm run dev          локальный сервер
npm run typecheck    TypeScript
npm run lint         ESLint
npm test             unit tests
npm run build        production build
npm run test:visual  снимки и pixel-diff с экранными эталонами
```

## 3. Реальная структура

```text
src/app/                 маршруты Next.js
src/components/          общие UI-компоненты
src/features/            cart, checkout, favorites, admin, i18n
src/lib/                 domain-логика, Supabase, каталог, delivery, auth
supabase/migrations/     versioned SQL migrations
public/images/           временные/сгенерированные food images
public/assets/icons/     копия доступных иконок и reference-материалов
screens/                 23 пользовательских визуальных эталона
папка иконок/            исходный набор иконок/пиктограмм от владельца
scripts/visual-compare.mjs  browser screenshot + pixel comparison
```

## 4. Публичные маршруты и состояние

| Маршрут | Назначение | Реальная логика |
| --- | --- | --- |
| `/` | главная | hero, категории, комбо, популярные блюда, промо |
| `/menu` | всё меню | категории, список товаров |
| `/menu/[categorySlug]` | категория | фильтр каталога по slug |
| `/combos` | комбо | товары типа `COMBO` |
| `/product/[slug]` | товар | описание, состав, цена, варианты пиццы, добавление |
| `/search` | поиск | поиск по каталогу и переход к фильтрам |
| `/cart` | корзина | localStorage-cart, количества, удаление, subtotal |
| `/favorites` | избранное | localStorage-favorites |
| `/checkout` | оформление | поля клиента, delivery/pickup, draft в sessionStorage |
| `/checkout/review` | проверка | серверная подготовка и пересчёт заказа |
| `/checkout/whatsapp` | готово к отправке | только server-generated `wa.me` URL |
| `/contacts` | контакты | настройки ресторана: телефоны, адрес, график, карта |

### Корзина

- Key localStorage: `diyor-cart`.
- Схема данных: `{ version: 1, items: [{ productId, variantId?, quantity }] }`.
- Максимум одной позиции: 99.
- Пицца хранится как отдельная строка для каждого варианта (`variantId`).
- `subtotal` не доверяет сохранённой цене: он определяется по текущим данным каталога.

### Избранное

- Key localStorage: `diyor-favorites`.
- Содержит только IDs товаров, без цен и персональных данных.

### Checkout draft

- Key sessionStorage: `diyor-checkout-draft`.
- Хранит только имя, телефон, способ получения, зону, адрес и комментарий.
- Не хранит цены, subtotal, delivery, total или состав корзины как источник истины.
- Некорректный JSON и устаревшие/несуществующие зоны игнорируются безопасно.

### WhatsApp-ready state

- Key sessionStorage: `diyor-checkout-ready`.
- Хранит URL и время создания.
- Время жизни — 30 минут.
- Корзина не очищается при открытии WhatsApp.
- Очистка возможна только явной кнопкой «Я отправил заказ — очистить корзину».

## 5. Логика заказа и денег

Все денежные значения в базе и доменной логике — **дирамы**. В UI суммы показываются в сомони.

Правило доставки из `src/lib/delivery.ts`:

```text
pickup:
  delivery = 0
  total = subtotal

delivery:
  если subtotal >= freeDeliveryThresholdDiram:
    delivery = 0
  иначе:
    delivery = deliveryFeeDiram
  total = subtotal + delivery
```

Клиентский preview не является источником истины. Перед WhatsApp сервер:

1. валидирует имя, телефон, способ получения, адрес и зону;
2. получает актуальные товары, варианты, зоны и settings;
3. проверяет доступность товара и варианта;
4. пересчитывает цену каждой позиции;
5. пересчитывает subtotal, delivery и total;
6. нормализует телефон клиента до формата `992XXXXXXXXX`;
7. получает WhatsApp ресторана из server-side settings;
8. создаёт canonical URL `https://wa.me/<номер>?text=<encoded текст>`.

В development fallback заданы три зоны. Они должны быть данными, а не условиями в UI:

| Зона | Delivery | Бесплатно от |
| --- | ---: | ---: |
| Кушониён | 10 сом | 150 сом |
| Вахш | 20 сом | 250 сом |
| Бохтар | 20 сом | 250 сом |

Текущий fallback WhatsApp заказа: `992007884423`.

## 6. Supabase и безопасность

### Клиенты

- `src/lib/supabase/browser.ts` — только public/publishable credentials.
- `src/lib/supabase/server.ts` — server-side клиент с cookies.
- Service-role key не требуется клиенту и не должен попасть в browser bundle.
- Реальные значения должны быть только в `.env.local` и настройках Vercel.

### Таблицы

- `admin_profiles` — активные администраторы;
- `categories` — категории меню;
- `products` — товары;
- `product_variants` — размеры/варианты, в том числе пиццы;
- `combo_components` — состав комбо;
- `delivery_zones` — зоны, fee и free-delivery threshold;
- `restaurant_settings` — контакты, график, pickup, WhatsApp, hero;
- `banners` — баннеры;
- `audit_logs` — аудит действий администратора.

### Миграции

| Файл | Роль |
| --- | --- |
| `20260920150000_checkpoint_1.sql` | базовая схема, RLS, seed, public view |
| `20260921090000_add_bilingual_content.sql` | русские и таджикские поля |
| `20260921093000_add_variant_availability.sql` | доступность и archive variants |
| `20260922100000_combo_component_products.sql` | связи components с товарами |
| `20260922101000_secure_public_variants.sql` | public RLS для вариантов |
| `20260922102000_restaurant_media_storage.sql` | Storage bucket и RLS для медиа |

### RLS-подход

- Public читает только активные и неархивные категории, доступные товары, допустимые варианты, активные delivery zones и active banners.
- Public не получает право редактировать menu, settings, delivery или audit logs.
- Мутации осуществляются только authenticated active admin, проверяемым через `admin_profiles` и `public.is_admin()`.
- Storage `restaurant-media`: public read, upload/update/delete только active admin.

### Admin auth

- Нет публичной регистрации.
- Login: email/password через Supabase Auth.
- `requireAdmin()` требует и authenticated user, и active profile.
- Unauthenticated, non-admin и inactive admin блокируются server-side.
- Logout реализован server action.

## 7. Админ-панель

| Route | Управление |
| --- | --- |
| `/admin` | dashboard: реальные content metrics и configuration warnings |
| `/admin/login` | вход администратора |
| `/admin/categories` | категории |
| `/admin/products` | товары, availability, archive |
| `/admin/products/[id]` | варианты/размеры товара |
| `/admin/combos` | комбо и компоненты |
| `/admin/delivery` | delivery zones, цены и пороги |
| `/admin/settings` | ресторан, WhatsApp, контакты, график, pickup, hero |
| `/admin/banners` | баннеры |

Что реально регулируется админом:

- контент RU/TJ;
- цены (вводятся в сомони, сохраняются в дирамах);
- статус товара, варианта, зоны, баннера;
- сортировка;
- состав комбо;
- фотографии с валидацией JPEG/PNG/WebP до 5 MB;
- WhatsApp, телефоны, Instagram, адрес, карта, график, hero;
- архивирование вместо необратимого удаления;
- audit log после мутаций.

Dashboard не рисует выдуманные revenue/orders. При unavailable data source должен показываться controlled unavailable state, а не «0» как факт.

## 8. Локализация

- Есть language provider и словари RU/TJ в `src/lib/i18n.ts`.
- Основные entity-данные имеют поля `name_tj`, `description_tj`, etc.
- Не все строки интерфейса ещё унифицированы через словарь: часть route-specific текстов сейчас задана напрямую на русском.

## 9. Дизайн-система и эталоны

### Палитра из владельческого icon pack

| Токен | Значение |
| --- | --- |
| тёмный шоколад | `#2B0E03` |
| средний шоколад | `#4A1E09` |
| active orange | `#FF6A00` |
| CTA yellow | `#FFC229` |
| alternative yellow | `#FFB800` |
| основной текст | `#0B0B0B` |
| secondary text | `#6B6B73` |
| inactive nav | `#6F7178` |
| success | `#25B84B` |
| WhatsApp | `#25D366` |
| favorite/danger | `#FF3B3B` |
| soft surface | `#F8F5F1` |

### Нужные размеры из pack

- top-bar icon: 30 px, clickable target: минимум 44 px;
- bottom-nav icon: 28 px, target: 48 px;
- add button: круг 48 px, glyph 28 px;
- heart: 30 px;
- contact icon: 24 px в круге 48 px;
- order success check: 72 px;
- category chip icon: 24 px;
- единый SVG stroke: примерно 2.2 px, round linecap/linejoin.

### Реальные источники дизайна

- `screens/` — 23 эталонных screenshot; это **визуальные reference**, а не production assets.
- `папка иконок/` — исходный набор иконок, pictograms, manifest, tokens и guide.
- `public/assets/icons/` — рабочая копия assets, используемая приложением.
- `public/images/` — изображения, созданные/добавленные для текущего fallback UI; это не подтверждённые владельцем финальные menu photos.

### Соответствие 23 эталонам

| Эталон | Требуемый экран/состояние |
| --- | --- |
| `14_12_49 (1)` | Home |
| `14_12_50 (2)` | Mobile drawer |
| `14_12_51 (3)`, `14_12_53 (4)` | Search/results |
| `14_12_54 (5)` | Filters |
| `14_12_56 (6)` | Menu |
| `14_12_57 (7)` | Combos list |
| `14_12_58 (8)` | Combo detail |
| `14_12_58 (9)` | Burgers list |
| `14_12_59 (10)` | Hot-dogs list |
| `14_14_53 (1)` | Rolls list |
| `14_14_53 (2)` | Pizza list |
| `14_14_54 (3)` | Sides list |
| `14_14_55 (4)` | Drinks list |
| `14_14_59 (5)` | Bigburger detail |
| `14_15_01 (6)` | Pizza detail |
| `14_15_03 (7)` | Add-to-cart feedback/sheet |
| `14_15_04 (8)` | Filled cart |
| `14_15_06 (9)` | Empty cart |
| `14_15_07 (10)` | Checkout |
| `14_19_36 (1)` | Order ready / WhatsApp state |
| `14_19_37 (2)` | Favorites |
| `14_19_38 (3)` | Contacts |

### Важная визуальная реальность сейчас

В проект добавлены первые попытки перепривязать public UI к этим референсам:

- `home-visual.css`, `visual.css`;
- `diyor-icon.tsx`, `diyor-icon.css`;
- `scripts/visual-compare.mjs`;
- изображения и иконки из pack.

Но полное pixel-perfect совпадение всех 23 экранов **ещё не достигнуто**. Последняя локальная browser-verification показала заметные расхождения на всех сравниваемых маршрутах. Это текущая работа, а не завершённый результат.

## 10. Иконки и изображения: важная техническая деталь

В `папка иконок/` часть файлов имеет расширение `.png`, но по факту является SVG XML. Если отдать такой файл как обычный PNG, браузер может показать broken image.

Правило использования:

1. UI glyphs следует брать из настоящих `.svg` и выводить через `DiyorIcon`/inline SVG, чтобы работал `currentColor`.
2. Reference screenshots и cropped raster assets не должны становиться production background или product media.
3. Для товарных фото нужен утверждённый владельцем оригинал либо изображение из Supabase Storage.
4. `category-drink (1).svg` добавлен отдельно как недостающий символ напитка; в исходном наборе отдельного настоящего SVG не было.

## 11. Найденные неясности и риски

1. **Финальные business photos не предоставлены.** В репозитории есть временные food images, но они не равны официальным фотографиям меню.
2. **Точный pickup address ещё не подтверждён.** Нельзя придумывать его для production.
3. **Финальные список меню, составы, цены и тексты требуют owner approval.** Fixture — development fallback.
4. **Референсы не полностью единообразны:** логотип, active color и пятый пункт нижней навигации меняются между скриншотами. Нужна нормализация по экранному сценарию, а не одна слепая navbar на все pages.
5. **В терминальном выводе отдельные русские строки могут выглядеть mojibake** из-за code page PowerShell. Перед массовым редактированием RU/TJ текстов надо подтверждать UTF-8 в редакторе/браузере, а не доверять такому terminal-preview.
6. **Текущая рабочая директория dirty.** Есть изменённые и untracked UI/assets files после недавнего визуального прохода. Их нельзя случайно reset/clean/delete.
7. **Screens и icon pack должны оставаться reference-материалом.** Их не надо бездумно включать в production bundle или Git history, если владелец не попросит иначе.
8. **Production Supabase/Vercel нельзя менять вслепую.** Миграции и environment values нужно применять только к подтверждённому проекту.

## 12. Безопасный следующий порядок работы

1. Зафиксировать текущий dirty visual pass отдельным осмысленным commit только после typecheck/lint/test/build.
2. Создать route-by-route visual checklist на 23 screenshot, а не «средний» универсальный CSS.
3. Сначала стабилизировать общий header, bottom navigation, icon layer, safe areas и typography.
4. Затем последовательно: home → menu/category/search/filter → product/combo detail → cart states → checkout/review/WhatsApp → favorites → contacts → drawer.
5. После каждого route делать screenshot на 390 × 693 CSS px и сравнивать с точным эталоном из `screens/`.
6. Не трогать checkout core, RLS и admin auth без установленной ошибки: это бизнес-критичная логика, уже покрытая тестами.
7. Только после визуальной проверки выполнить `typecheck`, `lint`, `test`, `build`, commit, push и deploy.

## 13. Что не является «непоняткой»

- Деньги должны храниться в дирамах.
- Зоны и thresholds не должны быть захардкожены в application UI.
- WhatsApp number берётся server-side из `restaurant_settings`.
- Service-role key не должен быть в браузере.
- Cart не очищается после открытия WhatsApp.
- Админ-операции требуют active admin.
- Скриншоты являются визуальным source of truth, но не production images.

