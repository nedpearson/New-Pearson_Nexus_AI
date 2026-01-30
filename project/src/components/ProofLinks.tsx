import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Document } from '../types';
import * as documentStore from '../lib/documentStore';

interface ProofLinksProps {
  entityType: 'bill' | 'transaction' | 'case' | 'task' | 'event' | 'recommendation' | 'asset' | 'liability';
  entityId: string;
}

export function ProofLinks({ entityType, entityId }: ProofLinksProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProofDocuments();
  }, [entityId]);

  const loadProofDocuments = () => {
    try {
      setLoading(true);
      const links = documentStore.getDocumentLinks(entityType, entityId);

      if (links && links.length > 0) {
        const docs: Document[] = [];
        for (const link of links) {
          const doc = documentStore.getDocument(link.document_id);
          if (doc) {
            docs.push(doc);
          }
        }
        setDocuments(docs);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error loading proof documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || documents.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <FileText className="w-4 h-4 text-blue-600" />
      <div className="flex flex-wrap gap-1">
        {documents.map((doc) => (
          <span
            key={doc.id}
            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200"
            title={doc.title}
          >
            📄 {doc.title.length > 20 ? doc.title.substring(0, 20) + '...' : doc.title}
          </span>
        ))}
      </div>
    </div>
  );
}
