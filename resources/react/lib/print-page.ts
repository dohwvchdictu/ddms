let frame: HTMLIFrameElement | null = null;

/**
 * Print one of the server's print pages without leaving the current one: the
 * page loads in a frame kept out of sight and is printed from there, so the
 * browser's own print preview opens over the current page.
 *
 * `printsItself`: the page calls window.print() on load (the Document Tracking
 * Form does, so it also prints when opened in a tab); otherwise it is printed
 * here once loaded. The frame is kept until the next print, since some browsers
 * print asynchronously and removing it early would cancel the job.
 */
export function printPage(url: string, { title, printsItself = false }: { title: string; printsItself?: boolean }): void {
    frame?.remove();

    const next = document.createElement('iframe');
    next.title = title;
    next.setAttribute('aria-hidden', 'true');
    next.tabIndex = -1;
    // Off screen at paper size, not zero size: some browsers print a zero-size frame blank.
    Object.assign(next.style, { position: 'fixed', left: '-10000px', top: '0', width: '816px', height: '1056px', border: '0' });

    if (!printsItself) {
        next.addEventListener('load', () => {
            next.contentWindow?.focus();
            next.contentWindow?.print();
        });
    }

    next.src = url;
    frame = next;
    document.body.appendChild(next);
}

/** A document's Document Tracking Form (transmittal). */
export function printTransmittalForm(controlNo: string): void {
    printPage(`/print-transmittal-form/${encodeURIComponent(controlNo)}`, { title: `Document Tracking Form for ${controlNo}`, printsItself: true });
}
