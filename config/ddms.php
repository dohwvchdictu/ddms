<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Administration access
    |--------------------------------------------------------------------------
    |
    | HRIS office ids (comma-separated) whose employees may use the
    | Administration pages: categories, citizen's charter and actions.
    | Defaults to ICTU (office 20). Stands in for user roles until they exist;
    | see App\Support\Administration.
    |
    */

    'admin_office_ids' => array_values(array_filter(array_map('trim', explode(',', (string) env('ADMIN_OFFICE_IDS', '20'))), 'strlen')),

];
