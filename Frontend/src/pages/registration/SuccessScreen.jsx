/**
 * Success Screen
 * Displayed after successful registration submission
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  Home,
  Pill,
  Building2
} from 'lucide-react';

const SuccessScreen = ({ registrationType = 'pharmacy' }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              <CheckCircle size={48} className="text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white"
            >
              Registration Submitted!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 mt-2"
            >
              Your {registrationType} registration is under review
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Status badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-sm font-semibold">
                <Clock size={16} className="animate-pulse" />
                Pending Admin Approval
              </span>
            </div>

            {/* Info message */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                  {registrationType === 'pharmacy' ? (
                    <Pill size={24} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Building2 size={24} className="text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    What happens next?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      Our team will review your submitted documents
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      Verification usually takes 1-3 business days
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      You'll be notified once approved
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Notification methods */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Phone size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Via SMS</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Phone notification</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Via Email</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Email notification</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="
                  w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold
                  bg-gradient-to-r from-blue-500 to-emerald-500 text-white
                  hover:from-blue-600 hover:to-emerald-600
                  transform hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200 shadow-lg
                "
              >
                <Home size={18} />
                Return to Home
              </button>
              <button
                onClick={() => navigate('/login')}
                className="
                  w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium
                  bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-gray-600
                  transition-all duration-200
                "
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          Need help? Contact support at support@medfinder.et
        </p>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;
