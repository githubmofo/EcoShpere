"use client";

import { useEffect, useState, useTransition } from "react";
import { PolicyAcknowledgement, Policy } from "@/lib/types";
import { apiGet, apiPost } from "@/lib/api-client";
import GovernancePage from "../page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AcknowledgementsPage() {
  const [acks, setAcks] = useState<PolicyAcknowledgement[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aData, pData] = await Promise.all([
        apiGet<PolicyAcknowledgement[]>("/governance/acknowledgements"),
        apiGet<Policy[]>("/governance/policies")
      ]);
      setAcks(aData);
      setPolicies(pData);
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
        await apiPost("/governance/acknowledgements", {
          policyId,
          employeeId: "emp_current",
          employeeName: "Current User",
          department: "Engineering"
        });
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
                  const ack = acks.find(a => a.policyId === p.id && a.employeeId === "emp_current");
                  const isAcked = !!ack;
                  
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.effectiveDate}</TableCell>
                      <TableCell className="text-right">
                        {isAcked ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Acknowledged on {new Date(ack.acknowledgedAt!).toLocaleDateString()}
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
