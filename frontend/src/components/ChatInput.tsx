import React, { useRef, useEffect, useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isDisabled = false,
  placeholder = 'Type your message…',
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // On desktop only — auto-focus. Avoid on mobile to prevent keyboard popup.
    if (!isDisabled && window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, [isDisabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isDisabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isDisabled}
          placeholder={isDisabled ? 'Northstar AI is responding…' : placeholder}
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          enterKeyHint="send"
          className="w-full bg-white border border-[#EAE6E1] focus:border-[#735A3A] focus:ring-1 focus:ring-[#735A3A]/30 rounded-full pl-4 sm:pl-5 pr-13 py-3 sm:py-3.5 text-sm text-[#1A1A1A] placeholder:text-[#A3A3A3] transition-all outline-none lux-shadow disabled:bg-[#F5F2ED] disabled:text-[#A3A3A3]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isDisabled}
          aria-label="Send message"
          className="absolute right-1.5 p-2.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-[#1A1A1A] transition-all flex items-center justify-center active:scale-95 touch-manipulation"
        >
          <Send className="w-4 h-4 text-[#E5D2B8]" />
        </button>
      </div>
    </form>
  );
};
