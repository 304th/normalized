import { PLANS, UPGRADE_INFO } from "@/lib/plans";
import { NextResponse } from "next/server";

export async function GET() {
  // Return plans without internal preset IDs
  const plans = PLANS.map(({ timewebPresetId, ...plan }) => plan);
  return NextResponse.json({
    plans,
    upgradeInfo: UPGRADE_INFO,
  });
}
