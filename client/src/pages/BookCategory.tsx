import { SiteHeader } from "@/components/site-header"
import BookCategoryTable from "@/components/book-category/BookCategoryTable"

export default function BookCategory() {
  return (
    <>
      <SiteHeader title={"Book Category Table"} />
      <BookCategoryTable />
    </>
  )
}
