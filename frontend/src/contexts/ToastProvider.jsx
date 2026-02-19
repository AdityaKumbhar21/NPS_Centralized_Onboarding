import React, { createContext, useContext, useEffect, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const Toast = ({ id, message, type = 'info', onClose }) => {
  const base = 'max-w-sm w-full pointer-events-auto rounded-lg shadow-lg ring-1 ring-black/5 overflow-hidden';
  const variants = {
    error: 'bg-red-50 border border-red-200 text-red-800',
    success: 'bg-green-50 border border-green-200 text-emerald-800',
    info: 'bg-white border border-slate-100 text-slate-800',
  };

  const icons = {
    error: '⚠️',
    success: '✓',
    info: 'ℹ️',
  };

  return (
    <div className={`${base} ${variants[type] || variants.info}`}>
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="text-lg leading-none mt-0.5">{icons[type] || icons.info}</div>
          <div className="text-sm font-medium flex-1">{message}</div>
          <button onClick={() => onClose(id)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleEvent = (e) => {
      const { message, type } = e.detail || {};
      if (!message) return;
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      // auto remove after 5s
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id));
      }, 5000);
    };

    window.addEventListener('nps:toast', handleEvent);
    return () => window.removeEventListener('nps:toast', handleEvent);
  }, []);

  const show = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 5000);
  };

  const remove = (id) => setToasts((t) => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <Toast key={t.id} id={t.id} message={t.message} type={t.type} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
