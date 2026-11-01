import { SiteHeader } from "@/components/site-header"
import BookCategoryTable from "@/components/book-category/BookCategoryTable"
import BookTable from "@/components/book/BookTable"

export default function Dashbourd() {
  return (
    <>
      <SiteHeader title={"Dashbourd"} />
      <ResizableDemo />
    </>
  )
}

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function ResizableDemo() {
  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize="100%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="50%">
            <div className="flex h-full items-center justify-center">
              <BookCategoryTable />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%">
            <div className="flex h-full items-center justify-center">
              <BookTable />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
