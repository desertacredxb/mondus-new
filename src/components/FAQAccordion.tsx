import { useState } from "react";

interface FAQItem {
  _id?: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items?: FAQItem[];
  allowMultiple?: boolean;
  className?: string;
  activeColor?: string;
}

export function FAQAccordion({
  items = [],
  allowMultiple = false,
  className = "",
  activeColor = "text-[#C49A6C]",
}: FAQAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      if (expandedIds.includes(id)) {
        setExpandedIds(expandedIds.filter((item) => item !== id));
      } else {
        setExpandedIds([...expandedIds, id]);
      }
    } else {
      setExpandedIds(expandedIds.includes(id) ? [] : [id]);
    }
  };

  if (!items.length) {
    return (
      <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
        No FAQ items provided.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
        <div>
            <p className="texxt-xl sm:text-2xl font-medium text-center my-6">
                Frequently Asked Questions
            </p>
        </div>
      {items.map((item, index) => {
        const id = item._id ?? String(index);
        const isExpanded = expandedIds.includes(id);

        return (
          <div
            key={id}
            className="border-b border-neutral-800 pb-4 transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => toggleItem(id)}
              className="w-full flex justify-between items-start py-3 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C49A6C] rounded-sm"
              aria-expanded={isExpanded}
            >
              <h3
                className={`text-base md:text-lg font-medium transition-colors duration-300 text-[#C29579] capitalize ${
                  isExpanded
                    ? activeColor
                    : "group-hover:text-neutral-300 "
                }`}
              >
                {index+1}. {item.question}
              </h3>

              <span
                className={`ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 transition-all duration-300 group-hover:border-neutral-700 ${
                  isExpanded
                    ? "border-[#C49A6C]/40 bg-neutral-900 rotate-180"
                    : ""
                }`}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    isExpanded ? activeColor : "text-neutral-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="text-neutral-400 text-sm md:text-base leading-relaxed pt-2 pb-3 pr-8">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}