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

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  name?: string;
  organization_id: string;
  isDemo: boolean;
  faceRecognitionEnabled?: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'basic' | 'professional' | 'business';
  created_at: string;
}

export interface Session {
  user: User;
  organization: Organization;
  token: string;
  expiresAt: number;
}

export interface AuthStore {
  signUp(email: string, password: string, name?: string): Promise<{ user: User; organization: Organization } | null>;
  /**
   * Sign in.
   * - rememberMe=true: should create/refresh a long-lived session (e.g., refresh token)
   * - rememberMe=false: should create a short-lived session that does not persist across browser restarts
   */
  signIn(email: string, password: string, rememberMe?: boolean): Promise<{ user: User; organization: Organization } | null>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<User | null>;
  /**
   * Request a password reset email/link. Implementations should avoid user enumeration.
   */
  requestPasswordReset?(email: string): Promise<void>;
  /**
   * Complete a password reset. Not currently used by UI but provided for completeness in server mode.
   */
  resetPassword?(token: string, newPassword: string): Promise<void>;
  seedDefaultUser?(): Promise<void>;
  resetAllData?(): Promise<void>;
}

export interface DataStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list<T>(prefix: string): Promise<T[]>;

  getDocuments(organizationId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;
  createDocument(doc: Omit<Document, 'id'>): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | null>;
  deleteDocument(id: string): Promise<void>;

  getBills(organizationId: string): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | null>;
  createBill(bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill>;
  updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null>;
  deleteBill(id: string): Promise<void>;

  getTransactions(organizationId: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | null>;
  createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null>;
  deleteTransaction(id: string): Promise<void>;

  getTasks(organizationId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<void>;

  getCalendarEvents(organizationId: string): Promise<CalendarEvent[]>;
  getCalendarEvent(id: string): Promise<CalendarEvent | null>;
  createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
  deleteCalendarEvent(id: string): Promise<void>;

  getLegalCases(organizationId: string): Promise<LegalCase[]>;
  getLegalCase(id: string): Promise<LegalCase | null>;
  createLegalCase(legalCase: Omit<LegalCase, 'id' | 'created_at' | 'updated_at'>): Promise<LegalCase>;
  updateLegalCase(id: string, updates: Partial<LegalCase>): Promise<LegalCase | null>;
  deleteLegalCase(id: string): Promise<void>;

  getAssets(organizationId: string): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | null>;
  createAsset(asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>): Promise<Asset>;
  updateAsset(id: string, updates: Partial<Asset>): Promise<Asset | null>;
  deleteAsset(id: string): Promise<void>;

  getLiabilities(organizationId: string): Promise<Liability[]>;
  getLiability(id: string): Promise<Liability | null>;
  createLiability(liability: Omit<Liability, 'id' | 'created_at' | 'updated_at'>): Promise<Liability>;
  updateLiability(id: string, updates: Partial<Liability>): Promise<Liability | null>;
  deleteLiability(id: string): Promise<void>;

  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | null>;
  createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template>;
  updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null>;
  deleteTemplate(id: string): Promise<void>;

  getPacketDrafts(organizationId: string): Promise<PacketDraft[]>;
  getPacketDraft(id: string): Promise<PacketDraft | null>;
  createPacketDraft(draft: Omit<PacketDraft, 'id' | 'created_at' | 'updated_at'>): Promise<PacketDraft>;
  updatePacketDraft(id: string, updates: Partial<PacketDraft>): Promise<PacketDraft | null>;
  deletePacketDraft(id: string): Promise<void>;

  getFundingOpportunities(organizationId: string): Promise<FundingOpportunity[]>;
  getFundingOpportunity(id: string): Promise<FundingOpportunity | null>;
  createFundingOpportunity(opportunity: Omit<FundingOpportunity, 'id' | 'created_at' | 'updated_at'>): Promise<FundingOpportunity>;
  updateFundingOpportunity(id: string, updates: Partial<FundingOpportunity>): Promise<FundingOpportunity | null>;
  deleteFundingOpportunity(id: string): Promise<void>;

  getPackets(organizationId: string): Promise<Packet[]>;
  getPacket(id: string): Promise<Packet | null>;
  createPacket(packet: Omit<Packet, 'id' | 'created_at' | 'updated_at'>): Promise<Packet>;
  updatePacket(id: string, updates: Partial<Packet>): Promise<Packet | null>;
  deletePacket(id: string): Promise<void>;

  getBinders(organizationId: string): Promise<Binder[]>;
  getBinder(id: string): Promise<Binder | null>;
  createBinder(binder: Omit<Binder, 'id' | 'created_at'>): Promise<Binder>;
  updateBinder(id: string, updates: Partial<Binder>): Promise<Binder | null>;
  deleteBinder(id: string): Promise<void>;

  getAttorneyPackets(organizationId: string): Promise<AttorneyPacket[]>;
  getAttorneyPacket(id: string): Promise<AttorneyPacket | null>;
  createAttorneyPacket(packet: Omit<AttorneyPacket, 'id' | 'created_at' | 'updated_at'>): Promise<AttorneyPacket>;
  updateAttorneyPacket(id: string, updates: Partial<AttorneyPacket>): Promise<AttorneyPacket | null>;
  deleteAttorneyPacket(id: string): Promise<void>;

  getFinancialAdvicePlans(organizationId: string): Promise<FinancialAdvicePlan[]>;
  getFinancialAdvicePlan(id: string): Promise<FinancialAdvicePlan | null>;
  createFinancialAdvicePlan(plan: Omit<FinancialAdvicePlan, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialAdvicePlan>;
  updateFinancialAdvicePlan(id: string, updates: Partial<FinancialAdvicePlan>): Promise<FinancialAdvicePlan | null>;
  deleteFinancialAdvicePlan(id: string): Promise<void>;

  getEntityDecisions(organizationId: string): Promise<EntityDecision[]>;
  getEntityDecision(id: string): Promise<EntityDecision | null>;
  createEntityDecision(decision: Omit<EntityDecision, 'id' | 'created_at' | 'updated_at'>): Promise<EntityDecision>;
  updateEntityDecision(id: string, updates: Partial<EntityDecision>): Promise<EntityDecision | null>;
  deleteEntityDecision(id: string): Promise<void>;

  getQuickBooksConnection(organizationId: string): Promise<QuickBooksConnection | null>;
  updateQuickBooksConnection(organizationId: string, connection: Partial<QuickBooksConnection>): Promise<QuickBooksConnection>;

  getQuickBooksSyncSettings(organizationId: string): Promise<QuickBooksSyncSettings | null>;
  updateQuickBooksSyncSettings(organizationId: string, settings: Partial<QuickBooksSyncSettings>): Promise<QuickBooksSyncSettings>;

  getCategoryMappingRules(organizationId: string): Promise<CategoryMappingRule[]>;
  createCategoryMappingRule(rule: Omit<CategoryMappingRule, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryMappingRule>;
  updateCategoryMappingRule(id: string, updates: Partial<CategoryMappingRule>): Promise<CategoryMappingRule | null>;
  deleteCategoryMappingRule(id: string): Promise<void>;
}
