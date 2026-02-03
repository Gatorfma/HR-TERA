import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { groupCategories } from "@/lib/categoryGroups";

interface CategoryComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: string[];
  placeholder?: string;
  disabled?: boolean;
  excludeCategories?: string[];
}

export function CategoryCombobox({
  value,
  onValueChange,
  categories,
  placeholder = "Kategori sec...",
  disabled = false,
  excludeCategories = [],
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Group categories using the dynamic grouping utility
  const groupedCategories = React.useMemo(() => {
    const availableCategories = categories.filter(
      (cat) => !excludeCategories.includes(cat)
    );
    return groupCategories(availableCategories);
  }, [categories, excludeCategories]);

  const selectedLabel = value || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {selectedLabel}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Kategori ara..." />
          <CommandList>
            <CommandEmpty>Kategori bulunamadi.</CommandEmpty>
            {Object.entries(groupedCategories).map(
              ([groupName, groupCategories], index) => (
                <React.Fragment key={groupName}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={groupName}>
                    {groupCategories.map((category) => (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={() => {
                          onValueChange(category);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === category ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Multi-select version for secondary categories
interface MultiCategoryComboboxProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  categories: string[];
  maxSelections: number;
  placeholder?: string;
  disabled?: boolean;
  excludeCategories?: string[];
}

export function MultiCategoryCombobox({
  value,
  onValueChange,
  categories,
  maxSelections,
  placeholder = "Kategori ekle...",
  disabled = false,
  excludeCategories = [],
}: MultiCategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const canAddMore = value.length < maxSelections;

  // Group categories using the dynamic grouping utility
  const groupedCategories = React.useMemo(() => {
    const availableCategories = categories.filter(
      (cat) => !excludeCategories.includes(cat) && !value.includes(cat)
    );
    return groupCategories(availableCategories);
  }, [categories, excludeCategories, value]);

  const handleSelect = (category: string) => {
    if (value.includes(category)) {
      onValueChange(value.filter((v) => v !== category));
    } else if (canAddMore) {
      onValueChange([...value, category]);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || !canAddMore}
        >
          <span className="text-muted-foreground">
            {canAddMore ? placeholder : "Maksimum kategori secildi"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Kategori ara..." />
          <CommandList>
            <CommandEmpty>Kategori bulunamadi.</CommandEmpty>
            {Object.entries(groupedCategories).map(
              ([groupName, groupCategories], index) => (
                <React.Fragment key={groupName}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={groupName}>
                    {groupCategories.map((category) => (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={() => handleSelect(category)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value.includes(category)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {category}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CategoryCombobox;
