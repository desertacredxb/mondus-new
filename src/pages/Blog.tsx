import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Nav";
import Footer from "../components/Footer";
import blogHeroImage from "../assets/blog.jpg";
import NotifyMe from "../components/NotifyMe";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  coverImage: string;
  tags: string[];
  datePublished: string;
  lastUpdated: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const blogsPerPage = 9;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/blogs/viewblog`);
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handlePostClick = (slug: string) => {
    navigate(`/blogs/${slug}`);
  };

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white font-raleway font-light dark:font-thin">
      <Navbar />

      <section className="relative h-[50vh] md:h-[100vh] w-full">
        <img
          src={blogHeroImage}
          alt="Blog Hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/70 flex flex-col items-center justify-end py-5 text-center px-4">
          <h1 className="text-4xl md:text-6xl text-white mb-4 uppercase">
            Our Latest Blogs
          </h1>
          <p className="text-lg md:text-2xl text-white">
            With knowledge we build a solid foundation for long term success for
            you
          </p>
        </div>
      </section>

      <section className="w-[90%] mx-auto my-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-[450px]"
              />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No blog posts available at the moment.
          </p>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {currentBlogs?.map((post) => (
                <div
                  key={post._id}
                  className="cursor-pointer relative rounded-lg p-[1.5px] hover:shadow-[0_0_10px_var(--primary-color)] transition"
                  style={{
                    background:
                      "linear-gradient(to bottom, #111, var(--primary-color))",
                  }}
                  onClick={() => handlePostClick(post.slug)}
                >
                  <div className="bg-white dark:bg-black rounded-lg h-[450px] flex flex-col overflow-hidden text-left">
                    <img
                      src={post.coverImage}
                      alt={`Cover image for ${post.title}`}
                      className="w-full h-[300px] object-fill rounded-t-lg"
                    />
                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-black dark:text-white leading-snug mb-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 truncate">
                          {post.excerpt}
                        </p>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                        By {post.author} •{" "}
                        {new Date(post.datePublished).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {blogs.length > blogsPerPage && (
              <div className="flex justify-center mt-10 space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <NotifyMe />
      <Footer />
    </div>
  );
};

export default Blog;
