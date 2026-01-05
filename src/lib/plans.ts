export interface PlanConfig {
  id: string;
  name: string;
  dbSizeMb: number;
  storageMb: number;
  priceMonthly: number; // kopecks
  timewebPresetId: number;
}

// Upgrade causes brief downtime - DB restarts on new instance
export const UPGRADE_INFO = {
  estimatedDowntimeSeconds: 120, // ~2 min typical
  requiresRestart: true,
  dataPreserved: true,
};

// Static plan definitions - maps to cloud provider presets
export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    dbSizeMb: 500,
    storageMb: 1000,
    priceMonthly: 0,
    timewebPresetId: 1, // smallest preset
  },
  {
    id: "starter",
    name: "Starter",
    dbSizeMb: 5000,
    storageMb: 10000,
    priceMonthly: 99000, // 990 RUB
    timewebPresetId: 2,
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
