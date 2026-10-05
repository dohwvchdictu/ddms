@php
    $stateLabels = ['overdue' => 'Overdue', 'due' => 'Due soon', 'pending' => 'In progress', 'complete' => 'Completed'];
    $place = fn (?array $office) => $office ? ($office['code'] ?? $office['name'] ?? '—') : '—';
    $period = $filters['from'] || $filters['to']
        ? ($filters['from'] ? \Carbon\Carbon::parse($filters['from'])->format('F d, Y') : 'the beginning') . ' – ' . ($filters['to'] ? \Carbon\Carbon::parse($filters['to'])->format('F d, Y') : 'today')
        : 'All dates';
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>External Requests Report</title>
    <style>
        @page { size: A4 landscape; margin: 10mm; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 16px; font-family: Arial, sans-serif; font-size: 10px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
        .header h1 { margin: 0 0 2px; font-size: 16px; text-transform: uppercase; letter-spacing: .5px; }
        .header p { margin: 1px 0; font-size: 10px; }
        .summary { display: flex; gap: 6px; margin-bottom: 10px; }
        .summary div { flex: 1; border: 1px solid #000; padding: 4px 6px; text-align: center; }
        .summary strong { display: block; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 3px 4px; vertical-align: top; text-align: left; }
        th { background: #e5e7eb; font-size: 9px; text-transform: uppercase; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        .nowrap { white-space: nowrap; }
        .small { margin-top: 1px; font-size: 8px; color: #444; }
        .num { text-align: center; }
        .state-overdue { font-weight: bold; }
        .empty { text-align: center; padding: 16px; }
        .footer { margin-top: 8px; font-size: 9px; text-align: right; }
        .print-button { margin-bottom: 12px; }
        @media print { body { padding: 0; } .print-button { display: none; } }
    </style>
</head>
<body>
    <div class="print-button">
        <button type="button" onclick="window.print()">Print</button>
    </div>

    <div class="header">
        <h1>External Requests Report</h1>
        <p>{{ $officeName }}</p>
        <p>Period: {{ $period }}@if ($filters['state'] !== 'all') · {{ $stateLabels[$filters['state']] }} only @endif @if ($filters['search'] !== '') · Search: “{{ $filters['search'] }}” @endif</p>
    </div>

    <div class="summary">
        <div>Total<strong>{{ number_format($counts['all']) }}</strong></div>
        @foreach ($stateLabels as $state => $label)
            <div>{{ $label }}<strong>{{ number_format($counts[$state]) }}</strong></div>
        @endforeach
    </div>

    <table>
        <thead>
            <tr>
                <th>Document Control No.</th>
                <th>Received</th>
                <th>Document Title</th>
                <th>Route</th>
                <th class="num">Required Days</th>
                <th>Days Remaining</th>
                <th>Current Status</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    <td>
                        <span class="nowrap">{{ $row['control_no'] }}</span>
                        @if ($row['encoded_by'])
                            <div class="small">By {{ $row['encoded_by'] }}</div>
                        @endif
                    </td>
                    <td class="nowrap">{{ \Carbon\Carbon::parse($row['created_at'])->format('M d, Y') }}</td>
                    <td>
                        {{ \Illuminate\Support\Str::limit($row['subject'], 160) }}
                        <div class="small">{{ $row['classification'] }}</div>
                    </td>
                    <td class="nowrap">
                        {{ $place($row['origin']) }} &rarr; {{ $place($row['first_destination']) }}
                        <div class="small">Now at {{ $place($row['now_at']) }}</div>
                    </td>
                    <td class="num">{{ $row['required_days'] }}</td>
                    <td class="nowrap state-{{ $row['state'] }}">{{ $row['deadline_label'] }}</td>
                    <td class="nowrap">{{ $row['status'] }}</td>
                    <td>{{ $row['remarks'] ? \Illuminate\Support\Str::limit($row['remarks'], 120) : '' }}</td>
                </tr>
            @empty
                <tr><td colspan="8" class="empty">No external requests for this period.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">Printed {{ now()->format('F d, Y h:i A') }}</div>
</body>
</html>
