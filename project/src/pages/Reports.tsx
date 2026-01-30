import { FileText, Download, Calendar, Filter, TrendingUp } from 'lucide-react';

export function Reports() {
  const reports = [
    {
      id: 1,
      title: 'Forensic Legal Report',
      description: 'Comprehensive evidence summary with timeline',
      case: 'Smith v. Smith',
      lastGenerated: '2024-01-15',
      type: 'forensic'
    },
    {
      id: 2,
      title: 'Legal Summary Export',
      description: 'Case overview with key documents',
      case: 'Custody Matter - Davis',
      lastGenerated: '2024-01-10',
      type: 'summary'
    },
    {
      id: 3,
      title: 'Financial Analysis',
      description: 'Transaction and asset tracking report',
      case: 'Estate Planning - Johnson',
      lastGenerated: '2024-01-05',
      type: 'financial'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and export forensic legal reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Total Reports</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{reports.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">This Month</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">3</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800">Active Cases</span>
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">2</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">New Report</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {report.case}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.lastGenerated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Report Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Evidence Timeline</h4>
            <p className="text-sm text-gray-600">Chronological evidence listing</p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Violation Summary</h4>
            <p className="text-sm text-gray-600">Tagged violations with details</p>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Document Bundle</h4>
            <p className="text-sm text-gray-600">Export all case documents</p>
          </div>
        </div>
      </div>
    </div>
  );
}
