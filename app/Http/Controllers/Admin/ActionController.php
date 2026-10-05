<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Action;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Administration › Actions: the steps a document's routing is logged with
 * (Created, Forwarded, Received, …). New ones can be added; existing ones are
 * not edited or removed, because the code finds them by name, so renaming or
 * removing one would break routing.
 */
class ActionController extends Controller
{
    /**
     * The colour indicators an action may have: the light Tailwind backgrounds
     * the existing actions use. Keep in step with COLORS in pages/admin/actions.tsx.
     */
    public const COLORS = [
        'bg-gray-100', 'bg-red-100', 'bg-orange-100', 'bg-amber-100', 'bg-yellow-100', 'bg-emerald-100',
        'bg-teal-100', 'bg-cyan-100', 'bg-sky-100', 'bg-indigo-100', 'bg-violet-100', 'bg-pink-100',
    ];

    public function index(): Response
    {
        return Inertia::render('admin/actions', [
            'actions' => Action::orderBy('id')->get(['id', 'name', 'color']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge(['name' => trim((string) $request->input('name'))]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('actions', 'name')],
            'color' => ['required', Rule::in(self::COLORS)],
        ], [
            'name.unique' => 'There is already an action with this name.',
            'color.required' => 'Choose a colour indicator.',
        ]);

        Action::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Action \"{$data['name']}\" added"]);

        return back();
    }
}
