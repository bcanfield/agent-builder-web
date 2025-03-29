'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  console.log({messages})
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              case 'tool-invocation':
                if (part.toolInvocation.state === 'call') {
                  // Display all args from the tool invocation
                  return (
                    <div key={`${message.id}-${i}`} className="text-blue-600">
                      {Object.entries(part.toolInvocation.args).map(([key, value]) => (
                        <div key={key}>
                          {key}: {String(value)}
                        </div>
                      ))}
                    </div>
                  );
                } else if (part.toolInvocation.state === 'result') {
  // Display all results from the tool invocation
  return (
    <div key={`${message.id}-${i}`} className="text-green-600">
      {Object.entries(part.toolInvocation.result).map(([key, value]) => (
        <div key={key}>
          {key}: {String(value)}
        </div>
      ))}
    </div>
  );
                }

                return null;
              default:
                return null;
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}