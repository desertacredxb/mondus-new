import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  BedDouble,
  Ruler,
  Bath,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/Nav";
import Footer from "../components/Footer";
import NotifyMe from "../components/NotifyMe";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Helmet } from "react-helmet";
import { FAQAccordion } from "../components/FAQAccordion";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BuyDetails = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  // console.log(idOrSlug);
  /* ================= FETCH PROPERTY ================= */
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/property/${idOrSlug}`);
        const json = await res.json();

        if (json.success && json.data) {
          const p = json.data;
          const normalized = {
            ...p,
            bedroom: p.bedroom === undefined || p.bedroom === null ? "" : String(p.bedroom),
            bathroom: p.bathroom === undefined || p.bathroom === null ? "" : String(p.bathroom),
            sizeSqft: p.sizeSqft === undefined || p.sizeSqft === null ? "" : String(p.sizeSqft),
          };

          setProperty(normalized);
          console.log("Fetched property:", normalized);
        } else {
          setProperty(null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [idOrSlug]);

  // console.log(property);

  if (loading) {
    return <div className="text-center py-24">Loading...</div>;
  }

  if (!property) {
    return <div className="text-center py-24">Property not found</div>;
  }

  /* ================= SAFE DATA ================= */
  const images: string[] = property.propertyImages || [];

  const sliderSettings = {
    slidesToShow: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    nextArrow: (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer">
        <ChevronRight size={36} />
      </div>
    ),
    prevArrow: (
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer">
        <ChevronLeft size={36} />
      </div>
    ),
  };

  const getEmbedMapUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("maps.google.com")) return url;
    if (url.includes("google.com/maps")) return url;

    // fallback: open share links via embed wrapper
    return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("embed")) return url;

    const videoId = url.includes("youtu.be")
      ? url.split("youtu.be/")[1]?.split("?")[0]
      : url.split("v=")[1]?.split("&")[0];

    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };


  const title = property.metaTitle || `${property.propertyName} for ${property.listingType === 'buy' ? 'Sale' : 'Rent'} | Real Estate`;
  const description = property.metaDescription || property.propertyDetails?.substring(0, 160);
  const currentUrl = window.location.href;
  const primaryImage = property.propertyImages?.[0] || "https://yourdomain.com/default-property.jpg";

  // 4. Generate Real Estate Listing Schema
  const realEstateSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.propertyName,
    "description": property.metaDescription,
    "url": currentUrl,
    "image": property.propertyImages || [primaryImage],
    "datePosted": property.createdAt,
    "about": {
      "@type": "SingleFamilyResidence",
      "name": property.propertyName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": property.address,
        "addressLocality": property.subArea || ""
      },
      "numberOfRooms": property.bedroom || undefined,
      "numberOfBathroomsTotal": property.bathroom || undefined,
      "floorSize": property.sizeSqft ? {
        "@type": "QuantitativeValue",
        "value": property.sizeSqft,
        "unitCode": "FTK"
      } : undefined,
      "offers": {
        "@type": "Offer",
        "price": property.price?.replace(/[^0-9.]/g, ''),
        "priceCurrency": "AED", // Change to match your currency target (USD, INR, AED, etc)
        "businessFunction": property.listingType === 'buy' ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut"
      }
    }
  };

  // 5. Generate FAQ Schema Markup conditionally if values exist
  let faqSchema = null;
  if (property.faqs && property.faqs.length > 0) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": property.faqs.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  return (
    <>
      <Helmet>
        {/* Standard Metadata */}
        <title>{title}</title>
        <meta name="description" content={description} />
        {property.metaKeywords && <meta name="keywords" content={property.metaKeywords} />}
        <link rel="canonical" href={currentUrl} />

        {/* Open Graph Tags (Social Shares) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={primaryImage} />
        <meta property="og:url" content={currentUrl} />

        {/* Twitter Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={primaryImage} />

        {/* Real Estate Schema injection */}
        <script type="application/ld+json">
          {JSON.stringify(realEstateSchema)}
        </script>

        {/* Dynamic FAQ Schema injection */}
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>
      <div className="bg-white dark:bg-black text-black dark:text-white">
        <Navbar />

        {/* ================= IMAGES ================= */}
        {images.length > 0 && (
          <div className="mt-16">
            <Slider {...sliderSettings}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={`${img}`}
                  className="w-full h-[80vh] object-cover"
                  alt={property.propertyName}
                />
              ))}
            </Slider>
          </div>
        )}

        {/* ================= DETAILS ================= */}
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
          {/* Title */}
          <div className="flex flex-wrap justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold">{property.propertyName}</h1>
              <p className="flex items-center gap-1 text-gray-500 mt-2">
                <MapPin size={16} />
                {property.subArea}
              </p>
            </div>

            <div className="text-2xl font-bold text-[var(--primary-color)]">
              {property.price && property.price !== "NaN" && property.price !== "0" && property.price !== "null" ? (
                String(property.price).toLowerCase().includes("aed") || String(property.price).toLowerCase().includes("price")
                  ? property.price
                  : `AED ${property.price}`
              ) : (
                "Price on Application"
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {property.bedroom && property.bedroom !== "NaN" && property.bedroom !== "0" && property.bedroom !== "null" && (
              <div className="flex gap-2">
                <BedDouble /> {property.bedroom}
              </div>
            )}
            {property.bathroom && property.bathroom !== "NaN" && property.bathroom !== "0" && property.bathroom !== "null" && (
              <div className="flex gap-2">
                <Bath /> {property.bathroom} Baths
              </div>
            )}
            {property.sizeSqft && property.sizeSqft !== "NaN" && property.sizeSqft !== "0" && property.sizeSqft !== "null" && (
              <div className="flex gap-2">
                <Ruler /> {property.sizeSqft} sqft
              </div>
            )}
            <div className="flex gap-2">
              <Building /> {property.propertyType}
            </div>
          </div>

          {/* Description */}
          {property.propertyDetails && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Property Description</h2>
              <div
                ref={contentRef}
                className={'prose prose-invert prose-headings:text-white text-white  max-w-none w-full prose-img:w-full'}
                dangerouslySetInnerHTML={{ __html: property.propertyDetails }}
              />
            </div>
          )}


          {/* Highlights */}
          {property.highlights?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Highlights</h2>
              <ul className="grid md:grid-cols-3 gap-2">
                {property.highlights.map((h: string, i: number) => (
                  <li key={i}>• {h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Amenities */}
          {property.featuresAmenities?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {property.featuresAmenities.map((a: string, i: number) => (
                  <span key={i} className="border px-3 py-2 rounded text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby */}
          {property.nearby?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Nearby</h2>
              <ul className="grid md:grid-cols-2 gap-2">
                {property.nearby.map((n: string, i: number) => (
                  <li key={i}>• {n}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Extra Highlights */}
          {property.extraHighlights?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Extra Highlights</h2>
              <ul className="grid md:grid-cols-2 gap-2">
                {property.extraHighlights.map((eh: string, i: number) => (
                  <li key={i}>• {eh}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Extra Info */}
          {property.extraInfo?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Extra Information</h2>
              <div className=" gap-3">
                {property.extraInfo.map((ei: string, i: number) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded text-sm"
                  >
                    {ei}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* {property.propertyBrochure && (
          <a
            href={`${API_BASE_URL}${property.propertyBrochure}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded"
          >
            📄 Download Brochure
          </a>
        )} */}

          {/* ================= VIDEO TOUR ================= */}
          {property.videoLink && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Video Tour</h2>
              <div className="relative w-full aspect-video rounded overflow-hidden border">
                <iframe
                  src={getYoutubeEmbedUrl(property.videoLink)}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {(property.faqs && property.faqs.length>0) && (<div className="max-w-3xl mx-auto">
            <FAQAccordion
              items={property.faqs}
              allowMultiple={false}
            />
          </div>)}

          {/* ================= MAP ================= */}
          {property.googleMapUrl && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <div className="w-full h-[350px] rounded overflow-hidden border">
                <iframe
                  src={getEmbedMapUrl(property.googleMapUrl)}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </div>

        <NotifyMe />
        <Footer />
      </div>
    </>
  );
};

export default BuyDetails;
