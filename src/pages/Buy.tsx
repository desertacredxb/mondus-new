import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { BedDouble, MapPin, Ruler } from "lucide-react";
import { Bath } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Lazy load components
const Navbar = lazy(() => import("../components/Nav"));
const Footer = lazy(() => import("../components/Footer"));
const NotifyMe = lazy(() => import("../components/NotifyMe"));

const Buy: React.FC = () => {
  const [saleData, setSaleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [bedroomFilter, setBedroomFilter] = useState("");
  const [bathroomFilter, setBathroomFilter] = useState("");
  const [subareaFilter, setSubareaFilter] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [minAreaFilter, setMinAreaFilter] = useState("");
  const [maxAreaFilter, setMaxAreaFilter] = useState("");

  /* ---------------- Fetch Properties ---------------- */
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/property?listingType=buy&status=true`,
        );
        const json = await res.json();

        // Safety filter (in case backend changes)
        const buyProperties = (json.data || []).filter(
          (p: any) => p.listingType === "buy",
        );

        setSaleData(buyProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // console.log(saleData);

  /* ---------------- Filter Options ---------------- */
  const uniquePropertyTypes = useMemo(
    () =>
      Array.from(new Set(saleData.map((p) => p.propertyType).filter(Boolean))),
    [saleData],
  );

  const uniqueSubareas = useMemo(
    () => Array.from(new Set(saleData.map((p) => p.subArea).filter(Boolean))),
    [saleData],
  );

  /* ---------------- Filter Logic ---------------- */
  const properties = useMemo(() => {
    return saleData.filter((property) => {
      const bedroomMatch =
        !bedroomFilter ||
        (bedroomFilter === "4"
          ? property.bedroom >= 4
          : property.bedroom === Number(bedroomFilter));

      const bathroomMatch =
        !bathroomFilter ||
        (bathroomFilter === "4"
          ? property.bathroom >= 4
          : property.bathroom === Number(bathroomFilter));

      const subareaMatch = !subareaFilter || property.subArea === subareaFilter;

      const propertyTypeMatch =
        !propertyTypeFilter || property.propertyType === propertyTypeFilter;

      const minAreaMatch =
        !minAreaFilter || property.sizeSqft >= Number(minAreaFilter);

      const maxAreaMatch =
        !maxAreaFilter || property.sizeSqft <= Number(maxAreaFilter);

      return (
        bedroomMatch &&
        bathroomMatch &&
        subareaMatch &&
        propertyTypeMatch &&
        minAreaMatch &&
        maxAreaMatch
      );
    });
  }, [
    saleData,
    bedroomFilter,
    bathroomFilter,
    subareaFilter,
    propertyTypeFilter,
    minAreaFilter,
    maxAreaFilter,
  ]);

  return (
    <>
      <Helmet>
        <title>
          Buy Property in Dubai | Apartments, Villas & Investment Deals
        </title>

        <meta
          name="title"
          content="Buy Property in Dubai | Apartments, Villas & Investment Deals"
        />
        <meta
          name="description"
          content="Explore top properties for sale in Dubai including luxury apartments, villas & high ROI investment deals. Get expert guidance from Mondus Properties. Call +971521110794 today."
        />

        <meta
          name="keywords"
          content="buy property dubai, dubai apartments for sale, villas for sale dubai, dubai real estate investment, property for sale dubai, off plan properties dubai, luxury homes dubai"
        />

        <meta name="robots" content="index, follow, max-image-preview:large" />

        <link rel="canonical" href="https://www.mondusproperties.ae/buy" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mondusproperties.ae/buy" />
        <meta
          property="og:title"
          content="Buy Property in Dubai | Apartments, Villas & Investment Deals"
        />
        <meta
          property="og:description"
          content="Find the best apartments, villas & investment properties for sale in Dubai. Expert assistance from Mondus Properties."
        />
        <meta
          property="og:image"
          content="https://www.mondusproperties.ae/og-buy.jpg"
        />
        <meta property="og:site_name" content="Mondus Properties" />
        <meta property="og:locale" content="en_AE" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content="https://www.mondusproperties.ae/buy"
        />
        <meta
          name="twitter:title"
          content="Buy Property in Dubai | Apartments & Villas"
        />
        <meta
          name="twitter:description"
          content="Browse Dubai properties for sale including apartments, villas & investment deals with Mondus Properties."
        />
        <meta
          name="twitter:image"
          content="https://www.mondusproperties.ae/og-buy.jpg"
        />

        <meta name="geo.region" content="AE-DU" />
        <meta name="geo.placename" content="Dubai" />
        <meta name="geo.position" content="25.2048;55.2708" />
        <meta name="ICBM" content="25.2048, 55.2708" />
      </Helmet>
      <div className="bg-white dark:bg-black text-black dark:text-white font-raleway font-light dark:font-thin">
        <div className="mb-16 md:mb-28 pt-5">
          <Suspense
            fallback={<div className="text-center py-4">Loading navbar...</div>}
          >
            <Navbar />
          </Suspense>
        </div>

        <h1 className="text-2xl text-center">PROPERTIES FOR SALE IN DUBAI</h1>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 px-4">
          <select
            className="border p-2 rounded dark:bg-neutral-800 dark:text-white"
            value={bedroomFilter}
            onChange={(e) => setBedroomFilter(e.target.value)}
          >
            <option value="">Select Bedrooms</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>

          <select
            className="border p-2 rounded dark:bg-neutral-800 dark:text-white"
            value={bathroomFilter}
            onChange={(e) => setBathroomFilter(e.target.value)}
          >
            <option value="">Select Bathrooms</option>
            <option value="1">1 Bathroom</option>
            <option value="2">2 Bathrooms</option>
            <option value="3">3 Bathrooms</option>
            <option value="4">4+ Bathrooms</option>
          </select>

          <select
            className="border p-2 rounded dark:bg-neutral-800 dark:text-white"
            value={subareaFilter}
            onChange={(e) => setSubareaFilter(e.target.value)}
          >
            <option value="">Select Subarea</option>
            {uniqueSubareas.map((subarea, i) => (
              <option key={i} value={subarea}>
                {subarea}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded dark:bg-neutral-800 dark:text-white"
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
          >
            <option value="">Select Property Type</option>
            {uniquePropertyTypes.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="border p-2 rounded w-28 dark:bg-neutral-800 dark:text-white"
            placeholder="Min sqft"
            value={minAreaFilter}
            onChange={(e) => setMinAreaFilter(e.target.value)}
          />

          <input
            type="number"
            className="border p-2 rounded w-28 dark:bg-neutral-800 dark:text-white"
            placeholder="Max sqft"
            value={maxAreaFilter}
            onChange={(e) => setMaxAreaFilter(e.target.value)}
          />
        </div>

        {/* Grid */}
        <div className="relative w-full md:w-[90%] mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : properties.length === 0 ? (
            <p className="text-center min-h-[300px] flex items-center justify-center">
              No properties match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link
                  to={`/buy/${property.slug}`}
                  key={property._id}
                  className="h-full"
                >
                  <div className="bg-gray-100 dark:bg-neutral-900 shadow rounded overflow-hidden border flex flex-col h-full">
                    <img
                      loading="lazy"
                      src={
                        property.propertyImages?.[0]
                          ? `${API_BASE_URL}${property.propertyImages[0]}`
                          : "/placeholder.jpg"
                      }
                      className="w-full h-56 object-cover"
                    />

                    <div className="space-y-1 px-4 py-2 flex-grow">
                      <h3 className="text-lg">{property.propertyName}</h3>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {property.subArea}
                      </p>

                      <div className="flex gap-4 text-sm py-1">
                        <span className="flex gap-1">
                          <BedDouble className="w-4 h-4" />
                          {property.bedroom}
                        </span>
                        <span className="flex gap-1">
                          <Bath className="w-4 h-4" />
                          {property.bathroom}
                        </span>
                        <span className="flex gap-1">
                          <Ruler className="w-4 h-4" />
                          {property.sizeSqft} sqft
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
          <NotifyMe />
          <Footer />
        </Suspense>
      </div>
    </>
  );
};

export default Buy;
