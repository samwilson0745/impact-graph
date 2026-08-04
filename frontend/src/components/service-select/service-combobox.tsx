'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TierDot } from '@/components/shared/tier-dot';
import { cn } from '@/lib/utils';
import type { ServiceNode } from '@/types/api';

interface ServiceComboboxProps {
  services: ServiceNode[];
  value: string | null;
  onChange: (serviceId: string) => void;
  placeholder?: string;
  excludeId?: string | null;
  disabled?: boolean;
  className?: string;
}

export function ServiceCombobox({
  services,
  value,
  onChange,
  placeholder = 'Select a service…',
  excludeId,
  disabled,
  className,
}: ServiceComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = services.find((s) => s.id === value);
  const options = excludeId ? services.filter((s) => s.id !== excludeId) : services;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full min-w-0 justify-between font-normal',
              !selected && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <TierDot tier={selected.tier} />
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search services…" />
          <CommandList>
            <CommandEmpty>No service found.</CommandEmpty>
            <CommandGroup>
              {options.map((service) => (
                <CommandItem
                  key={service.id}
                  value={`${service.name} ${service.id}`}
                  onSelect={() => {
                    onChange(service.id);
                    setOpen(false);
                  }}
                >
                  <TierDot tier={service.tier} />
                  <span className="flex-1 truncate">{service.name}</span>
                  <span className="text-xs text-muted-foreground">{service.tier}</span>
                  <Check className={cn('size-4', service.id === value ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
