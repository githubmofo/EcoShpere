"use client";

// app/gamification/page.tsx
// Member 3 – Gamification Tab: Challenges, Participation, Badges, Rewards, Leaderboard.

import { useEffect, useState } from "react";
import { useState } from "react";
import { Award, Coins, Trophy, Zap } from "lucide-react";
import PlatformFrame from "@/components/layout/PlatformFrame";
import PillTabs from "@/components/shared/PillTabs";
import { KpiCard } from "@/components/shared/kit";
import { Toaster, toast } from "@/components/feedback/Toaster";
import ChallengesTab from "@/components/gamification/ChallengesTab";
import ParticipationTab from "@/components/gamification/ParticipationTab";
import BadgesTab from "@/components/gamification/BadgesTab";
import RewardsTab from "@/components/gamification/RewardsTab";
import LeaderboardTab from "@/components/gamification/LeaderboardTab";
import * as seed from "@/lib/mock-data";
import { currentUser } from "@/lib/mock-data";
import {
  fetchGamification,
  approveParticipation as apiApprove,
  rejectParticipation as apiReject,
  redeemReward as apiRedeem,
  updateChallengeStatus as apiStatus,
  createChallengeApi,
} from "@/lib/api";
import type {
  Badge,
  Challenge,
  ChallengeParticipation,
  ChallengeStatus,
  LeaderboardEntry,
  Reward,
  RewardRedemption,
} from "@/lib/types";

const STATUS_LABEL: Record<ChallengeStatus, string> = {
  draft: "Draft",
  active: "Active",
  "under-review": "Under Review",
  completed: "Completed",
  archived: "Archived",
};

