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
  const { token } = useAuthStore();
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
    if (token) loadUsers();
  }, [token]);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAllUsers(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load users');
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !searchTerm ||
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || (u.role || '') === roleFilter;
    const active = u.active === true || u.active === 'active' || u.status === 'active';
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && active) ||
      (statusFilter === 'inactive' && !active);
    return matchSearch && matchRole && matchStatus;
  });

  const handleStatusChange = async (user, newActive) => {
    if (!token) return;
    try {
      await updateUser(token, user.id, { active: newActive });
      toast.success(newActive ? 'User activated' : 'User deactivated');
      loadUsers();
      setOpenDropdownId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const handleRoleChange = async () => {
    if (!token || !selectedUser || !editRole) return;
    try {
      await updateUser(token, selectedUser.id, { role: editRole });
      toast.success('Role updated');
      setEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err?.message || 'Failed to update role');
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
      <div className="flex justify-center py-12">
        <div className="size-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage all platform users and their permissions
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patient</option>
            <option value="hospital_agent">Hospital Agent</option>
            <option value="pharmacy_agent">Pharmacy Agent</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="font-semibold">Users</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">User</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const active = user.active === true || user.active === 'active' || user.status === 'active';
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                        {(user.role || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(active)}`}>
                        {active ? 'Active' : 'Inactive'}
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
                          <div className="absolute right-6 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
                            <button
                              type="button"
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => openEdit(user)}
                            >
                              <Edit className="size-4" />
                              Edit Role
                            </button>
                            {active ? (
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleStatusChange(user, false)}
                              >
                                <UserX className="size-4" />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleStatusChange(user, true)}
                              >
                                <UserCheck className="size-4" />
                                Activate
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
            No users found.
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
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
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
                    <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => openEdit(user)}
                      >
                        <Edit className="size-4" />
                        Edit Role
                      </button>
                      {active ? (
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleStatusChange(user, false)}
                        >
                          <UserX className="size-4" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleStatusChange(user, true)}
                        >
                          <UserCheck className="size-4" />
                          Activate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                  {(user.role || '').replace('_', ' ')}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(active)}`}>
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          );
        })}
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No users found.
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
            <h3 className="text-lg font-semibold mb-1">Edit User Role</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Change the role for {selectedUser.name}
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select New Role
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 mb-4"
            >
              <option value="patient">Patient</option>
              <option value="hospital_agent">Hospital Agent</option>
              <option value="pharmacy_agent">Pharmacy Agent</option>
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
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={handleRoleChange}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
