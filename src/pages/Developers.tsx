import Navbar from "../components/Nav";
import Footer from "../components/Footer";
import NotifyMe from "../components/NotifyMe";
import { Developer } from "../types/developer";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Developers = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/developers`);
      setDevelopers(res.data.data);
    } catch {
      toast.error("Failed to load developers details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white font-raleway">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] md:h-[100vh] w-full">
        <img
          src="https://www.axcapital.ae/_ipx/s_1920x960/img/developers/developers-banner.webp"
          className="h-full w-full object-cover"
          alt="Developers"
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-end py-10 text-center">
          <h1 className="text-4xl md:text-6xl text-white mb-4">Developers</h1>
          <p className="text-lg md:text-2xl text-white">
            More about Dubai developers
          </p>
        </div>
      </section>

      {/* Developer Listing */}
      <section className="max-w-6xl mx-auto my-20 px-5">
        <h2 className="text-3xl md:text-4xl text-center mb-12">
          Trusted Real Estate Developers
        </h2>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {developers.map((dev) => (
                <div
                  key={dev._id}
                  className="flex flex-col md:flex-row gap-6 border border-neutral-700 rounded-xl p-6 bg-white dark:bg-black shadow hover:shadow-lg transition"
                >
                  {/* Logo */}
                  <div className="flex-shrink-0 w-full md:w-64 flex items-center justify-center">
                    <img
                      src={dev.developerLogo}
                      alt={dev.developerName}
                      className="h-28 object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between w-full">
                    <div>
                      <h3 className="text-2xl font-medium mb-2">
                        {dev.developerName}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {dev.shortDescription}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                        {dev.location && <span>📍 {dev.location}</span>}
                        {dev.establishedYear && (
                          <span>🏗 Established {dev.establishedYear}</span>
                        )}
                        {dev.totalProjects && (
                          <span>🏢 {dev.totalProjects} Projects</span>
                        )}
                      </div>

                      {/* Highlights */}
                      {dev.highlights?.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {dev.highlights.slice(0, 5).map((item, i) => (
                            <li
                              key={i}
                              className="text-xs px-3 py-1 rounded-full border border-gray-400 dark:border-gray-600"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Website */}
                    {dev.website && (
                      <a
                        href={
                          dev.website.startsWith("http")
                            ? dev.website
                            : `https://${dev.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-sm text-[var(--primary-color)] hover:underline w-fit"
                      >
                        🌐 Visit Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <NotifyMe />
      <Footer />
    </div>
  );
};

export default Developers;
