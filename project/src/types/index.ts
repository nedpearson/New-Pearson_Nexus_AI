export type UserRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  category: string;
  subcategory?: string;
  summary: string;
  status: 'Needs Review' | 'Approved';
  tags: string[];
  organizationId: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export interface Bill {
  id: string;
  organization_id: string;
  title: string;
  payee: string;
  amount: number;
  due_date: string;
  frequency?: string;
  status: 'upcoming' | 'paid' | 'overdue';
  category: string;
  recurring: boolean;
  recurring_frequency?: string;
  payment_url?: string;
  notes: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  organization_id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method?: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  linked_bill_id?: string;
  linked_case_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  end_time?: string;
  location?: string;
  notes: string;
  event_type: 'meeting' | 'appointment' | 'deadline' | 'reminder' | 'other';
  all_day: boolean;
  source_bill_id?: string;
  source_case_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalCase {
  id: string;
  organization_id: string;
  title: string;
  case_type: 'personal' | 'divorce' | 'custody' | 'estate' | 'business' | 'other';
  status: 'active' | 'pending' | 'closed';
  description: string;
  attorney_name?: string;
  attorney_contact?: string;
  court_info?: string;
  case_number?: string;
  filing_date?: string;
  next_hearing_date?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  title: string;
  type: 'savings' | 'opportunity' | 'alert';
  explanation: string;
  status: 'new' | 'viewed' | 'accepted' | 'dismissed';
  organizationId: string;
}

export interface DocumentLink {
  id: string;
  document_id: string;
  linked_entity_type: 'bill' | 'transaction' | 'case' | 'task' | 'event' | 'recommendation' | 'asset' | 'liability';
  linked_entity_id: string;
  created_at: string;
}

export interface Asset {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  value: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface Liability {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  value: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  fields: TemplateField[];
  evidence_checklist: string[];
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required: boolean;
  prefill_source?: 'profile' | 'financial' | 'document';
  prefill_path?: string;
  options?: string[];
  value?: string | number;
}

export interface Template {
  id: string;
  name: string;
  type: 'loan' | 'grant' | 'tax_credit';
  description: string;
  sections: TemplateSection[];
  created_at: string;
  updated_at: string;
}

export interface PacketDraft {
  id: string;
  organization_id: string;
  template_id: string;
  template_name: string;
  template_type: string;
  data: Record<string, any>;
  attached_documents: string[];
  evidence_checklist: Record<string, boolean>;
  status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface QuickBooksConnection {
  id: string;
  organization_id: string;
  connected: boolean;
  company_name?: string;
  realm_id?: string;
  connected_at?: string;
  last_sync?: string;
  status: 'connected' | 'disconnected' | 'error';
  error_message?: string;
}

export interface QuickBooksSyncSettings {
  id: string;
  organization_id: string;
  sync_accounts: boolean;
  sync_categories: boolean;
  sync_vendors: boolean;
  sync_customers: boolean;
  sync_invoices: boolean;
  sync_bills: boolean;
  auto_sync: boolean;
  sync_frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
  last_updated: string;
}

export interface QuickBooksAccount {
  id: string;
  qb_id: string;
  name: string;
  type: string;
  balance: number;
  active: boolean;
  sync_enabled: boolean;
}

export interface QuickBooksCategory {
  id: string;
  qb_id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id?: string;
  sync_enabled: boolean;
}

export interface QuickBooksVendor {
  id: string;
  qb_id: string;
  name: string;
  email?: string;
  phone?: string;
  balance: number;
  sync_enabled: boolean;
}

export interface CategoryMappingRule {
  id: string;
  organization_id: string;
  qb_category_id: string;
  qb_category_name: string;
  local_category: string;
  auto_apply: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuickBooksTransaction {
  id: string;
  qb_id: string;
  type: 'invoice' | 'bill' | 'payment' | 'expense';
  date: string;
  amount: number;
  vendor?: string;
  customer?: string;
  category?: string;
  account?: string;
  description: string;
  status: 'synced' | 'pending' | 'error';
  reconciled: boolean;
}

export interface FundingOpportunity {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  provider: string;
  amount_min: number;
  amount_max: number;
  deadline: string;
  category: 'grant' | 'loan' | 'equity' | 'prize' | 'tax_credit';
  status: 'new' | 'in_progress' | 'submitted' | 'won' | 'lost';
  match_score: number;
  created_at: string;
  updated_at: string;
}

export interface OpportunityQualification {
  id: string;
  opportunity_id: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  supporting_factors: string[];
}

export interface OpportunityCitation {
  id: string;
  opportunity_id: string;
  text: string;
  source: string;
  document_id?: string;
  verified: boolean;
}

export interface OpportunityAssumption {
  id: string;
  opportunity_id: string;
  assumption: string;
  risk_level: 'low' | 'medium' | 'high';
  missing_data?: string;
}

export interface OpportunityEvidence {
  id: string;
  opportunity_id: string;
  requirement: string;
  status: 'missing' | 'partial' | 'complete';
  documents: string[];
  notes?: string;
}

export interface OpportunitySubmission {
  id: string;
  opportunity_id: string;
  platform: string;
  url: string;
  deadline: string;
  submitted_at?: string;
}

export interface PacketField {
  id: string;
  label: string;
  value: string;
  source: 'profile' | 'financial' | 'document' | 'manual';
  source_id?: string;
}

export interface Packet {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  template_type: string;
  version: number;
  fields: PacketField[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface BinderSection {
  id: string;
  title: string;
  page_number: number;
  items: BinderItem[];
}

export interface BinderItem {
  id: string;
  title: string;
  type: 'document' | 'packet' | 'financial' | 'evidence';
  reference_id?: string;
  page_number: number;
  description?: string;
}

export interface Binder {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  sections: BinderSection[];
  table_of_contents: string[];
  evidence_index: string[];
  created_at: string;
  created_by: string;
}

export interface AttorneyRiskFlag {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  mitigation?: string;
}

export interface AttorneyCitation {
  id: string;
  type: 'statute' | 'regulation' | 'case_law' | 'irs_guidance';
  reference: string;
  description: string;
  url?: string;
}

export interface AttorneyAssumption {
  id: string;
  description: string;
  verification_required: boolean;
  source?: string;
}

export interface EvidenceChecklistItem {
  id: string;
  item: string;
  required: boolean;
  collected: boolean;
  document_id?: string;
  notes?: string;
}

export interface AttorneyPacket {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  category: 'tax_credit' | 'deduction' | 'exemption' | 'compliance' | 'audit_defense' | 'planning';
  status: 'needs_review' | 'ready_to_export';
  rationale: string;
  citations: AttorneyCitation[];
  assumptions: AttorneyAssumption[];
  risk_flags: AttorneyRiskFlag[];
  evidence_checklist: EvidenceChecklistItem[];
  estimated_benefit?: string;
  confidence_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  created_by: string;
}

export interface FinancialRiskFlag {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  mitigation?: string;
}

export interface FinancialCitation {
  id: string;
  type: 'article' | 'regulation' | 'guide' | 'best_practice';
  reference: string;
  description: string;
  url?: string;
}

export interface FinancialAssumption {
  id: string;
  description: string;
  verification_required: boolean;
  source?: string;
}

export interface ActionChecklistItem {
  id: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  deadline?: string;
  notes?: string;
}

export interface FinancialAdvicePlan {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  category: 'savings' | 'investment' | 'debt_management' | 'insurance' | 'retirement' | 'tax_optimization';
  status: 'draft' | 'active' | 'completed';
  rationale: string;
  citations: FinancialCitation[];
  assumptions: FinancialAssumption[];
  risk_flags: FinancialRiskFlag[];
  action_checklist: ActionChecklistItem[];
  estimated_savings?: string;
  timeframe?: string;
  confidence_level: 'low' | 'medium' | 'high';
  template_url?: string;
  submission_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export type EntityType = 'LLC' | 'S-Corp' | 'C-Corp';

export interface EntityComparison {
  type: EntityType;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  taxTreatment: string;
  complexity: 'Low' | 'Medium' | 'High';
  cost: 'Low' | 'Medium' | 'High';
}

export interface StateStrategy {
  state: string;
  code: string;
  filingFee: string;
  annualFee: string;
  taxRate: string;
  pros: string[];
  cons: string[];
  popularity: number;
}

export interface EntityDecisionRisk {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface EntityDecisionAssumption {
  id: string;
  description: string;
  verification_required: boolean;
}

export interface EntityDecisionResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'irs' | 'state' | 'legal' | 'guide' | 'form';
}

export interface EntityDecision {
  id: string;
  organization_id: string;
  name: string;
  business_description: string;
  annual_revenue: string;
  num_owners: number;
  state: string;
  recommended_entity: EntityType;
  recommended_state: string;
  rationale: string;
  assumptions: EntityDecisionAssumption[];
  risks: EntityDecisionRisk[];
  resources: EntityDecisionResource[];
  tax_implications: string;
  next_steps: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}
