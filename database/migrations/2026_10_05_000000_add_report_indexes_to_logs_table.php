<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Two lookups the React lists and reports make on the 740k+ row logs table:
     *
     * - office_id, action_id, created_at: the Routing Logbook reads an office's
     *   own "For Receiving" hand-overs in a period. Without it MySQL walked every
     *   For Receiving log (about half the table) to find one office's.
     * - assigned_to, action_id, created_at: Processed and Closed find the
     *   documents an office forwarded or closed in a period. The older
     *   (assigned_to, action_id) index could not narrow by date.
     */
    public function up(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            $table->index(['office_id', 'action_id', 'created_at'], 'logs_office_action_created_index');
            $table->index(['assigned_to', 'action_id', 'created_at'], 'logs_assigned_action_created_index');
        });
    }

    public function down(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            $table->dropIndex('logs_office_action_created_index');
            $table->dropIndex('logs_assigned_action_created_index');
        });
    }
};
