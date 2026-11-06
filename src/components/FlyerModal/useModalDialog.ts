import { useEffect, useRef } from 'react';

/** Abre y cierra un <dialog> nativo según `open`, con el scroll de la página bloqueado mientras está abierto. */
export function useModalDialog(open: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    dialog.showModal();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return dialogRef;
}
