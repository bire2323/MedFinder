import { useState, useEffect } from "react";
import { Search, Filter, Edit, Trash2, MoreVertical, UserCheck, UserX } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { getUsers, updateUserStatus, updateUserRole, deleteUser } from "../../../api/adminapi";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await updateUserStatus(userId, newStatus);
      if (response.success) {
        toast.success(response.message);
        loadUsers();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        toast.success(response.message);
        loadUsers();
        setEditDialogOpen(false);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await deleteUser(userId);
      if (response.success) {
        toast.success(response.message);
        loadUsers();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "patient":
        return "secondary";
      case "hospital_agent":
        return "default";
      case "pharmacy_agent":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl">User Management</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage all platform users and their permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="hospital_agent">Hospital Agent</SelectItem>
                <SelectItem value="pharmacy_agent">Pharmacy Agent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p>{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedDate}</TableCell>
                  <TableCell>
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="size-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        {user.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "inactive")}
                          >
                            <UserX className="size-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, "active")}
                          >
                            <UserCheck className="size-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="size-4 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                    {user.status === "active" ? (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(user.id, "inactive")}
                      >
                        <UserX className="size-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(user.id, "active")}
                      >
                        <UserCheck className="size-4 mr-2" />
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role.replace("_", " ")}
                </Badge>
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {user.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Joined: {user.joinedDate}</p>
                <p>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select New Role</Label>
              <Select
                defaultValue={selectedUser?.role}
                onValueChange={(value) => {
                  if (selectedUser) {
                    handleRoleChange(selectedUser.id, value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="hospital_agent">Hospital Agent</SelectItem>
                  <SelectItem value="pharmacy_agent">Pharmacy Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
