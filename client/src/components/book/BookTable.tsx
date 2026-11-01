import { useCallback, useMemo, useRef, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import { Pencil, Trash2, Plus, EllipsisVertical } from "lucide-react"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GetRowIdParams,
  type GridApi,
  type GridReadyEvent,
  type ICellRendererParams,
  type IDatasource,
  type IGetRowsParams,
  type RowSelectionOptions,
} from "ag-grid-community"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BooksApi, type Book, type BookDto } from "@/api/books.api"
import DeleteBtn from "../DeleteBtn"
import BookForm from "./BookForm"

ModuleRegistry.registerModules([AllCommunityModule])

/* -------------------------------------------------------------------------- */
/*  Константы уровня модуля (не пересоздаются при рендере)                    */
/* -------------------------------------------------------------------------- */

const bookTableTheme = themeQuartz.withParams({
  backgroundColor: "var(--background)",
  foregroundColor: "var(--foreground)",
  headerBackgroundColor: "var(--muted)",
  headerTextColor: "var(--muted-foreground)",
  borderColor: "var(--border)",
  accentColor: "var(--primary)",
  rowHoverColor: "var(--accent)",
  selectedRowBackgroundColor: "var(--accent)",
  fontSize: 13,
  headerFontSize: 13,
  rowHeight: 42,
  headerHeight: 44,
  wrapperBorderRadius: 8,
})

const initialForm: BookDto = {
  title: "",
  price: 0,
  publishedAt: "",
  pages: 1,
  categoryId: null,
}

const toDto = (book: Book): BookDto => ({
  title: book.title,
  price: Number(book.price),
  publishedAt: book.publishedAt,
  pages: book.pages,
  categoryId: book.categoryId ?? null,
})

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
})

const rowSelection: RowSelectionOptions = {
  mode: "multiRow",
  checkboxes: true,
  headerCheckbox: false,
  enableClickSelection: true,
}

const getRowId = ({ data }: GetRowIdParams<Book>) => String(data.id)

const datasource: IDatasource = {
  async getRows(params: IGetRowsParams) {
    try {
      const { rows, lastRow } = await BooksApi.getAll({
        startRow: params.startRow,
        endRow: params.endRow,
        // sortModel: params.sortModel,
        // filterModel: params.filterModel,
      })
      params.successCallback(rows, lastRow)
    } catch (err) {
      console.error("Ошибка загрузки книг:", err)
      params.failCallback()
    }
  },
}

type GridContext = {
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

function ActionsCell({
  data,
  context,
}: ICellRendererParams<Book, unknown, GridContext>) {
  if (!data) return null

  return (
    <div className="flex h-full items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Действия"
              onClick={(event) => event.stopPropagation()}
            >
              <EllipsisVertical className="size-4" />
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => context.onEdit(data)}>
            <Pencil className="size-4" />
            <span>Изменить</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => context.onDelete(data)}
          >
            <Trash2 className="size-4" />
            <span>Удалить</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// filter: false, sortable: true, resizable: true — значения AG Grid по умолчанию
// в community-версии для infinite-модели, поэтому defaultColDef не нужен
const columnDefs: ColDef<Book>[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "title", headerName: "Название", flex: 2, minWidth: 200 },
  {
    colId: "category",
    headerName: "Категория",
    flex: 1,
    minWidth: 160,
    sortable: false,
    valueGetter: ({ data }) => data?.category?.name ?? "",
  },
  { field: "publishedAt", headerName: "Дата публикации", width: 170 },
  { field: "pages", headerName: "Страниц", width: 120 },
  {
    field: "price",
    headerName: "Цена",
    width: 130,
    valueFormatter: ({ value }) =>
      value != null ? priceFormatter.format(Number(value)) : "",
  },
  {
    colId: "actions",
    headerName: "Действия",
    width: 110,
    sortable: false,
    resizable: false,
    cellRenderer: ActionsCell,
  },
]

type DialogState =
  { mode: "closed" } | { mode: "create" } | { mode: "edit"; book: Book }

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback

