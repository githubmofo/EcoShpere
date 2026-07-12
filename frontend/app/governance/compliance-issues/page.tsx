"use client";

import { useEffect, useState } from "react";
import { ComplianceIssue, Audit } from "@/lib/types";
import { apiGet } from "@/lib/api-client";
import GovernancePage from "../page";
import { ComplianceIssueFormDialog } from "@/components/governance/ComplianceIssueFormDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ComplianceIssuesPage() {
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [iData, aData] = await Promise.all([
        apiGet<ComplianceIssue[]>("/governance/compliance-issues"),
        apiGet<Audit[]>("/governance/audits")
      ]);
      setIssues(iData);
      setAudits(aData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "bg-red-600 hover:bg-red-700";
      case "high": return "bg-orange-500 hover:bg-orange-600";
      case "medium": return "bg-yellow-500 hover:bg-yellow-600";
      case "low": return "bg-blue-500 hover:bg-blue-600";
      default: return "bg-gray-500";
    }
  };

  return (
    <GovernancePage>
      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-xl font-semibold">Compliance Issues</h2>
        <ComplianceIssueFormDialog audits={audits} onSuccess={fetchData}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </ComplianceIssueFormDialog>
      </div>

      <div className="border rounded-md overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue / Audit</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading issues...
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow key={issue.id} className={issue.isOverdue ? "bg-red-500/5" : ""}>
                  <TableCell>
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[300px]">
                      {issue.auditTitle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(issue.severity)} variant="secondary">
                      {issue.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{issue.owner}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={issue.isOverdue ? "font-semibold text-destructive" : ""}>
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </span>
                      {issue.isOverdue && (
                        <Badge variant="destructive" className="h-5 px-1 text-[10px] uppercase">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={issue.status === "resolved" ? "default" : "outline"}>
                      {issue.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </GovernancePage>
  );
}
