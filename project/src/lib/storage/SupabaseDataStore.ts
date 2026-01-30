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

function notImplemented(method: string): never {
  const error = new Error(
    `SupabaseDataStore.${method}() is not yet implemented.\n` +
    `This application is configured for 100% local-first operation.\n` +
    `Set VITE_DATASTORE=local in .env to use localStorage.`
  );
  console.error(error);
  throw error;
}

export class SupabaseDataStore implements DataStore {
  async get<T>(_key: string): Promise<T | null> {
    notImplemented('get');
  }

  async set<T>(_key: string, _value: T): Promise<void> {
    notImplemented('set');
  }

  async delete(_key: string): Promise<void> {
    notImplemented('delete');
  }

  async list<T>(_prefix: string): Promise<T[]> {
    notImplemented('list');
  }

  async getDocuments(_organizationId: string): Promise<Document[]> {
    notImplemented('getDocuments');
  }

  async getDocument(_id: string): Promise<Document | null> {
    notImplemented('getDocument');
  }

  async createDocument(_doc: Omit<Document, 'id'>): Promise<Document> {
    notImplemented('createDocument');
  }

  async updateDocument(_id: string, _updates: Partial<Document>): Promise<Document | null> {
    notImplemented('updateDocument');
  }

  async deleteDocument(_id: string): Promise<void> {
    notImplemented('deleteDocument');
  }

  async getBills(_organizationId: string): Promise<Bill[]> {
    notImplemented('getBills');
  }

  async getBill(_id: string): Promise<Bill | null> {
    notImplemented('getBill');
  }

