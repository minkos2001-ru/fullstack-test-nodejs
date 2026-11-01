
BEGIN;

-- =========================================
-- BOOK CATEGORIES
-- =========================================

CREATE TABLE IF NOT EXISTS public.book_categories
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    budget NUMERIC(10, 2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "booksCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "parentId" INTEGER,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_categories_parentId_fkey"
        FOREIGN KEY ("parentId")
        REFERENCES public.book_categories (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


-- =========================================
-- BOOKS
-- =========================================

CREATE TABLE IF NOT EXISTS public.books
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    "publishedAt" DATE NOT NULL,
    pages INTEGER NOT NULL,
    "categoryId" INTEGER,

    CONSTRAINT "books_categoryId_fkey"
        FOREIGN KEY ("categoryId")
        REFERENCES public.book_categories (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


-- =====================================================
-- 1. Создание 20 категорий
-- =====================================================

INSERT INTO book_categories (
    name,
    description,
    budget,
    "createdAt",
    "updatedAt",
    "booksCount",
    "isActive"
)
SELECT
    categories.name,
    categories.description,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0,
    TRUE
FROM (VALUES
    ('Фантастика', 'Фантастические произведения'),
    ('Детектив', 'Детективные истории'),
    ('Роман', 'Романы и проза'),
    ('Научная литература', 'Научные книги'),
    ('История', 'Исторические произведения'),
    ('Психология', 'Книги по психологии'),
    ('Программирование', 'Книги о разработке ПО'),
    ('Бизнес', 'Бизнес и предпринимательство'),
    ('Финансы', 'Финансовая литература'),
    ('Саморазвитие', 'Личностный рост'),
    ('Приключения', 'Приключенческая литература'),
    ('Ужасы', 'Ужасы и мистика'),
    ('Фэнтези', 'Миры фэнтези'),
    ('Биография', 'Биографии известных людей'),
    ('Философия', 'Философская литература'),
    ('Искусство', 'Книги об искусстве'),
    ('Спорт', 'Спортивная литература'),
    ('Кулинария', 'Кулинарные книги'),
    ('Путешествия', 'Книги о путешествиях'),
    ('Образование', 'Учебная литература')
) AS categories(name, description)
WHERE NOT EXISTS (
    SELECT 1
    FROM book_categories existing
    WHERE existing.name = categories.name
);

-- =====================================================
-- 2. Создание 1000 книг
--    По 50 книг на каждую категорию
-- =====================================================

WITH categories AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY name) AS category_number
    FROM book_categories
    WHERE name IN (
        'Фантастика',
        'Детектив',
        'Роман',
        'Научная литература',
        'История',
        'Психология',
        'Программирование',
        'Бизнес',
        'Финансы',
        'Саморазвитие',
        'Приключения',
        'Ужасы',
        'Фэнтези',
        'Биография',
        'Философия',
        'Искусство',
        'Спорт',
        'Кулинария',
        'Путешествия',
        'Образование'
    )
),
book_data AS (
    SELECT
        categories.id AS category_id,
        categories.category_number,
        book_number,
        'Книга №' || LPAD(
            ((categories.category_number - 1) * 50 + book_number)::TEXT,
            4,
            '0'
        ) AS title,
        ROUND((300 + RANDOM() * 1700)::NUMERIC, 2) AS price,
        CURRENT_DATE - (RANDOM() * 3650)::INTEGER AS published_at,
        (100 + RANDOM() * 500)::INTEGER AS pages
    FROM categories
    CROSS JOIN GENERATE_SERIES(1, 50) AS book_number
)
INSERT INTO books (
    title,
    price,
    "publishedAt",
    pages,
    "categoryId"
)
SELECT
    book_data.title,
    book_data.price,
    book_data.published_at,
    book_data.pages,
    book_data.category_id
FROM book_data
WHERE NOT EXISTS (
    SELECT 1
    FROM books existing
    WHERE existing.title = book_data.title
      AND existing."categoryId" = book_data.category_id
);

-- =====================================================
-- 3. Обновление количества книг в категориях
-- =====================================================

UPDATE book_categories categories
SET
    "booksCount" = (
        SELECT COUNT(*)
        FROM books
        WHERE books."categoryId" = categories.id
    ),
    "updatedAt" = CURRENT_TIMESTAMP;

COMMIT;
