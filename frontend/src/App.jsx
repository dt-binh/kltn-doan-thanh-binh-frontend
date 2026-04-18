import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/user/Home"
import BookList from "./pages/user/BookList"
import Cart from "./pages/user/Cart"
import Login from "./pages/user/Login"
import BookDetail from "./pages/user/BookDetail"
import Checkout from "./pages/user/Checkout"
import Profile from "./pages/user/Profile"
import Register from "./pages/user/Register"
import AdminLayout from "./pages/admin/AdminLayout"
import Dashboard from "./pages/admin/Dashboard"
import Users from "./pages/admin/Users"
import BooksPage from "./pages/admin/Books"
import Genres from "./pages/admin/Genres"
import Authors from "./pages/admin/Authors"
import Orders from "./pages/admin/Orders"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="genres" element={<Genres />} />
            <Route path="authors" element={<Authors />} />
            <Route path="orders" element={<Orders />} />
          </Route>

        </Routes>
      </div>
    </Router>
  )
}

export default App;