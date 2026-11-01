import type { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import BookCategory from "../models/book-category.model";
import sequelize from "../db/sequelize";
import { CreateBookCategoryDto } from "../dto/book-category/create-book-category.dto";
import { UpdateBookCategoryDto } from "../dto/book-category/update-book-category.dto";
import { GetBookCategoriesDto } from "../dto/book-category/get-book-categories.dto";
import config from "../config";

export const getBookCategories = async (
  req: Request<{}, {}, {}, GetBookCategoriesDto>,
  res: Response,
) => {
  try {
    const query = res.locals.query as GetBookCategoriesDto;

    const startRow = query.startRow ?? 0;
    const endRow = query.endRow ?? startRow + 20;
    const search = query.search?.trim() ?? "";

    if (endRow <= startRow) {
      return res.status(400).json({
        message: "Некорректный диапазон пагинации",
      });
    }

    const limit = Math.min(endRow - startRow, 100);
    const offset = startRow;

    const categories = await sequelize.query(
      `
        SELECT
          c.id,
          c.name,
          c.description,
          c.budget,
          c."createdAt",
          (
            SELECT COUNT(*)::INTEGER
            FROM books b
            WHERE b."categoryId" = c.id
          ) AS "booksCount",
          c."isActive",
          c."parentId",
          CASE
            WHEN parent.id IS NOT NULL THEN
              json_build_object(
                'id', parent.id,
                'name', parent.name
              )
            ELSE NULL
          END AS parent
        FROM book_categories c
        LEFT JOIN book_categories parent
          ON parent.id = c."parentId"
        WHERE c.name ILIKE :search
        ORDER BY c.id ASC
        LIMIT :limit OFFSET :offset
      `,
      {
        replacements: {
          search: `%${search}%`,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      },
    );

    const [countResult] = await sequelize.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count
        FROM book_categories
        WHERE name ILIKE :search
      `,
      {
        replacements: { search: `%${search}%` },
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      rows: categories,
      lastRow: Number(countResult?.count ?? 0),
    });
  } catch (error) {
    if (config.env === "development") {
      console.error("Ошибка получения категорий:", error);
    }
    return res.status(500).json({
      message: "Ошибка при получении категорий",
    });
  }
};

export const getBookCategoryById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const category = await BookCategory.findByPk(Number(req.params.id));

    if (!category) {
      return res.status(404).json({
        message: "Категория не найдена",
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    if (config.env === "development") {
      console.error("Ошибка при получении категории:", error);
    }
    return res.status(500).json({
      message: "Ошибка при получении категории",
    });
  }
};

export const createBookCategory = async (
  req: Request<{}, {}, CreateBookCategoryDto>,
  res: Response,
) => {
  try {
    const { name, description, budget, isActive, parentId } = req.body;

    const category = await BookCategory.create({
      name,
      description: description ?? null,
      budget: budget ?? "0",
      isActive: isActive ?? true,
      parentId: parentId ?? null,
    });

    return res.status(201).json(category);
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(400).json({
        message: "Родительская категория не существует",
      });
    }

    if (config.env === "development") {
      console.error("Ошибка при создании категории:", error);
    }

    return res.status(500).json({
      message: "Ошибка при создании категории",
    });
  }
};

export const updateBookCategory = async (
  req: Request<{ id: string }, {}, UpdateBookCategoryDto>,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    const [updatedCount] = await BookCategory.update(req.body, {
      where: { id },
    });

    if (updatedCount === 0) {
      return res.status(404).json({
        message: "Категория не найдена",
      });
    }

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(400).json({
        message: "Родительская категория не существует",
      });
    }
    if (config.env === "development") {
      console.error("Ошибка при обновлении категории:", error);
    }

    return res.status(500).json({
      message: "Ошибка при обновлении категории",
    });
  }
};

export const deleteBookCategory = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const deletedCount = await BookCategory.destroy({
      where: {
        id: Number(req.params.id),
      },
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        message: "Категория не найдена",
      });
    }

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(409).json({
        message: "Нельзя удалить категорию, у которой есть дочерние категории",
      });
    }

    if (config.env === "development") {
      console.error("Ошибка при удалении категории:", error);
    }

    return res.status(500).json({
      message: "Ошибка при удалении категории",
    });
  }
};

export const deleteBookCategoryList = async (req: Request, res: Response) => {
  try {
    const ids = (req.query.ids as string).split(",").map(Number);

    const deletedCount = await BookCategory.destroy({
      where: { id: ids },
    });

    return res.status(200).json({
      message: "Категории успешно удалены",
      deletedCount,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(409).json({
        message:
          "Нельзя удалить категории, на которые ссылаются книги или дочерние категории",
      });
    }

    if (config.env === "development") {
      console.error("Ошибка массового удаления категорий:", error);
    }

    return res.status(500).json({
      message: "Ошибка при удалении категорий",
    });
  }
};
