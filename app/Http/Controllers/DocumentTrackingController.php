<?php

namespace App\Http\Controllers;

use App\Actions\Documents\DocumentTracking;
use Illuminate\Http\JsonResponse;

/** JSON for the tracking view in the header search. */
class DocumentTrackingController extends Controller
{
    public function __invoke(int $document, DocumentTracking $tracking): JsonResponse
    {
        $data = $tracking->handle($document);

        abort_if($data === null, 404);

        return response()->json($data);
    }
}