export default function BookTable() {
  const gridApiRef = useRef<GridApi<Book> | null>(null)
  // Синхронная защита от повторных вызовов удаления (state обновляется асинхронно)
  const isDeletingRef = useRef(false)

  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" })
  const [selectedCount, setSelectedCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const onGridReady = useCallback((event: GridReadyEvent<Book>) => {
    gridApiRef.current = event.api
  }, [])

  // setSelectedCount с тем же значением не вызывает ререндер,
  // поэтому refreshCells и прочие ухищрения не нужны
  const syncSelection = useCallback(() => {
    setSelectedCount(gridApiRef.current?.getSelectedRows().length ?? 0)
  }, [])

  const reloadAll = useCallback(() => {
    gridApiRef.current?.purgeInfiniteCache()
  }, [])

  const closeDialog = useCallback(() => setDialog({ mode: "closed" }), [])

  const openCreate = useCallback(() => setDialog({ mode: "create" }), [])

  const handleDialogChange = useCallback(
    (open: boolean) => {
      if (!open) closeDialog()
    },
    [closeDialog]
  )

  // Ошибки пробрасываем наверх: BookForm сам хранит isSubmitting / error
  // и показывает сообщение. Диалог закрывается только при успехе.
  const handleSave = useCallback(
    async (dto: BookDto) => {
      if (dialog.mode === "edit") {
        await BooksApi.update(dialog.book.id, dto)
      } else {
        await BooksApi.create(dto)
      }

      reloadAll()
      closeDialog()
    },
    [dialog, reloadAll, closeDialog]
  )

  const handleDeleteOne = useCallback(
    async (book: Book) => {
      if (isDeletingRef.current) return
      if (
        !window.confirm(
          `Вы действительно хотите удалить книгу «${book.title}»?`
        )
      )
        return

      isDeletingRef.current = true
      setIsDeleting(true)

      try {
        await BooksApi.delete(book.id)

        // Снимаем выделение только с удалённой строки, остальные не трогаем
        gridApiRef.current?.getRowNode(String(book.id))?.setSelected(false)
        reloadAll()
        syncSelection()
      } catch (err) {
        window.alert(getErrorMessage(err, "Не удалось удалить книгу"))
      } finally {
        isDeletingRef.current = false
        setIsDeleting(false)
      }
    },
    [reloadAll, syncSelection]
  )

  const handleDeleteSelected = useCallback(async () => {
    const ids =
      gridApiRef.current?.getSelectedRows().map((book) => book.id) ?? []

    if (!ids.length || isDeletingRef.current) return

    isDeletingRef.current = true
    setIsDeleting(true)

    try {
      await BooksApi.deleteList(ids)

      gridApiRef.current?.deselectAll()
      reloadAll()
      syncSelection()
    } catch (err) {
      window.alert(getErrorMessage(err, "Не удалось удалить выбранные книги"))
    } finally {
      isDeletingRef.current = false
      setIsDeleting(false)
    }
  }, [reloadAll, syncSelection])

  // Стабильный объект: ячейки действий не перерисовываются зря
  const context = useMemo<GridContext>(
    () => ({
      onEdit: (book) => setDialog({ mode: "edit", book }),
      onDelete: handleDeleteOne,
    }),
    [handleDeleteOne]
  )

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4 p-4">
      {/* Toolbar */}
      <div className="flex space-x-2">
        <Button size="lg" variant="default" onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Добавить запись
        </Button>

        <DeleteBtn
          selectedCount={selectedCount}
          isDeleting={isDeleting}
          onConfirm={handleDeleteSelected}
        />
      </div>

      {/* Books Grid */}
      <div className="min-h-0 min-w-0 flex-1">
        <AgGridReact<Book>
          theme={bookTableTheme}
          columnDefs={columnDefs}
          context={context}
          datasource={datasource}
          rowModelType="infinite"
          cacheBlockSize={20}
          maxBlocksInCache={5}
          rowSelection={rowSelection}
          getRowId={getRowId}
          onGridReady={onGridReady}
          onSelectionChanged={syncSelection}
          animateRows
        />
      </div>

      {/* Create / Edit Book Dialog */}
      <Dialog open={dialog.mode !== "closed"} onOpenChange={handleDialogChange}>
        <DialogContent>
          {dialog.mode !== "closed" && (
            <BookForm
              mode={dialog.mode}
              initialValues={
                dialog.mode === "edit" ? toDto(dialog.book) : initialForm
              }
              onSave={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
