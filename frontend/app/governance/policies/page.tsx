"use client";

import { useEffect, useState } from "react";
import { Policy } from "@/lib/types";
import { apiGet, apiPost } from "@/lib/api-client";
import GovernancePage from "../page";
import { PolicyFormDialog } from "@/components/governance/PolicyFormDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, BellRing } from "lucide-react";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = () => {
    setLoading(true);
    apiGet<Policy[]>("/governance/policies")
      .then(setPolicies)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleRemind = async (id: string) => {
    try {
      await apiPost(`/governance/policies/${id}/remind`, {});
      alert("Reminders sent successfully!");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <GovernancePage>
      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-xl font-semibold">Company Policies</h2>
        <PolicyFormDialog onSuccess={fetchPolicies}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </PolicyFormDialog>
      </div>

      <div className="border rounded-md overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acknowledged</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading policies...
                </TableCell>
              </TableRow>
            ) : (
              policies.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.title}
                    <div className="text-xs text-muted-foreground mt-1">v{p.version}</div>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.effectiveDate}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "default" : "secondary"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${(p.acknowledgedCount / p.totalEmployees) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{p.acknowledgedCount}/{p.totalEmployees}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleRemind(p.id)}>
                      <BellRing className="w-4 h-4 mr-2" />
                      Remind
                    </Button>
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
