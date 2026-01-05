export interface DatabaseCredentials {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  connectionUrl: string;
}

export interface DatabaseConfig {
  name: string;
  region: string;
  presetId?: number;
}

export interface ProvisionResult {
  externalId: string;
  status: ProvisionStatus;
  credentials?: DatabaseCredentials;
}

export type ProvisionStatus =
  | "pending"
  | "provisioning"
  | "ready"
  | "error"
  | "upgrading"
  | "deleting"
  | "deleted";

export interface Plan {
  id: string;
  name: string;
  dbSizeMb: number;
  storageMb: number;
  presetId: number; // maps to cloud provider preset
  priceMonthly: number; // in kopecks/cents
}

export interface UpgradeInfo {
  estimatedDowntimeSeconds: number;
  requiresRestart: boolean;
  dataPreserved: boolean;
}

export interface CloudProvider {
  readonly name: string;

  /** Available plans/presets */
  getPlans(region: string): Promise<Plan[]>;

  createDatabase(projectId: string, config: DatabaseConfig): Promise<ProvisionResult>;

  /** Resize/upgrade database to new preset - data preserved */
  resizeDatabase(externalId: string, newPresetId: number): Promise<ProvisionStatus>;

  deleteDatabase(externalId: string): Promise<void>;

  getDatabaseStatus(externalId: string): Promise<ProvisionStatus>;

  getDatabaseCredentials(externalId: string): Promise<DatabaseCredentials | null>;
}
