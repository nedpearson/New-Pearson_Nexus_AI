import { describe, it, expect, beforeEach, vi } from 'vitest';
import { routeDocument } from '../routeDocument';
import type { NormalizedExtraction, IngestContext, RoutingDecision } from '../../types';

// Mock dependencies
vi.mock('../loadTaxonomy', () => ({
  loadTaxonomy: () => ({
    categories: [
      { id: 'business.invoices', folderPath: '/business/invoices' },
      { id: 'business.receipts', folderPath: '/business/receipts' },
      { id: 'business.contracts', folderPath: '/business/contracts' },
      { id: 'personal.medical', folderPath: '/personal/medical' },
      { id: 'personal.insurance', folderPath: '/personal/insurance' },
      { id: 'personal.legal', folderPath: '/personal/legal' },
      { id: 'personal.utilities', folderPath: '/personal/utilities' },
      { id: 'voice.notes', folderPath: '/voice/notes' },
      { id: 'inbox', folderPath: '/inbox' },
      { id: 'needs_review', folderPath: '/needs_review' },
    ]
  }),
  getCategoryById: (taxonomy: any, id: string) => {
    return taxonomy.categories.find((c: any) => c.id === id);
  }
}));

vi.mock('../../utils/confidence', () => ({
  DEFAULT_DOC_GATE: 0.90,
  needsReview: (confidence: number, gate: number) => confidence < gate
}));

