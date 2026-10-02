let frame: HTMLIFrameElement | null = null;

/**
 * Print a document's Document Tracking Form without leaving the page: the form
 * loads in a frame kept out of sight, and prints itself when loaded (its page
 * calls window.print() on load), so the browser's own print preview opens over
 * the current page. The frame is kept until the next print, since some
 * browsers print asynchronously and removing it early would cancel the job.
 */
export function printTransmittalForm(controlNo: string): void {
    frame?.remove();

    frame = document.createElement('iframe');
    frame.title = `Document Tracking Form for ${controlNo}`;
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    // Off screen at paper size, not zero size: some browsers print a zero-size frame blank.
    Object.assign(frame.style, { position: 'fixed', left: '-10000px', top: '0', width: '816px', height: '1056px', border: '0' });
    frame.src = `/print-transmittal-form/${encodeURIComponent(controlNo)}`;

    document.body.appendChild(frame);
}
