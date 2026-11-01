import { Router } from "express";
import {
  getBookCategories,
  getBookCategoryById,
  createBookCategory,
  updateBookCategory,
  deleteBookCategory,
  deleteBookCategoryList,
} from "../controllers/book-category.controller";
import { validateDto } from "../middleware/validate-dto";
import { validateQueryDto } from "../middleware/validate-query-dto";
import { validateIntId } from "../middleware/validate-int-id.middleware";
import { CreateBookCategoryDto } from "../dto/book-category/create-book-category.dto";
import { UpdateBookCategoryDto } from "../dto/book-category/update-book-category.dto";
import { GetBookCategoriesDto } from "../dto/book-category/get-book-categories.dto";

const router = Router();

router.post("/", validateDto(CreateBookCategoryDto), createBookCategory);
router.put(
  "/:id",
  validateIntId,
  validateDto(UpdateBookCategoryDto),
  updateBookCategory,
);
router.get("/", validateQueryDto(GetBookCategoriesDto), getBookCategories);
router.get("/:id", validateIntId, getBookCategoryById);
router.delete("/:id", validateIntId, deleteBookCategory);
router.delete("/", deleteBookCategoryList);

export default router;
