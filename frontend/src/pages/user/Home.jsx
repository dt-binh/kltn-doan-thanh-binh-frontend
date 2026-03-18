import Header  from "../../components/common/Header"
import Footer  from "../../components/common/Footer"
import { books, genres } from '../../data/mockData.js';
import BookCard from "../../components/common/BookCard"; 
import { Link } from "react-router-dom";
import "./Home.css"
const Home = () => {
    const featuredBooks = books.slice(0, 8);
    return (
        <div className="home">
            <Header/>
            <main>
                <div className="banner">
                    <div className="banner-content">
                        <h1>Chào mừng đến với Smile Shop</h1>
                        <p>Khám phá những bộ truyện tranh tuyệt vời nhất!</p>
                        <Link to="/books" className="btn-primary">Mua ngay</Link>
                    </div>
                </div>
                <section className="categories">
                    <div className="container">
                        <h2>Thể loại phổ biến</h2>
                        <div className="genre-grid">
                            {genres.slice(0,6).map((genre) => (
                                <Link key={genre} to="/books" className="genre-card">
                                {genre}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="featured">
                    <div className="container">
                        <h2>Truyện nổi bật</h2>
                        <div className="books-grid">
                        {featuredBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
           
    )
}
export default Home;