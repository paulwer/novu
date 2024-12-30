'use client';

import { Badge } from '@/components/primitives/badge';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/primitives/popover';
import { inputVariants } from '@/components/primitives/variants';
import { CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/utils/ui';
import { Command } from 'cmdk';
import { forwardRef, useEffect, useState } from 'react';
import { RiAddFill, RiCloseFill } from 'react-icons/ri';

type TagInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
  showAddButton?: boolean;
};

const TagInput = forwardRef<HTMLInputElement, TagInputProps>((props, ref) => {
  const { className, suggestions, value, onChange, showAddButton, ...rest } = props;
  const [tags, setTags] = useState<string[]>(value);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTags(value);
  }, [value]);

  const addTag = (tag: string) => {
    const newTags = [...tags, tag];
    if (new Set(newTags).size !== newTags.length) {
      return;
    }
    onChange(newTags);
    setInputValue('');
    setIsOpen(false);
  };

  const removeTag = (tag: string) => {
    const newTags = [...tags];
    const index = newTags.indexOf(tag);
    if (index !== -1) {
      newTags.splice(index, 1);
    }
    onChange(newTags);
    setInputValue('');
  };

  return (
    <Popover open={isOpen}>
      <Command>
        <div className="flex flex-col gap-2">
          <PopoverAnchor asChild>
            <div className={cn({ 'hidden group-focus-within:block': showAddButton })}>
              <CommandInput
                ref={ref}
                autoComplete="off"
                value={inputValue}
                className={cn(inputVariants(), 'flex-grow', className)}
                placeholder="Type a tag and press Enter"
                onValueChange={(value) => {
                  setInputValue(value);
                  setIsOpen(true);
                }}
                onFocusCapture={() => setIsOpen(true)}
                onBlurCapture={() => setIsOpen(false)}
                {...rest}
              />
            </div>
          </PopoverAnchor>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" kind="tag" className="gap-1">
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(tag)}>
                  <RiCloseFill className="size-3" />
                  <span className="sr-only">Remove tag</span>
                </button>
              </Badge>
            ))}

            {showAddButton && (
              <Badge
                variant="outline"
                kind="tag"
                className="flex px-1.5 py-3 focus:hidden active:hidden group-focus-within:hidden"
              >
                <button type="button">
                  <RiAddFill />
                  <span className="sr-only">Add tag</span>
                </button>
              </Badge>
            )}
          </div>
        </div>
        <CommandList>
          {(suggestions.length > 0 || inputValue !== '') && (
            <PopoverContent
              className="p-1"
              portal={false}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              onFocusOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
            >
              <CommandGroup>
                {inputValue !== '' && (
                  <CommandItem
                    // We can't have duplicate keys in our list so adding a prefix
                    // here to differentiate this from a possible suggestion value
                    value={`input-${inputValue}`}
                    onSelect={() => {
                      addTag(inputValue);
                    }}
                  >
                    {inputValue}
                  </CommandItem>
                )}
                {suggestions.map((tag) => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={() => {
                      addTag(tag);
                    }}
                  >
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </PopoverContent>
          )}
        </CommandList>
      </Command>
    </Popover>
  );
});

export { TagInput };
