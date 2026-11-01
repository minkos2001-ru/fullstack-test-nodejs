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

import DeleteBtn from "../DeleteBtn"
import BookCategoryForm from "./BookCategoryForm"

import {
  CategoriesApi,
  type BookCategory,
  type BookCategoryDto,
} from "@/api/book-categories.api"

ModuleRegistry.registerModules([AllCommunityModule])

const categoryTableTheme = themeQuartz.withParams({
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

const initialForm: BookCategoryDto = {
  name: "",
  description: null,
  budget: 0,
  isActive: true,
  parentId: null,
}

const toDto = (category: BookCategory): BookCategoryDto => ({
  name: category.name,
  description: category.description,
  budget: category.budget,
  isActive: category.isActive,
  parentId: category.parentId,
})

const budgetFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const rowSelection: RowSelectionOptions = {
  mode: "multiRow",
  checkboxes: true,
  headerCheckbox: false,
  enableClickSelection: true,
}

const getRowId = ({ data }: GetRowIdParams<BookCategory>) => String(data.id)

const datasource: IDatasource = {
  async getRows(params: IGetRowsParams) {
    try {
      const { rows, lastRow } = await CategoriesApi.getAll({
        startRow: params.startRow,
        endRow: params.endRow,
      })

      params.successCallback(rows, lastRow)
    } catch (err) {
      console.error("Ошибка загрузки категорий:", err)
      params.failCallback()
    }
  },
}

type GridContext = {
  onEdit: (category: BookCategory) => void
  onDelete: (category: BookCategory) => void
}

function ActionsCell({
  data,
  context,
}: ICellRendererParams<BookCategory, unknown, GridContext>) {
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

const columnDefs: ColDef<BookCategory>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 90,
  },
  {
    field: "name",
    headerName: "Название",
    flex: 2,
    minWidth: 180,
  },
  {
    field: "description",
    headerName: "Описание",
    flex: 2,
    minWidth: 200,
  },
  {
    field: "budget",
    headerName: "Бюджет",
    width: 130,
    valueFormatter: ({ value }) =>
      value != null ? budgetFormatter.format(Number(value)) : "",
  },
  {
    field: "booksCount",
    headerName: "Книг",
    width: 100,
  },
  {
    field: "isActive",
    headerName: "Активна",
    width: 110,
    valueFormatter: ({ value }) => (value ? "Да" : "Нет"),
  },
  {
    field: "parent",
    headerName: "Родительская категория",
    width: 180,
    valueFormatter: ({ value }) => value?.name ?? "—",
  },
  {
    field: "createdAt",
    headerName: "Дата создания",
    width: 170,
    valueFormatter: ({ value }) =>
      value ? new Date(value).toLocaleString("ru-RU") : "",
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
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; category: BookCategory }

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback

export default function BookCategoryTable() {
  const gridApiRef = useRef<GridApi<BookCategory> | null>(null)
  const isDeletingRef = useRef(false)

  const [dialog, setDialog] = useState<DialogState>({
    mode: "closed",
  })

  const [selectedCount, setSelectedCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const onGridReady = useCallback((event: GridReadyEvent<BookCategory>) => {
    gridApiRef.current = event.api
  }, [])

  const syncSelection = useCallback(() => {
    setSelectedCount(gridApiRef.current?.getSelectedRows().length ?? 0)
  }, [])

  const reloadAll = useCallback(() => {
    gridApiRef.current?.purgeInfiniteCache()
  }, [])

  const closeDialog = useCallback(() => {
    setDialog({ mode: "closed" })
  }, [])

  const openCreate = useCallback(() => {
    setDialog({ mode: "create" })
  }, [])

  const handleDialogChange = useCallback(
    (open: boolean) => {
      if (!open) closeDialog()
    },
    [closeDialog]
  )

  // Сохранение категории
  const handleSave = useCallback(
    async (dto: BookCategoryDto) => {
      if (dialog.mode === "edit") {
        await CategoriesApi.update(dialog.category.id, dto)
      } else {
        await CategoriesApi.create(dto)
      }

      reloadAll()
      closeDialog()
    },
    [dialog, reloadAll, closeDialog]
  )

  // Удаление одной категории
  const handleDeleteOne = useCallback(
    async (category: BookCategory) => {
      if (isDeletingRef.current) return

      if (
        !window.confirm(
          `Вы действительно хотите удалить категорию «${category.name}»?`
        )
      ) {
        return
      }

      isDeletingRef.current = true
      setIsDeleting(true)

      try {
        await CategoriesApi.delete(category.id)

        gridApiRef.current?.getRowNode(String(category.id))?.setSelected(false)

        reloadAll()
        syncSelection()
      } catch (err) {
        window.alert(getErrorMessage(err, "Не удалось удалить категорию"))
      } finally {
        isDeletingRef.current = false
        setIsDeleting(false)
      }
    },
    [reloadAll, syncSelection]
  )

  // Массовое удаление категорий через отдельные DELETE-запросы
  const handleDeleteSelected = useCallback(async () => {
    const ids =
      gridApiRef.current?.getSelectedRows().map((category) => category.id) ?? []

    if (!ids.length || isDeletingRef.current) return

    isDeletingRef.current = true
    setIsDeleting(true)

    try {
      const results = await Promise.allSettled(
        ids.map((id) => CategoriesApi.delete(id))
      )

      const deletedCount = results.filter(
        (result) => result.status === "fulfilled"
      ).length

      const failedCount = results.length - deletedCount

      gridApiRef.current?.deselectAll()
      reloadAll()
      syncSelection()

      if (failedCount > 0) {
        window.alert(
          `Удалено категорий: ${deletedCount}. Не удалось удалить: ${failedCount}.`
        )
      }
    } catch (err) {
      window.alert(
        getErrorMessage(err, "Не удалось удалить выбранные категории")
      )
    } finally {
      isDeletingRef.current = false
      setIsDeleting(false)
    }
  }, [reloadAll, syncSelection])

  // Стабильный контекст для ячеек действий
  const context = useMemo<GridContext>(
    () => ({
      onEdit: (category) => setDialog({ mode: "edit", category }),
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

      {/* Categories Grid */}
      <div className="min-h-0 min-w-0 flex-1">
        <AgGridReact<BookCategory>
          theme={categoryTableTheme}
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

      {/* Create / Edit Category Dialog */}
      <Dialog open={dialog.mode !== "closed"} onOpenChange={handleDialogChange}>
        <DialogContent>
          {dialog.mode !== "closed" && (
            <BookCategoryForm
              mode={dialog.mode}
              initialValues={
                dialog.mode === "edit" ? toDto(dialog.category) : initialForm
              }
              onSave={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
