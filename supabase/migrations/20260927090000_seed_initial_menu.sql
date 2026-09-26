-- Initial production catalog. The statements are idempotent so an existing
-- owner-managed catalog is never overwritten on a later migration run.

insert into public.categories (name, name_tj, slug, image_url, is_active, sort_order)
values
  ('Бургеры', 'Бургерҳо', 'burgers', '/images/burger-v1.png', true, 1),
  ('Хот-доги', 'Хот-догҳо', 'hotdogs', '/images/hotdog-v1.png', true, 2),
  ('Роллы', 'Роллҳо', 'rolls', '/images/burrito-v1.png', true, 3),
  ('Пицца', 'Пицца', 'pizza', '/images/pizza-v1.png', true, 4),
  ('Гарниры', 'Иловаҳо', 'sides', '/images/fries-cola-v1.png', true, 5),
  ('Напитки', 'Нӯшокиҳо', 'drinks', '/images/fries-cola-v1.png', true, 6),
  ('Комбо', 'Комбо', 'combos', '/images/fries-cola-v1.png', true, 7)
on conflict (slug) do nothing;

with seed (category_slug, name, slug, product_type, description, ingredients_text, image_url, base_price_diram, is_popular, sort_order) as (
  values
    ('burgers', 'Гамбургер', 'hamburger', 'NORMAL'::public.product_type, 'Сочная говяжья котлета, свежие овощи и фирменный соус.', 'говяжья котлета, овощи, фирменный соус', '/images/burger-v1.png', 2200, true, 1),
    ('burgers', 'Чизбургер', 'cheeseburger', 'NORMAL'::public.product_type, 'Сочная говяжья котлета, сыр, свежие овощи и фирменный соус.', 'говяжья котлета, сыр, овощи, фирменный соус', '/images/burger-v1.png', 2500, true, 2),
    ('burgers', 'Бигбургер', 'bigburger', 'NORMAL'::public.product_type, 'Две говяжьи котлеты, сыр, свежие овощи и фирменный соус.', 'две говяжьи котлеты, сыр, овощи', '/images/burger-v1.png', 3500, true, 3),
    ('hotdogs', 'Хот-дог', 'hotdog', 'NORMAL'::public.product_type, 'Сочная сосиска, булочка, кетчуп и горчица.', 'сосиска, булочка, кетчуп, горчица', '/images/hotdog-v1.png', 1200, false, 1),
    ('rolls', 'Ролл Буррито', 'burrito-roll', 'NORMAL'::public.product_type, 'Сочная говядина, свежие овощи и сыр в пшеничной лепёшке.', 'говядина, овощи, сыр, лепёшка', '/images/burrito-v1.png', 2800, true, 1),
    ('pizza', 'Пицца Пепперони', 'pepperoni', 'PIZZA'::public.product_type, 'Пицца с пепперони, моцареллой и томатным соусом.', 'пепперони, моцарелла, томатный соус', '/images/pizza-v1.png', null, true, 1),
    ('sides', 'Картофель фри', 'fries', 'NORMAL'::public.product_type, 'Золотистый и хрустящий картофель фри.', 'картофель, соль', '/images/fries-v2.png', 1600, true, 1),
    ('drinks', 'Coca-Cola 0.4', 'cola-04', 'NORMAL'::public.product_type, 'Классический освежающий напиток.', 'газированный напиток', '/images/cola-v2.png', 800, false, 1),
    ('combos', 'Комбо Гамбургер', 'combo-hamburger', 'COMBO'::public.product_type, 'Гамбургер + картофель фри + напиток 0.4.', 'гамбургер, картофель фри, напиток', '/images/fries-cola-v1.png', 4100, true, 1),
    ('combos', 'Комбо Чизбургер', 'combo-cheeseburger', 'COMBO'::public.product_type, 'Чизбургер + картофель фри + напиток 0.4.', 'чизбургер, картофель фри, напиток', '/images/fries-cola-v1.png', 4300, true, 2),
    ('combos', 'Комбо Бигбургер', 'combo-bigburger', 'COMBO'::public.product_type, 'Бигбургер + картофель фри + напиток 0.4.', 'бигбургер, картофель фри, напиток', '/images/fries-cola-v1.png', 5300, false, 3)
)
insert into public.products (category_id, name, name_tj, slug, product_type, description, description_tj, ingredients_text, ingredients_text_tj, image_url, base_price_diram, is_available, is_active, is_popular, sort_order)
select c.id, s.name, s.name, s.slug, s.product_type, s.description, s.description, s.ingredients_text, s.ingredients_text, s.image_url, s.base_price_diram, true, true, s.is_popular, s.sort_order
from seed s join public.categories c on c.slug = s.category_slug
on conflict (slug) do nothing;

with seed (product_slug, name, price_diram, sort_order) as (
  values ('pepperoni', '28 см', 6000, 1), ('pepperoni', '30 см', 7000, 2), ('pepperoni', '36 см', 8000, 3)
)
insert into public.product_variants (product_id, name, name_tj, price_diram, is_active, is_available, sort_order)
select p.id, s.name, s.name, s.price_diram, true, true, s.sort_order
from seed s join public.products p on p.slug = s.product_slug
where not exists (select 1 from public.product_variants v where v.product_id = p.id and v.name = s.name);

with seed (product_slug, component_product_slug, name, sort_order) as (
  values
    ('combo-hamburger', 'hamburger', 'Гамбургер', 1), ('combo-hamburger', 'fries', 'Картофель фри', 2), ('combo-hamburger', 'cola-04', 'Напиток 0.4', 3),
    ('combo-cheeseburger', 'cheeseburger', 'Чизбургер', 1), ('combo-cheeseburger', 'fries', 'Картофель фри', 2), ('combo-cheeseburger', 'cola-04', 'Напиток 0.4', 3),
    ('combo-bigburger', 'bigburger', 'Бигбургер', 1), ('combo-bigburger', 'fries', 'Картофель фри', 2), ('combo-bigburger', 'cola-04', 'Напиток 0.4', 3)
)
insert into public.combo_components (product_id, component_product_id, name, name_tj, quantity, sort_order)
select combo.id, component.id, s.name, s.name, 1, s.sort_order
from seed s join public.products combo on combo.slug = s.product_slug join public.products component on component.slug = s.component_product_slug
where not exists (select 1 from public.combo_components cc where cc.product_id = combo.id and cc.name = s.name and cc.archived_at is null);
