<?php

use App\Http\Controllers\Admin\ActionController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CitizenCharterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ClosedController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardDocumentsController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentSearchController;
use App\Http\Controllers\DocumentTrackingController;
use App\Http\Controllers\DocumentViewController;
use App\Http\Controllers\IncomingController;
use App\Http\Controllers\PendingController;
use App\Http\Controllers\Reports\DocumentStatusController;
use App\Http\Controllers\Reports\EndorsementsController;
use App\Http\Controllers\Reports\ExternalRequestsController;
use App\Http\Controllers\Reports\PerUnitController;
use App\Http\Controllers\Reports\TurnaroundController;
use App\Http\Controllers\ProcessedController;
use App\Http\Controllers\EmployeePhotoController;
use App\Http\Controllers\MiscController;
use App\Http\Controllers\MyDocumentsController;
use App\Http\Controllers\OfficeEmployeesController;
use App\Http\Controllers\RoutingLogbookController;
use App\Http\Controllers\TransmittalFormController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/


Route::get('/', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'store'])->name('login.store');

/** The old Filament admin panel (DTIS, then DDMS); its bookmarks now land on Administration. */
Route::permanentRedirect('/dtis-admin/{path?}', '/admin/categories')->where('path', '.*');
Route::permanentRedirect('/ddms-admin/{path?}', '/admin/categories')->where('path', '.*');

