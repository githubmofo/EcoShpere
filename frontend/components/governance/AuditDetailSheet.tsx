"use client";

import { Audit, ComplianceIssue } from "@/lib/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function AuditDetailSheet({ 
  audit, 
  children
}: { 
  audit: Audit; 
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      apiGet<ComplianceIssue[]>(`/governance/audits/${audit.id}/issues`)
        .then(setIssues)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, audit.id]);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "bg-red-600";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {React.isValidElement(children) ? (
        <SheetTrigger nativeButton={false} render={children as React.ReactElement} />
      ) : (
        <SheetTrigger render={<span className="cursor-pointer" />}>{children}</SheetTrigger>
      )}
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto w-full">
        <SheetHeader>
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-xl">{audit.title}</SheetTitle>
              <SheetDescription className="mt-1">
                {audit.department} Department Audit
              </SheetDescription>
            </div>
            <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
              {audit.status}
            </Badge>
          </div>
        </SheetHeader>
        
        <div className="py-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auditor</p>
              <p className="font-medium mt-1">{audit.auditor}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audit Date</p>
              <p className="font-medium mt-1">{audit.auditDate}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
              <p className="text-sm mt-1">{audit.description}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Linked Compliance Issues
                <Badge variant="secondary" className="ml-2">{audit.linkedIssueCount}</Badge>
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center p-8 text-muted-foreground text-sm">Loading issues...</div>
            ) : issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center bg-muted/30">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-3 opacity-80" />
                <p className="text-sm font-medium">No issues found</p>
                <p className="text-xs text-muted-foreground mt-1">This audit generated zero compliance findings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map(issue => (
                  <div key={issue.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{issue.title}</h4>
                      <Badge className={getSeverityColor(issue.severity)} variant="secondary">
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{issue.description}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Owner: {issue.owner}</span>
                      <span className={issue.isOverdue ? "text-destructive font-medium" : ""}>
                        Due: {issue.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
