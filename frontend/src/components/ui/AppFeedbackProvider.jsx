import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Info, TriangleAlert } from 'lucide-react';

const FeedbackContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
  confirm: HelpCircle,
};

function normalizeType(type) {
  return ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
}

export function AppFeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const idRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((message, options = {}) => {
    const id = ++idRef.current;
    const type = normalizeType(options.type || 'info');
    const timeout = Number.isFinite(options.timeout) ? options.timeout : 3600;

    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, timeout);
  }, [dismissToast]);

  const closeDialog = useCallback((payload) => {
    setDialog((prev) => {
      if (prev?.resolve) {
        prev.resolve(payload);
      }
      return null;
    });
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        kind: 'confirm',
        title: options.title || 'Please confirm',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        tone: options.tone === 'danger' ? 'danger' : 'default',
        resolve,
      });
    });
  }, []);

  const prompt = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        kind: 'prompt',
        title: options.title || 'Enter a value',
        message: options.message || '',
        placeholder: options.placeholder || '',
        defaultValue: options.defaultValue || '',
        required: Boolean(options.required),
        confirmText: options.confirmText || 'Submit',
        cancelText: options.cancelText || 'Cancel',
        tone: options.tone === 'danger' ? 'danger' : 'default',
        resolve,
      });
    });
  }, []);

  const value = useMemo(() => ({ toast, confirm, prompt }), [toast, confirm, prompt]);

  const DialogIcon = dialog?.kind === 'confirm' ? ICONS.confirm : ICONS.info;

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <section className="app-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((item) => {
          const Icon = ICONS[item.type] || ICONS.info;
          return (
            <article key={item.id} className={`app-toast app-toast-${item.type}`}>
              <Icon size={17} />
              <p>{item.message}</p>
              <button type="button" onClick={() => dismissToast(item.id)} aria-label="Dismiss notification">
                Close
              </button>
            </article>
          );
        })}
      </section>

      {dialog && (
        <DialogOverlay
          dialog={dialog}
          DialogIcon={DialogIcon}
          onCancel={() => closeDialog(dialog.kind === 'prompt' ? null : false)}
          onConfirm={closeDialog}
        />
      )}
    </FeedbackContext.Provider>
  );
}

function DialogOverlay({ dialog, DialogIcon, onCancel, onConfirm }) {
  const [inputValue, setInputValue] = useState(dialog.defaultValue || '');

  const canSubmit = dialog.kind !== 'prompt' || !dialog.required || inputValue.trim().length > 0;

  const submitPrompt = () => {
    if (!canSubmit) return;
    onConfirm(inputValue);
  };

  return (
    <div className="app-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="app-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={dialog.title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-dialog-head">
          <div className="app-dialog-icon-wrap">
            <DialogIcon size={18} />
          </div>
          <h3>{dialog.title}</h3>
        </div>

        {dialog.message && <p className="app-dialog-message">{dialog.message}</p>}

        {dialog.kind === 'prompt' && (
          <input
            autoFocus
            className="app-dialog-input"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={dialog.placeholder}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canSubmit) {
                submitPrompt();
              }
              if (event.key === 'Escape') {
                onCancel();
              }
            }}
          />
        )}

        <div className="app-dialog-actions">
          <button type="button" className="btn-outline" onClick={onCancel}>
            {dialog.cancelText}
          </button>
          <button
            type="button"
            className={`btn-primary ${dialog.tone === 'danger' ? 'app-danger-btn' : ''}`}
            disabled={!canSubmit}
            onClick={() => (dialog.kind === 'prompt' ? submitPrompt() : onConfirm(true))}
          >
            {dialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useAppFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useAppFeedback must be used inside AppFeedbackProvider');
  }
  return context;
}
