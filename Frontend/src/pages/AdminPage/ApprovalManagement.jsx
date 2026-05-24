import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Building2,
  Pill,
  Calendar,
  MapPin,
  FileText,
  Eye,
  User as UserIcon,
  Phone,
  Info,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getPendingApprovals, decideApproval } from '../../api/admin';
import useAuthStore from '../../store/UserAuthStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Loading from '../../component/SupportiveComponent/Loading';

function DetailModal({ approval, onApprove, onReject, onClose, setDetailModalOpen }) {
  const { t } = useTranslation();
  if (!approval) return null;
  const isHospital = (approval.type || '').toLowerCase() === 'hospital';
  const address = approval.addresses?.[0] || {};
  const regionEn = address?.region?.name_en || address.region_en || '—';
  const cityEn = address?.city?.name_en || address.sub_city_en || address.city_en || '—';

  const formatDate = (value) => {
    const date = value ? new Date(value) : null;
    return date instanceof Date && !isNaN(date) ? date.toLocaleDateString() : 'N/A';
  };

  const safeCoordinates = (value) => {
    return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(4) : '—';
  };

  const facilityName = approval.entityName || approval.hospital_name_en || approval.pharmacy_name_en || approval.hospital_name_am || approval.pharmacy_name_am || t("Admin.UnknownFacility");
  const agentName = approval.agent?.Name || approval.agent?.name || t("Admin.UnknownAgent");
  const agentJoined = formatDate(approval.agent?.created_at);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200/60 dark:border-slate-800"
      >
        <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${isHospital ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400'}`}>
              {isHospital ? <Building2 className="size-5" /> : <Pill className="size-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider">{facilityName}</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-black mt-0.5">{t("Admin.Details")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-450 dark:text-slate-400">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-7">
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-4.5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Info className="size-3.5" /> {t("Admin.BasicInfo")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t("Admin.FacilityNameEn")}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{approval.hospital_name_en || approval.pharmacy_name_en || t("Common.NoData")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t("Admin.FacilityNameAm")}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{approval.hospital_name_am || approval.pharmacy_name_am || t("Common.NoData")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t("Admin.LicenseNumber")}</p>
                <p className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-350 px-2.5 py-1.5 rounded-lg inline-block border border-slate-200/60 dark:border-slate-800/80">
                  {approval.license_number || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t("Admin.TypeCategory")}</p>
                <p className="text-sm capitalize font-semibold text-slate-800 dark:text-white">{approval.hospital_ownership_type || approval.pharmacy_license_category || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-4.5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <MapPin className="size-3.5" /> {t("Admin.LocationAddress")}
            </h4>
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4.5 rounded-2xl space-y-4 border border-slate-200/50 dark:border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{t("Admin.Region")}</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{regionEn}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{t("Admin.ZoneSubCity")}</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{cityEn}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{t("Admin.WoredaKebele")}</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{address.kebele || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{t("Admin.Coordinates")}</p>
                  <p className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                    {address.latitude || address.longitude ? `${safeCoordinates(address.latitude)}, ${safeCoordinates(address.longitude)}` : '—'}
                  </p>
                </div>
              </div>
              {approval.address_description_en && (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">{t("Admin.DetailedDescription")}</p>
                  <p className="text-xs italic text-slate-650 dark:text-slate-400">"{approval.address_description_en}"</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-4.5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <UserIcon className="size-3.5" /> {t("Admin.SubmittedBy")}
            </h4>
            <div className="flex items-center gap-4 p-4 border border-slate-200/50 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30">
              <div className="size-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-black text-white text-lg shrink-0 shadow-sm">
                {approval.agent?.Name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{agentName}</p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1.5"><Phone className="size-3" /> {approval.agent?.Phone || t("Common.NoData")}</span>
                  <span className="flex items-center gap-1.5"><Clock className="size-3" /> {t("Admin.Joined")} {agentJoined}</span>
                </div>
              </div>
            </div>
          </section>

          {approval.rejection_reason && (
            <section className="bg-red-50/50 dark:bg-red-950/20 p-4.5 rounded-2xl border border-red-155 dark:border-red-900/30">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-750 dark:text-red-400 mb-1.5 flex items-center gap-2">
                <AlertCircle className="size-4" /> {t("Admin.RejectionHistory")}
              </h4>
              <p className="text-xs font-medium text-red-755 dark:text-red-300">"{approval.rejection_reason}"</p>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4.5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 z-10">
          {approval.status === "REJECTED" && (
            <button
              type="button"
              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer border-transparent"
              onClick={() => {
                onApprove(approval.id, approval.type);
                setDetailModalOpen(false);
              }}
            >
              {t("Admin.Approve")}
            </button>
          )}
          {approval.status === "APPROVED" && (
            <button
              type="button"
              className="px-4.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              onClick={() => { onReject(approval); setDetailModalOpen(false); }}
            >
              {t("Admin.Reject")}
            </button>
          )}
          <button onClick={onClose} className="px-4.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            {t("Common.Close")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DocumentModal({ documentUrl, title, onClose }) {
  const { t } = useTranslation();
  if (!documentUrl) return null;

  const getExtension = (url) => {
    try {
      const path = new URL(url, window.location.origin).pathname;
      return path.split('.').pop()?.toLowerCase() || '';
    } catch {
      const fallback = url.split('?')[0].split('#')[0];
      return fallback.split('.').pop()?.toLowerCase() || '';
    }
  };

  const extension = getExtension(documentUrl);
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
  const isImage = imageExtensions.includes(extension);
  const isPdf = extension === 'pdf';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-200/60 dark:border-slate-800"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 px-5 py-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
          <div>
            <p className="text-sm font-black text-slate-850 dark:text-white tracking-wide">{title || t("Admin.Document")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
            aria-label={t("Common.Close")}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="h-[calc(90vh-5rem)] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img src={documentUrl} alt={title || t("Admin.Document")}
              className="max-h-full max-w-full object-contain"
            />
          ) : isPdf ? (
            <iframe
              title={title || t("Admin.Document")}
              src={documentUrl}
              className="w-full h-full"
              frameBorder="0"
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                {t("Admin.DocumentPreviewNotSupported") || 'This document cannot be previewed in the browser.'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {t("Admin.DocumentTypeDownloadHint") || 'Please download the file to view it.'}
              </p>
              <a
                href={documentUrl}
                download
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700"
              >
                {t("Admin.DownloadDocument") || 'Download Document'}
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ApprovalCard({ approval, onApprove, onReject, onViewDetails, onViewDocument }) {
  const { t } = useTranslation();
  const isHospital = (approval.type || '').toLowerCase() === 'hospital';
  const isPending = (approval.status || '').toUpperCase() === 'PENDING';
  const isApproved = (approval.status || '').toUpperCase() === 'APPROVED';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.005, boxShadow: "0 12px 25px -12px rgba(0,0,0,0.08)" }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden transition-all duration-300 shadow-sm relative group"
    >
      <div className="px-5.5 pt-5.5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 ${isHospital ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400'}`}>
              {isHospital
                ? <Building2 className="size-5" />
                : <Pill className="size-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug">{approval.entityName || approval.hospital_name_en || approval.pharmacy_name_en || approval.hospital_name_am || approval.pharmacy_name_am || t("Admin.UnknownFacility")}</h3>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 mt-1">
                {isHospital ? t("Admin.HospitalRegistration") : t("Admin.PharmacyRegistration")} &bull; <span className="font-mono bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-100 dark:border-slate-800">{approval.license_number || 'N/A'}</span>
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${isApproved
              ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
              : approval.status === 'REJECTED'
                ? 'bg-red-50 border-red-250 text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400'
                : 'bg-amber-50 border-amber-255 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400'
              }`}>
              {isApproved && <CheckCircle2 className="size-3" />}
              {approval.status === 'REJECTED' && <X className="size-3" />}
              {!isApproved && approval.status !== 'REJECTED' && <Clock className="size-3" />}
              {approval.status === 'PENDING' ? t("Admin.Pending") : approval.status === 'APPROVED' ? t("Admin.Approved") : t("Admin.Rejected")}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5.5 pb-5.5 space-y-4">
        <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span>{approval.addresses?.[0]?.region_en || t("Admin.LocationMissing")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            <span>{approval.created_at ? new Date(approval.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/85">
          <button
            onClick={() => onViewDetails(approval)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Eye className="size-3.5" />
            {t("Admin.ViewDetails")}
          </button>

          {(approval.license_document_url || approval.official_license_upload_url) && (
            <button
              type="button"
              onClick={() => onViewDocument(approval)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-black uppercase tracking-wider"
            >
              <FileText className="size-3.5" />
              {t("Admin.Document")}
            </button>
          )}

          {isPending && (
            <>
              <button
                type="button"
                className="flex-[1.5] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 border border-transparent cursor-pointer"
                onClick={() => onApprove(approval.id, approval.type)}
              >
                <CheckCircle className="size-3.5" />
                {t("Admin.Approve")}
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                onClick={() => onReject(approval)}
              >
                <X className="size-3.5" />
                {t("Admin.Reject")}
              </button>
            </>
          )}

          {isApproved && (
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              onClick={() => onReject(approval)}
            >
              <X className="size-3.5" />
              {t("Admin.Reject")}
            </button>
          )}

          {approval.status === 'REJECTED' && (
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 border border-transparent cursor-pointer"
              onClick={() => onApprove(approval.id, approval.type)}
            >
              <CheckCircle className="size-3.5" />
              {t("Admin.Approve")}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ApprovalManagement() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('PENDING');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadApprovals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getPendingApprovals(user, activeStatus);
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setApprovals(list);
    } catch (err) {
      toast.error(t("Admin.toast.failedLoadRegistrations"));
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [user, activeStatus, t]);

  useEffect(() => {
    if (user) loadApprovals();
  }, [user?.id, activeStatus, loadApprovals]);

  const handleApprove = async (approvalId, type) => {
    if (!user) return;
    try {
      await decideApproval(user, approvalId, 'approved', null, type);
      toast.success(t("Admin.toast.regApproved"));
      loadApprovals();
    } catch (err) {
      toast.error(err?.message || t("Admin.toast.failedApprove"));
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;
    if (!rejectionReason.trim()) {
      toast.error(t("Admin.toast.provideReason"));
      return;
    }
    if (!user) return;
    try {
      await decideApproval(user, selectedApproval.id, 'rejected', rejectionReason, selectedApproval.type);
      toast.success(t("Admin.toast.regRejected"));
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedApproval(null);
      loadApprovals();
    } catch (err) {
      toast.error(err?.message || t("Admin.toast.failedReject"));
    }
  };

  if (loading) {
    return <Loading lable={t("Admin.FetchingRegistrations")} />;
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white uppercase tracking-wider">{t("Admin.ApprovalMgmt")}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("Admin.ApprovalMgmtDesc")}
          </p>
        </div>

        {/* Sliding Capsule Filter for Statuses */}
        <div className="flex p-1.5 bg-white dark:bg-slate-900 rounded-2xl w-fit gap-1 border border-slate-200/60 dark:border-slate-800">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className="relative px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 select-none group cursor-pointer"
            >
              {activeStatus === status && (
                <motion.div
                  layoutId="activeApprovalStatusTab"
                  className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700 rounded-xl shadow-md shadow-emerald-500/10 dark:shadow-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-300 ${activeStatus === status
                ? 'text-white font-black'
                : 'text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-200'
                }`}>
                {status === 'PENDING' ? t("Admin.Pending") : status === 'APPROVED' ? t("Admin.Approved") : t("Admin.Rejected")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 py-16 text-center shadow-sm">
          <div className="size-14 bg-slate-50 dark:bg-slate-955 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
            <CheckCircle className="size-7 text-slate-350 dark:text-slate-600" />
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{t("Admin.NoRegistrations")}</p>
          <p className="text-sm text-slate-500 dark:text-slate-450">
            {t("Admin.NoPendingDesc", { status: activeStatus.toLowerCase() })}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {approvals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onApprove={handleApprove}
              onReject={(app) => { setSelectedApproval(app); setRejectDialogOpen(true); }}
              onViewDetails={(app) => { setSelectedApproval(app); setDetailModalOpen(true); }}
              onViewDocument={(app) => { setSelectedApproval(app); setDocumentUrl(app.license_document_url || app.official_license_upload_url); setDocumentModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Details Dialog overlay */}
      <AnimatePresence>
        {detailModalOpen && selectedApproval && (
          <DetailModal
            approval={selectedApproval}
            onApprove={handleApprove}
            onReject={(app) => { setSelectedApproval(app); setRejectDialogOpen(true); }}
            onClose={() => { setDetailModalOpen(false); setSelectedApproval(null); }}
            setDetailModalOpen={setDetailModalOpen}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {documentModalOpen && documentUrl && (
          <DocumentModal
            documentUrl={documentUrl}
            title={selectedApproval?.entityName || t("Admin.Document")}
            onClose={() => { setDocumentModalOpen(false); setDocumentUrl(''); setSelectedApproval(null); }}
          />
        )}
      </AnimatePresence>

      {/* Reject Dialog overlay */}
      <AnimatePresence>
        {rejectDialogOpen && selectedApproval && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => { setRejectDialogOpen(false); setSelectedApproval(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200/60 dark:border-slate-800"
            >
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-2">{t("Admin.RejectRegistration")}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {t("Admin.ConfirmRejectDesc", { name: selectedApproval.entityName })}
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t("Admin.ReasonPlaceholder") || "Enter the reason for rejection..."}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-350 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-400"
              />

              <div className="flex justify-end gap-2.5 mt-5">
                <button
                  onClick={() => { setRejectDialogOpen(false); setRejectionReason(''); setSelectedApproval(null); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t("Common.Cancel")}
                </button>
                <button
                  onClick={handleReject}
                  className="px-4.5 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer border-transparent"
                >
                  {t("Admin.Reject")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
