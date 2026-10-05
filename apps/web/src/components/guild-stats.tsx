"use client";

import { useI18n } from "@/i18n/provider";
import { StatCard } from "./stat-card";
import { TrafficChart } from "./traffic-chart";

const UP = [4, 6, 5, 8, 7, 11, 9, 13, 12, 16];
const DOWN = [14, 12, 13, 10, 11, 8, 9, 7, 8, 6];

export function GuildStats() {
  const { t } = useI18n();
  const s = t.stats;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={s.joinedMembers} value="1,250" delta="+12.8%" trend="up" headline={s.joinsUp} caption={s.last6} spark={UP} />
        <StatCard title={s.joinedStaff} value="250" delta="+4.3%" trend="up" headline={s.staffJoinsUp} caption={s.last6} spark={UP} />
        <StatCard title={s.leftMembers} value="500" delta="3.8%" trend="down" headline={s.membersLeft} caption={s.last6} spark={DOWN} />
        <StatCard title={s.leftStaff} value="100" delta="1.1%" trend="down" headline={s.staffLeft} caption={s.last6} spark={DOWN} />
      </div>
      <TrafficChart title={s.memberTraffic} seed={7} defaultRange="m1" />
      <TrafficChart title={s.staffTraffic} seed={21} defaultRange="m3" />
    </>
  );
}
