import request from "./request"

export interface Book {
  id: number
  title: string
  price: number
  publishedAt: string
  pages: number
  categoryId: number | null
  category?: {
    id: number
    name: string
  } | null
}

export interface BooksResponse {
  rows: Book[]
  lastRow: number
}

export interface BookDto {
  title: string
  price: number
  publishedAt: string
  pages: number
  categoryId: number | null
}

export interface GetBooksParams {
  startRow: number
  endRow: number
}

export class BooksApi {
  static getAll(params: GetBooksParams): Promise<BooksResponse> {
    const query = new URLSearchParams({
      startRow: String(params.startRow),
      endRow: String(params.endRow),
    })

    return request<BooksResponse>(`/books?${query}`)
  }

  static getById(id: number): Promise<Book> {
    return request<Book>(`/books/${id}`)
  }

  static create(data: BookDto): Promise<Book> {
    return request<Book>("/books", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static update(id: number, data: BookDto): Promise<Book> {
    return request<Book>(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static delete(id: number): Promise<void> {
    return request<void>(`/books/${id}`, {
      method: "DELETE",
    })
  }

  static deleteList(ids: number[]): Promise<void> {
    const query = new URLSearchParams({
      ids: ids.join(","),
    })

    return request<void>(`/books?${query}`, {
      method: "DELETE",
    })
  }
}