describe('routeDocument', () => {
  let ctx: IngestContext;

  beforeEach(() => {
    ctx = {
      userId: 'user-123',
      source: 'web',
      filename: 'test.pdf',
      mimeType: 'application/pdf'
    };
  });

  function createExtraction(overrides: Partial<NormalizedExtraction> = {}): NormalizedExtraction {
    return {
      text: '',
      pages: [],
      tables: [],
      keyValues: [],
      entities: [],
      docType: { name: 'unknown', confidence: 0.95 },
      confidence: 0.95,
      providerMeta: {},
      ...overrides
    };
  }

  describe('DocType-driven routing (high confidence)', () => {
    it('should route invoice to business.invoices', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('business.invoices');
      expect(result.folderPath).toBe('/business/invoices');
      expect(result.tags).toContain('invoice');
      expect(result.sensitivity).toBe('internal');
      expect(result.needsReview).toBe(false);
      expect(result.reasons).toContain('docType=invoice');
    });

    it('should route receipt to business.receipts', () => {
      const extraction = createExtraction({
        docType: { name: 'receipt', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('business.receipts');
      expect(result.tags).toContain('receipt');
      expect(result.sensitivity).toBe('internal');
    });

    it('should route contract to business.contracts with confidential sensitivity', () => {
      const extraction = createExtraction({
        docType: { name: 'contract', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('business.contracts');
      expect(result.tags).toContain('contract');
      expect(result.sensitivity).toBe('confidential');
    });

    it('should route medical documents to personal.medical with restricted sensitivity', () => {
      const extraction = createExtraction({
        docType: { name: 'medical', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('personal.medical');
      expect(result.tags).toContain('medical');
      expect(result.sensitivity).toBe('restricted');
    });

    it('should route insurance documents with confidential sensitivity', () => {
      const extraction = createExtraction({
        docType: { name: 'insurance', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('personal.insurance');
      expect(result.tags).toContain('insurance');
      expect(result.sensitivity).toBe('confidential');
    });

    it('should route legal documents with confidential sensitivity', () => {
      const extraction = createExtraction({
        docType: { name: 'legal', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('personal.legal');
      expect(result.tags).toContain('legal');
      expect(result.sensitivity).toBe('confidential');
    });

    it('should handle compound docType names containing keywords', () => {
      const extraction = createExtraction({
        docType: { name: 'tax_invoice', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('business.invoices');
    });
  });

  describe('Low confidence handling', () => {
    it('should route to needs_review when docType confidence is low', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.85 }, // Below 0.90 threshold
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('needs_review');
      expect(result.folderPath).toBe('/needs_review');
      expect(result.needsReview).toBe(true);
      expect(result.tags).toContain('needs_review');
      expect(result.reasons.some(r => r.includes('docType confidence low'))).toBe(true);
    });

    it('should route to needs_review when overall confidence is low', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.95 },
        confidence: 0.85 // Below 0.90 threshold
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('needs_review');
      expect(result.needsReview).toBe(true);
    });

    it('should set confidence to minimum of overall and docType confidence', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.92 },
        confidence: 0.98
      });

      const result = routeDocument(extraction, ctx);

      expect(result.confidence).toBe(0.92); // Min of 0.92 and 0.98
    });

    it('should route to needs_review even with high confidence docType if overall is low', () => {
      const extraction = createExtraction({
        docType: { name: 'contract', confidence: 0.95 },
        confidence: 0.80
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('needs_review');
      expect(result.needsReview).toBe(true);
    });
  });

  describe('Entity-driven routing (secondary)', () => {
    it('should route to utilities when vendor entity contains "electric"', () => {
      const extraction = createExtraction({
        docType: { name: 'unknown', confidence: 0.50 }, // Low docType confidence
        confidence: 0.95,
        entities: [
          { type: 'vendor', value: 'Electric Company', confidence: 0.9 }
        ]
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('personal.utilities');
      expect(result.tags).toContain('utilities');
      expect(result.tags).toContain('electric');
      expect(result.reasons.some(r => r.includes('vendor contains electric'))).toBe(true);
    });

    it('should route to inbox when amount detected but docType unknown', () => {
      const extraction = createExtraction({
        docType: { name: 'unknown', confidence: 0.50 },
        confidence: 0.95,
        entities: [
          { type: 'amount', value: '$123.45', confidence: 0.9 }
        ]
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('inbox');
      expect(result.tags).toContain('amount_detected');
    });

    it('should not use entity routing when overall confidence is low', () => {
      const extraction = createExtraction({
        docType: { name: 'unknown', confidence: 0.50 },
        confidence: 0.85, // Below threshold
        entities: [
          { type: 'vendor', value: 'Electric Company', confidence: 0.9 }
        ]
      });

      const result = routeDocument(extraction, ctx);

      // Should fall back to inbox, not use entity routing
      expect(result.categoryId).toBe('needs_review');
      expect(result.reasons.some(r => r.includes('overall extraction confidence low'))).toBe(true);
    });

    it('should prefer docType routing over entity routing when both available', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.95 },
        confidence: 0.95,
        entities: [
          { type: 'vendor', value: 'Electric Company', confidence: 0.9 }
        ]
      });

      const result = routeDocument(extraction, ctx);

      // Should use docType (invoice) not entity (utilities)
      expect(result.categoryId).toBe('business.invoices');
      expect(result.reasons).toContain('docType=invoice');
    });
  });

  describe('Source-aware fallback routing', () => {
    it('should route voice sources to voice.notes as fallback', () => {
      const voiceCtx: IngestContext = {
        ...ctx,
        source: 'voice'
      };

      const extraction = createExtraction({
        docType: { name: 'unknown', confidence: 0.50 },
        confidence: 0.95,
        entities: []
      });

      const result = routeDocument(extraction, voiceCtx);

      expect(result.categoryId).toBe('voice.notes');
      expect(result.tags).toContain('voice');
      expect(result.reasons.some(r => r.includes('fallback voice route'))).toBe(true);
    });

    it('should route unknown documents to inbox as fallback', () => {
      const extraction = createExtraction({
        docType: { name: 'unknown', confidence: 0.50 },
        confidence: 0.95,
        entities: []
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('inbox');
      expect(result.tags).toContain('unclassified');
      expect(result.reasons.some(r => r.includes('fallback inbox route'))).toBe(true);
    });

    it('should route inbox items to needs_review', () => {
      const extraction = createExtraction({
        docType: { name: 'unknown', confidence: 0.95 },
        confidence: 0.95,
        entities: []
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('needs_review');
      expect(result.needsReview).toBe(true);
    });
  });

  describe('Tags and metadata', () => {
    it('should deduplicate tags', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.95 },
        confidence: 0.85 // Will add needs_review tag
      });

      const result = routeDocument(extraction, ctx);

      const uniqueTags = Array.from(new Set(result.tags));
      expect(result.tags.length).toBe(uniqueTags.length);
    });

    it('should include multiple tags from routing logic', () => {
      const extraction = createExtraction({
        docType: { name: 'legal', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.tags).toContain('legal');
      expect(result.tags.length).toBeGreaterThan(0);
    });

    it('should always include reasons for debugging', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.reasons).toBeDefined();
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should set retention policy to default', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.95 },
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.retentionPolicy).toBe('default');
    });
  });

  describe('Sensitivity levels', () => {
    it('should set internal sensitivity for invoices and receipts', () => {
      const invoice = createExtraction({ docType: { name: 'invoice', confidence: 0.95 }, confidence: 0.95 });
      const receipt = createExtraction({ docType: { name: 'receipt', confidence: 0.95 }, confidence: 0.95 });

      expect(routeDocument(invoice, ctx).sensitivity).toBe('internal');
      expect(routeDocument(receipt, ctx).sensitivity).toBe('internal');
    });

    it('should set confidential sensitivity for contracts, legal, and insurance', () => {
      const contract = createExtraction({ docType: { name: 'contract', confidence: 0.95 }, confidence: 0.95 });
      const legal = createExtraction({ docType: { name: 'legal', confidence: 0.95 }, confidence: 0.95 });
      const insurance = createExtraction({ docType: { name: 'insurance', confidence: 0.95 }, confidence: 0.95 });

      expect(routeDocument(contract, ctx).sensitivity).toBe('confidential');
      expect(routeDocument(legal, ctx).sensitivity).toBe('confidential');
      expect(routeDocument(insurance, ctx).sensitivity).toBe('confidential');
    });

    it('should set restricted sensitivity for medical documents', () => {
      const medical = createExtraction({ docType: { name: 'medical', confidence: 0.95 }, confidence: 0.95 });

      expect(routeDocument(medical, ctx).sensitivity).toBe('restricted');
    });

    it('should default to internal sensitivity for fallback routes', () => {
      const unknown = createExtraction({ docType: { name: 'unknown', confidence: 0.95 }, confidence: 0.95 });

      const result = routeDocument(unknown, ctx);
      expect(result.sensitivity).toBe('internal');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle document with multiple entities correctly', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.95 },
        confidence: 0.95,
        entities: [
          { type: 'vendor', value: 'ABC Corp', confidence: 0.9 },
          { type: 'amount', value: '$500.00', confidence: 0.9 },
          { type: 'date', value: '2024-01-15', confidence: 0.9 }
        ]
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('business.invoices');
      expect(result.needsReview).toBe(false);
    });

    it('should handle edge case where confidence is exactly at threshold', () => {
      const extraction = createExtraction({
        docType: { name: 'invoice', confidence: 0.90 }, // Exactly at threshold
        confidence: 0.90
      });

      const result = routeDocument(extraction, ctx);

      // Should NOT need review at threshold
      expect(result.needsReview).toBe(false);
      expect(result.categoryId).toBe('business.invoices');
    });

    it('should prioritize needsReview routing over normal routing', () => {
      const extraction = createExtraction({
        docType: { name: 'medical', confidence: 0.80 }, // Low confidence
        confidence: 0.95
      });

      const result = routeDocument(extraction, ctx);

      expect(result.categoryId).toBe('needs_review');
      expect(result.needsReview).toBe(true);
      // Original routing information should still be in tags/reasons
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should handle different upload sources appropriately', () => {
      const sources: Array<'web' | 'mobile' | 'email' | 'api' | 'voice'> = ['web', 'mobile', 'email', 'api'];

      sources.forEach(source => {
        const sourceCtx: IngestContext = { ...ctx, source };
        const extraction = createExtraction({
          docType: { name: 'invoice', confidence: 0.95 },
          confidence: 0.95
        });

        const result = routeDocument(extraction, sourceCtx);

        // All non-voice sources with valid docType should route the same
        expect(result.categoryId).toBe('business.invoices');
      });
    });
  });
});
