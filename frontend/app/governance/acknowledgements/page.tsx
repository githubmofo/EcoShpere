"use client";

import { useEffect, useState, useTransition } from "react";
import { PolicyAcknowledgement, Policy } from "@/lib/types";
import { apiGet } from "@/lib/api-client";
import GovernancePage from "../page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";

export default function AcknowledgementsPage() {
  const [acks, setAcks] = useState<PolicyAcknowledgement[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  // Track which policies were acknowledged in this session (covers the UUID mismatch)
  const [locallyAcked, setLocallyAcked] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aData, pData] = await Promise.all([
        apiGet<PolicyAcknowledgement[]>("/governance/acknowledgements"),
        apiGet<Policy[]>("/governance/policies")
      ]);
      setAcks(aData);
      setPolicies(pData);

      // Pre-populate locallyAcked from server data so already-acknowledged policies show correctly
      const ackedPolicyIds = new Set(aData.map(a => a.policyId));
      setLocallyAcked(prev => new Set([...prev, ...ackedPolicyIds]));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcknowledge = (policyId: string) => {
    startTransition(async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
        const res = await fetch(`${API_BASE_URL}/governance/acknowledgements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            policyId,
            employeeId: "emp_current",
          }),
        });

        if (res.status === 409) {
          // Already acknowledged — treat as success
          setLocallyAcked(prev => new Set(prev).add(policyId));
          return;
        }

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        // Success — mark as acknowledged locally and refresh data
        setLocallyAcked(prev => new Set(prev).add(policyId));
        fetchData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <GovernancePage>
      <div className="mb-6 mt-4">
        <h2 className="text-xl font-semibold">Policy Acknowledgements</h2>
      </div>

      <Tabs defaultValue="my-policies">
        <TabsList className="mb-4">
          <TabsTrigger value="my-policies">My Policies</TabsTrigger>
          <TabsTrigger value="all-acks">All Acknowledgements (Admin)</TabsTrigger>
        </TabsList>

        <TabsContent value="my-policies">
          <div className="border rounded-md overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map(p => {
                  const isAcked = locallyAcked.has(p.id);
                  const ack = acks.find(a => a.policyId === p.id);
                  
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.effectiveDate}</TableCell>
                      <TableCell className="text-right">
                        {isAcked ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline-block" />
                            {ack?.acknowledgedAt
                              ? `Acknowledged on ${new Date(ack.acknowledgedAt).toLocaleDateString()}`
                              : "Acknowledged ✓"}
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleAcknowledge(p.id)}
                            disabled={isPending}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="all-acks">
          <div className="border rounded-md overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acks.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.employeeName}</TableCell>
                    <TableCell>{a.department}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{a.policyTitle}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "acknowledged" ? "default" : "secondary"}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.acknowledgedAt ? new Date(a.acknowledgedAt).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </GovernancePage>
  );
}
