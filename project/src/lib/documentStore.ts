import { Document, DocumentLink } from '../types';

const STORAGE_KEY = 'pnx_documents';
const LINKS_KEY = 'pnx_document_links';

export function listDocuments(organizationId: string): Document[] {
  try {
    if (!localStorage?.getItem) return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const allDocs = JSON.parse(stored) as Document[];
    return Array.isArray(allDocs) ? allDocs.filter(doc => doc.organizationId === organizationId) : [];
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
}

export function getDocument(id: string): Document | null {
  try {
    if (!localStorage?.getItem) return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const allDocs = JSON.parse(stored) as Document[];
    return Array.isArray(allDocs) ? (allDocs.find(doc => doc.id === id) || null) : null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

export function addDocument(doc: Document): void {
  try {
    if (!localStorage?.getItem || !localStorage?.setItem) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const allDocs = stored ? JSON.parse(stored) as Document[] : [];

    if (Array.isArray(allDocs)) {
      allDocs.push(doc);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
    }
  } catch (error) {
    console.error('Error adding document:', error);
  }
}

export function updateDocument(id: string, patch: Partial<Document>): void {
  try {
    if (!localStorage?.getItem || !localStorage?.setItem) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allDocs = JSON.parse(stored) as Document[];
    if (!Array.isArray(allDocs)) return;

    const index = allDocs.findIndex(doc => doc.id === id);

    if (index !== -1) {
      allDocs[index] = { ...allDocs[index], ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
    }
  } catch (error) {
    console.error('Error updating document:', error);
  }
}

export function deleteDocument(id: string): void {
  try {
    if (!localStorage?.getItem || !localStorage?.setItem) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allDocs = JSON.parse(stored) as Document[];
    if (!Array.isArray(allDocs)) return;

    const filtered = allDocs.filter(doc => doc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting document:', error);
  }
}

export function getDocumentLinks(entityType: string, entityId: string): DocumentLink[] {
  try {
    if (!localStorage?.getItem) return [];
    const stored = localStorage.getItem(LINKS_KEY);
    if (!stored) return [];

    const allLinks = JSON.parse(stored) as DocumentLink[];
    return Array.isArray(allLinks) ? allLinks.filter(link =>
      link.linked_entity_type === entityType && link.linked_entity_id === entityId
    ) : [];
  } catch (error) {
    console.error('Error loading document links:', error);
    return [];
  }
}

export function addDocumentLink(link: DocumentLink): void {
  try {
    if (!localStorage?.getItem || !localStorage?.setItem) return;
    const stored = localStorage.getItem(LINKS_KEY);
    const allLinks = stored ? JSON.parse(stored) as DocumentLink[] : [];

    if (Array.isArray(allLinks)) {
      allLinks.push(link);
      localStorage.setItem(LINKS_KEY, JSON.stringify(allLinks));
    }
  } catch (error) {
    console.error('Error adding document link:', error);
  }
}

export function deleteDocumentLink(linkId: string): void {
  try {
    if (!localStorage?.getItem || !localStorage?.setItem) return;
    const stored = localStorage.getItem(LINKS_KEY);
    if (!stored) return;

    const allLinks = JSON.parse(stored) as DocumentLink[];
    if (!Array.isArray(allLinks)) return;

    const filtered = allLinks.filter(link => link.id !== linkId);
    localStorage.setItem(LINKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting document link:', error);
  }
}
