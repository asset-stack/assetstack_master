import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';

const PAGES = [
  'Building Cover Page', 'Defects', 'Total Costs Summary', 'Program by Room',
  'Program by Asset Type', '20yr Forward Works Plan', 'FWP by Area of Facility',
  'Matrices', 'Condition Summary', 'Condition Change', 'Asset Summary',
  'LOS Summary', 'First Instance of Replacement/Repair',
];

export default function P01_Homepage({ assessment, onNavigate }) {
  return (
    <div className="grid grid-cols-12 gap-8 min-h-[800px]">
      {/* Left column: title + meta */}
      <div className="col-span-7 flex flex-col justify-between">
        <div>
          {assessment?.partner_logo_url ? (
            <img src={assessment.partner_logo_url} alt="" className="h-14 object-contain mb-12" />
          ) : (
            <div className="h-14 mb-12 flex items-center text-2xl font-bold text-indigo-600">AssetStack</div>
          )}
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Building Condition Assessment {assessment?.assessment_year || new Date().getFullYear()}
          </h1>
          <div className="mt-6 space-y-1">
            <div className="text-lg text-slate-700">{assessment?.location_name || 'Facility'}</div>
            <div className="text-sm text-slate-500">Condition Assessment and Forward Works Plan</div>
          </div>
          {(assessment?.assessor_name || assessment?.assessor_company) && (
            <div className="mt-10 pt-6 border-t border-slate-100">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Prepared by</div>
              <div className="text-sm font-semibold text-slate-800 mt-0.5">{assessment?.assessor_company || '—'}</div>
              <div className="text-xs text-slate-500">{assessment?.assessor_name || ''}</div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: navigation tiles (Power BI style) */}
      <div className="col-span-3 flex flex-col justify-center">
        <div className="bg-slate-900 text-white text-center py-2 text-sm font-semibold rounded-t-md">Contents</div>
        <div className="border border-slate-200 border-t-0 rounded-b-md overflow-hidden">
          {PAGES.map((name, i) => (
            <button
              key={i}
              onClick={() => onNavigate(i + 1)}
              className="w-full flex items-center justify-between py-2 px-3 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-t border-slate-100 transition-colors group"
            >
              <span>{name}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {/* Right column: cover image + client logo */}
      <div className="col-span-2 flex flex-col justify-between">
        {assessment?.client_logo_url ? (
          <img src={assessment.client_logo_url} alt="" className="h-20 object-contain self-end" />
        ) : (
          <div className="h-20 self-end flex items-center justify-end text-xs text-slate-400">No logo</div>
        )}
        {assessment?.cover_image_url ? (
          <img
            src={assessment.cover_image_url}
            alt=""
            className="w-full h-64 object-cover rounded-md shadow-lg"
          />
        ) : (
          <div className="w-full h-64 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
            <Building2 className="w-16 h-16 text-slate-300" />
          </div>
        )}
      </div>
    </div>
  );
}