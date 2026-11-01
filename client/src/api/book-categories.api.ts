import request from "./request"

export interface BookCategory {
  id: number
  name: string
  description: string | null
  budget: number
  createdAt: string
  booksCount: number
  isActive: boolean
  parentId: number | null
  parent: {
    id: number
    name: string
  } | null
}

export interface CategoriesResponse {
  rows: BookCategory[]
  lastRow: number
}

export interface BookCategoryDto {
  name: string
  description: string | null
  budget: number
  isActive: boolean
  parentId: number | null
}

export interface GetCategoriesParams {
  startRow: number
  endRow: number
  search?: string
}

export class CategoriesApi {
  static getAll(params: GetCategoriesParams): Promise<CategoriesResponse> {
    const query = new URLSearchParams({
      startRow: String(params.startRow),
      endRow: String(params.endRow),
    })

    if (params.search?.trim()) {
      query.set("search", params.search.trim())
    }

    return request<CategoriesResponse>(`/book-categories?${query}`)
  }

  static getById(id: number): Promise<BookCategory> {
    return request<BookCategory>(`/book-categories/${id}`)
  }

  static create(data: BookCategoryDto): Promise<BookCategory> {
    return request<BookCategory>("/book-categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static update(id: number, data: BookCategoryDto): Promise<BookCategory> {
    return request<BookCategory>(`/book-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static delete(id: number): Promise<void> {
    return request<void>(`/book-categories/${id}`, {
      method: "DELETE",
    })
  }

  static deleteList(ids: number[]): Promise<void> {
    const query = new URLSearchParams({
      ids: ids.join(","),
    })

    return request<void>(`/book-categories?${query}`, {
      method: "DELETE",
    })
  }
}
