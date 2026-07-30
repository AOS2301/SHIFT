-- ============================================
-- BRANDS
-- ============================================
INSERT INTO brands (nome) VALUES
  ('Nike'),
  ('Adidas'),
  ('Vans'),
  ('New Balance'),
  ('Puma')
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (nome, tipo) VALUES
  ('Corrida', 'CATEGORIA'),
  ('Basquete', 'CATEGORIA'),
  ('Skate', 'CATEGORIA'),
  ('Lifestyle', 'CATEGORIA'),
  ('Masculino', 'GENERO'),
  ('Feminino', 'GENERO'),
  ('Unissex', 'GENERO')
ON CONFLICT (nome, tipo) DO NOTHING;

-- ============================================
-- PRODUTO 1: Air Max Pulse (Nike / Corrida)
-- ============================================
WITH b AS (SELECT id FROM brands WHERE nome = 'Nike'),
     c AS (SELECT id FROM categories WHERE nome = 'Corrida' AND tipo = 'CATEGORIA'),
     p AS (
       INSERT INTO products (nome, descricao, preco_base, brand_id, category_id, updated_at)
       SELECT 'Air Max Pulse', 'Amortecimento leve pro dia a dia', 899.00, b.id, c.id, now() FROM b, c
       RETURNING id
     )
INSERT INTO product_variants (tamanho, cor, estoque, sku, product_id)
SELECT tamanho, 'Preto', 5, 'NK-AMP-' || tamanho, p.id
FROM p, unnest(ARRAY[38, 40, 42]) AS tamanho;

-- ============================================
-- PRODUTO 2: Ultraboost Light (Adidas / Corrida)
-- ============================================
WITH b AS (SELECT id FROM brands WHERE nome = 'Adidas'),
     c AS (SELECT id FROM categories WHERE nome = 'Corrida' AND tipo = 'CATEGORIA'),
     p AS (
       INSERT INTO products (nome, descricao, preco_base, brand_id, category_id, updated_at)
       SELECT 'Ultraboost Light', 'Retorno de energia em cada passada', 1049.00, b.id, c.id, now() FROM b, c
       RETURNING id
     )
INSERT INTO product_variants (tamanho, cor, estoque, sku, product_id)
SELECT tamanho, 'Branco', 3, 'AD-UBL-' || tamanho, p.id
FROM p, unnest(ARRAY[39, 41, 43]) AS tamanho;

-- ============================================
-- PRODUTO 3: Old Skool (Vans / Skate)
-- ============================================
WITH b AS (SELECT id FROM brands WHERE nome = 'Vans'),
     c AS (SELECT id FROM categories WHERE nome = 'Skate' AND tipo = 'CATEGORIA'),
     p AS (
       INSERT INTO products (nome, descricao, preco_base, brand_id, category_id, updated_at)
       SELECT 'Old Skool', 'O clássico que nunca sai de moda', 429.00, b.id, c.id, now() FROM b, c
       RETURNING id
     )
INSERT INTO product_variants (tamanho, cor, estoque, sku, product_id)
SELECT tamanho, 'Preto/Branco', 8, 'VN-OSK-' || tamanho, p.id
FROM p, unnest(ARRAY[36, 39, 42]) AS tamanho;

-- ============================================
-- PRODUTO 4: 550 (New Balance / Lifestyle)
-- ============================================
WITH b AS (SELECT id FROM brands WHERE nome = 'New Balance'),
     c AS (SELECT id FROM categories WHERE nome = 'Lifestyle' AND tipo = 'CATEGORIA'),
     p AS (
       INSERT INTO products (nome, descricao, preco_base, brand_id, category_id, updated_at)
       SELECT '550', 'Visual retrô de quadra dos anos 80', 759.00, b.id, c.id, now() FROM b, c
       RETURNING id
     )
INSERT INTO product_variants (tamanho, cor, estoque, sku, product_id)
SELECT tamanho, 'Verde/Branco', 4, 'NB-550-' || tamanho, p.id
FROM p, unnest(ARRAY[37, 38, 40]) AS tamanho;

-- ============================================
-- PRODUTO 5: Suede Classic (Puma / Lifestyle)
-- ============================================
WITH b AS (SELECT id FROM brands WHERE nome = 'Puma'),
     c AS (SELECT id FROM categories WHERE nome = 'Lifestyle' AND tipo = 'CATEGORIA'),
     p AS (
       INSERT INTO products (nome, descricao, preco_base, brand_id, category_id, updated_at)
       SELECT 'Suede Classic', 'Ícone atemporal do streetwear', 549.00, b.id, c.id, now() FROM b, c
       RETURNING id
     )
INSERT INTO product_variants (tamanho, cor, estoque, sku, product_id)
SELECT tamanho, 'Azul', 6, 'PM-SDC-' || tamanho, p.id
FROM p, unnest(ARRAY[38, 40, 41, 43]) AS tamanho;

-- ============================================
-- PRODUTO 6: Air Force 1 (Nike / Lifestyle)
-- ============================================
WITH b AS (SELECT id FROM brands WHERE nome = 'Nike'),
     c AS (SELECT id FROM categories WHERE nome = 'Lifestyle' AND tipo = 'CATEGORIA'),
     p AS (
       INSERT INTO products (nome, descricao, preco_base, brand_id, category_id, updated_at)
       SELECT 'Air Force 1', 'O tênis mais icônico da história da Nike', 699.00, b.id, c.id, now() FROM b, c
       RETURNING id
     )
INSERT INTO product_variants (tamanho, cor, estoque, sku, product_id)
SELECT tamanho, 'Branco', 10, 'NK-AF1-' || tamanho, p.id
FROM p, unnest(ARRAY[37, 38, 39, 40, 42]) AS tamanho;

-- ============================================
-- PRODUTO 7: Dame Certified (Adidas / Basquete)
-- ============================================
WITH b AS (SELECT id FROM brands WHERE nome = 'Adidas'),
     c AS (SELECT id FROM categories WHERE nome = 'Basquete' AND tipo = 'CATEGORIA'),
     p AS (
       INSERT INTO products (nome, descricao, preco_base, brand_id, category_id, updated_at)
       SELECT 'Dame Certified', 'Estabilidade e explosão pra quadra', 649.00, b.id, c.id, now() FROM b, c
       RETURNING id
     )
INSERT INTO product_variants (tamanho, cor, estoque, sku, product_id)
SELECT tamanho, 'Preto/Vermelho', 2, 'AD-DMC-' || tamanho, p.id
FROM p, unnest(ARRAY[40, 42, 44]) AS tamanho;

-- ============================================
-- CONFERÊNCIA
-- ============================================
SELECT p.id, p.nome, b.nome AS marca, c.nome AS categoria, p.preco_base
FROM products p
JOIN brands b ON b.id = p.brand_id
JOIN categories c ON c.id = p.category_id
ORDER BY p.id;

SELECT pv.sku, pv.tamanho, pv.cor, pv.estoque, p.nome
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
ORDER BY pv.id;
