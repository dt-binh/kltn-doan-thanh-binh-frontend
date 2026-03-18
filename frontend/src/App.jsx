import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/user/Home"
import BookList from "./pages/user/BookList"
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;