import React from 'react';
import { Package } from 'lucide-react';

const MedicineInventoryTable = ({ medicines, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Medicine Inventory</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Medicine Name</th>
              <th className="px-6 py-4 font-semibold">Stock Level</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Entries</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medicines.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>No medicines found. Add some to get started.</p>
                </td>
              </tr>
            ) : (
              medicines.map((med, index) => {
                const isLow = med.stock < 10;
                const isCritical = med.stock === 0;
                
                return (
                  <tr 
                    key={med.id || index} 
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-700">{med.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {med.stock} <span className="text-slate-400 text-sm font-normal">units</span>
                    </td>
                    <td className="px-6 py-4">
                      {isCritical ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                      {med.entriesCount > 1 ? `Added ${med.entriesCount} times` : 'Added 1 time'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineInventoryTable;
