"use client";

import { useEffect, useState, useTransition } from "react";
import { CsrActivity } from "@/lib/types";
import { apiGet, apiPost } from "@/lib/api-client";
import SocialPage from "../page";
import { CsrActivityCard } from "@/components/social/CsrActivityCard";
import { Button } from "@/components/ui/button";
import { Plus, Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CsrActivitiesPage() {
  const [activities, setActivities] = useState<CsrActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formError, setFormError] = useState("");

  const fetchActivities = () => {
    setLoading(true);
    apiGet<CsrActivity[]>("/social/csr-activities")
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // ── Export CSV ────────────────────────────────────────────────
  const handleExportCsv = () => {
    if (activities.length === 0) return;
    const headers = ["ID", "Title", "Category", "Status", "Start Date", "End Date", "Participants", "Points"];
    const rows = activities.map((a) => [
      a.id,
      `"${a.title}"`,
      a.category,
      a.status,
      a.startDate,
      a.endDate,
      a.participantCount,
      a.defaultPoints,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `csr-activities-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Create New Activity ──────────────────────────────────────
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim() || !formDesc.trim() || !formStart || !formEnd) {
      setFormError("All fields are required.");
      return;
    }
    if (new Date(formEnd) < new Date(formStart)) {
      setFormError("End date must be after start date.");
      return;
    }

    startTransition(async () => {
      try {
        await apiPost("/social/csr-activities", {
          title: formTitle.trim(),
          description: formDesc.trim(),
          startDate: formStart,
          endDate: formEnd,
          status: "planned",
        });
        // Reset form and close
        setFormTitle("");
        setFormDesc("");
        setFormStart("");
        setFormEnd("");
        setOpen(false);
        fetchActivities(); // refresh list
      } catch (err) {
        console.error(err);
        setFormError("Failed to create activity. Please try again.");
      }
    });
  };

  return (
    <SocialPage>
      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-xl font-semibold">Corporate Social Responsibility</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={activities.length === 0}
            id="export-csv-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button id="new-activity-btn">
                <Plus className="w-4 h-4 mr-2" />
                New Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Create New CSR Activity</DialogTitle>
                <DialogDescription>
                  Plan a new community or environmental event. It will appear in the list immediately.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="act-title">Activity Title</Label>
                  <Input
                    id="act-title"
                    placeholder="e.g., Beach Cleanup Drive"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="act-start">Start Date</Label>
                    <Input
                      id="act-start"
                      type="date"
                      value={formStart}
                      onChange={(e) => setFormStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="act-end">End Date</Label>
                    <Input
                      id="act-end"
                      type="date"
                      value={formEnd}
                      onChange={(e) => setFormEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="act-desc">Description</Label>
                  <Textarea
                    id="act-desc"
                    placeholder="Describe the purpose and scope of this activity..."
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    required
                  />
                </div>
                {formError && (
                  <p className="text-sm text-destructive font-medium">{formError}</p>
                )}
                <Button type="submit" disabled={isPending} className="mt-1">
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Activity"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Plus className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No activities yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Click <strong>New Activity</strong> to create your first CSR campaign.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activities.map((activity) => (
            <CsrActivityCard
              key={activity.id}
              activity={activity}
              onJoin={fetchActivities}
            />
          ))}
        </div>
      )}
    </SocialPage>
  );
}
