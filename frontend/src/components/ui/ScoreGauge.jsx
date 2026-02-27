export default function ScoreGauge({ value = 0, size = 56, label, color = '#7c3aed' }) {
    const r = (size - 8) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (Math.min(value, 100) / 100) * c;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={4} />
                    <circle cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
                        strokeDasharray={c} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                    style={{ color }}>{value}</span>
            </div>
            {label && <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{label}</span>}
        </div>
    );
}
