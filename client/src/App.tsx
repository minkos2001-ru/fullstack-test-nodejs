import { BrowserRouter, Routes, Route } from "react-router"
import RootLayout from "./layouts/RootLayout"
import Dashbourd from "./pages/Dashboard"
import NotFound from "./pages/NotFound"
import Book from "./pages/Book"
import Settings from "./pages/Settings"
import BookCategory from "./pages/BookCategory"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="dashboard" element={<Dashbourd />} />
          <Route path="book-table" element={<Book />} />
          <Route path="book-category-table" element={<BookCategory />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
