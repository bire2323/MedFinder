import React from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatusBanner = ({ status, rejectionReason }) => {
  const { t } = useTranslation();

  if (!status || status === 'APPROVED') return null;

  const isPending = status === 'PENDING';
  const isRejected = status === 'REJECTED';

  return (
    <div className={`mb-6 p-4 rounded-xl border flex gap-4 items-start ${
      isPending 
        ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-400'
        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-400'
    }`}>
      <div className="shrink-0 mt-1">
        {isPending ? <Clock size={20} /> : <XCircle size={20} />}
      </div>
      <div>
        <h3 className="font-bold text-sm mb-1">
          {isPending ? t('statusBanner.pendingTitle') : t('statusBanner.rejectedTitle')}
        </h3>
        <p className="text-sm opacity-90">
          {isPending 
            ? t('statusBanner.pendingDesc')
            : t('statusBanner.rejectedDesc', { reason: rejectionReason || t('statusBanner.rejectedDefaultReason') })
          }
        </p>
        {isRejected && (
          <p className="text-sm mt-2 font-semibold">
            {t('statusBanner.resubmitHint')}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatusBanner;
