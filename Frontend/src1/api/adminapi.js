// Mock API functions for Admin Dashboard
// In production, replace these with actual API endpoints

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock users data
let mockUsers = [
  {
    id: "USR001",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    role: "patient",
    status: "active",
    joinedDate: "2024-01-15",
    lastLogin: "2024-03-14T10:30:00Z",
  },
  {
    id: "USR002",
    name: "Dr. Robert Smith",
    email: "robert.s@cityhospital.com",
    role: "hospital_agent",
    status: "active",
    joinedDate: "2023-08-22",
    lastLogin: "2024-03-15T08:15:00Z",
  },
  {
    id: "USR003",
    name: "Sarah Williams",
    email: "sarah.w@pharmacy.com",
    role: "pharmacy_agent",
    status: "active",
    joinedDate: "2023-11-10",
    lastLogin: "2024-03-14T16:45:00Z",
  },
  {
    id: "USR004",
    name: "Michael Brown",
    email: "michael.b@example.com",
    role: "patient",
    status: "inactive",
    joinedDate: "2023-05-03",
    lastLogin: "2024-01-20T14:22:00Z",
  },
  {
    id: "USR005",
    name: "Dr. Emily Davis",
    email: "emily.d@generalhospital.com",
    role: "hospital_agent",
    status: "pending",
    joinedDate: "2024-03-10",
    lastLogin: "2024-03-15T09:00:00Z",
  },
];

// Mock pending approvals
let mockPendingApprovals = [
  {
    id: "APPR001",
    type: "hospital",
    entityName: "Riverside Medical Center",
    submittedBy: "Dr. James Wilson",
    submittedDate: "2024-03-12T10:00:00Z",
    status: "pending",
    licenseNumber: "LIC-2024-67890",
    location: "456 River Road, Riverside, CA",
  },
  {
    id: "APPR002",
    type: "pharmacy",
    entityName: "HealthCare Pharmacy",
    submittedBy: "John Martinez",
    submittedDate: "2024-03-13T14:30:00Z",
    status: "pending",
    licenseNumber: "PHR-2024-54321",
    location: "789 Main Street, Springfield, IL",
  },
  {
    id: "APPR003",
    type: "hospital",
    entityName: "Lakeside Hospital",
    submittedBy: "Dr. Patricia Lee",
    submittedDate: "2024-03-14T09:15:00Z",
    status: "pending",
    licenseNumber: "LIC-2024-11223",
    location: "321 Lake Drive, Lakeside, NY",
  },
];

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalUsers: 15847,
    activeHospitals: 342,
    activePharmacies: 891,
    totalChats: 23456,
    userGrowth: 12.5,
    hospitalGrowth: 8.3,
    pharmacyGrowth: 15.2,
    chatGrowth: 22.1,
  },
  userActivity: [
    { date: "2024-03-09", patients: 420, hospitalAgents: 45, pharmacyAgents: 78 },
    { date: "2024-03-10", patients: 380, hospitalAgents: 42, pharmacyAgents: 71 },
    { date: "2024-03-11", patients: 510, hospitalAgents: 48, pharmacyAgents: 85 },
    { date: "2024-03-12", patients: 475, hospitalAgents: 50, pharmacyAgents: 80 },
    { date: "2024-03-13", patients: 550, hospitalAgents: 52, pharmacyAgents: 88 },
    { date: "2024-03-14", patients: 490, hospitalAgents: 47, pharmacyAgents: 82 },
    { date: "2024-03-15", patients: 520, hospitalAgents: 51, pharmacyAgents: 86 },
  ],
  chatbotInteractions: [
    { hour: "00:00", interactions: 45 },
    { hour: "04:00", interactions: 23 },
    { hour: "08:00", interactions: 156 },
    { hour: "12:00", interactions: 234 },
    { hour: "16:00", interactions: 198 },
    { hour: "20:00", interactions: 142 },
  ],
  topServices: [
    { name: "Emergency Care", requests: 1234 },
    { name: "General Consultation", requests: 987 },
    { name: "Pharmacy Lookup", requests: 856 },
    { name: "Lab Tests", requests: 743 },
    { name: "Specialist Referral", requests: 621 },
  ],
};

