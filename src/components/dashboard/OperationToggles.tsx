"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useConfigStore, type OperationToggles as OperationTogglesState, type NumberTypeToggles } from "@/stores/configStore";

const OPERATION_LABELS: { key: keyof OperationTogglesState; label: string }[] = [
  { key: "add", label: "Addition (+)" },
  { key: "subtract", label: "Subtraction (−)" },
  { key: "multiply", label: "Multiplication (×)" },
  { key: "divide", label: "Division (÷)" },
];

const NUMBER_TYPE_LABELS: { key: keyof NumberTypeToggles; label: string }[] = [
  { key: "integer", label: "Integers" },
  { key: "decimal", label: "Decimals" },
  { key: "fraction", label: "Fractions" },
  { key: "percentage", label: "Percentages" },
];

export function OperationToggles() {
  const operations = useConfigStore((s) => s.operations);
  const numberTypes = useConfigStore((s) => s.numberTypes);
  const toggleOperation = useConfigStore((s) => s.toggleOperation);
  const toggleNumberType = useConfigStore((s) => s.toggleNumberType);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Operations</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 xl:grid-cols-2">
          {OPERATION_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label htmlFor={`op-${key}`} className="text-sm font-normal">
                {label}
              </Label>
              <Switch id={`op-${key}`} checked={operations[key]} onCheckedChange={() => toggleOperation(key)} />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Always stacked below Operations — never side-by-side, at any width. */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Number Types</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 xl:grid-cols-2">
          {NUMBER_TYPE_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label htmlFor={`num-${key}`} className="text-sm font-normal">
                {label}
              </Label>
              <Switch id={`num-${key}`} checked={numberTypes[key]} onCheckedChange={() => toggleNumberType(key)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
