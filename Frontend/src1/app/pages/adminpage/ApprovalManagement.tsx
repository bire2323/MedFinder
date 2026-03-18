import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Building2, Pill, Calendar, MapPin, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { getPendingApprovals, approveRegistration, rejectRegistration } from "../../../api/adminapi";
import { toast } from "sonner";

export default function ApprovalManagement() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadApprovals();
  }, [filterType]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const response = await getPendingApprovals(filterType);
      if (response.success) {
        setApprovals(response.data);
      }
    } catch (error) {
      toast.error("Failed to load approvals");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      const response = await approveRegistration(approvalId);
      if (response.success) {
        toast.success(response.message);
        loadApprovals();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to approve");
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    if (!selectedApproval) return;

    try {
      const response = await rejectRegistration(selectedApproval.id, rejectionReason);
      if (response.success) {
        toast.success(response.message);
        setRejectDialogOpen(false);
        setRejectionReason("");
        setSelectedApproval(null);
        loadApprovals();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to reject");
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
      <div>
        <h2 className="text-2xl">Approval Management</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Review and approve new hospital and pharmacy registrations
        </p>
      </div>

      <Tabs value={filterType} onValueChange={setFilterType}>
        <TabsList>
          <TabsTrigger value="all">All ({approvals.length})</TabsTrigger>
          <TabsTrigger value="hospital">
            Hospitals ({approvals.filter((a) => a.type === "hospital").length})
          </TabsTrigger>
          <TabsTrigger value="pharmacy">
            Pharmacies ({approvals.filter((a) => a.type === "pharmacy").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {approvals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="size-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
                <p className="text-xl mb-2">All caught up!</p>
                <p className="text-gray-500 dark:text-gray-400">
                  No pending approvals at this time
                </p>
              </CardContent>
            </Card>
          ) : (
            approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={handleApprove}
                onReject={(approval) => {
                  setSelectedApproval(approval);
                  setRejectDialogOpen(true);
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="hospital" className="space-y-4 mt-6">
          {approvals.filter((a) => a.type === "hospital").length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No pending hospital approvals
                </p>
              </CardContent>
            </Card>
          ) : (
            approvals
              .filter((a) => a.type === "hospital")
              .map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onApprove={handleApprove}
                  onReject={(approval) => {
                    setSelectedApproval(approval);
                    setRejectDialogOpen(true);
                  }}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="pharmacy" className="space-y-4 mt-6">
          {approvals.filter((a) => a.type === "pharmacy").length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No pending pharmacy approvals
                </p>
              </CardContent>
            </Card>
          ) : (
            approvals
              .filter((a) => a.type === "pharmacy")
              .map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onApprove={handleApprove}
                  onReject={(approval) => {
                    setSelectedApproval(approval);
                    setRejectDialogOpen(true);
                  }}
                />
              ))
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedApproval?.entityName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Incomplete documentation, Invalid license..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Registration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ApprovalCardProps {
  approval: any;
  onApprove: (id: string) => void;
  onReject: (approval: any) => void;
}

function ApprovalCard({ approval, onApprove, onReject }: ApprovalCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`size-12 rounded-lg flex items-center justify-center ${
                approval.type === "hospital"
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-green-100 dark:bg-green-900"
              }`}
            >
              {approval.type === "hospital" ? (
                <Building2
                  className={`size-6 ${
                    approval.type === "hospital"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                />
              ) : (
                <Pill
                  className={`size-6 ${
                    approval.type === "hospital"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{approval.entityName}</CardTitle>
              <CardDescription>Submitted by {approval.submittedBy}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {approval.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <FileText className="size-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">License Number</p>
              <p>{approval.licenseNumber}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
              <p>{approval.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="size-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Submitted Date</p>
              <p>{new Date(approval.submittedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => onApprove(approval.id)}
            className="flex-1"
            variant="default"
          >
            <CheckCircle className="size-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={() => onReject(approval)}
            className="flex-1"
            variant="destructive"
          >
            <XCircle className="size-4 mr-2" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
