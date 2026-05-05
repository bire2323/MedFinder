import { useState, useEffect } from 'react';
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
  // console.log("DetailModal approval", approval);
  const { t } = useTranslation();
  if (!approval) return null;
  // console.log(approval);
  const isHospital = (approval.type || '').toLowerCase() === 'hospital';
  const address = approval.addresses?.[0] || {};

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-gray-800">
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-slate-200 dark:border-gray-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isHospital ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30'}`}>
              {isHospital ? <Building2 className="size-5 text-blue-600 dark:text-blue-400" /> : <Pill className="size-5 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{approval.entityName} {t("Admin.Details")}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-slate-500 dark:text-gray-400">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-7">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-4 flex items-center gap-2">
              <Info className="size-3.5" /> {t("Admin.BasicInfo")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-0.5">{t("Admin.FacilityNameEn")}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{approval.hospital_name_en || approval.pharmacy_name_en}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-0.5">{t("Admin.FacilityNameAm")}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{approval.hospital_name_am || approval.pharmacy_name_am}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-0.5">{t("Admin.LicenseNumber")}</p>
                <p className="text-sm font-mono bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 px-2 py-0.5 rounded inline-block">
                  {approval.license_number}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mb-0.5">{t("Admin.TypeCategory")}</p>
                <p className="text-sm capitalize text-slate-900 dark:text-white">{approval.hospital_ownership_type || approval.pharmacy_license_category || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-4 flex items-center gap-2">
              <MapPin className="size-3.5" /> {t("Admin.LocationAddress")}
            </h4>
            <div className="bg-slate-50 dark:bg-gray-800/60 p-4 rounded-xl space-y-4 border border-slate-100 dark:border-gray-700/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-1">{t("Admin.Region")}</p>
                  <p className="text-sm text-slate-700 dark:text-gray-300">{address.region_en || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-1">{t("Admin.ZoneSubCity")}</p>
                  <p className="text-sm text-slate-700 dark:text-gray-300">{address.zone_en || address.sub_city_en || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-1">{t("Admin.WoredaKebele")}</p>
                  <p className="text-sm text-slate-700 dark:text-gray-300">{address.kebele || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-1">{t("Admin.Coordinates")}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    {/*  {address.latitude?.toFixed(4)}, {address.longitude?.toFixed(4)} */}
                  </p>
                </div>
              </div>
              {approval.address_description_en && (
                <div className="pt-3 border-t border-slate-200 dark:border-gray-700">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-1">{t("Admin.DetailedDescription")}</p>
                  <p className="text-sm italic text-slate-600 dark:text-gray-400">"{approval.address_description_en}"</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-4 flex items-center gap-2">
              <UserIcon className="size-3.5" /> {t("Admin.SubmittedBy")}
            </h4>
            <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800/40">
              <div className="size-11 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-lg shrink-0">
                {approval.agent?.Name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{approval.agent?.Name || t("Admin.UnknownAgent")}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Phone className="size-3" /> {approval.agent?.Phone || t("Common.NoData")}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {t("Admin.Joined")} {new Date(approval.agent?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </section>

          {approval.rejection_reason && (
            <section className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/40">
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-2">
                <X className="size-4" /> {t("Admin.RejectionHistory")}
              </h4>
              <p className="text-sm text-red-600 dark:text-red-300">"{approval.rejection_reason}"</p>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-50 dark:bg-gray-900/80 px-6 py-4 border-t border-slate-200 dark:border-gray-800 flex justify-end">
          {approval.status === "REJECTED" && (

            <button
              type="button"
              className="flex-[1.5] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 text-sm font-semibold transition-all shadow-sm active:scale-95"
              onClick={() => {

                onApprove(approval.id, approval.type);
                setDetailModalOpen(false);
              }}
            >
              <CheckCircle className="size-3.5" />
              {t("Admin.Approve")}
            </button>

          )}
          {(approval.status === "APPROVED") && (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-300 dark:border-red-700/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
              onClick={() => { onReject(approval); setDetailModalOpen(false); }}
            >
              <X className="size-3.5" />
              {t("Admin.Reject")}
            </button>
          )}

          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
            {t("Common.Close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ approval, onApprove, onReject, onViewDetails }) {
  const { t } = useTranslation();
  const isHospital = (approval.type || '').toLowerCase() === 'hospital';
  const isPending = (approval.status || '').toUpperCase() === 'PENDING';
  const isApproved = (approval.status || '').toUpperCase() === 'APPROVED';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${isHospital ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30'
              }`}>
              {isHospital
                ? <Building2 className="size-5 text-blue-600 dark:text-blue-400" />
                : <Pill className="size-5 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{approval.entityName}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                {isHospital ? t("Admin.HospitalRegistration") : t("Admin.PharmacyRegistration")} &bull; <span className="font-mono">{approval.license_number}</span>
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isApproved
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400'
              : approval.status === 'REJECTED'
                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'
                : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400'
              }`}>
              {isApproved && <CheckCircle2 className="size-3" />}
              {approval.status === 'REJECTED' && <X className="size-3" />}
              {!isApproved && approval.status !== 'REJECTED' && <Clock className="size-3" />}
              {approval.status === 'PENDING' ? t("Admin.Pending") : approval.status === 'APPROVED' ? t("Admin.Approved") : t("Admin.Rejected")}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">
        <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span>{approval.addresses?.[0]?.region_en || t("Admin.LocationMissing")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            <span>{new Date(approval.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100 dark:border-gray-800">
          <button
            onClick={() => onViewDetails(approval)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            <Eye className="size-3.5" />
            {t("Admin.ViewDetails")}
          </button>

          {(approval.license_document_url || approval.official_license_upload_url) && (
            <a
              href={approval.license_document_url || approval.official_license_upload_url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="size-3.5" />
              {t("Admin.Document")}
            </a>

          )}


          {isPending && (
            <>
              <button
                type="button"
                className="flex-[1.5] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 text-sm font-semibold transition-all shadow-sm active:scale-95"
                onClick={() => onApprove(approval.id, approval.type)}
              >
                <CheckCircle className="size-3.5" />
                {t("Admin.Approve")}
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-300 dark:border-red-700/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
                onClick={() => onReject(approval)}
              >
                <X className="size-3.5" />
                {t("Admin.Reject")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
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
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (user) loadApprovals();
  }, [user, activeStatus]);

  const loadApprovals = async () => {
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
  };

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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t("Admin.ApprovalMgmt")}</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            {t("Admin.ApprovalMgmtDesc")}
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-gray-800 rounded-xl w-fit gap-0.5">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeStatus === status
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
            >
              {status === 'PENDING' ? t("Admin.Pending") : status === 'APPROVED' ? t("Admin.Approved") : t("Admin.Rejected")}
            </button>
          ))}
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-gray-800 py-20 text-center">
          <div className="size-16 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="size-8 text-slate-300 dark:text-gray-600" />
          </div>
          <p className="text-lg font-bold text-slate-700 dark:text-gray-200">{t("Admin.NoRegistrations", { status: activeStatus.toLowerCase() === 'pending' ? t("Admin.Pending").toLowerCase() : activeStatus.toLowerCase() === 'approved' ? t("Admin.Approved").toLowerCase() : t("Admin.Rejected").toLowerCase() })}</p>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1.5">{t("Admin.AllHandled")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {approvals.map((approval) => (
            <ApprovalCard
              key={`${approval.type}-${approval.id}`}
              approval={approval}
              onApprove={handleApprove}
              onReject={(a) => {
                setSelectedApproval(a);
                setRejectDialogOpen(true);
              }}
              onViewDetails={(a) => {
                setSelectedApproval(a);
                setDetailModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {detailModalOpen && (
        <DetailModal
          approval={selectedApproval}
          onApprove={handleApprove}
          onReject={(a) => {
            setSelectedApproval(a);
            setRejectDialogOpen(true);
          }}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedApproval(null);
          }}
          setDetailModalOpen={setDetailModalOpen}
        />
      )}

      {rejectDialogOpen && selectedApproval && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectDialogOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-7 border border-slate-200 dark:border-gray-800">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="size-4 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("Admin.RejectRegistration")}</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {t("Admin.RejectRegistrationDesc")}
              </p>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-2">
              {t("Admin.RejectionReason")}
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t("Admin.RejectionPlaceholder")}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-400 focus:border-red-300 outline-none transition resize-none placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />

            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 font-semibold text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setRejectDialogOpen(false)}
              >
                {t("Common.Cancel")}
              </button>
              <button
                className="flex-[2] px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all shadow-md active:scale-95"
                onClick={handleReject}
              >
                {t("Admin.ConfirmRejection")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
