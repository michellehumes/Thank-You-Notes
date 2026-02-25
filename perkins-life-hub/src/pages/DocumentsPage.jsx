import { useState } from 'react';
import Card from '../components/Card';
import { FolderOpen, FileText, ExternalLink, Upload } from 'lucide-react';

const CATEGORIES = [
  { id: 'insurance', label: 'Insurance Documents', icon: FileText },
  { id: 'tax', label: 'Tax Documents', icon: FileText },
  { id: 'legal', label: 'Legal Documents', icon: FileText },
  { id: 'medical', label: 'Medical Records', icon: FileText },
  { id: 'warranty', label: 'Warranties', icon: FileText },
  { id: 'financial', label: 'Financial Documents', icon: FileText },
  { id: 'property', label: 'Property Documents', icon: FileText },
];

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-900">Document Vault</h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-[12px] rounded hover:bg-neutral-50 transition-colors">
          <Upload size={14} /> Upload Document
        </button>
      </div>
      <p className="text-[13px] text-neutral-500 mb-4">Connect Google Drive in Settings to auto-index your documents. Currently showing local document categories.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)} className={`text-left border rounded-lg p-4 transition-colors ${selectedCategory === cat.id ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
            <div className="flex items-center gap-3">
              <FolderOpen size={20} className="text-neutral-400" />
              <div>
                <p className="text-[13px] font-medium text-neutral-800">{cat.label}</p>
                <p className="text-[11px] text-neutral-500">Connect Google Drive to populate</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {selectedCategory && (
        <Card title={CATEGORIES.find((c) => c.id === selectedCategory)?.label} className="mt-4">
          <div className="text-center py-8">
            <FolderOpen size={32} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-[13px] text-neutral-500">No documents indexed yet</p>
            <p className="text-[11px] text-neutral-400 mt-1">Connect Google Drive in Settings to auto-index files</p>
          </div>
        </Card>
      )}
    </div>
  );
}
