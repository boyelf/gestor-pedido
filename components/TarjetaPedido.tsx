import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Check, Settings } from 'lucide-react'

const TarjetaPedido: React.FC = () => {
  return (
    <Card className="max-w-md w-full overflow-hidden">
      {/* Header Image Section */}
      <div className="relative h-48 w-full bg-slate-200 dark:bg-slate-800">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLzvcZ9GxkbR7-kXqbrWjAPazddNXJ29fH-sKpuWuZcV43C6qnHXkmvyZlIMjXCwnp6krH1pEvsaN7Pkal7McbyW-UlTz1VD5hGrqZx7HNu4LCNqUJLSJ57TOGJ2vYRSu7yuWuuvGV9Pp9cBUT_3pTGKaeEDSdmPke0GJ6fFLENMXUFcgxzV-pjlheI5ievXXePiz9ApQKocp1azRcQxK3TF-7hG-sT8qT5NPaSU2J9VJGKjMlxABdl3zkPYDFwpdvozsbYjrGmEBv')"
          }}
        />
        <div className="absolute top-4 right-4">
          <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            En proceso
          </span>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6">
        {/* Order ID & Messenger Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">Pedido #82934</h2>
            <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-lg">person</span>
              <p className="text-sm font-medium">Mensajero: Carlos Rodríguez</p>
            </div>
          </div>
          <div className="bg-primary/10 p-2 rounded-lg">
            <span className="material-symbols-outlined text-primary"><Settings /></span>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-0 relative">
          {/* Timeline Line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-slate-100 dark:bg-slate-800"></div>

          {/* Event 1: Created */}
          <div className="relative flex gap-4 pb-6">
            <div className="z-10 bg-white dark:bg-slate-900 rounded-full h-6 w-6 flex items-center justify-center border-2 border-primary">
              <span className="material-symbols-outlined text-primary text-[14px] font-bold">
                <Check />
                </span>
            </div>
            <div>
              <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Pedido Creado</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">12 May, 2024 - 10:30 AM</p>
            </div>
          </div>

          {/* Event 2: Start */}
          <div className="relative flex gap-4 pb-6">
            <div className="z-10 bg-white dark:bg-slate-900 rounded-full h-6 w-6 flex items-center justify-center border-2 border-primary">
              <span className="material-symbols-outlined text-primary text-[14px] font-bold"><Check /></span>
            </div>
            <div>
              <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Inicio de Entrega</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">12 May, 2024 - 10:45 AM</p>
            </div>
          </div>

          {/* Event 3: Estimated Delivery */}
          <div className="relative flex gap-4">
            <div className="z-10 bg-slate-100 dark:bg-slate-800 rounded-full h-6 w-6 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400 text-[14px]">schedule</span>
            </div>
            <div>
              <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Entrega Estimada</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">12 May, 2024 - 11:15 AM</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3">
          <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm"><BookOpen /></span>
            Detalles
          </button>
          <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-3 rounded-lg transition-colors">
            <span className="material-symbols-outlined">opcion</span>
          </button>
        </div>
      </CardContent>

      {/* Secondary States (Footer Info) */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between opacity-60">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Otros estados</span>
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              <span className="text-[10px] text-slate-500">Pendiente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[10px] text-slate-500">Completado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span className="text-[10px] text-slate-500">Cancelado</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TarjetaPedido;