"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as React from "react";
import { useState, useTransition } from "react";
import { apiPost } from "@/lib/api-client";

export function PolicyFormDialog({ 
  children,
  onSuccess 
}: { 
  children: React.ReactNode;
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
        await apiPost("/governance/policies", body);
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
          <DialogTitle>Create New Policy</DialogTitle>
          <DialogDescription>
            Add a new governance policy for employees to acknowledge.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title</label>
            <Input name="title" required placeholder="e.g., Data Privacy Policy" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category</label>
              <Select name="category" defaultValue="Compliance">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ethics">Ethics</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Workplace">Workplace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Version</label>
              <Input name="version" required placeholder="1.0" defaultValue="1.0" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Effective Date</label>
            <Input name="effectiveDate" type="date" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" required placeholder="Brief description of the policy..." rows={4} />
          </div>
          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "Creating..." : "Create Policy"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
