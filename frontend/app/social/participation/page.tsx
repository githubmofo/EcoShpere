"use client";

import { useEffect, useState } from "react";
import { EmployeeParticipation } from "@/lib/types";
import { apiGet } from "@/lib/api-client";
import SocialPage from "../page";
import { ParticipationDrawer } from "@/components/social/ParticipationDrawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search } from "lucide-react";

export default function ParticipationPage() {
  const [participations, setParticipations] = useState<EmployeeParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipations = () => {
    setLoading(true);
    apiGet<EmployeeParticipation[]>("/social/participation")
      .then(setParticipations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParticipations();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <SocialPage>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
        <h2 className="text-xl font-semibold">Employee Participation Review</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-[200px]" placeholder="Search employee..." />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Proof</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading participation data...
                </TableCell>
              </TableRow>
            ) : participations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No participation records found.
                </TableCell>
              </TableRow>
            ) : (
              participations.map((p) => (
                <ParticipationDrawer key={p.id} participation={p} onUpdate={fetchParticipations}>
                  <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{p.employeeName}</TableCell>
                    <TableCell>{p.activityTitle}</TableCell>
                    <TableCell>{p.department}</TableCell>
                    <TableCell className="text-center">
                      {p.proofFileName ? (
                        <FileText className="w-4 h-4 mx-auto text-muted-foreground" />
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{p.pointsEarned}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusColor(p.status)}>{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                </ParticipationDrawer>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </SocialPage>
  );
}
