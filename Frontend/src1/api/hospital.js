// Mock API functions for Hospital Agent Dashboard
// In production, replace these with actual API endpoints

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock hospital data
let mockHospitalData = {
  id: "HOSP001",
  name: "City General Hospital",
  location: {
    address: "123 Medical Center Drive, Downtown",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    coordinates: {
      lat: 40.7580,
      lng: -73.9855,
    },
  },
  workingHours: {
    monday: "00:00 - 23:59",
    tuesday: "00:00 - 23:59",
    wednesday: "00:00 - 23:59",
    thursday: "00:00 - 23:59",
    friday: "00:00 - 23:59",
    saturday: "00:00 - 23:59",
    sunday: "00:00 - 23:59",
  },
  emergencyContact: "+1 (555) 123-4567",
  phoneNumber: "+1 (555) 123-4500",
  email: "info@citygeneralhospital.com",
  website: "https://citygeneralhospital.com",
  logo: null,
  licenseNumber: "LIC-2024-12345",
  licenseExpiryDate: "2025-12-31",
  verificationStatus: "verified",
  rating: 4.5,
  totalBeds: 350,
  availableBeds: 87,
  createdAt: "2023-01-15T10:30:00Z",
  updatedAt: "2024-03-10T14:22:00Z",
};

// Mock departments data
let mockDepartments = [
  {
    id: "DEPT001",
    name: "Emergency Department",
    description: "24/7 emergency medical services",
    headDoctor: "Dr. Sarah Johnson",
    phoneNumber: "+1 (555) 123-4501",
    workingHours: "24/7",
    services: ["Trauma Care", "Emergency Surgery", "Critical Care"],
    availableServices: true,
  },
  {
    id: "DEPT002",
    name: "Cardiology",
    description: "Heart and cardiovascular care",
    headDoctor: "Dr. Michael Chen",
    phoneNumber: "+1 (555) 123-4502",
    workingHours: "Mon-Fri: 08:00-18:00",
    services: ["ECG", "Echocardiography", "Cardiac Catheterization", "Heart Surgery"],
    availableServices: true,
  },
  {
    id: "DEPT003",
    name: "Pediatrics",
    description: "Specialized care for children",
    headDoctor: "Dr. Emily Rodriguez",
    phoneNumber: "+1 (555) 123-4503",
    workingHours: "Mon-Sat: 08:00-20:00",
    services: ["General Pediatrics", "Vaccinations", "Pediatric Surgery"],
    availableServices: true,
  },
  {
    id: "DEPT004",
    name: "Radiology",
    description: "Medical imaging and diagnostics",
    headDoctor: "Dr. James Wilson",
    phoneNumber: "+1 (555) 123-4504",
    workingHours: "Mon-Fri: 07:00-21:00",
    services: ["X-Ray", "CT Scan", "MRI", "Ultrasound"],
    availableServices: true,
  },
];

// Mock profile data
let mockAgentProfile = {
  id: "AGENT001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@citygeneralhospital.com",
  phoneNumber: "+1 (555) 987-6543",
  position: "Hospital Administrator",
  department: "Administration",
  verificationStatus: "verified",
  joinedDate: "2022-05-10",
  avatar: null,
};

// API Functions

/**
 * Get hospital information
 * @returns {Promise} Hospital data
 */
export async function getHospitalInfo() {
  await delay(500);
  return {
    success: true,
    data: mockHospitalData,
  };
}

/**
 * Update hospital information
 * @param {Object} data - Updated hospital data
 * @returns {Promise} Updated hospital data
 */
export async function updateHospitalInfo(data) {
  await delay(800);
  mockHospitalData = {
    ...mockHospitalData,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return {
    success: true,
    message: "Hospital information updated successfully",
    data: mockHospitalData,
  };
}

/**
 * Get all departments
 * @returns {Promise} List of departments
 */
export async function getDepartments() {
  await delay(400);
  return {
    success: true,
    data: mockDepartments,
  };
}

/**
 * Add new department
 * @param {Object} department - New department data
 * @returns {Promise} Created department
 */
export async function addDepartment(department) {
  await delay(600);
  const newDepartment = {
    id: `DEPT${String(mockDepartments.length + 1).padStart(3, "0")}`,
    ...department,
  };
  mockDepartments.push(newDepartment);
  return {
    success: true,
    message: "Department added successfully",
    data: newDepartment,
  };
}

/**
 * Update department
 * @param {string} id - Department ID
 * @param {Object} data - Updated department data
 * @returns {Promise} Updated department
 */
export async function updateDepartment(id, data) {
  await delay(600);
  const index = mockDepartments.findIndex((dept) => dept.id === id);
  if (index !== -1) {
    mockDepartments[index] = { ...mockDepartments[index], ...data };
    return {
      success: true,
      message: "Department updated successfully",
      data: mockDepartments[index],
    };
  }
  return {
    success: false,
    message: "Department not found",
  };
}

/**
 * Delete department
 * @param {string} id - Department ID
 * @returns {Promise} Deletion result
 */
export async function deleteDepartment(id) {
  await delay(500);
  const index = mockDepartments.findIndex((dept) => dept.id === id);
  if (index !== -1) {
    mockDepartments.splice(index, 1);
    return {
      success: true,
      message: "Department deleted successfully",
    };
  }
  return {
    success: false,
    message: "Department not found",
  };
}

/**
 * Get agent profile
 * @returns {Promise} Agent profile data
 */
export async function getAgentProfile() {
  await delay(400);
  return {
    success: true,
    data: mockAgentProfile,
  };
}

/**
 * Update agent profile
 * @param {Object} data - Updated profile data
 * @returns {Promise} Updated profile
 */
export async function updateAgentProfile(data) {
  await delay(600);
  mockAgentProfile = { ...mockAgentProfile, ...data };
  return {
    success: true,
    message: "Profile updated successfully",
    data: mockAgentProfile,
  };
}

/**
 * Get verification status
 * @returns {Promise} Verification status
 */
export async function getVerificationStatus() {
  await delay(300);
  return {
    success: true,
    data: {
      hospitalVerified: mockHospitalData.verificationStatus === "verified",
      agentVerified: mockAgentProfile.verificationStatus === "verified",
      licenseValid: new Date(mockHospitalData.licenseExpiryDate) > new Date(),
      documentsSubmitted: true,
    },
  };
}
