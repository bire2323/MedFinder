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

function DetailModal({ approval, onClose }) {
  const { t } = useTranslation();
  if (!approval) return null;
  console.log(approval);
  const isHospital = (approval.type || '').toLowerCase() === 'hospital';
  const address = approval.addresses?.[0] || {};

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isHospital ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-green-100 dark:bg-green-900/40'}`}>
              {isHospital ? <Building2 className="size-6 text-blue-600 dark:text-blue-400" /> : <Pill className="size-6 text-green-600 dark:text-green-400" />}
            </div>
            <h3 className="text-xl font-bold">{approval.entityName} {t("Admin.Details")}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="size-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Info */}
          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Info className="size-4" /> {t("Admin.BasicInfo")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 font-medium">{t("Admin.FacilityNameEn")}</p>
                <p className="text-sm font-semibold">{approval.hospital_name_en || approval.pharmacy_name_en}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{t("Admin.FacilityNameAm")}</p>
                <p className="text-sm font-semibold">{approval.hospital_name_am || approval.pharmacy_name_am}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{t("Admin.LicenseNumber")}</p>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded inline-block">
                  {approval.license_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{t("Admin.TypeCategory")}</p>
                <p className="text-sm capitalize">{approval.hospital_ownership_type || approval.pharmacy_license_category || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Location Details */}
          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <MapPin className="size-4" /> {t("Admin.LocationAddress")}
            </h4>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{t("Admin.Region")}</p>
                  <p className="text-sm">{address.region_en || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{t("Admin.ZoneSubCity")}</p>
                  <p className="text-sm">{address.zone_en || address.sub_city_en || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{t("Admin.WoredaKebele")}</p>
                  <p className="text-sm">{address.kebele || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{t("Admin.Coordinates")}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    {/*  {address.latitude?.toFixed(4)}, {address.longitude?.toFixed(4)} */}
                  </p>
                </div>
              </div>
              {approval.address_description_en && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">{t("Admin.DetailedDescription")}</p>
                  <p className="text-sm italic">"{approval.address_description_en}"</p>
                </div>
              )}
            </div>
          </section>

          {/* Agent Information */}
          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <UserIcon className="size-4" /> {t("Admin.SubmittedBy")}
            </h4>
            <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="size-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600">
                {approval.agent?.Name?.[0] || 'A'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{approval.agent?.Name || t("Admin.UnknownAgent")}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Phone className="size-3" /> {approval.agent?.Phone || t("Common.NoData")}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {t("Admin.Joined")} {new Date(approval.agent?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </section>

          {approval.rejection_reason && (
            <section className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/40">
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                <X className="size-4" /> {t("Admin.RejectionHistory")}
              </h4>
              <p className="text-sm text-red-600 dark:text-red-300">"{approval.rejection_reason}"</p>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-medium transition-colors">
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="px-6 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${isHospital ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-green-100 dark:bg-green-900/40'
                }`}
            >
              {isHospital ? (
                <Building2 className="size-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <Pill className="size-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{approval.entityName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isHospital ? t("Admin.HospitalRegistration") : t("Admin.PharmacyRegistration")} • {approval.license_number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${isApproved ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900/40 dark:text-green-400' :
              approval.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-400' :
                'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-400'
              }`}>
              {isApproved && <CheckCircle2 className="size-3" />}
              {approval.status === 'REJECTED' && <X className="size-3" />}
              {!isApproved && approval.status !== 'REJECTED' && <Clock className="size-3" />}
              {approval.status === 'PENDING' ? t("Admin.Pending") : approval.status === 'APPROVED' ? t("Admin.Approved") : t("Admin.Rejected")}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <MapPin className="size-4" />
            <span>{approval.addresses?.[0]?.region_en || t("Admin.LocationMissing")}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Calendar className="size-4" />
            <span>{new Date(approval.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onViewDetails(approval)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="size-4" />
            {t("Admin.ViewDetails")}
          </button>

          {(approval.official_license_upload || approval.pharmacy_license_upload) && (
            <a
              href={`/storage/${approval.official_license_upload || approval.pharmacy_license_upload}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
            >
              <FileText className="size-4" />
              {t("Admin.Document")}
            </a>
          )}

          {isPending && (
            <>
              <button
                type="button"
                className="flex-[1.5] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                onClick={() => onApprove(approval.id, approval.type)}
              >
                <CheckCircle className="size-4" />
                {t("Admin.Approve")}
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => onReject(approval)}
              >
                <X className="size-4" />
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
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white">ss</div>
          <p className="text-gray-500 font-medium animate-pulse">{t("Admin.FetchingRegistrations")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("Admin.ApprovalMgmt")}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("Admin.ApprovalMgmtDesc")}
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-fit">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeStatus === status
                ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {status === 'PENDING' ? t("Admin.Pending") : status === 'APPROVED' ? t("Admin.Approved") : t("Admin.Rejected")}
            </button>
          ))}
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 py-20 text-center">
          <div className="size-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="size-10 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t("Admin.NoRegistrations", { status: activeStatus.toLowerCase() === 'pending' ? t("Admin.Pending").toLowerCase() : activeStatus.toLowerCase() === 'approved' ? t("Admin.Approved").toLowerCase() : t("Admin.Rejected").toLowerCase() })}</p>
          <p className="text-gray-500 mt-2">{t("Admin.AllHandled")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
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

      {/* Detail Modal */}
      {detailModalOpen && (
        <DetailModal
          approval={selectedApproval}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedApproval(null);
          }}
        />
      )}

      {/* Rejection Dialog */}
      {rejectDialogOpen && selectedApproval && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectDialogOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-red-600">{t("Admin.RejectRegistration")}</h3>
              <p className="text-gray-500 mt-2">
                {t("Admin.RejectRegistrationDesc")}
              </p>
            </div>

            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t("Admin.RejectionReason")}
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t("Admin.RejectionPlaceholder")}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />

            <div className="flex gap-3 mt-8">
              <button
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 font-bold hover:bg-gray-50 transition-colors"
                onClick={() => setRejectDialogOpen(false)}
              >
                {t("Common.Cancel")}
              </button>
              <button
                className="flex-[2] px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95"
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
