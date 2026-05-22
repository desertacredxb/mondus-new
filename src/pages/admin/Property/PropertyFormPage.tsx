/**
 * PropertyFormPage.tsx
 *
 * Reusable Add / Edit Property page.
 *
 * Props:
 *   editing       – Property | null   (null → create mode)
 *   onSuccess     – () => void         (called after create/update; parent refreshes list & navigates away)
 *   onCancel      – () => void         (back / cancel)
 *
 * New fields added vs original:
 *   metaTitle, metaDescription, metaKeywords   (SEO)
 *   faqs: { question: string; answer: string }[]
 *   propertyDetails is now a rich-text editor (custom dark toolbar)
 *
 * Dependencies already expected in the project:
 *   axios, react-hot-toast
 *
 * Rich-text editor is built WITHOUT an external library so it works
 * out-of-the-box using the browser's native execCommand API.
 * It keeps the dark theme and handles pasting as plain text.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import JoditEditor from "jodit-react";

/* ─────────────────────────────────────────────────────────────────────────
 *  SHARED RICH-TEXT CSS
 *
 *  Root cause of heading styles not showing:
 *    • Tailwind preflight resets h1-h6 to font-size/weight: inherit
 *    • Jodit's iframe is a separate document — page CSS never reaches it
 *
 *  Solution:
 *    • Run Jodit in DIV mode (iframe: false) so content is in main document
 *    • Inject one <style id="rte-styles"> scoped to .jodit-wysiwyg (editor)
 *      AND .rte-content (frontend view) — same CSS class, same visual output
 *    • Export <RteView> for use in the view modal so editor ↔ frontend match
 * ───────────────────────────────────────────────────────────────────────── */
const RTE_CSS = `
  .rte-content h1, .jodit-wysiwyg h1 { font-size: 2em    !important; font-weight: 700 !important; margin: .4em 0  !important; color: #f9fafb !important; line-height: 1.2; }
  .rte-content h2, .jodit-wysiwyg h2 { font-size: 1.6em  !important; font-weight: 700 !important; margin: .4em 0  !important; color: #f9fafb !important; line-height: 1.2; }
  .rte-content h3, .jodit-wysiwyg h3 { font-size: 1.35em !important; font-weight: 600 !important; margin: .4em 0  !important; color: #f9fafb !important; line-height: 1.3; }
  .rte-content h4, .jodit-wysiwyg h4 { font-size: 1.15em !important; font-weight: 600 !important; margin: .35em 0 !important; color: #f9fafb !important; }
  .rte-content h5, .jodit-wysiwyg h5 { font-size: 1em    !important; font-weight: 600 !important; margin: .35em 0 !important; color: #f9fafb !important; }
  .rte-content h6, .jodit-wysiwyg h6 { font-size: .875em !important; font-weight: 600 !important; margin: .35em 0 !important; color: #d1d5db !important; }
  .rte-content p,  .jodit-wysiwyg p  { margin: .35em 0; }
  .rte-content ul, .jodit-wysiwyg ul { list-style: disc    !important; padding-left: 1.5em !important; margin: .35em 0; }
  .rte-content ol, .jodit-wysiwyg ol { list-style: decimal !important; padding-left: 1.5em !important; margin: .35em 0; }
  .rte-content li, .jodit-wysiwyg li { margin: .2em 0; }
  .rte-content a,  .jodit-wysiwyg a  { color: #818cf8; text-decoration: underline; }
  .rte-content strong, .jodit-wysiwyg strong { font-weight: 700 !important; }
  .rte-content em,     .jodit-wysiwyg em     { font-style: italic !important; }
  .rte-content blockquote, .jodit-wysiwyg blockquote {
    border-left: 3px solid #4f46e5; margin: .5em 0; padding-left: 1em; color: #9ca3af;
  }
  /* editor area itself */
  .jodit-wysiwyg {
    background: #1f2937 !important;
    color: #f3f4f6   !important;
    font-size: 15px  !important;
    line-height: 1.7 !important;
    min-height: 200px;
    padding: 12px !important;
  }
`;

function injectRteStyles() {
    if (document.getElementById("rte-styles")) return;
    const el = document.createElement("style");
    el.id = "rte-styles";
    el.textContent = RTE_CSS;
    document.head.appendChild(el);
}

/**
 * Use this in the view modal to render saved HTML with the same styles
 * as the editor — guaranteed visual parity.
 */
