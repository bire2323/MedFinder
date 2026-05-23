import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAdminRegions } from "../../hooks/useLocationData";
import locationApi from "../../api/locationApi";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import SearchInput from "../../components/common/SearchInput";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Edit3, Trash2 } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";

export default function RegionManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const perPage = 15;

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [mutating, setMutating] = useState(false);

  const { regions, pagination, loading, error, refetch } = useAdminRegions(page, perPage, search);

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: { name_en: "", name_am: "", code: "", is_active: true },
  });

  useEffect(() => {
    if (!modalOpen) return;
    if (editing) {
      reset({
        name_en: editing.name_en || "",
        name_am: editing.name_am || "",
        code: editing.code || "",
        is_active: editing.is_active !== false,
      });
      return;
    }
    reset({ name_en: "", name_am: "", code: "", is_active: true });
  }, [editing, modalOpen, reset]);

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (region) => {
    setEditing(region);
    setModalOpen(true);
  };

  const onAskDelete = (region) => {
    setDeleting(region);
    setConfirmOpen(true);
  };

  const onToggleStatus = async (region) => {
    setMutating(true);
    try {
      await locationApi.admin.toggleRegionStatus(region.id);
      toastSuccess("Region status updated");
      refetch();
    } catch (e) {
      toastError(e.message || "Failed to update status");
    } finally {
      setMutating(false);
    }
  };

  const columns = [
    { key: "name_en", header: "English Name" },
    { key: "name_am", header: "Amharic Name" },
    { key: "code", header: "Code", render: (r) => r.code || "—" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <button
          type="button"
          onClick={() => onToggleStatus(r)}
          disabled={mutating}
          className={`rounded-full px-3 py-1 text-xs font-bold ${r.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
            } disabled:opacity-60`}
        >
          {r.is_active ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(r)}
            aria-label="Edit region"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Edit3 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onAskDelete(r)}
            aria-label="Delete region"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 hover:text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  const onSubmit = handleSubmit(async (values) => {
    setMutating(true);
    try {
      if (editing) {
        await locationApi.admin.updateRegion(editing.id, values);
        toastSuccess("Region updated");
      } else {
        await locationApi.admin.createRegion(values);
        toastSuccess("Region created");
      }
      setModalOpen(false);
      setEditing(null);
      refetch();
    } catch (e) {
      toastError(e.message || "Failed to save region");
    } finally {
      setMutating(false);
    }
  });

  const onConfirmDelete = async () => {
    if (!deleting) return;
    setMutating(true);
    try {
      await locationApi.admin.deleteRegion(deleting.id);
      toastSuccess("Region deleted");
      setConfirmOpen(false);
      setDeleting(null);
      refetch();
    } catch (e) {
      toastError(e.message || "Failed to delete region");
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Region Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Create and maintain normalized regions.</p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Add Region
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search regions..."
        />
        <div className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
          {loading ? (
            <div className="inline-flex items-center gap-2">
              <LoadingSpinner size={16} className="border-gray-400 dark:border-gray-300" />
              Loading
            </div>
          ) : pagination.total ? (
            `${pagination.total} total`
          ) : null}
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <DataTable
        columns={columns}
        rows={regions}
        rowKey={(r) => r.id}
        loading={loading}
        emptyMessage={search ? "No regions match your search" : "No regions yet"}
        page={page}
        perPage={perPage}
      />

      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onChange={(p) => setPage(p)}
        disabled={loading}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Edit Region" : "Create Region"}
        onClose={mutating ? undefined : () => setModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={mutating}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="region-form"
              disabled={mutating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {mutating ? <LoadingSpinner size={16} className="border-white" /> : null}
              Save
            </button>
          </div>
        }
      >
        <form id="region-form" onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">English Name</label>
            <input
              type="text"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${formState.errors.name_en ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              {...register("name_en", { required: "English name is required" })}
            />
            {formState.errors.name_en ? <p className="text-xs text-red-500">{formState.errors.name_en.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Amharic Name</label>
            <input
              type="text"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:bg-gray-800 dark:text-white ${formState.errors.name_am ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                }`}
              {...register("name_am", { required: "Amharic name is required" })}
            />
            {formState.errors.name_am ? <p className="text-xs text-red-500">{formState.errors.name_am.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Code</label>
            <input
              type="text"
              maxLength={10}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              {...register("code")}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <input type="checkbox" className="h-4 w-4" {...register("is_active")} />
            Active
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Region"
        message={
          deleting
            ? `Delete "${deleting.name_en}"? This may also affect associated cities.`
            : "Delete this region?"
        }
        confirmLabel="Delete"
        confirmTone="danger"
        loading={mutating}
        onConfirm={onConfirmDelete}
        onClose={() => {
          if (mutating) return;
          setConfirmOpen(false);
          setDeleting(null);
        }}
      />
    </div>
  );
}
