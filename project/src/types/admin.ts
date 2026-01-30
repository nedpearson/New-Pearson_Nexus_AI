export interface User {
  id: string;
  email: string;
  status: 'active' | 'disabled' | 'banned';
  last_login?: string;
  created_at: string;
  tenant_id?: string;
}

export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'trial';
  plan_id?: string;
  domain_restrictions?: string[];
  allowed_email_domains?: string[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  tenant_id?: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  scope: 'global' | 'tenant' | 'user';
  tenant_id?: string;
  user_id?: string;
  rollout_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  features: Record<string, any>;
  limits: Record<string, number>;
  status: 'active' | 'retired';
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

export interface Rule {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  type: 'document_routing' | 'finance_mapping' | 'notification' | 'automation';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConfig {
  id: string;
  tenant_id?: string;
  provider: string;
  name: string;
  config: Record<string, any>;
  status: 'active' | 'disabled' | 'error';
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id?: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Job {
  id: string;
  tenant_id?: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  payload?: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  retries: number;
  max_retries: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface SystemMetrics {
  activeUsers: number;
  totalTenants: number;
  documentsProcessed: number;
  jobsQueued: number;
  jobsRunning: number;
  errorRate: number;
}
