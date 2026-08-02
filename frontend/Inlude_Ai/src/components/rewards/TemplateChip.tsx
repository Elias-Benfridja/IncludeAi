interface Template {
  emoji: string;
  name: string;
  price: number;
}

interface TemplateChipProps {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}

export default function TemplateChip({ template, selected, onSelect }: TemplateChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`whitespace-nowrap px-5 py-3 rounded-full border-2 text-body-md transition-all active:scale-95 flex items-center gap-2 ${
        selected
          ? "bg-secondary-fixed border-secondary text-on-secondary-fixed"
          : "border-tertiary-fixed bg-surface-container-lowest text-secondary hover:bg-secondary-fixed"
      }`}
    >
      <span>{template.emoji}</span> {template.name}
    </button>
  );
}
