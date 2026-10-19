interface MultiSelectProps {
  label?: string;
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
}

export function MultiSelect({ label, options, value, onChange }: MultiSelectProps) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              value.includes(opt)
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
