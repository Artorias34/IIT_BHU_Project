import React, { useState, useEffect, useRef } from 'react';
import { db, storage, auth } from '../../firebase';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  Upload, FileText, Trash2, Eye, Download, Search, 
  Calendar, X, Filter, Plus, Image, File
} from 'lucide-react';

const MedicalReports = ({ selectedMember }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [yearFilter, setYearFilter] = useState('all');
  const [previewReport, setPreviewReport] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchReports = async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'medicalReports'),
        where('category', '==', selectedMember.name)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedMember]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !reportDate || !file) return alert('Please fill required fields and select a file');
    
    setUploading(true);
    try {
      const userId = auth.currentUser?.uid || 'anonymous';
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `reports/${userId}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'medicalReports'), {
        title,
        reportDate: reportDate,
        doctorName: doctorName || '',
        notes: notes || '',
        fileName: file.name,
        fileType: file.type,
        fileURL: downloadURL,
        storagePath: `reports/${userId}/${fileName}`,
        category: selectedMember.name,
        userId,
        createdAt: Timestamp.now(),
      });

      // Reset form
      setTitle('');
      setReportDate('');
      setDoctorName('');
      setNotes('');
      setFile(null);
      setShowUploadForm(false);
      fetchReports();
    } catch (error) {
      alert('Error uploading report: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (report) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      if (report.storagePath) {
        const storageRef = ref(storage, report.storagePath);
        await deleteObject(storageRef).catch(() => {});
      }
      await deleteDoc(doc(db, 'medicalReports', report.id));
      fetchReports();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  };

  // Filtering & sorting
  const filteredReports = reports
    .filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.doctorName && r.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesYear = yearFilter === 'all' || r.reportDate?.startsWith(yearFilter);
      return matchesSearch && matchesYear;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return (b.reportDate || '').localeCompare(a.reportDate || '');
      return (a.reportDate || '').localeCompare(b.reportDate || '');
    });

  const years = [...new Set(reports.map(r => r.reportDate?.split('-')[0]).filter(Boolean))].sort().reverse();

  const isImage = (type) => type && type.startsWith('image/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Medical Reports</h2>
          <p className="text-slate-500 mt-1 text-sm">Store and organize your prescriptions & reports</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-200 flex items-center space-x-2"
        >
          {showUploadForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showUploadForm ? 'Cancel' : 'Upload Report'}</span>
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in fade-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Upload New Report</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Blood Test Results"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Date *</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={e => setReportDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sharma"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Any additional notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
            
            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={e => setFile(e.target.files[0])}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  {isImage(file.type) ? <Image className="w-8 h-8 text-blue-500" /> : <File className="w-8 h-8 text-red-500" />}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, or PDF</p>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {uploading ? 'Uploading...' : 'Save Report'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
        >
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 font-medium">Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reports found</p>
          <p className="text-sm text-slate-400 mt-1">Upload your first report to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredReports.map(report => (
            <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
              {/* Thumbnail */}
              <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                {isImage(report.fileType) ? (
                  <img src={report.fileURL} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-red-400 mx-auto" />
                    <p className="text-xs text-slate-400 mt-1">PDF Document</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="font-semibold text-slate-800 truncate">{report.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">{report.reportDate}</span>
                </div>
                {report.doctorName && (
                  <p className="text-xs text-slate-500 mt-1">Dr. {report.doctorName}</p>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setPreviewReport(report)}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <a
                    href={report.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => handleDelete(report)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewReport(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{previewReport.title}</h3>
                <p className="text-sm text-slate-500">{previewReport.reportDate} {previewReport.doctorName && `• Dr. ${previewReport.doctorName}`}</p>
              </div>
              <button onClick={() => setPreviewReport(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              {isImage(previewReport.fileType) ? (
                <img src={previewReport.fileURL} alt={previewReport.title} className="w-full rounded-xl" />
              ) : (
                <iframe src={previewReport.fileURL} title={previewReport.title} className="w-full h-[70vh] rounded-xl border border-slate-200" />
              )}
              {previewReport.notes && (
                <p className="mt-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">{previewReport.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReports;
