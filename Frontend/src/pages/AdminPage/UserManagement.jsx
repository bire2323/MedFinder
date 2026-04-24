import { useState, useEffect } from 'react';
import {
  Search,
  Edit,
  MoreVertical,
  UserCheck,
  UserX,
} from 'lucide-react';
import { getAllUsers, getUsers, updateUser } from '../../api/admin';
import useAuthStore from '../../store/UserAuthStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Loading from '../../component/SupportiveComponent/Loading';

function getRoleBadgeClass(role) {
  switch (role) {
    case 'patient':
      return 'bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300';
    case 'hospital_agent':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
    case 'pharmacy_agent':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getStatusBadgeClass(status) {
  if (status === true || status === 'active') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  return 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-400';
}

export default function UserManagement() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (page) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUsers(page);
      console.log("data", data);
      if (data.success) {
        setUsers(Array.isArray(data.data?.data) ? data.data?.data : []);
        setTotalPages(data.data.last_page);
      } else {
        console.log("success false");
        setLoading(false);
      }
    } catch (err) {
      toast.error(t("Admin.toast.failedLoad"));
      console.error(err);
      setUsers([]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !searchTerm ||
      (u.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.Email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || (u.role || '').includes(roleFilter);
    const active = u.active === true || u.active === 'active' || u.status === 'active';
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && active) ||
      (statusFilter === 'inactive' && !active);
    return matchSearch && matchRole && matchStatus;
  });

  const handleStatusChange = async (user, newActive) => {
    if (!user) return;
    try {
      await updateUser(user, user.id, { status: newActive ? "active" : "inactive" });
      toast.success(newActive ? t("Admin.toast.userActivated") : t("Admin.toast.userDeactivated"));
      fetchUsers(1);
      setOpenDropdownId(null);
    } catch (err) {
      toast.error(err?.message || t("Admin.toast.failedUpdateStatus"));
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = page - 1; i <= page + 1; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const handleRoleChange = async () => {
    if (!user || !selectedUser || !editRole) return;
    try {
      await updateUser(user, selectedUser.id, { role: editRole });
      toast.success(t("Admin.toast.roleUpdated"));
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(1);
    } catch (err) {
      toast.error(err?.message || t("Admin.toast.failedUpdateRole"));
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditRole(user.role || 'patient');
    setEditDialogOpen(true);
    setOpenDropdownId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("Admin.UserManagement")}</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
            {t("Admin.UserMgmtDesc")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t("Admin.SearchUsers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none transition"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-slate-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          >
            <option value="all">{t("Admin.AllRoles")}</option>
            <option value="patient">{t("Admin.Patient")}</option>
            <option value="hospitalAgent">{t("Admin.HospitalAgent")}</option>
            <option value="pharmacyAgent">{t("Admin.PharmacyAgent")}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-slate-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          >
            <option value="all">{t("Admin.AllStatus")}</option>
            <option value="active">{t("Admin.Active")}</option>
            <option value="inactive">{t("Admin.Inactive")}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-6 pt-5 pb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">{t("Admin.Users")}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                {filteredUsers.length === 1 ? t("Admin.UserFound") : t("Admin.UsersFound", { count: filteredUsers.length })}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-gray-800/60 border-y border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.User")}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.Role")}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.Status")}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{t("Admin.Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {filteredUsers.map((user) => {
                    const active = user.active === true || user.active === 'active' || user.status === 'active';
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.Name}</p>
                            <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">{user.Email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                            {(user.role?.map(r => r).join(', ') || '')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${getStatusBadgeClass(active)}`}>
                            <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {active ? t("Admin.Active") : t("Admin.Inactive")}
                          </span>
                        </td>
                        <td className="px-6 py-4 relative">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                            aria-label="Actions"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                          {openDropdownId === user.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdownId(null)}
                                aria-hidden
                              />
                              <div className="absolute right-6 top-0 z-20 mt-1 w-48 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => openEdit(user)}
                                >
                                  <Edit className="size-3.5 text-slate-400" />
                                  {t("Admin.EditUserRole")}
                                </button>
                                {active ? (
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    onClick={() => handleStatusChange(user, false)}
                                  >
                                    <UserX className="size-3.5" />
                                    {t("Admin.Deactivate")}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                    onClick={() => handleStatusChange(user, true)}
                                  >
                                    <UserCheck className="size-3.5" />
                                    {t("Admin.Activate")}
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="px-6 py-14 text-center text-slate-500 dark:text-gray-400 text-sm">
                {t("Admin.NoUsersFound")}
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => {
              const active = user.active === true || user.active === 'active' || user.status === 'active';
              return (
                <div
                  key={user.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{user.Name}</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{user.Email}</p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {openDropdownId === user.id && (
                        <div className="absolute right-0 top-8 z-20 w-48 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => openEdit(user)}
                          >
                            <Edit className="size-3.5 text-slate-400" />
                            {t("Admin.EditUserRole")}
                          </button>
                          {active ? (
                            <button
                              type="button"
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              onClick={() => handleStatusChange(user, false)}
                            >
                              <UserX className="size-3.5" />
                              {t("Admin.Deactivate")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                              onClick={() => handleStatusChange(user, true)}
                            >
                              <UserCheck className="size-3.5" />
                              {t("Admin.Activate")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                      {(user.role?.map(r => r).join(', ') || '')}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${getStatusBadgeClass(active)}`}>
                      <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {active ? t("Admin.Active") : t("Admin.Inactive")}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <div className="py-14 text-center text-slate-500 dark:text-gray-400 text-sm">
                {t("Admin.NoUsersFound")}
              </div>
            )}
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-slate-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t("common.previous")}
          </button>

          <div className="flex gap-1 overflow-x-auto px-1">
            {getVisiblePages().map((p, i) =>
              p === '...' ? (
                <span key={i} className="px-2 py-2 text-slate-400 dark:text-gray-500 text-sm">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    page === p
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                      : 'border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-slate-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t("common.next")}
          </button>
        </div>
      )}

      {/* Edit Role Dialog */}
      {editDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setEditDialogOpen(false);
              setSelectedUser(null);
            }}
            aria-hidden
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-7 border border-slate-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Edit className="size-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("Admin.EditUserRole")}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-5 ml-8">
              {t("Admin.EditRoleFor", { name: selectedUser.Name })}
            </p>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-gray-300 mb-2">
              {t("Admin.SelectNewRole")}
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm mb-6 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            >
              <option value=""></option>
              <option value="patient">{t("Admin.Patient")}</option>
              <option value="hospitalAgent">{t("Admin.HospitalAgent")}</option>
              <option value="pharmacyAgent">{t("Admin.PharmacyAgent")}</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedUser(null);
                }}
              >
                {t("Common.Cancel")}
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
                onClick={handleRoleChange}
              >
                {t("Common.Save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
