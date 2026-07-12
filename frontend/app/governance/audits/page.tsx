"use client";

import { useEffect, useState, useTransition } from "react";
import { Audit } from "@/lib/types";
import { apiGet, apiPost } from "@/lib/api-client";
import GovernancePage from "../page";
import { AuditDetailSheet } from "@/components/governance/AuditDetailSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
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

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formError, setFormError] = useState("");

  const fetchAudits = () => {
    setLoading(true);
    apiGet<Audit[]>("/governance/audits")
      .then(setAudits)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim() || !formDesc.trim() || !formDate) {
      setFormError("All fields are required.");
      return;
    }

    startTransition(async () => {
      try {
        await apiPost("/governance/audits", {
          title: formTitle.trim(),
          description: formDesc.trim(),
          auditDate: formDate,
        });
        setFormTitle("");
        setFormDesc("");
        setFormDate("");
        setOpen(false);
        fetchAudits();
      } catch (err) {
        console.error(err);
        setFormError("Failed to create audit. Please try again.");
      }
    });
  };

  return (
    <GovernancePage>
      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-xl font-semibold">Compliance Audits</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="new-audit-btn">
              <Plus className="w-4 h-4 mr-2" />
              New Audit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Schedule New Audit</DialogTitle>
              <DialogDescription>
                Schedule an internal or external compliance audit. It will appear in the table immediately.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
              <div className="grid gap-1.5">
                <Label htmlFor="audit-title">Audit Title</Label>
                <Input
                  id="audit-title"
                  placeholder="e.g., Q3 Information Security Audit"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="audit-date">Audit Date</Label>
                <Input
                  id="audit-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="audit-desc">Description</Label>
                <Textarea
                  id="audit-desc"
                  placeholder="Describe the audit scope and objectives..."
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
                    Scheduling...
                  </>
                ) : (
                  "Schedule Audit"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Audit Title</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : audits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No audits scheduled yet. Click <strong>New Audit</strong> to get started.
                </TableCell>
              </TableRow>
            ) : (
              audits.map((a) => (
                <AuditDetailSheet key={a.id} audit={a}>
                  <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell>{a.department}</TableCell>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{a.auditor}</TableCell>
                    <TableCell>{a.auditDate}</TableCell>
                    <TableCell>
                      {a.linkedIssueCount > 0 ? (
                        <Badge variant="destructive">{a.linkedIssueCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={a.status === "completed" ? "default" : "secondary"}
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </AuditDetailSheet>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </GovernancePage>
  );
}
