<?php

namespace App\Http\Controllers;

use App\Actions\Documents\DocumentPermissions;
use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Illuminate\View\View;
use Picqer\Barcode\Renderers\HtmlRenderer;
use Picqer\Barcode\Types\TypeCode128;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * The printed Document Tracking Form (transmittal) for a forwarded document.
 * Only the data is worked out here; resources/views/print/transmittal-form is
 * the form's fixed layout. Replaces MiscController::printTransmittalForm.
 */
class TransmittalFormController extends Controller
{
    public function __invoke(string $controlNo, ApiService $api): View
    {
        $document = Document::with(['category', 'citizencharter'])->where('control_no', $controlNo)->firstOrFail();

        // The same rule as the Print button: the origin office, once it has gone out.
        abort_unless(DocumentPermissions::for($document)->canPrint(), 403);

        $offices = collect($api->getOfficesData()['officeList'] ?? [])->keyBy('id');
        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])->keyBy('id');

        // Where it was last sent; a document forwarded again prints its current destination.
        $destinationId = Log::where('document_id', $document->id)
            ->where('action_id', Action::where('name', 'For Receiving')->value('id'))
            ->orderByDesc('id')
            ->value('assigned_to') ?? $document->assigned_to;

        // ENCODED BY is whoever encoded the document, not whoever prints it.
        $encoder = $employees[$document->user_id] ?? session('user');

        return view('print.transmittal-form', [
            'user' => ['firstName' => $encoder['firstName'] ?? '', 'lastName' => $encoder['lastName'] ?? ''],
            'office' => $offices[$document->office_id]['officeName'] ?? '',
            'destination' => $offices[$destinationId]['officeName'] ?? '',
            'document' => $document,
            'barcodeImg' => (new HtmlRenderer())->render((new TypeCode128())->getBarcode($document->control_no)),
            'qrCode' => QrCode::size(110)->generate(url('/document/qr-receive/' . $document->control_no)),
        ]);
    }
}
