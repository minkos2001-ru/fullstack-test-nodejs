import { Router } from "express";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  deleteBookList,
} from "../controllers/book.controller";
import { validateDto } from "../middleware/validate-dto";
import { validateQueryDto } from "../middleware/validate-query-dto";
import { validateIntId } from "../middleware/validate-int-id.middleware";
import { CreateBookDto } from "../dto/book/create-book.dto";
import { UpdateBookDto } from "../dto/book/update-book.dto";
import { GetBooksDto } from "../dto/book/get-books.dto";

const router = Router();

router.post("/", validateDto(CreateBookDto), createBook);
router.put("/:id", validateIntId, validateDto(UpdateBookDto), updateBook);
router.get("/", validateQueryDto(GetBooksDto), getBooks);
router.get("/:id", validateIntId, getBookById);
router.delete("/:id", validateIntId, deleteBook);
router.delete("/", deleteBookList);

export default router;