// Mock notifications
let mockNotifications = [
  {
    id: "NOTIF001",
    type: "approval",
    title: "New Hospital Registration",
    message: "Riverside Medical Center requires approval",
    timestamp: "2024-03-15T09:30:00Z",
    read: false,
    priority: "high",
  },
  {
    id: "NOTIF002",
    type: "violation",
    title: "Policy Violation Detected",
    message: "Pharmacy XYZ exceeded inventory update limits",
    timestamp: "2024-03-15T08:15:00Z",
    read: false,
    priority: "high",
  },
  {
    id: "NOTIF003",
    type: "update",
    title: "System Update Completed",
    message: "Platform updated to version 2.4.1",
    timestamp: "2024-03-14T22:00:00Z",
    read: true,
    priority: "low",
  },
  {
    id: "NOTIF004",
    type: "inactive",
    title: "Inactive User Alert",
    message: "15 users haven't logged in for 30+ days",
    timestamp: "2024-03-14T10:00:00Z",
    read: false,
    priority: "medium",
  },
];

// API Functions

/**
 * Get all users
 * @param {Object} filters - Filter parameters (role, status, search)
 * @returns {Promise} List of users
 */
export async function getUsers(filters = {}) {
  await delay(500);
  let filteredUsers = [...mockUsers];

  if (filters.role) {
    filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
  }
  if (filters.status) {
    filteredUsers = filteredUsers.filter((user) => user.status === filters.status);
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }

  return {
    success: true,
    data: filteredUsers,
    total: filteredUsers.length,
  };
}

/**
 * Update user status
 * @param {string} userId - User ID
 * @param {string} status - New status (active/inactive/suspended)
 * @returns {Promise} Update result
 */
export async function updateUserStatus(userId, status) {
  await delay(600);
  const user = mockUsers.find((u) => u.id === userId);
  if (user) {
    user.status = status;
    return {
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    };
  }
  return {
    success: false,
    message: "User not found",
  };
}

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise} Update result
 */
export async function updateUserRole(userId, role) {
  await delay(600);
  const user = mockUsers.find((u) => u.id === userId);
  if (user) {
    user.role = role;
    return {
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    };
  }
  return {
    success: false,
    message: "User not found",
  };
}

/**
 * Get pending approvals
 * @param {string} type - Filter by type (hospital/pharmacy/all)
 * @returns {Promise} List of pending approvals
 */
export async function getPendingApprovals(type = "all") {
  await delay(400);
  let filtered = [...mockPendingApprovals];
  if (type !== "all") {
    filtered = filtered.filter((approval) => approval.type === type);
  }
  return {
    success: true,
    data: filtered,
    total: filtered.length,
  };
}

/**
 * Approve registration
 * @param {string} approvalId - Approval ID
 * @returns {Promise} Approval result
 */
export async function approveRegistration(approvalId) {
  await delay(700);
  const approval = mockPendingApprovals.find((a) => a.id === approvalId);
  if (approval) {
    approval.status = "approved";
    return {
      success: true,
      message: `${approval.entityName} has been approved`,
    };
  }
  return {
    success: false,
    message: "Approval not found",
  };
}

/**
 * Reject registration
 * @param {string} approvalId - Approval ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} Rejection result
 */
export async function rejectRegistration(approvalId, reason) {
  await delay(700);
  const approval = mockPendingApprovals.find((a) => a.id === approvalId);
  if (approval) {
    approval.status = "rejected";
    approval.rejectionReason = reason;
    return {
      success: true,
      message: `${approval.entityName} has been rejected`,
    };
  }
  return {
    success: false,
    message: "Approval not found",
  };
}

/**
 * Get analytics data
 * @param {string} timeRange - Time range (7d/30d/90d)
 * @returns {Promise} Analytics data
 */
export async function getAnalytics(timeRange = "7d") {
  await delay(800);
  return {
    success: true,
    data: mockAnalytics,
    timeRange,
  };
}

/**
 * Get notifications
 * @param {boolean} unreadOnly - Filter for unread notifications
 * @returns {Promise} List of notifications
 */
export async function getNotifications(unreadOnly = false) {
  await delay(300);
  let filtered = [...mockNotifications];
  if (unreadOnly) {
    filtered = filtered.filter((notif) => !notif.read);
  }
  return {
    success: true,
    data: filtered,
    unreadCount: filtered.filter((n) => !n.read).length,
  };
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise} Update result
 */
export async function markNotificationRead(notificationId) {
  await delay(200);
  const notification = mockNotifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
    return {
      success: true,
      message: "Notification marked as read",
    };
  }
  return {
    success: false,
    message: "Notification not found",
  };
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise} Deletion result
 */
export async function deleteUser(userId) {
  await delay(600);
  const index = mockUsers.findIndex((u) => u.id === userId);
  if (index !== -1) {
    const user = mockUsers[index];
    mockUsers.splice(index, 1);
    return {
      success: true,
      message: `User ${user.name} has been deleted`,
    };
  }
  return {
    success: false,
    message: "User not found",
  };
}
