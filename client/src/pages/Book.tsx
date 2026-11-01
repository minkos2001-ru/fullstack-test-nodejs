import { SiteHeader } from "@/components/site-header"
import BookTable from "../components/book/BookTable"

export default function Book() {
  return (
    <>
      <SiteHeader title={"Book Table"} />
      <BookTable />
    </>
  )
}
