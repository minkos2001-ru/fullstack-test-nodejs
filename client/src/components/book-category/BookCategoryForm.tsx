import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Save, RussianRuble } from "lucide-react"

import {
  DialogFooter,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import { CategoriesApi, type BookCategoryDto } from "@/api/book-categories.api"

type CategoryFormMode = "create" | "edit"

interface CategoryOption {
  id: number
  name: string
}

interface BookCategoryFormProps {
  mode: CategoryFormMode
  initialValues: BookCategoryDto
  initialCategory?: CategoryOption | null
  currentCategoryId?: number
  onSave: (dto: BookCategoryDto) => Promise<void>
}

interface FormValues {
  name: string
  description: string
  budget: string
  isActive: boolean
}

const formConfig: Record<
  CategoryFormMode,
  { title: string; description: string; submit: string; submitting: string }
> = {
  create: {
    title: "Создание категории",
    description: "Заполните данные категории и нажмите «Создать».",
    submit: "Создать",
    submitting: "Создание...",
  },
  edit: {
    title: "Редактирование категории",
    description: "Измените данные категории и нажмите «Сохранить».",
    submit: "Сохранить",
    submitting: "Сохранение...",
  },
}

const toFormValues = (dto: BookCategoryDto): FormValues => ({
  name: dto.name,
  description: dto.description ?? "",
  budget: String(dto.budget),
  isActive: dto.isActive,
})

const toDto = (
  values: FormValues,
  parent: CategoryOption | null
): BookCategoryDto => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
  budget: Number(values.budget),
  isActive: values.isActive,
  parentId: parent?.id ?? null,
})

export default function BookCategoryForm({
  mode,
  initialValues,
  initialCategory = null,
  currentCategoryId,
  onSave,
}: BookCategoryFormProps) {
  const config = formConfig[mode]

  const [values, setValues] = useState<FormValues>(() =>
    toFormValues(initialValues)
  )

  const [parent, setParent] = useState<CategoryOption | null>(initialCategory)

  const [query, setQuery] = useState("")
  const [found, setFound] = useState<CategoryOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const setField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  // Поиск родительских категорий с задержкой 300 мс
  useEffect(() => {
    let cancelled = false

    const timeout = setTimeout(async () => {
      setIsLoadingCategories(true)

      try {
        const response = await CategoriesApi.getAll({
          startRow: 0,
          endRow: 20,
          search: query.trim(),
        })

        if (!cancelled) {
          setFound(
            response.rows.filter((item) => item.id !== currentCategoryId)
          )
        }
      } catch (err) {
        console.error("Ошибка поиска категорий:", err)
        if (!cancelled) setFound([])
      } finally {
        if (!cancelled) setIsLoadingCategories(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query, currentCategoryId])

  // Выбранная категория всегда остаётся в списке
  const categoryItems = useMemo(() => {
    const items = found.filter((item) => item.id !== currentCategoryId)

    if (!parent || items.some((item) => item.id === parent.id)) {
      return items
    }

    return [parent, ...items]
  }, [found, parent, currentCategoryId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) return

    setError("")

    if (!values.budget.trim() || !Number.isFinite(Number(values.budget))) {
      setError("Введите корректный бюджет")
      return
    }

    if (Number(values.budget) < 0) {
      setError("Бюджет не может быть отрицательным")
      return
    }

    setIsSubmitting(true)

    try {
      await onSave(toDto(values, parent))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "edit"
            ? "Произошла ошибка при обновлении категории"
            : "Произошла ошибка при создании категории"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogTitle>{config.title}</DialogTitle>
      <DialogDescription>{config.description}</DialogDescription>

      <Field>
        <FieldLabel htmlFor="category-name">Название</FieldLabel>
        <Input
          id="category-name"
          type="text"
          required
          maxLength={255}
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Введите название категории"
        />
      </Field>

      <Field>
        <FieldLabel>Родительская категория</FieldLabel>

        <Combobox
          items={categoryItems}
          value={parent}
          onValueChange={(next) => setParent(next)}
          filter={null}
          itemToStringLabel={(item) => item.name}
          isItemEqualToValue={(a, b) => a.id === b.id}
          onInputValueChange={(text, { reason }) =>
            setQuery(reason === "input-change" ? text : "")
          }
          autoHighlight
        >
          <ComboboxInput
            placeholder="Выберите родительскую категорию..."
            className="w-full"
            showClear
          />

          <ComboboxContent>
            <ComboboxEmpty>
              {isLoadingCategories
                ? "Поиск категорий..."
                : "Категории не найдены"}
            </ComboboxEmpty>

            <ComboboxList>
              {(item: CategoryOption) => (
                <ComboboxItem key={item.id} value={item}>
                  {item.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <FieldDescription>
          Выберите родительскую категорию или оставьте поле пустым.
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="category-budget">Бюджет</FieldLabel>

        <InputGroup>
          <InputGroupInput
            id="category-budget"
            type="number"
            required
            min="0"
            step="0.01"
            value={values.budget}
            onChange={(e) => setField("budget", e.target.value)}
          />

          <InputGroupAddon>
            <RussianRuble />
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="category-active"
          checked={values.isActive}
          onCheckedChange={(checked) => setField("isActive", checked === true)}
        />

        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="category-active">Активная категория</FieldLabel>
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="category-description">Описание</FieldLabel>
        <Textarea
          id="category-description"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Введите описание категории"
          rows={3}
        />
      </Field>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Отмена
            </Button>
          }
        />

        <Button type="submit" disabled={isSubmitting}>
          <Save data-icon="inline-start" />
          {isSubmitting ? config.submitting : config.submit}
        </Button>
      </DialogFooter>
    </form>
  )
}
