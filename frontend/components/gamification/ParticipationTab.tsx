"use client";

// components/gamification/ParticipationTab.tsx

import { Check, FileText, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ApprovalStatus, ChallengeParticipation } from "@/lib/types";

const APPROVAL_CLS: Record<ApprovalStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export default function ParticipationTab({
  participations,
  isAdmin,
  onApprove,
  onReject,
}: {
  participations: ChallengeParticipation[];
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const pending = participations.filter(
    (p) => p.approvalStatus === "pending"
  ).length;

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-medium">Challenge Participation</h3>
        <span className="text-xs text-muted-foreground">
          {pending} pending approval{pending === 1 ? "" : "s"}
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Challenge</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="w-40">Progress</TableHead>
            <TableHead>Proof</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">XP</TableHead>
            {isAdmin && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {participations.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.challengeTitle}</TableCell>
              <TableCell>{p.employee}</TableCell>
              <TableCell className="text-muted-foreground">
                {p.department}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground">
                    {p.progress}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {p.proof ? (
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <FileText className="size-3.5" />
                    {p.proof}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                    APPROVAL_CLS[p.approvalStatus]
                  )}
                >
                  {p.approvalStatus}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {p.xpAwarded > 0 ? `+${p.xpAwarded}` : "—"}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  {p.approvalStatus === "pending" ? (
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" onClick={() => onApprove(p.id)}>
                        <Check className="size-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReject(p.id)}
                      >
                        <X className="size-3.5" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