Route::middleware(['jwt.auth'])->group(function () {
    /** Dashboard */
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/dashboard/documents', DashboardDocumentsController::class)->name('dashboard.documents');

    /** Header search */
    Route::get('/documents/search', DocumentSearchController::class)->name('documents.search');
    Route::get('/documents/{document}/tracking', DocumentTrackingController::class)
        ->whereNumber('document')
        ->name('documents.tracking');

    /** Create Document */
    Route::get('/new-document', [DocumentController::class, 'create'])->name('documents.create');
    Route::post('/new-document', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('/new-document/{document}/saved', [DocumentController::class, 'created'])
        ->whereNumber('document')
        ->name('documents.created');

    /** My Documents */
    Route::get('/my-documents', MyDocumentsController::class)->name('my-documents');
    Route::get('/my-documents/selectable', [MyDocumentsController::class, 'selectable'])->name('my-documents.selectable');
    Route::post('/my-documents/forward', [MyDocumentsController::class, 'forward'])->name('my-documents.forward');
    Route::get('/offices/{office}/employees', OfficeEmployeesController::class)
        ->whereNumber('office')
        ->name('offices.employees');
    // Now tabs of My Documents; kept so bookmarks and older redirects still land.
    Route::permanentRedirect('/my-purchase-requests', '/my-documents?type=purchase_requests');
    Route::permanentRedirect('/my-payments', '/my-documents?type=payments');

    /** Status of Documents */
    Route::get('/status-incoming', [IncomingController::class, 'index'])->name('incoming');
    Route::get('/status-incoming/selectable', [IncomingController::class, 'selectable'])->name('incoming.selectable');
    Route::post('/status-incoming/receive', [IncomingController::class, 'receive'])->name('incoming.receive');
    Route::get('/status-pending', [PendingController::class, 'index'])->name('pending');
    Route::get('/status-pending/selectable', [PendingController::class, 'selectable'])->name('pending.selectable');
    Route::post('/status-pending/forward', [PendingController::class, 'forward'])->name('pending.forward');
    Route::post('/status-pending/endorse', [PendingController::class, 'endorse'])->name('pending.endorse');
    Route::get('/status-pending/close-code', [PendingController::class, 'closeCode'])->name('pending.close-code');
    Route::post('/status-pending/close', [PendingController::class, 'close'])->name('pending.close');
    // Merged into Pending's "To me" switch; kept so bookmarks and older links still land.
    Route::permanentRedirect('/status-endorsed', '/status-pending?endorsed=me');
    Route::get('/status-forwarded', [ProcessedController::class, 'index'])->name('processed');
    Route::get('/status-forwarded/selectable', [ProcessedController::class, 'selectable'])->name('processed.selectable');
    Route::get('/status-closed', [ClosedController::class, 'index'])->name('closed');

    /** View Document */
    Route::get('/document/view/{control_no}', [DocumentViewController::class, 'show'])->name('document.view');
    Route::patch('/documents/{document}/subject', [DocumentViewController::class, 'updateSubject'])
        ->whereNumber('document')
        ->name('documents.subject');
    Route::delete('/documents/{document}', [DocumentViewController::class, 'destroy'])
        ->whereNumber('document')
        ->name('documents.destroy');
    Route::post('/documents/{document}/attachments', [DocumentViewController::class, 'attach'])
        ->whereNumber('document')
        ->name('documents.attachments.store');
    Route::delete('/documents/{document}/attachments/{attachment}', [DocumentViewController::class, 'detach'])
        ->whereNumber(['document', 'attachment'])
        ->name('documents.attachments.destroy');
    Route::get('/document/incoming/{control_no}', [DocumentViewController::class, 'showIncoming'])->name('document.incoming');
    Route::post('/documents/{document}/return', [DocumentViewController::class, 'returnDocument'])
        ->whereNumber('document')
        ->name('documents.return');
    Route::get('/document/pending/{control_no}', [DocumentViewController::class, 'showPending'])->name('document.pending');
    Route::get('/document/qr-receive/{control_no}', [DocumentViewController::class, 'qrReceive'])->name('document.qr-receive');
    Route::get('/routing-logbook', [RoutingLogbookController::class, 'index'])->name('routing-logbook');

    /** Reports */
    Route::get('/report-status-of-documents', DocumentStatusController::class)->name('reports.status');
    Route::get('/report-status-per-employee', EndorsementsController::class)->name('reports.endorsements');
    Route::get('/report-status-of-external-documents', [ExternalRequestsController::class, 'index'])->name('reports.external');
    Route::get('/report-per-unit', PerUnitController::class)->name('reports.per-unit');
    Route::get('/report-turnaround-time', [TurnaroundController::class, 'index'])->name('reports.turnaround');
    Route::get('/report-turnaround-time/offices/{office}', [TurnaroundController::class, 'office'])
        ->whereNumber('office')
        ->name('reports.turnaround.office');

    /** Administration: only for allowed employees (App\Support\Administration) */
    Route::prefix('admin')->name('admin.')->middleware('can:administer')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::patch('/categories/{category}', [CategoryController::class, 'update'])->whereNumber('category')->name('categories.update');
        Route::get('/citizen-charters', [CitizenCharterController::class, 'index'])->name('citizen-charters.index');
        Route::post('/citizen-charters', [CitizenCharterController::class, 'store'])->name('citizen-charters.store');
        Route::patch('/citizen-charters/{citizenCharter}', [CitizenCharterController::class, 'update'])->whereNumber('citizenCharter')->name('citizen-charters.update');
        Route::get('/actions', [ActionController::class, 'index'])->name('actions.index');
        Route::post('/actions', [ActionController::class, 'store'])->name('actions.store');
    });

    /** Printing of Report*/
    Route::get('/print-document-status-report', [MiscController::class, 'printDocumentStatusReport'])->name('print.document.status');
    Route::get('/print-external-documents-report', [ExternalRequestsController::class, 'print'])->name('print.external.documents');

    /** Printing of Transmittal */
    Route::get('/print-transmittal-form/{control_no}', TransmittalFormController::class)->name('print.transmittal.form');
    Route::get('/inbox/generate-logbook', [MiscController::class, 'generateLogbook'])->name('inbox.generate-logbook');

    /** User Photo */
    Route::get('/employee/image/{filename}', EmployeePhotoController::class)->name('employee.photo');

    /** Logout */
    Route::post('/logout', function () {
        session()->invalidate();
        session()->regenerateToken();
        return redirect()->route('login');
    })->name('logout');

});
