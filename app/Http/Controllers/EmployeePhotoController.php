<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves a cached employee photo from storage/app/public/photos. Moved here
 * from the Livewire Navbar component, which the Blade app header replaced.
 */
class EmployeePhotoController extends Controller
{
    private const ALLOWED = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    public function __invoke(string $filename): Response
    {
        $filename = basename($filename);

        abort_unless(in_array(strtolower(pathinfo($filename, PATHINFO_EXTENSION)), self::ALLOWED, true), 404);

        $path = 'photos/' . $filename;

        abort_unless(Storage::disk('public')->exists($path), 404);

        return response(Storage::disk('public')->get($path))
            ->header('Content-Type', Storage::disk('public')->mimeType($path))
            ->header('Cache-Control', 'public, max-age=86400');
    }
}
