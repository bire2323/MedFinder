import React, { useEffect } from "react";

export default function Modal({ isOpen, onClose, children, closeOnBackdrop = false }) {

  // On small screens anchor modal to bottom with 50% height.
  // On md+ screens center the modal vertically.
  const containerAlignClass = 'items-end md:items-center';
  // allow modal to grow to fit content on small screens, limit to 90vh on md+
  const responsiveModalClasses = 'h-auto md:max-h-[90vh] rounded-t-lg md:rounded-lg overflow-auto';

  useEffect(() => {
    if (!isOpen) return;
    // maintain a global open-modals counter to support nested modals
    if (!window.__openModalsCount) window.__openModalsCount = 0;
    window.__openModalsCount += 1;

    // when at least one modal is open, prevent background scrolling
    if (window.__openModalsCount === 1) {
      document.body.__prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add('modal-open');
    }

    // dispatch event with current open state
    window.dispatchEvent(new CustomEvent('modal:change', { detail: { open: true } }));

    return () => {
      window.__openModalsCount = Math.max(0, (window.__openModalsCount || 1) - 1);
      if (window.__openModalsCount === 0) {
        // restore overflow when no modals remain
        document.body.style.overflow = document.body.__prevOverflow || '';
        document.body.classList.remove('modal-open');
        delete document.body.__prevOverflow;
      }
      window.dispatchEvent(new CustomEvent('modal:change', { detail: { open: !!(window.__openModalsCount) } }));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className={`flex ${containerAlignClass} justify-center h-full`}> 
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => { if (closeOnBackdrop) onClose(); }}
        ></div>

        <div className={`relative bg-white dark:bg-gray-800 shadow-xl w-full md:w-[70vw] max-w-none mx-0 md:mx-4 ${responsiveModalClasses}`}>
          <div className="p-4 overflow-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
