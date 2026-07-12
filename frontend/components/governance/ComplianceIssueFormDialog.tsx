"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as React from "react";
import { useState, useTransition } from "react";
import { apiPost } from "@/lib/api-client";
import { Audit } from "@/lib/types";

export function ComplianceIssueFormDialog({ 
  children,
  audits,
  onSuccess 
}: { 
  children: React.ReactNode;
  audits: Audit[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    startTransition(async () => {
      try {
        await apiPost("/governance/compliance-issues", body);
        onSuccess();
        setOpen(false);
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {React.isValidElement(children) ? (
        <DialogTrigger render={children as React.ReactElement} />
      ) : (
        <DialogTrigger render={<span className="cursor-pointer" />}>{children}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report Compliance Issue</DialogTitle>
          <DialogDescription>
            Log a new issue linked to an audit. Overdue issues will be flagged automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Issue Title</label>
            <Input name="title" required placeholder="e.g., Unencrypted database backups" />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Linked Audit</label>
            <Select name="auditId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select related audit" />
              </SelectTrigger>
              <SelectContent>
                {audits.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Severity</label>
              <Select name="severity" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input name="dueDate" type="date" required />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Assign Owner</label>
            <Input name="owner" required placeholder="Employee Name" />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" required placeholder="Details about the finding..." rows={3} />
          </div>
          
          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "Submitting..." : "Submit Issue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
