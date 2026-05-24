import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit3, Plus, Trash2 } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import SearchInput from "../../components/common/SearchInput";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toastError, toastSuccess } from "../../utils/toast";
import { apiCreateFaq, apiDeleteFaq, apiGetAdminFaqs, apiUpdateFaq } from "../../api/faq";

const defaultValues = {
  category: "",
  question_en: "",
  answer_en: "",
  question_am: "",
  answer_am: "",
  order_priority: 1,
  is_active: true,
};

export default function FaqManagement() {
  const [faqItems, setFaqItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [mutating, setMutating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState,
  } = useForm({
    defaultValues,
  });

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGetAdminFaqs(search);
      setFaqItems(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchFaqs, 250);
    return () => clearTimeout(timer);
  }, [fetchFaqs]);

  useEffect(() => {
    if (!modalOpen) return;

    if (editing) {
      reset({
        category: editing.category || "",
        question_en: editing.question_en || "",
        answer_en: editing.answer_en || "",
        question_am: editing.question_am || "",
        answer_am: editing.answer_am || "",
        order_priority: editing.order_priority ?? 1,
        is_active: editing.is_active !== false,
      });
      return;
    }

    reset(defaultValues);
  }, [editing, modalOpen, reset]);

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (faq) => {
    setEditing(faq);
    setModalOpen(true);
  };

  const onAskDelete = (faq) => {
    setDeleting(faq);
    setConfirmOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    setMutating(true);
    try {
      if (editing) {
        await apiUpdateFaq(editing.id, values);
        toastSuccess("FAQ updated successfully");
      } else {
        await apiCreateFaq(values);
        toastSuccess("FAQ added successfully");
      }
      setModalOpen(false);
      setEditing(null);
      await fetchFaqs();
    } catch (err) {
      toastError(err.message || "Failed to save FAQ");
    } finally {
      setMutating(false);
    }
  });

  const onConfirmDelete = async () => {
    if (!deleting) return;
    setMutating(true);
    try {
      await apiDeleteFaq(deleting.id);
      toastSuccess("FAQ deleted successfully");
      setConfirmOpen(false);
      setDeleting(null);
      await fetchFaqs();
    } catch (err) {
      toastError(err.message || "Failed to delete FAQ");
    } finally {
      setMutating(false);
    }
  };

  const columns = [
    { key: "category", header: "Category" },
    {
      key: "question_en",
      header: "Question (EN)",
      render: (faq) => <div className="max-w-xl whitespace-normal text-sm text-gray-900 dark:text-gray-100">{faq.question_en}</div>,
    },
    {
      key: "answer_en",
      header: "Answer (EN)",
      render: (faq) => <div className="max-w-xl whitespace-normal text-sm text-gray-900 dark:text-gray-100">{faq.answer_en}</div>,
    },
    {
      key: "is_active",
      header: "Status",
      render: (faq) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${faq.is_active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
          {faq.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (faq) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(faq)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Edit FAQ"
          >
            <Edit3 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onAskDelete(faq)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 hover:text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900"
            aria-label="Delete FAQ"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">FAQ Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage site FAQs, search by keyword, and update content from the admin dashboard.</p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" /> Add FAQ
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        <SearchInput
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder="Search FAQs by question, answer, or category..."
          disabled={loading}
        />
        <div className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
          {loading ? (
            <div className="inline-flex items-center gap-2">
              <LoadingSpinner size={16} className="border-gray-400 dark:border-gray-300" />
              Loading FAQs
            </div>
          ) : faqItems.length ? (
            `${faqItems.length} FAQs found`
          ) : null}
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <DataTable
        columns={columns}
        rows={faqItems}
        rowKey={(faq) => faq.id}
        loading={loading}
        emptyMessage={search ? "No FAQs match your search" : "No FAQs have been created yet"}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Edit FAQ" : "Create FAQ"}
        onClose={mutating ? undefined : () => { setModalOpen(false); setEditing(null); }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { setModalOpen(false); setEditing(null); }}
              disabled={mutating}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="faq-form"
              disabled={mutating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {mutating ? <LoadingSpinner size={16} className="border-white" /> : null}
              Save
            </button>
          </div>
        }
      >
        <form id="faq-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Category</label>
              <input
                type="text"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${formState.errors.category ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                {...register("category", { required: "Category is required" })}
              />
              {formState.errors.category ? <p className="text-xs text-red-500">{formState.errors.category.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Order Priority</label>
              <input
                type="number"
                min={1}
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${formState.errors.order_priority ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
                {...register("order_priority", { valueAsNumber: true, min: 1 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Question (English)</label>
            <textarea
              rows={3}
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${formState.errors.question_en ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
              {...register("question_en", { required: "Question in English is required" })}
            />
            {formState.errors.question_en ? <p className="text-xs text-red-500">{formState.errors.question_en.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Answer (English)</label>
            <textarea
              rows={3}
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${formState.errors.answer_en ? "border-red-400" : "border-gray-300 dark:border-gray-600"}`}
              {...register("answer_en", { required: "Answer in English is required" })}
            />
            {formState.errors.answer_en ? <p className="text-xs text-red-500">{formState.errors.answer_en.message}</p> : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Question (Amharic)</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                {...register("question_am")}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Answer (Amharic)</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                {...register("answer_am")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input
                id="faq-active"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register("is_active")}
              />
              <label htmlFor="faq-active" className="text-sm font-medium text-gray-700 dark:text-gray-200">Active</label>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete FAQ"
        message={`Are you sure you want to delete this FAQ?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={mutating}
        onConfirm={onConfirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
