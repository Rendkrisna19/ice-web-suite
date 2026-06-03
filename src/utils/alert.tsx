import toast from 'react-hot-toast';
import { AlertTriangle, Info, Trash2, LogOut } from 'lucide-react';
import React from 'react';

type AlertType = 'danger' | 'warning' | 'info' | 'logout';

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type?: AlertType;
}

export const confirmAlert = (
  message: string,
  onConfirm: () => void,
  options?: ConfirmOptions
) => {
  const type = options?.type || 'warning';
  
  let Icon = AlertTriangle;
  let iconBg = 'bg-orange-100';
  let iconColor = 'text-orange-600';
  let btnColor = 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20';

  if (type === 'danger') {
    Icon = Trash2;
    iconBg = 'bg-red-100';
    iconColor = 'text-red-600';
    btnColor = 'bg-red-600 hover:bg-red-700 shadow-red-600/20';
  } else if (type === 'logout') {
    Icon = LogOut;
    iconBg = 'bg-red-100';
    iconColor = 'text-red-600';
    btnColor = 'bg-red-600 hover:bg-red-700 shadow-red-600/20';
  } else if (type === 'info') {
    Icon = Info;
    iconBg = 'bg-blue-100';
    iconColor = 'text-blue-600';
    btnColor = 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20';
  }

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black/5 overflow-hidden p-5 border border-surface-100`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${iconBg} ${iconColor}`}>
            <Icon size={24} />
          </div>
          <div className="flex-1 pt-1">
            <h4 className="font-bold text-neutral-800 text-base">
              {options?.title || 'Konfirmasi'}
            </h4>
            <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 justify-end mt-6">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-5 py-2.5 text-sm font-bold text-neutral-600 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors active:scale-95"
          >
            {options?.cancelText || 'Batal'}
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg active:scale-95 ${btnColor}`}
          >
            {options?.confirmText || 'Ya, Lanjutkan'}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: 'top-center',
    }
  );
};
