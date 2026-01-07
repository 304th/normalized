export type PoolType = "free" | "starter";

export interface PlanConfig {
  id: string;
  name: string;
  dbSizeMb: number;
  storageMb: number;
  priceMonthly: number; // kopecks
  timewebPresetId: number;
  isShared?: boolean;
  poolType?: PoolType; // Which shared cluster pool to use
}

// Upgrade causes brief downtime - DB restarts on new instance
export const UPGRADE_INFO = {
  estimatedDowntimeSeconds: 120, // ~2 min typical
  requiresRestart: true,
  dataPreserved: true,
};

// Shared cluster pool configs
export const POOL_CONFIG = {
  free: { maxDatabases: 300, presetId: 2 },    // 64MB × 300 = 19.2GB on 20GB cluster
  starter: { maxDatabases: 4, presetId: 2 },   // 5GB × 4 = 20GB on 20GB cluster
} as const;

// Static plan definitions - maps to cloud provider presets
export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    dbSizeMb: 64,
    storageMb: 256,
    priceMonthly: 0,
    timewebPresetId: 2,
    isShared: true,
    poolType: "free",
  },
  {
    id: "starter",
    name: "Starter",
    dbSizeMb: 5000,
    storageMb: 10000,
    priceMonthly: 99000, // 990 RUB
    timewebPresetId: 2,
    isShared: true,
    poolType: "starter",
  },
  {
    id: "pro",
    name: "Pro",
    dbSizeMb: 20000,
    storageMb: 50000,
    priceMonthly: 299000, // 2990 RUB
    timewebPresetId: 3,
  },
  {
    id: "business",
    name: "Business",
    dbSizeMb: 100000,
    storageMb: 200000,
    priceMonthly: 999000, // 9990 RUB
    timewebPresetId: 4,
  },
];

export function getPlan(planId: string): PlanConfig | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function canUpgrade(currentPlanId: string, newPlanId: string): boolean {
  const currentIdx = PLANS.findIndex((p) => p.id === currentPlanId);
  const newIdx = PLANS.findIndex((p) => p.id === newPlanId);
  return newIdx > currentIdx;
}
