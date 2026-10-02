/** One-tap remarks, as the Livewire Pending page offered them. */
export const REMARK_PRESETS = [
    'Document has been approved.',
    'Document has been signed.',
    'Document has been initialed.',
    'Document has been checked.',
    'Document has been processed.',
];

/** Preset chips that fill the remarks field; the picked one stays highlighted. */
export default function RemarkPresets({ value, onPick }: { value: string; onPick: (remark: string) => void }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {REMARK_PRESETS.map((remark) => {
                const label = remark.replace('Document has been ', '').replace('.', '');
                const picked = value === remark;

                return (
                    <button
                        key={remark}
                        type="button"
                        onClick={() => onPick(remark)}
                        className={
                            picked
                                ? 'rounded-full border border-emerald-600 bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white capitalize'
                                : 'rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground capitalize hover:bg-accent hover:text-foreground'
                        }
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
