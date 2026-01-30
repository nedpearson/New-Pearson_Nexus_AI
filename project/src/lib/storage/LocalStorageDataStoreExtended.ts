import { DataStore } from './interfaces';
import type {
  Document,
  Bill,
  Transaction,
  Task,
  CalendarEvent,
  LegalCase,
  Asset,
  Liability,
  Template,
  PacketDraft,
  FundingOpportunity,
  Packet,
  Binder,
  AttorneyPacket,
  FinancialAdvicePlan,
  EntityDecision,
  QuickBooksConnection,
  QuickBooksSyncSettings,
  CategoryMappingRule
} from '../../types';

const STORAGE_PREFIXES = {
  DOCUMENTS: 'pnx_documents_',
  BILLS: 'pnx_bills_',
  TRANSACTIONS: 'pnx_transactions_',
  TASKS: 'pnx_tasks_',
  EVENTS: 'pnx_events_',
  LEGAL_CASES: 'pnx_legal_cases_',
  ASSETS: 'pnx_assets_',
  LIABILITIES: 'pnx_liabilities_',
  TEMPLATES: 'pnx_templates_',
  PACKET_DRAFTS: 'pnx_packet_drafts_',
  FUNDING_OPPORTUNITIES: 'pnx_funding_opportunities_',
  PACKETS: 'pnx_packets_',
  BINDERS: 'pnx_binders_',
  ATTORNEY_PACKETS: 'pnx_attorney_packets_',
  FINANCIAL_ADVICE_PLANS: 'pnx_financial_advice_plans_',
  ENTITY_DECISIONS: 'pnx_entity_decisions_',
  QB_CONNECTIONS: 'pnx_qb_connections_',
  QB_SYNC_SETTINGS: 'pnx_qb_sync_settings_',
  CATEGORY_MAPPING_RULES: 'pnx_category_mapping_rules_'
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function timestamp(): string {
  return new Date().toISOString();
}

export class LocalStorageDataStoreExtended implements DataStore {
  async get<T>(key: string): Promise<T | null> {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(`Get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async list<T>(prefix: string): Promise<T[]> {
    try {
      const items: T[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            items.push(JSON.parse(value));
          }
        }
      }
      return items;
    } catch (error) {
      console.error(`List error for prefix ${prefix}:`, error);
      return [];
    }
  }

  private async listByOrganization<T extends { organization_id?: string; organizationId?: string }>(
    prefix: string,
    organizationId: string
  ): Promise<T[]> {
    const all = await this.list<T>(prefix);
    return all.filter(item => item.organization_id === organizationId || item.organizationId === organizationId);
  }

  async getDocuments(organizationId: string): Promise<Document[]> {
    return this.listByOrganization<Document>(STORAGE_PREFIXES.DOCUMENTS, organizationId);
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.get<Document>(`${STORAGE_PREFIXES.DOCUMENTS}${id}`);
  }

  async createDocument(doc: Omit<Document, 'id'>): Promise<Document> {
    const id = generateId();
    const document: Document = { ...doc, id };
    await this.set(`${STORAGE_PREFIXES.DOCUMENTS}${id}`, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | null> {
    const doc = await this.getDocument(id);
    if (!doc) return null;
    const updated = { ...doc, ...updates };
    await this.set(`${STORAGE_PREFIXES.DOCUMENTS}${id}`, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.DOCUMENTS}${id}`);
  }

  async getBills(organizationId: string): Promise<Bill[]> {
    return this.listByOrganization(STORAGE_PREFIXES.BILLS, organizationId);
  }

  async getBill(id: string): Promise<Bill | null> {
    return this.get<Bill>(`${STORAGE_PREFIXES.BILLS}${id}`);
  }

  async createBill(bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill> {
    const id = generateId();
    const now = timestamp();
    const newBill: Bill = { ...bill, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.BILLS}${id}`, newBill);
    return newBill;
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    const bill = await this.getBill(id);
    if (!bill) return null;
    const updated = { ...bill, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.BILLS}${id}`, updated);
    return updated;
  }

  async deleteBill(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.BILLS}${id}`);
  }

  async getTransactions(organizationId: string): Promise<Transaction[]> {
    return this.listByOrganization(STORAGE_PREFIXES.TRANSACTIONS, organizationId);
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.get<Transaction>(`${STORAGE_PREFIXES.TRANSACTIONS}${id}`);
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const id = generateId();
    const now = timestamp();
    const newTransaction: Transaction = { ...transaction, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.TRANSACTIONS}${id}`, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const transaction = await this.getTransaction(id);
    if (!transaction) return null;
    const updated = { ...transaction, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.TRANSACTIONS}${id}`, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.TRANSACTIONS}${id}`);
  }

  async getTasks(organizationId: string): Promise<Task[]> {
    return this.listByOrganization(STORAGE_PREFIXES.TASKS, organizationId);
  }

  async getTask(id: string): Promise<Task | null> {
    return this.get<Task>(`${STORAGE_PREFIXES.TASKS}${id}`);
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const id = generateId();
    const now = timestamp();
    const newTask: Task = { ...task, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.TASKS}${id}`, newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const task = await this.getTask(id);
    if (!task) return null;
    const updated = { ...task, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.TASKS}${id}`, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.TASKS}${id}`);
  }

  async getCalendarEvents(organizationId: string): Promise<CalendarEvent[]> {
    return this.listByOrganization(STORAGE_PREFIXES.EVENTS, organizationId);
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | null> {
    return this.get<CalendarEvent>(`${STORAGE_PREFIXES.EVENTS}${id}`);
  }

  async createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    const id = generateId();
    const now = timestamp();
    const newEvent: CalendarEvent = { ...event, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.EVENTS}${id}`, newEvent);
    return newEvent;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const event = await this.getCalendarEvent(id);
    if (!event) return null;
    const updated = { ...event, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.EVENTS}${id}`, updated);
    return updated;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.EVENTS}${id}`);
  }

  async getLegalCases(organizationId: string): Promise<LegalCase[]> {
    return this.listByOrganization(STORAGE_PREFIXES.LEGAL_CASES, organizationId);
  }

  async getLegalCase(id: string): Promise<LegalCase | null> {
    return this.get<LegalCase>(`${STORAGE_PREFIXES.LEGAL_CASES}${id}`);
  }

  async createLegalCase(legalCase: Omit<LegalCase, 'id' | 'created_at' | 'updated_at'>): Promise<LegalCase> {
    const id = generateId();
    const now = timestamp();
    const newCase: LegalCase = { ...legalCase, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.LEGAL_CASES}${id}`, newCase);
    return newCase;
  }

  async updateLegalCase(id: string, updates: Partial<LegalCase>): Promise<LegalCase | null> {
    const legalCase = await this.getLegalCase(id);
    if (!legalCase) return null;
    const updated = { ...legalCase, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.LEGAL_CASES}${id}`, updated);
    return updated;
  }

  async deleteLegalCase(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.LEGAL_CASES}${id}`);
  }

  async getAssets(organizationId: string): Promise<Asset[]> {
    return this.listByOrganization(STORAGE_PREFIXES.ASSETS, organizationId);
  }

  async getAsset(id: string): Promise<Asset | null> {
    return this.get<Asset>(`${STORAGE_PREFIXES.ASSETS}${id}`);
  }

  async createAsset(asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>): Promise<Asset> {
    const id = generateId();
    const now = timestamp();
    const newAsset: Asset = { ...asset, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.ASSETS}${id}`, newAsset);
    return newAsset;
  }

  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset | null> {
    const asset = await this.getAsset(id);
    if (!asset) return null;
    const updated = { ...asset, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.ASSETS}${id}`, updated);
    return updated;
  }

  async deleteAsset(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.ASSETS}${id}`);
  }

  async getLiabilities(organizationId: string): Promise<Liability[]> {
    return this.listByOrganization(STORAGE_PREFIXES.LIABILITIES, organizationId);
  }

  async getLiability(id: string): Promise<Liability | null> {
    return this.get<Liability>(`${STORAGE_PREFIXES.LIABILITIES}${id}`);
  }

  async createLiability(liability: Omit<Liability, 'id' | 'created_at' | 'updated_at'>): Promise<Liability> {
    const id = generateId();
    const now = timestamp();
    const newLiability: Liability = { ...liability, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.LIABILITIES}${id}`, newLiability);
    return newLiability;
  }

  async updateLiability(id: string, updates: Partial<Liability>): Promise<Liability | null> {
    const liability = await this.getLiability(id);
    if (!liability) return null;
    const updated = { ...liability, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.LIABILITIES}${id}`, updated);
    return updated;
  }

  async deleteLiability(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.LIABILITIES}${id}`);
  }

  async getTemplates(): Promise<Template[]> {
    return this.list(STORAGE_PREFIXES.TEMPLATES);
  }

  async getTemplate(id: string): Promise<Template | null> {
    return this.get<Template>(`${STORAGE_PREFIXES.TEMPLATES}${id}`);
  }

  async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const id = generateId();
    const now = timestamp();
    const newTemplate: Template = { ...template, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.TEMPLATES}${id}`, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null> {
    const template = await this.getTemplate(id);
    if (!template) return null;
    const updated = { ...template, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.TEMPLATES}${id}`, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.TEMPLATES}${id}`);
  }

  async getPacketDrafts(organizationId: string): Promise<PacketDraft[]> {
    return this.listByOrganization(STORAGE_PREFIXES.PACKET_DRAFTS, organizationId);
  }

  async getPacketDraft(id: string): Promise<PacketDraft | null> {
    return this.get<PacketDraft>(`${STORAGE_PREFIXES.PACKET_DRAFTS}${id}`);
  }

  async createPacketDraft(draft: Omit<PacketDraft, 'id' | 'created_at' | 'updated_at'>): Promise<PacketDraft> {
    const id = generateId();
    const now = timestamp();
    const newDraft: PacketDraft = { ...draft, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.PACKET_DRAFTS}${id}`, newDraft);
    return newDraft;
  }

  async updatePacketDraft(id: string, updates: Partial<PacketDraft>): Promise<PacketDraft | null> {
    const draft = await this.getPacketDraft(id);
    if (!draft) return null;
    const updated = { ...draft, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.PACKET_DRAFTS}${id}`, updated);
    return updated;
  }

  async deletePacketDraft(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.PACKET_DRAFTS}${id}`);
  }

  async getFundingOpportunities(organizationId: string): Promise<FundingOpportunity[]> {
    return this.listByOrganization(STORAGE_PREFIXES.FUNDING_OPPORTUNITIES, organizationId);
  }

  async getFundingOpportunity(id: string): Promise<FundingOpportunity | null> {
    return this.get<FundingOpportunity>(`${STORAGE_PREFIXES.FUNDING_OPPORTUNITIES}${id}`);
  }

  async createFundingOpportunity(opportunity: Omit<FundingOpportunity, 'id' | 'created_at' | 'updated_at'>): Promise<FundingOpportunity> {
    const id = generateId();
    const now = timestamp();
    const newOpportunity: FundingOpportunity = { ...opportunity, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.FUNDING_OPPORTUNITIES}${id}`, newOpportunity);
    return newOpportunity;
  }

  async updateFundingOpportunity(id: string, updates: Partial<FundingOpportunity>): Promise<FundingOpportunity | null> {
    const opportunity = await this.getFundingOpportunity(id);
    if (!opportunity) return null;
    const updated = { ...opportunity, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.FUNDING_OPPORTUNITIES}${id}`, updated);
    return updated;
  }

  async deleteFundingOpportunity(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.FUNDING_OPPORTUNITIES}${id}`);
  }

  async getPackets(organizationId: string): Promise<Packet[]> {
    return this.listByOrganization(STORAGE_PREFIXES.PACKETS, organizationId);
  }

  async getPacket(id: string): Promise<Packet | null> {
    return this.get<Packet>(`${STORAGE_PREFIXES.PACKETS}${id}`);
  }

  async createPacket(packet: Omit<Packet, 'id' | 'created_at' | 'updated_at'>): Promise<Packet> {
    const id = generateId();
    const now = timestamp();
    const newPacket: Packet = { ...packet, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.PACKETS}${id}`, newPacket);
    return newPacket;
  }

  async updatePacket(id: string, updates: Partial<Packet>): Promise<Packet | null> {
    const packet = await this.getPacket(id);
    if (!packet) return null;
    const updated = { ...packet, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.PACKETS}${id}`, updated);
    return updated;
  }

  async deletePacket(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.PACKETS}${id}`);
  }

  async getBinders(organizationId: string): Promise<Binder[]> {
    return this.listByOrganization(STORAGE_PREFIXES.BINDERS, organizationId);
  }

  async getBinder(id: string): Promise<Binder | null> {
    return this.get<Binder>(`${STORAGE_PREFIXES.BINDERS}${id}`);
  }

  async createBinder(binder: Omit<Binder, 'id' | 'created_at'>): Promise<Binder> {
    const id = generateId();
    const newBinder: Binder = { ...binder, id, created_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.BINDERS}${id}`, newBinder);
    return newBinder;
  }

  async updateBinder(id: string, updates: Partial<Binder>): Promise<Binder | null> {
    const binder = await this.getBinder(id);
    if (!binder) return null;
    const updated = { ...binder, ...updates };
    await this.set(`${STORAGE_PREFIXES.BINDERS}${id}`, updated);
    return updated;
  }

  async deleteBinder(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.BINDERS}${id}`);
  }

  async getAttorneyPackets(organizationId: string): Promise<AttorneyPacket[]> {
    return this.listByOrganization(STORAGE_PREFIXES.ATTORNEY_PACKETS, organizationId);
  }

  async getAttorneyPacket(id: string): Promise<AttorneyPacket | null> {
    return this.get<AttorneyPacket>(`${STORAGE_PREFIXES.ATTORNEY_PACKETS}${id}`);
  }

  async createAttorneyPacket(packet: Omit<AttorneyPacket, 'id' | 'created_at' | 'updated_at'>): Promise<AttorneyPacket> {
    const id = generateId();
    const now = timestamp();
    const newPacket: AttorneyPacket = { ...packet, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.ATTORNEY_PACKETS}${id}`, newPacket);
    return newPacket;
  }

  async updateAttorneyPacket(id: string, updates: Partial<AttorneyPacket>): Promise<AttorneyPacket | null> {
    const packet = await this.getAttorneyPacket(id);
    if (!packet) return null;
    const updated = { ...packet, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.ATTORNEY_PACKETS}${id}`, updated);
    return updated;
  }

  async deleteAttorneyPacket(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.ATTORNEY_PACKETS}${id}`);
  }

  async getFinancialAdvicePlans(organizationId: string): Promise<FinancialAdvicePlan[]> {
    return this.listByOrganization(STORAGE_PREFIXES.FINANCIAL_ADVICE_PLANS, organizationId);
  }

  async getFinancialAdvicePlan(id: string): Promise<FinancialAdvicePlan | null> {
    return this.get<FinancialAdvicePlan>(`${STORAGE_PREFIXES.FINANCIAL_ADVICE_PLANS}${id}`);
  }

  async createFinancialAdvicePlan(plan: Omit<FinancialAdvicePlan, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialAdvicePlan> {
    const id = generateId();
    const now = timestamp();
    const newPlan: FinancialAdvicePlan = { ...plan, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.FINANCIAL_ADVICE_PLANS}${id}`, newPlan);
    return newPlan;
  }

  async updateFinancialAdvicePlan(id: string, updates: Partial<FinancialAdvicePlan>): Promise<FinancialAdvicePlan | null> {
    const plan = await this.getFinancialAdvicePlan(id);
    if (!plan) return null;
    const updated = { ...plan, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.FINANCIAL_ADVICE_PLANS}${id}`, updated);
    return updated;
  }

  async deleteFinancialAdvicePlan(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.FINANCIAL_ADVICE_PLANS}${id}`);
  }

  async getEntityDecisions(organizationId: string): Promise<EntityDecision[]> {
    return this.listByOrganization(STORAGE_PREFIXES.ENTITY_DECISIONS, organizationId);
  }

  async getEntityDecision(id: string): Promise<EntityDecision | null> {
    return this.get<EntityDecision>(`${STORAGE_PREFIXES.ENTITY_DECISIONS}${id}`);
  }

  async createEntityDecision(decision: Omit<EntityDecision, 'id' | 'created_at' | 'updated_at'>): Promise<EntityDecision> {
    const id = generateId();
    const now = timestamp();
    const newDecision: EntityDecision = { ...decision, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.ENTITY_DECISIONS}${id}`, newDecision);
    return newDecision;
  }

  async updateEntityDecision(id: string, updates: Partial<EntityDecision>): Promise<EntityDecision | null> {
    const decision = await this.getEntityDecision(id);
    if (!decision) return null;
    const updated = { ...decision, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.ENTITY_DECISIONS}${id}`, updated);
    return updated;
  }

  async deleteEntityDecision(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.ENTITY_DECISIONS}${id}`);
  }

  async getQuickBooksConnection(organizationId: string): Promise<QuickBooksConnection | null> {
    return this.get<QuickBooksConnection>(`${STORAGE_PREFIXES.QB_CONNECTIONS}${organizationId}`);
  }

  async updateQuickBooksConnection(organizationId: string, connection: Partial<QuickBooksConnection>): Promise<QuickBooksConnection> {
    const existing = await this.getQuickBooksConnection(organizationId);
    const updated: QuickBooksConnection = {
      id: existing?.id || generateId(),
      organization_id: organizationId,
      connected: false,
      status: 'disconnected',
      ...existing,
      ...connection
    };
    await this.set(`${STORAGE_PREFIXES.QB_CONNECTIONS}${organizationId}`, updated);
    return updated;
  }

  async getQuickBooksSyncSettings(organizationId: string): Promise<QuickBooksSyncSettings | null> {
    return this.get<QuickBooksSyncSettings>(`${STORAGE_PREFIXES.QB_SYNC_SETTINGS}${organizationId}`);
  }

  async updateQuickBooksSyncSettings(organizationId: string, settings: Partial<QuickBooksSyncSettings>): Promise<QuickBooksSyncSettings> {
    const existing = await this.getQuickBooksSyncSettings(organizationId);
    const updated: QuickBooksSyncSettings = {
      id: existing?.id || generateId(),
      organization_id: organizationId,
      sync_accounts: true,
      sync_categories: true,
      sync_vendors: true,
      sync_customers: true,
      sync_invoices: true,
      sync_bills: true,
      auto_sync: false,
      sync_frequency: 'manual',
      last_updated: timestamp(),
      ...existing,
      ...settings
    };
    await this.set(`${STORAGE_PREFIXES.QB_SYNC_SETTINGS}${organizationId}`, updated);
    return updated;
  }

  async getCategoryMappingRules(organizationId: string): Promise<CategoryMappingRule[]> {
    return this.listByOrganization(STORAGE_PREFIXES.CATEGORY_MAPPING_RULES, organizationId);
  }

  async createCategoryMappingRule(rule: Omit<CategoryMappingRule, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryMappingRule> {
    const id = generateId();
    const now = timestamp();
    const newRule: CategoryMappingRule = { ...rule, id, created_at: now, updated_at: now };
    await this.set(`${STORAGE_PREFIXES.CATEGORY_MAPPING_RULES}${id}`, newRule);
    return newRule;
  }

  async updateCategoryMappingRule(id: string, updates: Partial<CategoryMappingRule>): Promise<CategoryMappingRule | null> {
    const rule = await this.get<CategoryMappingRule>(`${STORAGE_PREFIXES.CATEGORY_MAPPING_RULES}${id}`);
    if (!rule) return null;
    const updated = { ...rule, ...updates, updated_at: timestamp() };
    await this.set(`${STORAGE_PREFIXES.CATEGORY_MAPPING_RULES}${id}`, updated);
    return updated;
  }

  async deleteCategoryMappingRule(id: string): Promise<void> {
    await this.delete(`${STORAGE_PREFIXES.CATEGORY_MAPPING_RULES}${id}`);
  }
}

export const extendedDataStore = new LocalStorageDataStoreExtended();
