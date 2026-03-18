import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Phone, Clock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from "../../../api/hospital";
import { toast } from "sonner";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    headDoctor: "",
    phoneNumber: "",
    workingHours: "",
    services: "",
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      toast.error("Failed to load departments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (dept: any = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        description: dept.description,
        headDoctor: dept.headDoctor,
        phoneNumber: dept.phoneNumber,
        workingHours: dept.workingHours,
        services: Array.isArray(dept.services) ? dept.services.join(", ") : "",
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: "",
        description: "",
        headDoctor: "",
        phoneNumber: "",
        workingHours: "",
        services: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    const departmentData = {
      ...formData,
      services: formData.services.split(",").map((s) => s.trim()).filter(Boolean),
      availableServices: true,
    };

    try {
      let response;
      if (editingDept) {
        response = await updateDepartment(editingDept.id, departmentData);
      } else {
        response = await addDepartment(departmentData);
      }

      if (response.success) {
        toast.success(response.message);
        setDialogOpen(false);
        loadDepartments();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      const response = await deleteDepartment(id);
      if (response.success) {
        toast.success(response.message);
        loadDepartments();
      } else {
        toast.error(response.message || "Failed to delete department");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Department Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage hospital departments and services</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="size-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDept ? "Edit Department" : "Add New Department"}
              </DialogTitle>
              <DialogDescription>
                {editingDept
                  ? "Update department information"
                  : "Fill in the details to add a new department"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cardiology"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the department"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="headDoctor">Head Doctor</Label>
                  <Input
                    id="headDoctor"
                    value={formData.headDoctor}
                    onChange={(e) => setFormData({ ...formData, headDoctor: e.target.value })}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours">Working Hours</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  placeholder="e.g., Mon-Fri: 08:00-18:00 or 24/7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="services">Services (comma-separated)</Label>
                <Textarea
                  id="services"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder="e.g., ECG, Echocardiography, Cardiac Surgery"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDept ? "Update Department" : "Add Department"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            {departments.length} department{departments.length !== 1 ? "s" : ""} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Head Doctor</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div>
                      <p>{dept.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dept.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{dept.headDoctor}</TableCell>
                  <TableCell>{dept.phoneNumber}</TableCell>
                  <TableCell>{dept.workingHours}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {dept.services?.slice(0, 2).map((service: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {dept.services?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{dept.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(dept)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 className="size-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(dept)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
                    <Trash2 className="size-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-gray-500" />
                <span>{dept.headDoctor}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-gray-500" />
                <span>{dept.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-gray-500" />
                <span>{dept.workingHours}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {dept.services?.map((service: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
