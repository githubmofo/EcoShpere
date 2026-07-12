"use client";

import { CsrActivity } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { apiPost } from "@/lib/api-client";

const CURRENT_EMPLOYEE_ID = "u-aditi"; // Seeded user ID — replace with auth context later

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  ongoing: "default",
  planned: "secondary",
  completed: "outline",
};

export function CsrActivityCard({
  activity,
  onJoin,
}: {
  activity: CsrActivity;
  onJoin: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = () => {
    setError("");
    startTransition(async () => {
      try {
        await apiPost("/social/participation", {
          employeeId: CURRENT_EMPLOYEE_ID,
          activityId: activity.id,
        });
        setJoined(true);
        onJoin(); // re-fetch activity list to update participantCount
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to join";
        // 409 = already joined — treat as success visually
        if (msg.includes("409") || msg.includes("Already")) {
          setJoined(true);
        } else {
          setError("Could not join. Please try again.");
          console.error("[handleJoin]", e);
        }
      }
    });
  };

  const isCompleted = activity.status === "completed";
  const canJoin = !isCompleted && !joined;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-200 group">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant={statusVariant[activity.status] ?? "secondary"}>
            {activity.category}
          </Badge>
          <Badge variant="outline">{activity.defaultPoints} pts</Badge>
        </div>
        <CardTitle className="text-lg leading-snug">{activity.title}</CardTitle>
        <CardDescription className="line-clamp-2">{activity.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {activity.startDate} → {activity.endDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 shrink-0" />
            <span>{activity.participantCount} Participants</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Dialog>
          <DialogTrigger render={<Button variant="secondary" className="w-full">View Details</Button>} />
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{activity.title}</DialogTitle>
              <DialogDescription>
                {activity.category} • {activity.defaultPoints} pts
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
              <p className="whitespace-pre-wrap">{activity.description}</p>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <Calendar className="w-4 h-4" />
                <span>{activity.startDate} → {activity.endDate}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{activity.participantCount} Participants</span>
              </div>
            </div>
            
            {joined && (
              <div className="bg-green-50 text-green-700 border border-green-200 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-md mb-4 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Successfully joined! You're now a participant.</span>
              </div>
            )}

            <DialogFooter>
              {joined || isCompleted ? (
                <Button variant="outline" className="w-full" disabled>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                  {isCompleted ? "Activity Completed" : "Joined!"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleJoin}
                  disabled={isPending || !canJoin}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Activity"
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {joined && (
          <div className="bg-green-50 text-green-700 border border-green-200 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Successfully joined!</span>
          </div>
        )}

        {joined || isCompleted ? (
          <Button variant="outline" className="w-full" disabled>
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            {isCompleted ? "Activity Completed" : "Joined!"}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={isPending || !canJoin}
            id={`join-activity-${activity.id}`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Activity"
            )}
          </Button>
        )}
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
      </CardFooter>
    </Card>
  );
}