  async createBill(_bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill> {
    notImplemented('createBill');
  }

  async updateBill(_id: string, _updates: Partial<Bill>): Promise<Bill | null> {
    notImplemented('updateBill');
  }

  async deleteBill(_id: string): Promise<void> {
    notImplemented('deleteBill');
  }

  async getTransactions(_organizationId: string): Promise<Transaction[]> {
    notImplemented('getTransactions');
  }

  async getTransaction(_id: string): Promise<Transaction | null> {
    notImplemented('getTransaction');
  }

  async createTransaction(_transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    notImplemented('createTransaction');
  }

  async updateTransaction(_id: string, _updates: Partial<Transaction>): Promise<Transaction | null> {
    notImplemented('updateTransaction');
  }

  async deleteTransaction(_id: string): Promise<void> {
    notImplemented('deleteTransaction');
  }

  async getTasks(_organizationId: string): Promise<Task[]> {
    notImplemented('getTasks');
  }

  async getTask(_id: string): Promise<Task | null> {
    notImplemented('getTask');
  }

  async createTask(_task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    notImplemented('createTask');
  }

  async updateTask(_id: string, _updates: Partial<Task>): Promise<Task | null> {
    notImplemented('updateTask');
  }

  async deleteTask(_id: string): Promise<void> {
    notImplemented('deleteTask');
  }

  async getCalendarEvents(_organizationId: string): Promise<CalendarEvent[]> {
    notImplemented('getCalendarEvents');
  }

  async getCalendarEvent(_id: string): Promise<CalendarEvent | null> {
    notImplemented('getCalendarEvent');
  }

  async createCalendarEvent(_event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    notImplemented('createCalendarEvent');
  }

  async updateCalendarEvent(_id: string, _updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    notImplemented('updateCalendarEvent');
  }

  async deleteCalendarEvent(_id: string): Promise<void> {
    notImplemented('deleteCalendarEvent');
  }

  async getLegalCases(_organizationId: string): Promise<LegalCase[]> {
    notImplemented('getLegalCases');
  }

  async getLegalCase(_id: string): Promise<LegalCase | null> {
    notImplemented('getLegalCase');
  }

  async createLegalCase(_legalCase: Omit<LegalCase, 'id' | 'created_at' | 'updated_at'>): Promise<LegalCase> {
    notImplemented('createLegalCase');
  }

  async updateLegalCase(_id: string, _updates: Partial<LegalCase>): Promise<LegalCase | null> {
    notImplemented('updateLegalCase');
  }

  async deleteLegalCase(_id: string): Promise<void> {
    notImplemented('deleteLegalCase');
  }

  async getAssets(_organizationId: string): Promise<Asset[]> {
    notImplemented('getAssets');
  }

  async getAsset(_id: string): Promise<Asset | null> {
    notImplemented('getAsset');
  }

  async createAsset(_asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>): Promise<Asset> {
    notImplemented('createAsset');
  }

  async updateAsset(_id: string, _updates: Partial<Asset>): Promise<Asset | null> {
    notImplemented('updateAsset');
  }

  async deleteAsset(_id: string): Promise<void> {
    notImplemented('deleteAsset');
  }

  async getLiabilities(_organizationId: string): Promise<Liability[]> {
    notImplemented('getLiabilities');
  }

  async getLiability(_id: string): Promise<Liability | null> {
    notImplemented('getLiability');
  }

  async createLiability(_liability: Omit<Liability, 'id' | 'created_at' | 'updated_at'>): Promise<Liability> {
    notImplemented('createLiability');
  }

  async updateLiability(_id: string, _updates: Partial<Liability>): Promise<Liability | null> {
    notImplemented('updateLiability');
  }

  async deleteLiability(_id: string): Promise<void> {
    notImplemented('deleteLiability');
  }

  async getTemplates(): Promise<Template[]> {
    notImplemented('getTemplates');
  }

  async getTemplate(_id: string): Promise<Template | null> {
    notImplemented('getTemplate');
  }

  async createTemplate(_template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    notImplemented('createTemplate');
  }

  async updateTemplate(_id: string, _updates: Partial<Template>): Promise<Template | null> {
    notImplemented('updateTemplate');
  }

  async deleteTemplate(_id: string): Promise<void> {
    notImplemented('deleteTemplate');
  }

  async getPacketDrafts(_organizationId: string): Promise<PacketDraft[]> {
    notImplemented('getPacketDrafts');
  }

  async getPacketDraft(_id: string): Promise<PacketDraft | null> {
    notImplemented('getPacketDraft');
  }

  async createPacketDraft(_draft: Omit<PacketDraft, 'id' | 'created_at' | 'updated_at'>): Promise<PacketDraft> {
    notImplemented('createPacketDraft');
  }

  async updatePacketDraft(_id: string, _updates: Partial<PacketDraft>): Promise<PacketDraft | null> {
    notImplemented('updatePacketDraft');
  }

  async deletePacketDraft(_id: string): Promise<void> {
    notImplemented('deletePacketDraft');
  }

  async getFundingOpportunities(_organizationId: string): Promise<FundingOpportunity[]> {
    notImplemented('getFundingOpportunities');
  }

  async getFundingOpportunity(_id: string): Promise<FundingOpportunity | null> {
    notImplemented('getFundingOpportunity');
  }

  async createFundingOpportunity(_opportunity: Omit<FundingOpportunity, 'id' | 'created_at' | 'updated_at'>): Promise<FundingOpportunity> {
    notImplemented('createFundingOpportunity');
  }

  async updateFundingOpportunity(_id: string, _updates: Partial<FundingOpportunity>): Promise<FundingOpportunity | null> {
    notImplemented('updateFundingOpportunity');
  }

  async deleteFundingOpportunity(_id: string): Promise<void> {
    notImplemented('deleteFundingOpportunity');
  }

  async getPackets(_organizationId: string): Promise<Packet[]> {
    notImplemented('getPackets');
  }

  async getPacket(_id: string): Promise<Packet | null> {
    notImplemented('getPacket');
  }

  async createPacket(_packet: Omit<Packet, 'id' | 'created_at' | 'updated_at'>): Promise<Packet> {
    notImplemented('createPacket');
  }

  async updatePacket(_id: string, _updates: Partial<Packet>): Promise<Packet | null> {
    notImplemented('updatePacket');
  }

  async deletePacket(_id: string): Promise<void> {
    notImplemented('deletePacket');
  }

  async getBinders(_organizationId: string): Promise<Binder[]> {
    notImplemented('getBinders');
  }

  async getBinder(_id: string): Promise<Binder | null> {
    notImplemented('getBinder');
  }

  async createBinder(_binder: Omit<Binder, 'id' | 'created_at'>): Promise<Binder> {
    notImplemented('createBinder');
  }

  async updateBinder(_id: string, _updates: Partial<Binder>): Promise<Binder | null> {
    notImplemented('updateBinder');
  }

  async deleteBinder(_id: string): Promise<void> {
    notImplemented('deleteBinder');
  }

  async getAttorneyPackets(_organizationId: string): Promise<AttorneyPacket[]> {
    notImplemented('getAttorneyPackets');
  }

  async getAttorneyPacket(_id: string): Promise<AttorneyPacket | null> {
    notImplemented('getAttorneyPacket');
  }

  async createAttorneyPacket(_packet: Omit<AttorneyPacket, 'id' | 'created_at' | 'updated_at'>): Promise<AttorneyPacket> {
    notImplemented('createAttorneyPacket');
  }

  async updateAttorneyPacket(_id: string, _updates: Partial<AttorneyPacket>): Promise<AttorneyPacket | null> {
    notImplemented('updateAttorneyPacket');
  }

  async deleteAttorneyPacket(_id: string): Promise<void> {
    notImplemented('deleteAttorneyPacket');
  }

  async getFinancialAdvicePlans(_organizationId: string): Promise<FinancialAdvicePlan[]> {
    notImplemented('getFinancialAdvicePlans');
  }

  async getFinancialAdvicePlan(_id: string): Promise<FinancialAdvicePlan | null> {
    notImplemented('getFinancialAdvicePlan');
  }

  async createFinancialAdvicePlan(_plan: Omit<FinancialAdvicePlan, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialAdvicePlan> {
    notImplemented('createFinancialAdvicePlan');
  }

  async updateFinancialAdvicePlan(_id: string, _updates: Partial<FinancialAdvicePlan>): Promise<FinancialAdvicePlan | null> {
    notImplemented('updateFinancialAdvicePlan');
  }

  async deleteFinancialAdvicePlan(_id: string): Promise<void> {
    notImplemented('deleteFinancialAdvicePlan');
  }

  async getEntityDecisions(_organizationId: string): Promise<EntityDecision[]> {
    notImplemented('getEntityDecisions');
  }

  async getEntityDecision(_id: string): Promise<EntityDecision | null> {
    notImplemented('getEntityDecision');
  }

  async createEntityDecision(_decision: Omit<EntityDecision, 'id' | 'created_at' | 'updated_at'>): Promise<EntityDecision> {
    notImplemented('createEntityDecision');
  }

  async updateEntityDecision(_id: string, _updates: Partial<EntityDecision>): Promise<EntityDecision | null> {
    notImplemented('updateEntityDecision');
  }

  async deleteEntityDecision(_id: string): Promise<void> {
    notImplemented('deleteEntityDecision');
  }

  async getQuickBooksConnection(_organizationId: string): Promise<QuickBooksConnection | null> {
    notImplemented('getQuickBooksConnection');
  }

  async updateQuickBooksConnection(_organizationId: string, _connection: Partial<QuickBooksConnection>): Promise<QuickBooksConnection> {
    notImplemented('updateQuickBooksConnection');
  }

  async getQuickBooksSyncSettings(_organizationId: string): Promise<QuickBooksSyncSettings | null> {
    notImplemented('getQuickBooksSyncSettings');
  }

  async updateQuickBooksSyncSettings(_organizationId: string, _settings: Partial<QuickBooksSyncSettings>): Promise<QuickBooksSyncSettings> {
    notImplemented('updateQuickBooksSyncSettings');
  }

  async getCategoryMappingRules(_organizationId: string): Promise<CategoryMappingRule[]> {
    notImplemented('getCategoryMappingRules');
  }

  async createCategoryMappingRule(_rule: Omit<CategoryMappingRule, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryMappingRule> {
    notImplemented('createCategoryMappingRule');
  }

  async updateCategoryMappingRule(_id: string, _updates: Partial<CategoryMappingRule>): Promise<CategoryMappingRule | null> {
    notImplemented('updateCategoryMappingRule');
  }

  async deleteCategoryMappingRule(_id: string): Promise<void> {
    notImplemented('deleteCategoryMappingRule');
  }
}