export const RteView = ({ html }: { html?: string | null }) => {
    useEffect(() => { injectRteStyles(); }, []);
    if (!html?.trim()) return <p className="text-sm text-gray-400">—</p>;
    return (
        <div
            className="rte-content text-gray-100 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

/* ─────────────────────────────────────────────── */
/*  Re-export types so parent can import from here */
/* ─────────────────────────────────────────────── */

export type ListingType = "buy" | "sell" | "rent" | "offPlan";

export interface Property {
    _id: string;
    propertyName: string;
    slug: string;
    listingType: ListingType;
    propertyType: string;
    price: string;
    bedroom: string;
    bathroom: string;
    sizeSqft: string;
    address: string;
    subArea: string;
    developerName: string;
    propertyDetails: string;
    highlights: string[];
    featuresAmenities: string[];
    nearby: string[];
    extraHighlights: string[];
    extraInfo: string[];
    videoLink?: string | null;
    googleMapUrl?: string | null;
    propertyImages: string[];
    propertyBrochure?: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    /* NEW */
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    faqs?: { question: string; answer: string }[];
}

interface PropertyFormFields {
    propertyName: string;
    slug: string;
    listingType: ListingType;
    propertyType: string;
    price: string;
    bedroom: string;
    bathroom: string;
    sizeSqft: string;
    address: string;
    subArea: string;
    developerName: string;
    propertyDetails: string; // stores HTML
    highlights: string;
    featuresAmenities: string;
    nearby: string;
    extraHighlights: string;
    extraInfo: string;
    videoLink: string;
    googleMapUrl: string;
    /* SEO */
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
}

interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

type ImageItem =
    | { id: string; type: "existing"; url: string }
    | { id: string; type: "new"; file: File; preview: string };

/* ─────────────────────────────────────────────── */
/*  Helpers                                        */
/* ─────────────────────────────────────────────── */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

function generateSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/--+/g, "-");
}

const toAssetUrl = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
};



/* ─────────────────────────────────────────────── */
/*  Section Heading helper                         */
/* ─────────────────────────────────────────────── */

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-widest whitespace-nowrap">
            {children}
        </h3>
        <div className="flex-1 h-px bg-gray-700" />
    </div>
);

/* ─────────────────────────────────────────────── */
/*  Main Component                                 */
/* ─────────────────────────────────────────────── */

