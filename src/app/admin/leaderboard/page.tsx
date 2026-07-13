'use client';

import React from 'react';
import LeaderboardView from '@/components/leaderboard-view';

export default function AdminLeaderboardPage() {
  return (
    <LeaderboardView isAdmin={true} />
  );
}
