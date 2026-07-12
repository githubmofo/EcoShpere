"use client";

import { CsrActivity } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import { useTransition } from "react";
import { apiPost } from "@/lib/api-client";

export function CsrActivityCard({ activity, onJoin }: { activity: CsrActivity; onJoin: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    startTransition(async () => {
      try {
        await apiPost("/social/participation", {
          employeeId: "emp_current", // Mock current user
          employeeName: "Current User",
          activityId: activity.id,
          activityTitle: activity.title,
          department: "Engineering"
        });
        onJoin();
      } catch (e) {
        console.error("Failed to join activity", e);
      }
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant={activity.status === "ongoing" ? "default" : "secondary"}>
            {activity.category}
          </Badge>
          <Badge variant="outline">{activity.defaultPoints} pts</Badge>
        </div>
        <CardTitle className="text-lg">{activity.title}</CardTitle>
        <CardDescription className="line-clamp-2">{activity.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{activity.startDate} to {activity.endDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{activity.participantCount} Participants</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleJoin} 
          disabled={isPending || activity.status === "completed"}
        >
          {isPending ? "Joining..." : activity.status === "completed" ? "Completed" : "Join Activity"}
        </Button>
      </CardFooter>
    </Card>
  );
}
