"use client";

import { useEffect, useState } from "react";
import { Audit } from "@/lib/types";
import { apiGet } from "@/lib/api-client";
import GovernancePage from "../page";
import { AuditDetailSheet } from "@/components/governance/AuditDetailSheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <GovernancePage>
      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-xl font-semibold">Compliance Audits</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Audit
        </Button>
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
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading audits...
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
                      <Badge variant={a.status === "completed" ? "default" : "secondary"}>
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