interface Props {
    editing: Property | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const EMPTY_FORM: PropertyFormFields = {
    propertyName: "",
    slug: "",
    listingType: "buy",
    propertyType: "",
    price: "",
    bedroom: "",
    bathroom: "",
    sizeSqft: "",
    address: "",
    subArea: "",
    developerName: "",
    propertyDetails: "",
    highlights: "",
    featuresAmenities: "",
    nearby: "",
    extraHighlights: "",
    extraInfo: "",
    videoLink: "",
    googleMapUrl: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
};

const PropertyFormPage = ({ editing, onSuccess, onCancel }: Props) => {
    const [form, setForm] = useState<PropertyFormFields>(EMPTY_FORM);
    const [slugTouched, setSlugTouched] = useState(false);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [brochure, setBrochure] = useState<File | null>(null);
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    /* Inject shared RTE styles on mount */
    useEffect(() => { injectRteStyles(); }, []);

    /* ─────────────────────────────────────────────────────────────────
     *  Jodit config
     *
     *  Key decisions:
     *  • iframe: false  → editor runs in DIV mode inside the main document,
     *    so our injected <style id="rte-styles"> reaches .jodit-wysiwyg
     *    directly. No iframe cross-document CSS problems.
     *  • editorStyle   → sets background + text color on the wysiwyg div
     *    (belt-and-suspenders alongside the injected stylesheet)
     *  • useSearch/statusbar/chars off → cleaner dark UI
     * ────────────────────────────────────────────────────────────────── */
    const joditConfig = useMemo(
        () => ({
            theme: "dark",
            iframe: false,          // ← DIV mode: main document CSS applies
            height: 420,
            minHeight: 300,
            editorStyle: {          // applied directly to .jodit-wysiwyg element
                background: "#1f2937",
                color: "#f3f4f6",
                fontSize: "15px",
                lineHeight: "1.7",
                fontFamily: "inherit",
            },
            toolbarAdaptive: false,
            showCharsCounter: false,
            showWordsCounter: false,
            showXPathInStatusbar: false,
            useSearch: false,
        }),
        []
    );

    /* ── Populate form when editing ── */
    useEffect(() => {
        if (!editing) {
            setForm(EMPTY_FORM);
            setImages([]);
            setBrochure(null);
            setFaqs([]);
            setSlugTouched(false);
            return;
        }

        setSlugTouched(false);
        setForm({
            propertyName: editing.propertyName,
            slug: editing.slug,
            listingType: editing.listingType,
            propertyType: editing.propertyType,
            price: String(editing.price),
            bedroom: String(editing.bedroom),
            bathroom: String(editing.bathroom),
            sizeSqft: String(editing.sizeSqft),
            address: editing.address,
            subArea: editing.subArea || "",
            developerName: editing.developerName,
            propertyDetails: editing.propertyDetails || "",
            highlights: editing.highlights?.join(", ") || "",
            featuresAmenities: editing.featuresAmenities?.join(", ") || "",
            nearby: editing.nearby?.join(", ") || "",
            extraHighlights: editing.extraHighlights?.join(", ") || "",
            extraInfo: editing.extraInfo?.join("\n") || "",
            videoLink: editing.videoLink || "",
            googleMapUrl: editing.googleMapUrl || "",
            metaTitle: editing.metaTitle || "",
            metaDescription: editing.metaDescription || "",
            metaKeywords: editing.metaKeywords || "",
        });

        setImages(
            editing.propertyImages.map((url) => ({
                id: crypto.randomUUID(),
                type: "existing",
                url,
            }))
        );

        setFaqs(
            (editing.faqs ?? []).map((f) => ({
                id: crypto.randomUUID(),
                question: f.question,
                answer: f.answer,
            }))
        );
    }, [editing]);

    /* ── Image handlers ── */
    const handleImages = (files: FileList | null) => {
        if (!files) return;
        const newImgs: ImageItem[] = Array.from(files).map((file) => ({
            id: crypto.randomUUID(),
            type: "new",
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImgs]);
    };

    const removeImage = (id: string) =>
        setImages((prev) => prev.filter((img) => img.id !== id));

    const handleDragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const list = [...images];
        const dragged = list.splice(dragItem.current, 1)[0];
        list.splice(dragOverItem.current, 0, dragged);
        dragItem.current = null;
        dragOverItem.current = null;
        setImages(list);
    };

    /* ── FAQ handlers ── */
    const addFaq = () =>
        setFaqs((prev) => [
            ...prev,
            { id: crypto.randomUUID(), question: "", answer: "" },
        ]);

    const removeFaq = (id: string) =>
        setFaqs((prev) => prev.filter((f) => f.id !== id));

    const updateFaq = (id: string, field: "question" | "answer", val: string) =>
        setFaqs((prev) =>
            prev.map((f) => (f.id === id ? { ...f, [field]: val } : f))
        );

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (images.length === 0) {
            toast.error("At least one image is required");
            return;
        }
        if (
            !form.propertyName ||
            !form.slug ||
            !form.propertyType ||
            !form.address ||
            !form.propertyDetails ||
            !form.price
        ) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setSubmitting(true);
            const fd = new FormData();

            fd.append("propertyName", form.propertyName);
            fd.append("slug", form.slug);
            fd.append("listingType", form.listingType);
            fd.append("propertyType", form.propertyType);
            fd.append("address", form.address);
            fd.append("subArea", form.subArea);
            fd.append("developerName", form.developerName);
            fd.append("propertyDetails", form.propertyDetails);

            fd.append("price", form.price.trim());
            fd.append("bedroom", form.bedroom.trim());
            fd.append("bathroom", form.bathroom.trim());
            fd.append("sizeSqft", form.sizeSqft.trim());

            if (form.highlights) fd.append("highlights", form.highlights);
            if (form.featuresAmenities)
                fd.append("featuresAmenities", form.featuresAmenities);
            if (form.nearby) fd.append("nearby", form.nearby);
            if (form.extraHighlights)
                fd.append("extraHighlights", form.extraHighlights);
            if (form.extraInfo) fd.append("extraInfo", form.extraInfo);
            if (form.videoLink) fd.append("videoLink", form.videoLink);
            if (form.googleMapUrl) fd.append("googleMapUrl", form.googleMapUrl);

            /* SEO */
            if (form.metaTitle) fd.append("metaTitle", form.metaTitle);
            if (form.metaDescription)
                fd.append("metaDescription", form.metaDescription);
            if (form.metaKeywords) fd.append("metaKeywords", form.metaKeywords);

            /* FAQs as JSON string */
            const cleanFaqs = faqs
                .filter((f) => f.question.trim() && f.answer.trim())
                .map(({ question, answer }) => ({ question, answer }));
            if (cleanFaqs.length)
                fd.append("faqs", JSON.stringify(cleanFaqs));

            /* Images – only new ones; existing are kept on server */
            images.forEach((img) => {
                if (img.type === "new") fd.append("propertyImages", img.file);
            });

            /* Brochure */
            if (brochure) fd.append("propertyBrochure", brochure);
            // for (const [key, value] of fd.entries()) {
            //     console.log(key, value);
            // }
            if (editing) {
                await axios.put(`${API_BASE_URL}/api/property/${editing._id}`, fd);
                toast.success("Property updated successfully");
            } else {
                await axios.post(`${API_BASE_URL}/api/property`, fd);
                toast.success("Property created successfully");
            }

            onSuccess();
        } catch (err: any) {
            console.error(err.response?.data);
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Field helper ── */
    const field = (
        key: keyof PropertyFormFields,
        placeholder: string,
        type = "text"
    ) => (
        <input
            type={type}
            placeholder={placeholder}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors w-full"
            value={form[key] as string}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        />
    );

    /* ─────────────────────────── */
    /*  RENDER                     */
    /* ─────────────────────────── */

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Page header */}
            <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Back"
                    >
                        ← Back
                    </button>
                    <span className="text-gray-600">/</span>
                    <h1 className="text-lg font-semibold">
                        {editing ? "Edit Property" : "Add New Property"}
                    </h1>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-700 rounded text-sm hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-2 rounded text-sm font-medium transition-colors"
                    >
                        {submitting
                            ? "Saving…"
                            : editing
                                ? "Update Property"
                                : "Create Property"}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
                {/* ── 1. Basic Info ── */}
                <section>
                    <SectionHeading>Basic Info</SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Property Name */}
                        <input
                            placeholder="Property Name *"
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            value={form.propertyName}
                            onChange={(e) => {
                                const value = e.target.value;
                                setForm((prev) => ({
                                    ...prev,
                                    propertyName: value,
                                    slug: slugTouched ? prev.slug : generateSlug(value),
                                }));
                            }}
                        />

                        {/* Slug */}
                        <input
                            placeholder="Slug (auto-generated) *"
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            value={form.slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setForm((prev) => ({
                                    ...prev,
                                    slug: generateSlug(e.target.value),
                                }));
                            }}
                        />

                        {/* Property Type */}
                        <select
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
                            value={form.propertyType}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, propertyType: e.target.value }))
                            }
                        >
                            <option value="">Select Property Type *</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Builder Floor">Builder Floor</option>
                            <option value="Villa">Villa</option>
                            <option value="Plot">Plot</option>
                            <option value="FarmHouse">FarmHouse</option>
                        </select>

                        {/* Listing Type */}
                        <select
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
                            value={form.listingType}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    listingType: e.target.value as ListingType,
                                }))
                            }
                        >
                            <option value="buy">Buy</option>
                            <option value="rent">Rent</option>
                        </select>

                        {field("price", "Price *")}
                        {field("bedroom", "Bedrooms")}
                        {field("bathroom", "Bathrooms")}
                        {field("sizeSqft", "Size (sqft)")}
                        {field("subArea", "Area / Sub Area")}
                        {field("address", "Address *")}
                        {field("developerName", "Developer Name")}
                    </div>
                </section>

                {/* ── 2. Property Description (Rich Text) ── */}
                <section>
                    <SectionHeading>Property Description *</SectionHeading>
                    <div className="rounded-lg overflow-hidden border border-gray-700">
                        <JoditEditor
                            value={form.propertyDetails}
                            config={joditConfig}
                            onBlur={(html) =>
                                setForm((prev) => ({ ...prev, propertyDetails: html }))
                            }
                        />
                    </div>
                </section>

                {/* ── 3. Lists / Tags ── */}
                <section>
                    <SectionHeading>Highlights & Features</SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Highlights <span className="text-gray-600">(comma separated)</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Sea View, Private Pool, Gym"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                                value={form.highlights}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, highlights: e.target.value }))
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Features & Amenities{" "}
                                <span className="text-gray-600">(comma separated)</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Parking, 24/7 Security, Rooftop"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                                value={form.featuresAmenities}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        featuresAmenities: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Nearby <span className="text-gray-600">(comma separated)</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Dubai Mall, Metro Station"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                                value={form.nearby}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, nearby: e.target.value }))
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Extra Highlights{" "}
                                <span className="text-gray-600">(comma separated)</span>
                            </label>
                            <textarea
                                rows={3}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                                value={form.extraHighlights}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        extraHighlights: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">
                                Extra Info <span className="text-gray-600">(one item per line)</span>
                            </label>
                            <textarea
                                rows={3}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                                value={form.extraInfo}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, extraInfo: e.target.value }))
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* ── 4. Links ── */}
                <section>
                    <SectionHeading>Media Links</SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {field("videoLink", "Video / Reel Link")}
                        {field("googleMapUrl", "Google Map URL")}
                    </div>
                </section>

                {/* ── 5. Images ── */}
                <section>
                    <SectionHeading>Property Images</SectionHeading>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="cursor-pointer text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                        onChange={(e) => handleImages(e.target.files)}
                    />

                    {images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                            {images.map((img, index) => (
                                <div
                                    key={img.id}
                                    draggable
                                    onDragStart={() => (dragItem.current = index)}
                                    onDragEnter={() => (dragOverItem.current = index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="relative group border border-gray-700 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                                >
                                    <img
                                        src={img.type === "existing" ? toAssetUrl(img.url) : img.preview}
                                        className="w-full h-24 object-cover"
                                        alt=""
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(img.id)}
                                        className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                    {index === 0 && (
                                        <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                                            Cover
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        Drag to reorder · Click ✕ to remove · First image = cover
                    </p>
                </section>

                {/* ── 6. Brochure ── */}
                <section>
                    <SectionHeading>Property Brochure</SectionHeading>

                    <input
                        type="file"
                        accept="application/pdf"
                        className="block text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) {
                                toast.error("PDF must be less than 10MB");
                                return;
                            }
                            setBrochure(file);
                        }}
                    />

                    {brochure && (
                        <div className="mt-2 inline-flex items-center gap-3 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
                            <span className="text-gray-300">📄 {brochure.name}</span>
                            <button
                                type="button"
                                onClick={() => setBrochure(null)}
                                className="text-red-400 hover:text-red-300 text-xs"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {editing?.propertyBrochure && !brochure && (
                        <p className="text-xs text-gray-500 mt-2">
                            Current: {editing.propertyBrochure} (upload new to replace)
                        </p>
                    )}
                </section>

                {/* ── 7. FAQ ── */}
                <section>
                    <SectionHeading>FAQ Section</SectionHeading>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={faq.id}
                                className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        FAQ #{idx + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(faq.id)}
                                        className="text-red-400 hover:text-red-300 text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <input
                                    placeholder="Question"
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    value={faq.question}
                                    onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                                />

                                <textarea
                                    rows={3}
                                    placeholder="Answer"
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                                    value={faq.answer}
                                    onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                                />
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addFaq}
                            className="flex items-center gap-2 border border-dashed border-gray-600 hover:border-indigo-500 text-gray-400 hover:text-indigo-400 rounded-lg px-4 py-3 text-sm transition-colors w-full justify-center"
                        >
                            + Add FAQ
                        </button>
                    </div>
                </section>

                {/* ── 8. SEO / Meta ── */}
                <section>
                    <SectionHeading>SEO / Meta</SectionHeading>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Meta Title{" "}
                                <span className="text-gray-600">
                                    ({form.metaTitle.length}/60)
                                </span>
                            </label>
                            <input
                                placeholder="Meta Title"
                                maxLength={60}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                value={form.metaTitle}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Meta Description{" "}
                                <span className="text-gray-600">
                                    ({form.metaDescription.length}/160)
                                </span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Meta Description"
                                maxLength={160}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                                value={form.metaDescription}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        metaDescription: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Meta Keywords{" "}
                                <span className="text-gray-600">(comma separated)</span>
                            </label>
                            <input
                                placeholder="e.g. luxury apartment, dubai marina, sea view"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                value={form.metaKeywords}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, metaKeywords: e.target.value }))
                                }
                            />
                        </div>

                        {/* Live preview */}
                        {(form.metaTitle || form.metaDescription) && (
                            <div className="mt-2 border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                                    Search Preview
                                </p>
                                <p className="text-indigo-400 text-sm font-medium truncate">
                                    {form.metaTitle || "Page Title"}
                                </p>
                                <p className="text-green-500 text-xs truncate">
                                    {API_BASE_URL || "https://yoursite.com"}/
                                    {form.slug || "property-slug"}
                                </p>
                                <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                                    {form.metaDescription || "Meta description will appear here…"}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Sticky bottom CTA (mobile convenience) ── */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 pb-8">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-700 rounded text-sm hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-6 py-2 rounded text-sm font-medium transition-colors"
                    >
                        {submitting
                            ? "Saving…"
                            : editing
                                ? "Update Property"
                                : "Create Property"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyFormPage;