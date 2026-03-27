import { useState, useEffect } from 'react';
import {
  Search,
  Edit,
  MoreVertical,
  UserCheck,
  UserX,
} from 'lucide-react';
import { getAllUsers, updateUser } from '../../api/admin';
import useAuthStore from '../../store/UserAuthStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function getRoleBadgeClass(role) {
  switch (role) {
    case 'patient':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    case 'hospital_agent':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200';
    case 'pharmacy_agent':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

function getStatusBadgeClass(status) {
  if (status === true || status === 'active') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
  return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

export default function UserManagement() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    if (user) loadUsers();
  }, [user]);

  const loadUsers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAllUsers(user);
      setUsers(Array.isArray(data.data?.data) ? data.data?.data : []);
    } catch (err) {
      toast.error(t("Admin.toast.failedLoad"));
      console.error(err);
      setUsers([]);
    } finally {
      //setLoading(false);
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
      loadUsers();
      setOpenDropdownId(null);
    } catch (err) {
      toast.error(err?.message || t("Admin.toast.failedUpdateStatus"));
    }
  };

  const handleRoleChange = async () => {
    if (!user || !selectedUser || !editRole) return;
    try {
      await updateUser(user, selectedUser.id, { role: editRole });
      toast.success(t("Admin.toast.roleUpdated"));
      setEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full py-12">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white">ss</div>

      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{t("Admin.UserManagement")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("Admin.UserMgmtDesc")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <input
              type="text"
              placeholder={t("Admin.SearchUsers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-300"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bordegreen-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="all">{t("Admin.AllRoles")}</option>
            <option value="patient">{t("Admin.Patient")}</option>
            <option value="hospitalAgent">{t("Admin.HospitalAgent")}</option>
            <option value="pharmacyAgent">{t("Admin.PharmacyAgent")}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="all">{t("Admin.AllStatus")}</option>
            <option value="active">{t("Admin.Active")}</option>
            <option value="inactive">{t("Admin.Inactive")}</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="font-semibold">{t("Admin.Users")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredUsers.length === 1 ? t("Admin.UserFound") : t("Admin.UsersFound", { count: filteredUsers.length })}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">{t("Admin.User")}</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">{t("Admin.Role")}</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">{t("Admin.Status")}</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">{t("Admin.Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const active = user.active === true || user.active === 'active' || user.status === 'active';
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{user.Name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{user.Email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                        {(user.role?.map(r => r).join(', ') || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(active)}`}>
                        {active ? t("Admin.Active") : t("Admin.Inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        type="button"
                        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
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
                          <div className="absolute right-6 top-0 z-50 mt-1 z-20 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
                            <button
                              type="button"
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => openEdit(user)}
                            >
                              <Edit className="size-4" />
                              {t("Admin.EditUserRole")}
                            </button>
                            {active ? (
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleStatusChange(user, false)}
                              >
                                <UserX className="size-4" />
                                {t("Admin.Deactivate")}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleStatusChange(user, true)}
                              >
                                <UserCheck className="size-4" />
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
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            {t("Admin.NoUsersFound")}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => {
          const active = user.active === true || user.active === 'active' || user.status === 'active';
          return (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{user.Name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.Email}</p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                  >
                    <MoreVertical className="size-4" />
                  </button>
                  {openDropdownId === user.id && (
                    <div className="absolute right-0 top-1/2 mt-1 z-20 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => openEdit(user)}
                      >
                        <Edit className="size-4" />
                        {t("Admin.EditUserRole")}
                      </button>
                      {active ? (
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleStatusChange(user, false)}
                        >
                          <UserX className="size-4" />
                          {t("Admin.Deactivate")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleStatusChange(user, true)}
                        >
                          <UserCheck className="size-4" />
                          {t("Admin.Activate")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                  {(user.role?.map(r => r).join(', ') || '')}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(active)}`}>
                  {active ? t("Admin.Active") : t("Admin.Inactive")}
                </span>
              </div>
            </div>
          );
        })}
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            {t("Admin.NoUsersFound")}
          </div>
        )}
      </div>

      {/* Edit Role Dialog */}
      {editDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setEditDialogOpen(false);
              setSelectedUser(null);
            }}
            aria-hidden
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-1">{t("Admin.EditUserRole")}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t("Admin.EditRoleFor", { name: selectedUser.Name })}
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("Admin.SelectNewRole")}
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 mb-4"
            >
              <option value=""></option>
              <option value="patient">{t("Admin.Patient")}</option>
              <option value="hospitalAgent">{t("Admin.HospitalAgent")}</option>
              <option value="pharmacyAgent">{t("Admin.PharmacyAgent")}</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedUser(null);
                }}
              >
                {t("Common.Cancel")}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-700"
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
