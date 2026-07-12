"use client";

import { EmployeeParticipation } from "@/lib/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import * as React from "react";
import { useState, useTransition } from "react";
import { FileText, CheckCircle, XCircle } from "lucide-react";

// Need to add apiPatch to lib/api-client.ts, I will do that next
// For now, simulate it locally or assume it exists.

export function ParticipationDrawer({ 
  participation, 
  children,
  onUpdate 
}: { 
  participation: EmployeeParticipation; 
  children: React.ReactNode;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(participation.comments || "");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: "approved" | "rejected") => {
    startTransition(async () => {
      try {
        await fetch(`/api/social/participation/${participation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: newStatus, 
            comments,
            pointsEarned: newStatus === "approved" ? 50 : 0 // Mock 50 pts
          })
        });
        onUpdate();
        setOpen(false);
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {React.isValidElement(children) ? (
        <SheetTrigger nativeButton={false} render={children as React.ReactElement} />
      ) : (
        <SheetTrigger render={<span className="cursor-pointer" />}>{children}</SheetTrigger>
      )}
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Review Participation</SheetTitle>
          <SheetDescription>
            {participation.employeeName} - {participation.activityTitle}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">Status</p>
              <Badge variant={participation.status === "approved" ? "default" : participation.status === "rejected" ? "destructive" : "secondary"}>
                {participation.status}
              </Badge>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Department</p>
              <p>{participation.department}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Submitted At</p>
              <p>{new Date(participation.submittedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Points Earned</p>
              <p>{participation.pointsEarned}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-sm text-muted-foreground mb-2">Proof Evidence</p>
            {participation.proofFileName ? (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{participation.proofFileName}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No proof file provided.</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-sm text-muted-foreground mb-2">Reviewer Comments</p>
            <Textarea 
              placeholder="Add comments here..." 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={participation.status !== "pending"}
            />
          </div>
        </div>

        {participation.status === "pending" && (
          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => handleStatusChange("rejected")}
              disabled={isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleStatusChange("approved")}
              disabled={isPending || !participation.proofFileName}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
