import React, { useState } from "react";
import CatalogCard from "./CatalogCard";
import CatalogPreviewModal from "./CatalogPreviewModal";
import Navbar from "./Nav";
import Footer from "./Footer";
import { catalogImgData } from "../data/catalogImgData";

const catalogItems = [
  {
    title: "Best Emaar Offers",
    subtitle: "TOP 10 PROJECTS FROM DUBAI LEADING DEVELOPER",
    cover: catalogImgData[0].cover,
    pages: catalogImgData[0].pages,
  },
  {
    title: "Branded Homes",
    subtitle:
      "CURATED PROJECTS IN DUBAI MADE IN COLLABORATION WITH FAMOUS BRANDS",
    cover: catalogImgData[1].cover,
    pages: catalogImgData[1].pages,
  },
  {
    title: "Branded Homes",
    subtitle:
      "CURATED PROJECTS IN DUBAI MADE IN COLLABORATION WITH FAMOUS BRANDS",
    cover: catalogImgData[2].cover,
    pages: catalogImgData[2].pages,
  },
  {
    title: "Branded Homes",
    subtitle:
      "CURATED PROJECTS IN DUBAI MADE IN COLLABORATION WITH FAMOUS BRANDS",
    cover: catalogImgData[3].cover,
    pages: catalogImgData[3].pages,
  },
  {
    title: "Branded Homes",
    subtitle:
      "CURATED PROJECTS IN DUBAI MADE IN COLLABORATION WITH FAMOUS BRANDS",
    cover: catalogImgData[4].cover,
    pages: catalogImgData[4].pages,
  },
  {
    title: "Branded Homes",
    subtitle:
      "CURATED PROJECTS IN DUBAI MADE IN COLLABORATION WITH FAMOUS BRANDS",
    cover: catalogImgData[5].cover,
    pages: catalogImgData[5].pages,
  },
];

const CatalogSection: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activePages, setActivePages] = useState<string[]>([]);

  const handlePreview = (pages: string[]) => {
    setActivePages(pages);
    setPreviewOpen(true);
  };

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white font-raleway font-light dark:font-thin">
      <Navbar />
      <div className="w-[90%]  mx-auto  p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-28">
        {catalogItems.map((item, idx) => (
          <CatalogCard
            key={idx}
            title={item.title}
            subtitle={item.subtitle}
            imageUrl={item.cover}
            onPreview={() => handlePreview(item.pages)}
            images={item.pages}
          />
        ))}
        <CatalogPreviewModal
          isOpen={previewOpen}
          onRequestClose={() => setPreviewOpen(false)}
          images={activePages}
        />
      </div>
      <Footer />
    </div>
  );
};

export default CatalogSection;
