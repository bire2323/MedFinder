import { useState, useEffect } from "react";
import { Save, Upload, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { updateHospitalInfo } from "../../../api/hospital";
import { toast } from "sonner";

interface HospitalManagementProps {
  hospitalInfo: any;
  onUpdate: () => void;
}

export default function HospitalManagement({ hospitalInfo, onUpdate }: HospitalManagementProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    emergencyContact: "",
    email: "",
    website: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    totalBeds: "",
    availableBeds: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hospitalInfo) {
      setFormData({
        name: hospitalInfo.name || "",
        address: hospitalInfo.location?.address || "",
        city: hospitalInfo.location?.city || "",
        state: hospitalInfo.location?.state || "",
        zipCode: hospitalInfo.location?.zipCode || "",
        phoneNumber: hospitalInfo.phoneNumber || "",
        emergencyContact: hospitalInfo.emergencyContact || "",
        email: hospitalInfo.email || "",
        website: hospitalInfo.website || "",
        licenseNumber: hospitalInfo.licenseNumber || "",
        licenseExpiryDate: hospitalInfo.licenseExpiryDate?.split("T")[0] || "",
        totalBeds: hospitalInfo.totalBeds?.toString() || "",
        availableBeds: hospitalInfo.availableBeds?.toString() || "",
      });
    }
  }, [hospitalInfo]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Hospital name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = "Emergency contact is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    try {
      const response = await updateHospitalInfo({
        name: formData.name,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        email: formData.email,
        website: formData.website,
        licenseNumber: formData.licenseNumber,
        licenseExpiryDate: formData.licenseExpiryDate,
        totalBeds: parseInt(formData.totalBeds) || 0,
        availableBeds: parseInt(formData.availableBeds) || 0,
      });

      if (response.success) {
        toast.success(response.message);
        onUpdate();
      } else {
        toast.error("Failed to update hospital information");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your hospital's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Hospital Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter hospital name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value)}
                placeholder="LIC-YYYY-XXXXX"
              />
              {errors.licenseNumber && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.licenseNumber}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="licenseExpiryDate">License Expiry Date</Label>
              <Input
                id="licenseExpiryDate"
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => handleChange("licenseExpiryDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
          <CardDescription>Hospital address and location details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Medical Center Drive"
            />
            {errors.address && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.address}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange("zipCode", e.target.value)}
                placeholder="12345"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How patients can reach your hospital</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact *</Label>
              <Input
                id="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => handleChange("emergencyContact", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              {errors.emergencyContact && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.emergencyContact}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="info@hospital.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://hospital.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capacity Information</CardTitle>
          <CardDescription>Bed availability and capacity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="totalBeds">Total Beds</Label>
              <Input
                id="totalBeds"
                type="number"
                min="0"
                value={formData.totalBeds}
                onChange={(e) => handleChange("totalBeds", e.target.value)}
                placeholder="350"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableBeds">Available Beds</Label>
              <Input
                id="availableBeds"
                type="number"
                min="0"
                value={formData.availableBeds}
                onChange={(e) => handleChange("availableBeds", e.target.value)}
                placeholder="87"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="size-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
