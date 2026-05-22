/**
 * PropertyManagement.tsx
 *
 * List view – now delegates add/edit to <PropertyFormPage />.
 * All original features (view modal, delete confirm, status toggle,
 * pagination, optimistic updates) are preserved.
 */

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import type { Property } from "./Property/PropertyFormPage";
import PropertyFormPage from "./Property/PropertyFormPage";

/* ─────────────────────────────────── */
/*  Config                             */
/* ─────────────────────────────────── */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const PAGE_LIMIT = 10;

type ConfirmAction = "delete" | "status" | null;

/* ─────────────────────────────────── */
/*  Helpers (view modal sub-components)*/
/* ─────────────────────────────────── */

const toAssetUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm text-gray-100 mt-1 break-words">
      {value?.trim() ? value : "—"}
    </p>
  </div>
);

const TagList = ({ title, items }: { title: string; items?: string[] }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
    <p className="text-xs text-gray-400 mb-2">{title}</p>
    {items?.length ? (
      <div className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span
            key={t + i}
            className="text-xs bg-gray-900/60 border border-gray-700 px-2 py-1 rounded"
          >
            {t}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-200">—</p>
    )}
  </div>
);

const LinkRow = ({ title, url }: { title: string; url: string }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
    <p className="text-xs text-gray-400 mb-2">{title}</p>
    {url?.trim() ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-indigo-300 hover:text-indigo-200 break-all underline"
      >
        {url}
      </a>
    ) : (
      <p className="text-sm text-gray-200">—</p>
    )}
  </div>
);

/* ─────────────────────────────────── */
/*  Main Component                     */
/* ─────────────────────────────────── */

const PropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  /* Form page visibility */
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  /* Pagination */
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(properties.length / PAGE_LIMIT);

  /* Confirm dialog */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  /* View modal */
  const [viewOpen, setViewOpen] = useState(false);
  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  /* ── Fetch ── */
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/property`);
      setProperties(res.data.data);
    } catch {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  /* ── Delete (optimistic) ── */
  const deleteProperty = async (id: string) => {
    const prev = properties;
    setProperties((p) => p.filter((x) => x._id !== id));
    try {
      await axios.delete(`${API_BASE_URL}/api/property/${id}`);
      toast.success("Property deleted");
    } catch {
      toast.error("Delete failed");
      setProperties(prev);
    }
  };

  /* ── Status toggle ── */
  const toggleStatus = async (p: Property) => {
    setProperties((prev) =>
      prev.map((x) => (x._id === p._id ? { ...x, status: !x.status } : x))
    );
    try {
      await axios.patch(`${API_BASE_URL}/api/property/${p._id}/status`, {
        status: !p.status,
      });
    } catch {
      toast.error("Status update failed");
      fetchProperties();
    }
  };

  /* ── Confirm helpers ── */
  const openDeleteConfirm = (property: Property) => {
    setSelectedProperty(property);
    setConfirmAction("delete");
    setConfirmOpen(true);
  };

  const openStatusConfirm = (property: Property) => {
    setSelectedProperty(property);
    setConfirmAction("status");
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelectedProperty(null);
    setConfirmAction(null);
  };

  const handleConfirm = async () => {
    if (!selectedProperty || !confirmAction) return;
    if (confirmAction === "delete") await deleteProperty(selectedProperty._id);
    if (confirmAction === "status") await toggleStatus(selectedProperty);
    closeConfirm();
  };

  /* ── View modal ── */
  const openView = async (p: Property) => {
    setViewProperty(p);
    setViewOpen(true);
    try {
      setViewLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/property/${p._id}`);
      const fresh = res.data?.data;
      if (fresh) setViewProperty(fresh);
    } catch {
      /* keep optimistic data */
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    setViewOpen(false);
    setViewProperty(null);
    setViewLoading(false);
  };

  /* ── Form page helpers ── */
  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditing(null);
    fetchProperties();
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditing(null);
  };

  /* ── Paginated data ── */
  const paginated = properties.slice(
    (page - 1) * PAGE_LIMIT,
    page * PAGE_LIMIT
  );

  /* ─────────────────────────────────── */
  /*  If form is open, render that page  */
  /* ─────────────────────────────────── */

  if (formOpen) {
    return (
      <PropertyFormPage
        editing={editing}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  /* ─────────────────────────────────── */
  /*  List view                          */
  /* ─────────────────────────────────── */

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Property Management</h1>
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition-colors"
        >
          + Add new property
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left">Property Name</th>
              <th className="p-3 text-left">Listing Type</th>
              <th className="p-3">Property Type</th>
              <th className="p-3">No. of beds</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No properties found.
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr key={p._id} className="border-t border-gray-700 hover:bg-gray-800/40 transition-colors">
                  <td className="p-3 font-medium">{p.propertyName}</td>
                  <td className="p-3 capitalize">{p.listingType}</td>
                  <td className="p-3 capitalize text-center">{p.propertyType}</td>
                  <td className="p-3 text-center">{p.bedroom || "—"}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        p.status ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {p.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openView(p)}
                        className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openStatusConfirm(p)}
                        className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs transition-colors"
                      >
                        Status
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(p)}
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded transition-colors ${
                page === i + 1 ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════ */}
      {/*  Confirm Modal                      */}
      {/* ═══════════════════════════════════ */}
      {confirmOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-lg font-semibold">
                {confirmAction === "delete"
                  ? "Delete Property"
                  : selectedProperty.status
                  ? "Deactivate Property"
                  : "Activate Property"}
              </h3>
            </div>

            <div className="p-5 text-sm text-gray-300">
              {confirmAction === "delete" ? (
                <p>
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-white">
                    {selectedProperty.propertyName}
                  </span>
                  ? This action cannot be undone.
                </p>
              ) : (
                <p>
                  Are you sure you want to{" "}
                  <span className="font-semibold text-white">
                    {selectedProperty.status ? "deactivate" : "activate"}
                  </span>{" "}
                  this property?
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-800">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded transition-colors ${
                  confirmAction === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════ */}
      {/*  View Modal                         */}
      {/* ═══════════════════════════════════ */}
      {viewOpen && viewProperty && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-5xl border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-800 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  {viewProperty.propertyName || "Property Details"}
                </h2>
                <p className="text-xs text-gray-400 mt-1 break-all">
                  ID: {viewProperty._id} · Slug: {viewProperty.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {viewLoading && (
                  <span className="text-xs text-gray-400">Refreshing…</span>
                )}
                <button
                  onClick={closeView}
                  className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-6">
              {/* Status + quick stats */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    viewProperty.status ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {viewProperty.status ? "Active" : "Inactive"}
                </span>
                <span className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1">
                  {viewProperty.listingType?.toUpperCase()}
                </span>
                <span className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1">
                  {viewProperty.propertyType}
                </span>
                <span className="text-xs text-gray-300">
                  {viewProperty.price &&
                  viewProperty.price !== "NaN" &&
                  viewProperty.price !== "0"
                    ? String(viewProperty.price).toLowerCase().includes("aed") ||
                      String(viewProperty.price).toLowerCase().includes("price")
                      ? viewProperty.price
                      : `AED ${viewProperty.price}`
                    : "Price on Application"}
                </span>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-sm font-semibold text-gray-200 mb-3">
                  Property Images ({viewProperty.propertyImages?.length || 0})
                </h3>
                {viewProperty.propertyImages?.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {viewProperty.propertyImages.map((imgUrl:any, idx:any) => (
                      <a
                        key={imgUrl + idx}
                        href={toAssetUrl(imgUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg overflow-hidden border border-gray-800 bg-gray-800"
                      >
                        <img
                          src={toAssetUrl(imgUrl)}
                          alt={`Property image ${idx + 1}`}
                          className="w-full h-28 sm:h-32 md:h-36 object-cover"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded p-3">
                    No images attached.
                  </div>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Address" value={viewProperty.address} />
                <InfoRow label="Sub Area" value={viewProperty.subArea} />
                <InfoRow label="Developer" value={viewProperty.developerName} />
                <InfoRow label="Bedrooms" value={String(viewProperty.bedroom)} />
                <InfoRow label="Bathrooms" value={String(viewProperty.bathroom)} />
                <InfoRow label="Size (sqft)" value={String(viewProperty.sizeSqft)} />
                <InfoRow
                  label="Created"
                  value={new Date(viewProperty.createdAt).toLocaleString()}
                />
                <InfoRow
                  label="Updated"
                  value={new Date(viewProperty.updatedAt).toLocaleString()}
                />
              </div>

              {/* Property Details (rendered HTML) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-200 mb-2">
                  Property Details
                </h3>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
                  {viewProperty.propertyDetails ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: viewProperty.propertyDetails,
                      }}
                    />
                  ) : (
                    <p className="text-gray-400">—</p>
                  )}
                </div>
              </div>

              {/* Arrays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TagList title="Highlights" items={viewProperty.highlights} />
                <TagList
                  title="Features & Amenities"
                  items={viewProperty.featuresAmenities}
                />
                <TagList title="Nearby" items={viewProperty.nearby} />
                <TagList
                  title="Extra Highlights"
                  items={viewProperty.extraHighlights}
                />
                <TagList title="Extra Info" items={viewProperty.extraInfo} />
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LinkRow title="Video Link" url={viewProperty.videoLink || ""} />
                <LinkRow
                  title="Google Map URL"
                  url={viewProperty.googleMapUrl || ""}
                />
              </div>

              {/* FAQs */}
              {viewProperty.faqs && viewProperty.faqs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-200 mb-3">
                    FAQs ({viewProperty.faqs.length})
                  </h3>
                  <div className="space-y-3">
                    {viewProperty.faqs.map((faq:any, i:any) => (
                      <div
                        key={i}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                      >
                        <p className="text-sm font-medium text-gray-100">
                          {faq.question}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO / Meta */}
              {(viewProperty.metaTitle ||
                viewProperty.metaDescription ||
                viewProperty.metaKeywords) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-200 mb-3">
                    SEO / Meta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Meta Title" value={viewProperty.metaTitle} />
                    <InfoRow
                      label="Meta Keywords"
                      value={viewProperty.metaKeywords}
                    />
                    <div className="md:col-span-2">
                      <InfoRow
                        label="Meta Description"
                        value={viewProperty.metaDescription}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Brochure */}
              <div>
                <h3 className="text-sm font-semibold text-gray-200 mb-2">
                  Brochure (PDF)
                </h3>
                {viewProperty.propertyBrochure ? (
                  <a
                    href={toAssetUrl(viewProperty.propertyBrochure)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm hover:bg-gray-700 transition-colors"
                  >
                    📄 Open brochure
                    <span className="text-xs text-gray-400 break-all">
                      {viewProperty.propertyBrochure}
                    </span>
                  </a>
                ) : (
                  <div className="text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded p-3">
                    No brochure uploaded.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-800 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => {
                  closeView();
                  openEdit(viewProperty);
                }}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => openStatusConfirm(viewProperty)}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm transition-colors"
              >
                Toggle Status
              </button>
              <button
                onClick={() => openDeleteConfirm(viewProperty)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
              >
                Delete
              </button>
              <button
                onClick={closeView}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;