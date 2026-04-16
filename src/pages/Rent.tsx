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

const Rent: React.FC = () => {
  const [rentData, setRentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [bedroomFilter, setBedroomFilter] = useState("");
  const [bathroomFilter, setBathroomFilter] = useState("");
  const [subareaFilter, setSubareaFilter] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [minAreaFilter, setMinAreaFilter] = useState("");
  const [maxAreaFilter, setMaxAreaFilter] = useState("");

  /* ---------------- FETCH RENT PROPERTIES ---------------- */
  useEffect(() => {
    const fetchRentProperties = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/property?listingType=rent&status=true`,
        );
        const json = await res.json();
        setRentData(json.data || []);
      } catch (error) {
        console.error("Error fetching rent properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRentProperties();
  }, []);

  /* ---------------- DROPDOWNS ---------------- */
  const uniqueSubareas = useMemo(
    () =>
      Array.from(
        new Set(rentData.map((p) => p.subArea).filter(Boolean)),
      ).sort(),
    [rentData],
  );

  const uniquePropertyTypes = useMemo(
    () =>
      Array.from(
        new Set(rentData.map((p) => p.propertyType).filter(Boolean)),
      ).sort(),
    [rentData],
  );

  /* ---------------- FILTER LOGIC ---------------- */
  const properties = useMemo(() => {
    return rentData.filter((property) => {
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
    rentData,
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
        <title>Rent Property in Dubai | Flats, Villas & Furnished Homes</title>

        <meta
          name="title"
          content="Rent Property in Dubai | Flats, Villas & Furnished Homes"
        />
        <meta
          name="description"
          content="Find apartments, villas & furnished homes for rent in Dubai at best prices. Call +971521110794 for quick assistance."
        />

        <meta
          name="keywords"
          content="rent property dubai, apartments for rent dubai, villas for rent dubai, furnished flats dubai, dubai rental properties"
        />

        <meta name="robots" content="index, follow, max-image-preview:large" />

        <link rel="canonical" href="https://www.mondusproperties.ae/rent" />

        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://www.mondusproperties.ae/sell"
        />
        <meta
          property="og:title"
          content="Rent Property in Dubai | Flats, Villas & Furnished Homes"
        />
        <meta
          property="og:description"
          content="Find apartments, villas & furnished homes for rent in Dubai at best prices. Call +971521110794 for quick assistance."
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
          content="https://www.mondusproperties.ae/rent"
        />
        <meta
          name="twitter:title"
          content="Rent Property in Dubai | Flats, Villas & Furnished Homes"
        />
        <meta
          name="twitter:description"
          content="Find apartments, villas & furnished homes for rent in Dubai at best prices. Call +971521110794 for quick assistance."
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

        <h1 className="text-2xl text-center">PROPERTIES FOR RENT IN DUBAI</h1>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mt-4 px-4">
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
            <option value="">All Subareas</option>
            {uniqueSubareas.map((area, i) => (
              <option key={i} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded dark:bg-neutral-800 dark:text-white"
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
          >
            <option value="">All Property Types</option>
            {uniquePropertyTypes.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Area Sqft"
            value={minAreaFilter}
            onChange={(e) => setMinAreaFilter(e.target.value)}
            className="border p-2 rounded dark:bg-neutral-800 dark:text-white"
          />

          <input
            type="number"
            placeholder="Max Area Sqft"
            value={maxAreaFilter}
            onChange={(e) => setMaxAreaFilter(e.target.value)}
            className="border p-2 rounded dark:bg-neutral-800 dark:text-white"
          />
        </div>

        {/* Property Grid */}
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
                  to={`/rent/${property.slug}`}
                  key={property._id}
                  className="h-full"
                >
                  <div className="bg-gray-100 dark:bg-neutral-900 shadow rounded overflow-hidden border flex flex-col h-full">
                    <img
                      loading="lazy"
                      src={
                        property.propertyImages?.[0]
                          ? `${property.propertyImages[0]}`
                          : "/placeholder.jpg"
                      }
                      className="w-full h-56 object-cover"
                    />

                    <div className="space-y-1 px-4 py-2 flex-grow">
                      <h3 className="text-lg">{property.propertyName}</h3>

                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {property.subArea}
                      </p>

                      <p className="text-sm">{property.propertyType}</p>

                      <div className="flex items-center text-sm gap-4 py-1">
                        <span className="flex gap-1">
                          <BedDouble className="w-4 h-4" /> {property.bedroom}
                        </span>
                        <span className="flex gap-1">
                          <Bath className="w-4 h-4" /> {property.bathroom}
                        </span>
                        <span className="flex gap-1">
                          <Ruler className="w-4 h-4" /> {property.sizeSqft} sqft
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

export default Rent;
