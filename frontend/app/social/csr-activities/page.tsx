"use client";

import { useEffect, useState } from "react";
import { CsrActivity } from "@/lib/types";
import { apiGet } from "@/lib/api-client";
import SocialPage from "../page";
import { CsrActivityCard } from "@/components/social/CsrActivityCard";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CsrActivitiesPage() {
  const [activities, setActivities] = useState<CsrActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = () => {
    setLoading(true);
    apiGet<CsrActivity[]>("/social/csr-activities")
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <SocialPage>
      <div className="flex justify-between items-center mb-6 mt-4">
        <h2 className="text-xl font-semibold">Corporate Social Responsibility</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          
          <Dialog>
            <DialogTrigger render={<Button />}>
                <Plus className="w-4 h-4 mr-2" />
                New Activity
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New CSR Activity</DialogTitle>
                <DialogDescription>Plan a new community or environmental event.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="Activity Title" />
                <Input placeholder="Category" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" placeholder="Start Date" />
                  <Input type="date" placeholder="End Date" />
                </div>
                <Input type="number" placeholder="Points Reward" />
                <Textarea placeholder="Description..." rows={3} />
                <Button onClick={() => alert("Mock Create")}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading activities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map(activity => (
            <CsrActivityCard 
              key={activity.id} 
              activity={activity} 
              onJoin={fetchActivities} 
            />
          ))}
        </div>
      )}
    </SocialPage>
  );
}
