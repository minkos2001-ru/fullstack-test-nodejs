import type { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import Book from "../models/book.model";
import sequelize from "../db/sequelize";
import { CreateBookDto } from "../dto/book/create-book.dto";
import { UpdateBookDto } from "../dto/book/update-book.dto";
import { GetBooksDto } from "../dto/book/get-books.dto";

export const getBooks = async (
  req: Request<{}, {}, {}, GetBooksDto>,
  res: Response,
) => {
  try {
    const query = res.locals.query as GetBooksDto;

    const startRow = query.startRow ?? 0;
    const endRow = query.endRow ?? startRow + 20;

    if (endRow <= startRow) {
      return res.status(400).json({
        message: "Некорректный диапазон пагинации",
      });
    }

    const limit = Math.min(endRow - startRow, 100);
    const offset = startRow;

    const books = await sequelize.query(
      `
        SELECT
          b.id,
          b.title,
          b.price,
          b."publishedAt",
          b.pages,
          b."categoryId",
          CASE
            WHEN c.id IS NOT NULL THEN
              json_build_object(
                'id', c.id,
                'name', c.name
              )
            ELSE NULL
          END AS category
        FROM books b
        LEFT JOIN book_categories c
          ON c.id = b."categoryId"
        ORDER BY b.id ASC
        LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { limit, offset },
        type: QueryTypes.SELECT,
      },
    );

    const [countResult] = await sequelize.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count
        FROM books
      `,
      {
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      rows: books,
      lastRow: Number(countResult?.count ?? 0),
    });
  } catch (error) {
    console.error("Ошибка получения книг:", error);

    return res.status(500).json({
      message: "Ошибка при получении книг",
    });
  }
};

export const getBookById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const book = await Book.findByPk(Number(req.params.id));

    if (!book) {
      return res.status(404).json({
        message: "Книга не найдена",
      });
    }

    return res.status(200).json(book);
  } catch {
    return res.status(500).json({
      message: "Ошибка при получении книги",
    });
  }
};

export const createBook = async (
  req: Request<{}, {}, CreateBookDto>,
  res: Response,
) => {
  try {
    const { title, price, publishedAt, pages, categoryId } = req.body;

    const book = await Book.create({
      title,
      price,
      publishedAt,
      pages,
      categoryId: categoryId ?? null,
    });

    return res.status(201).json(book);
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(400).json({
        message: "Указанная категория не существует",
      });
    }

    return res.status(500).json({
      message: "Ошибка при создании книги",
    });
  }
};

export const updateBook = async (
  req: Request<{ id: string }, {}, UpdateBookDto>,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    const [updatedCount] = await Book.update(req.body, {
      where: { id },
    });

    if (updatedCount === 0) {
      return res.status(404).json({
        message: "Книга не найдена",
      });
    }

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(400).json({
        message: "Указанная категория не существует",
      });
    }

    return res.status(500).json({
      message: "Ошибка при обновлении книги",
    });
  }
};

export const deleteBook = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const deletedCount = await Book.destroy({
      where: {
        id: Number(req.params.id),
      },
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        message: "Книга не найдена",
      });
    }

    return res.status(204).send();
  } catch {
    return res.status(500).json({
      message: "Ошибка при удалении книги",
    });
  }
};

export const deleteBookList = async (req: Request, res: Response) => {
  try {
    const ids = (req.query.ids as string).split(",").map(Number);

    const deletedCount = await Book.destroy({
      where: {
        id: ids,
      },
    });

    return res.status(200).json({
      message: "Книги успешно удалены",
      deletedCount,
    });
  } catch (error) {
    console.error("Ошибка массового удаления книг:", error);

    return res.status(500).json({
      message: "Ошибка при удалении книг",
    });
  }
};
