import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Building2,
  Pill,
  Calendar,
  MapPin,
  FileText,
} from 'lucide-react';
import { getPendingApprovals, decideApproval } from '../../api/admin';
import useAuthStore from '../../store/UserAuthStore';
import toast from 'react-hot-toast';

function ApprovalCard({ approval, onApprove, onReject }) {
  const isHospital = (approval.type || '').toLowerCase() === 'hospital';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${
                isHospital ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-green-100 dark:bg-green-900/40'
              }`}
            >
              {isHospital ? (
                <Building2 className="size-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <Pill className="size-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{approval.name || approval.entityName || 'Unknown'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {approval.submittedBy ? `Submitted by ${approval.submittedBy}` : approval.summary || approval.type}
              </p>
            </div>
          </div>
          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium border border-gray-300 dark:border-gray-600 capitalize">
            {approval.type || 'pending'}
          </span>
        </div>
      </div>
      <div className="px-6 pb-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {approval.licenseNumber && (
            <div className="flex items-start gap-2">
              <FileText className="size-4 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">License / Ref</p>
                <p className="text-sm">{approval.licenseNumber}</p>
              </div>
            </div>
          )}
          {approval.location && (
            <div className="flex items-start gap-2">
              <MapPin className="size-4 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-sm">{approval.location}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Calendar className="size-4 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requested</p>
              <p className="text-sm">
                {approval.created_at
                  ? new Date(approval.created_at).toLocaleDateString()
                  : approval.submittedDate
                    ? new Date(approval.submittedDate).toLocaleDateString()
                    : '—'}
              </p>
            </div>
          </div>
          {approval.summary && (
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Details</p>
              <p className="text-sm">{approval.summary}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={() => onApprove(approval.id)}
          >
            <CheckCircle className="size-4" />
            Approve
          </button>
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => onReject(approval)}
          >
            <XCircle className="size-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalManagement() {
  const { token } = useAuthStore();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (token) loadApprovals();
  }, [token, filterType]);

  const loadApprovals = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getPendingApprovals(token);
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setApprovals(list);
    } catch (err) {
      toast.error('Failed to load approvals');
      console.error(err);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    if (!token) return;
    try {
      await decideApproval(token, approvalId, 'approved', null);
      toast.success('Registration approved');
      loadApprovals();
    } catch (err) {
      toast.error(err?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    if (!token) return;
    try {
      await decideApproval(token, selectedApproval.id, 'rejected', rejectionReason);
      toast.success('Registration rejected');
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedApproval(null);
      loadApprovals();
    } catch (err) {
      toast.error(err?.message || 'Failed to reject');
    }
  };

  const filteredApprovals =
    filterType === 'all'
      ? approvals
      : approvals.filter((a) => (a.type || '').toLowerCase() === filterType);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Approval Management</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Review and approve new hospital and pharmacy registrations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
        {[
          { id: 'all', label: `All (${approvals.length})` },
          {
            id: 'hospital',
            label: `Hospitals (${approvals.filter((a) => (a.type || '').toLowerCase() === 'hospital').length})`,
          },
          {
            id: 'pharmacy',
            label: `Pharmacies (${approvals.filter((a) => (a.type || '').toLowerCase() === 'pharmacy').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredApprovals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-12 text-center">
          <CheckCircle className="size-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
          <p className="text-xl font-medium mb-2">All caught up!</p>
          <p className="text-gray-500 dark:text-gray-400">No pending approvals at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onApprove={handleApprove}
              onReject={(a) => {
                setSelectedApproval(a);
                setRejectDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Rejection Dialog */}
      {rejectDialogOpen && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectionReason('');
              setSelectedApproval(null);
            }}
            aria-hidden
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-1">Reject Registration</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting {selectedApproval.name || selectedApproval.entityName}
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Incomplete documentation, Invalid license..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm mb-4 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason('');
                  setSelectedApproval(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={handleReject}
              >
                Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
