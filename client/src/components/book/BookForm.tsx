import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Save, RussianRuble, Hash } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import type { BookDto } from "@/api/books.api"
import { CategoriesApi } from "@/api/book-categories.api"

type BookFormMode = "create" | "edit"

interface BookCategoryOption {
  id: number
  name: string
}

interface BookFormProps {
  mode: BookFormMode
  initialValues: BookDto
  /** Категория редактируемой книги: берём из строки таблицы, без лишнего запроса */
  initialCategory?: BookCategoryOption | null
  onSave: (dto: BookDto) => Promise<void>
}

// categoryId здесь нет: единственный источник правды для категории — `category`
interface FormValues {
  title: string
  price: string
  pages: string
  publishedAt: string
}

const formConfig: Record<
  BookFormMode,
  { title: string; description: string; submit: string; submitting: string }
> = {
  create: {
    title: "Создание книги",
    description: "Заполните данные книги и нажмите «Создать».",
    submit: "Создать",
    submitting: "Создание...",
  },
  edit: {
    title: "Редактирование книги",
    description: "Измените данные книги и нажмите «Сохранить».",
    submit: "Сохранить",
    submitting: "Сохранение...",
  },
}

const toFormValues = (dto: BookDto): FormValues => ({
  title: dto.title,
  price: String(dto.price),
  pages: String(dto.pages),
  publishedAt: dto.publishedAt,
})

const toDto = (
  values: FormValues,
  category: BookCategoryOption | null
): BookDto => ({
  title: values.title,
  price: Number(values.price),
  pages: Number(values.pages),
  publishedAt: values.publishedAt,
  categoryId: category?.id ?? null,
})

export default function BookForm({
  mode,
  initialValues,
  initialCategory = null,
  onSave,
}: BookFormProps) {
  const config = formConfig[mode]

  const [values, setValues] = useState<FormValues>(() =>
    toFormValues(initialValues)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Выбранная категория (объект целиком) и поисковый запрос — разные вещи.
  // Текст в инпуте Combobox сам выводит из `category` по itemToStringLabel.
  const [category, setCategory] = useState<BookCategoryOption | null>(
    initialCategory
  )
  const [query, setQuery] = useState("")
  const [found, setFound] = useState<BookCategoryOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  const setField = (field: keyof FormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }))

  // Поиск категорий с задержкой 300 мс
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

        if (!cancelled) setFound(response.rows)
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
  }, [query])

  // Выбранная категория всегда остаётся в списке, даже если не попала в выдачу
  const categoryItems = useMemo(() => {
    if (!category || found.some((item) => item.id === category.id)) return found
    return [category, ...found]
  }, [found, category])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setError("")
    setIsSubmitting(true)

    try {
      await onSave(toDto(values, category))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "edit"
            ? "Произошла ошибка при обновлении книги"
            : "Произошла ошибка при создании книги"
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
        <FieldLabel htmlFor="title">Название</FieldLabel>
        <Input
          id="title"
          type="text"
          required
          maxLength={255}
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Введите название книги"
        />
      </Field>

      <Field>
        <FieldLabel>Категория</FieldLabel>

        <Combobox
          items={categoryItems}
          value={category}
          onValueChange={(next) => setCategory(next)}
          // Фильтрация выполняется на сервере, встроенную отключаем
          filter={null}
          // Как показывать выбранную категорию в инпуте
          itemToStringLabel={(item) => item.name}
          // Объекты из поиска и выбранный объект — разные ссылки, сравниваем по id
          isItemEqualToValue={(a, b) => a.id === b.id}
          // Запрос обновляем только при наборе текста. Выбор пункта,
          // сброс и закрытие меняют текст инпута, но не должны запускать поиск.
          onInputValueChange={(text, { reason }) =>
            setQuery(reason === "input-change" ? text : "")
          }
          autoHighlight
        >
          <ComboboxInput
            placeholder="Начните вводить название категории..."
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
              {(item: BookCategoryOption) => (
                <ComboboxItem key={item.id} value={item}>
                  {item.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <FieldDescription>
          Выберите категорию из списка или оставьте поле пустым.
        </FieldDescription>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="pages">Страниц</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="pages"
              type="number"
              required
              min="1"
              step="1"
              value={values.pages}
              onChange={(e) => setField("pages", e.target.value)}
            />
            <InputGroupAddon>
              <Hash />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="price">Цена</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="price"
              type="number"
              required
              min="0"
              step="0.01"
              value={values.price}
              onChange={(e) => setField("price", e.target.value)}
            />
            <InputGroupAddon>
              <RussianRuble />
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </div>

      <Field>
        <FieldLabel>Дата публикации</FieldLabel>
        <DatePicker
          value={values.publishedAt}
          onChange={(value) => setField("publishedAt", value)}
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
