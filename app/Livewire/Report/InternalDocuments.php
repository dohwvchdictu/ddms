<?php

namespace App\Livewire\Report;

use Livewire\Attributes\Title;
use Livewire\Component;

class InternalDocuments extends Component
{
    #[Title('Internal Documents | DDMS')]
    public function render()
    {
        return view('livewire.report.internal-documents');
    }
}