export default function GamificationPage() {
  const isAdmin = currentUser.role === "Admin";

  const [tab, setTab] = useState("challenges");
  const [challenges, setChallenges] = useState<Challenge[]>(seed.challenges);
  const [participations, setParticipations] = useState<ChallengeParticipation[]>(
    seed.participations
  );
  const [rewards, setRewards] = useState<Reward[]>(seed.rewards);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(
    seed.initialRedemptions
  );
  const [badges, setBadges] = useState<Badge[]>(seed.badges);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(
    seed.leaderboard
  );
  const [xp, setXp] = useState(currentUser.xp);
  const [points, setPoints] = useState(currentUser.points);

  // Load live data from the backend DB (falls back to seed data on error).
  useEffect(() => {
    let active = true;
    fetchGamification()
      .then((d) => {
        if (!active) return;
        setChallenges(d.challenges);
        setParticipations(d.participation);
        setBadges(d.badges);
        setRewards(d.rewards);
        setLeaderboard(d.leaderboard);
        setXp(d.summary.xp);
        setPoints(d.summary.points);
      })
      .catch(() => {
        /* keep seeded mock data */
      });
    return () => {
      active = false;
    };
  }, []);

  const earnedBadges = badges.filter((b) => b.earned).length;
  const activeCount = challenges.filter((c) => c.status === "active").length;
  const pendingCount = participations.filter(
    (p) => p.approvalStatus === "pending"
  ).length;

  function reorder(list: LeaderboardEntry[]) {
    return [...list]
      .sort((a, b) => b.xp - a.xp)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }

  function autoAwardBadges(newXp: number, completed: number) {
    const newly = badges.filter(
      (b) =>
        !b.earned &&
        ((b.unlockType === "xp" && newXp >= b.unlockThreshold) ||
          (b.unlockType === "challenges" && completed >= b.unlockThreshold))
    );
    if (newly.length === 0) return;
    const ids = new Set(newly.map((b) => b.id));
    setBadges((prev) =>
      prev.map((b) =>
        ids.has(b.id) ? { ...b, earned: true, earnedBy: b.earnedBy + 1 } : b
      )
    );
    // Fire toasts in the event handler (not inside the state updater).
    newly.forEach((b) =>
      toast({ title: `🏅 Badge unlocked: ${b.name}`, description: b.criteria })
    );
  }

  function handleJoin(id: string) {
    const c = challenges.find((x) => x.id === id);
    setChallenges((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, participantCount: x.participantCount + 1 } : x
      )
    );
    toast({
      title: "Joined challenge",
      description: c ? `You joined “${c.title}”` : undefined,
    });
  }

  function handleSetStatus(id: string, status: ChallengeStatus) {
    const c = challenges.find((x) => x.id === id);
    setChallenges((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status } : x))
    );
    apiStatus(id, status).catch(() => {});
    toast({
      title: "Challenge updated",
      description: c ? `“${c.title}” → ${STATUS_LABEL[status]}` : undefined,
      variant: "info",
    });
  }

  function handleAddChallenge(data: Omit<Challenge, "id">) {
    setChallenges((prev) => [{ ...data, id: `c-${Date.now()}` }, ...prev]);
    createChallengeApi(data).catch(() => {});
    toast({
      title: "Challenge created",
      description: `“${data.title}” saved as Draft`,
    });
  }

  function handleApprove(id: string) {
    const p = participations.find((x) => x.id === id);
    if (!p) return;
    apiApprove(id).catch(() => {});
    const challenge = challenges.find((c) => c.id === p.challengeId);
    const award = challenge?.xp ?? 100;

    setParticipations((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, approvalStatus: "approved", xpAwarded: award }
          : x
      )
    );
    setLeaderboard((prev) =>
      reorder(prev.map((e) => (e.name === p.employee ? { ...e, xp: e.xp + award } : e)))
    );

    toast({
      title: "Participation approved",
      description: `+${award} XP awarded to ${p.employee}`,
    });

    if (p.employee === currentUser.name) {
      const newXp = xp + award;
      setXp(newXp);
      const completed =
        participations.filter(
          (x) =>
            x.employee === currentUser.name &&
            (x.approvalStatus === "approved" || x.id === id)
        ).length;
      autoAwardBadges(newXp, completed);
    }
  }

  function handleReject(id: string) {
    setParticipations((prev) =>
      prev.map((x) => (x.id === id ? { ...x, approvalStatus: "rejected" } : x))
    );
    apiReject(id).catch(() => {});
    toast({ title: "Participation rejected", variant: "error" });
  }

  function handleRedeem(id: string) {
    const r = rewards.find((x) => x.id === id);
    if (!r) return;
    if (r.stock <= 0) {
      toast({ title: "Out of stock", description: r.name, variant: "error" });
      return;
    }
    if (points < r.pointsCost) {
      toast({
        title: "Not enough points",
        description: `${r.name} costs ${r.pointsCost} pts`,
        variant: "error",
      });
      return;
    }
    setRewards((prev) =>
      prev.map((x) => (x.id === id ? { ...x, stock: x.stock - 1 } : x))
    );
    setPoints((prev) => prev - r.pointsCost);
    setRedemptions((prev) => [
      {
        id: `rd-${Date.now()}`,
        rewardId: r.id,
        rewardName: r.name,
        pointsSpent: r.pointsCost,
        redeemedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    apiRedeem(id).catch(() => {});
    toast({
      title: "Reward redeemed",
      description: `${r.name} · −${r.pointsCost} pts`,
    });
  }

  const tabs = [
    { key: "challenges", label: "Challenges" },
    { key: "participation", label: "Challenge Participation", count: pendingCount },
    { key: "badges", label: "Badges" },
    { key: "rewards", label: "Rewards" },
    { key: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <PlatformFrame>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Gamification</h1>
          <p className="text-sm text-muted-foreground">
            Challenges, badges, rewards &amp; leaderboards to drive ESG
            engagement.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<Zap className="size-4" />}
            label="My XP"
            value={xp.toLocaleString()}
            hint="Earned from challenges"
          />
          <KpiCard
            icon={<Trophy className="size-4" />}
            label="Active Challenges"
            value={activeCount}
            hint={`${challenges.length} total`}
          />
          <KpiCard
            icon={<Award className="size-4" />}
            label="Badges Unlocked"
            value={`${earnedBadges} / ${badges.length}`}
            hint="Auto-awarded by XP rules"
          />
          <KpiCard
            icon={<Coins className="size-4" />}
            label="My Points"
            value={points.toLocaleString()}
            hint="Redeemable for rewards"
          />
        </div>

        <PillTabs tabs={tabs} value={tab} onChange={setTab} />

        {tab === "challenges" && (
          <ChallengesTab
            challenges={challenges}
            badges={badges}
            leaderboard={leaderboard}
            isAdmin={isAdmin}
            onJoin={handleJoin}
            onSetStatus={handleSetStatus}
            onAddChallenge={handleAddChallenge}
          />
        )}
        {tab === "participation" && (
          <ParticipationTab
            participations={participations}
            isAdmin={isAdmin}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
        {tab === "badges" && <BadgesTab badges={badges} />}
        {tab === "rewards" && (
          <RewardsTab
            rewards={rewards}
            points={points}
            redemptions={redemptions}
            onRedeem={handleRedeem}
          />
        )}
        {tab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard} />
        )}
      </div>
      <Toaster />
    </PlatformFrame>
  );
}
