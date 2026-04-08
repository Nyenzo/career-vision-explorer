
import { useEffect, useState } from "react";

interface AIAssistantProps {
  message: string;
}

export const AIAssistant = ({ message }: AIAssistantProps) => {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedMessage("");
    
    const startDelay = setTimeout(() => {

    
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < message.length) {
        setDisplayedMessage(prev => {
          const newMessage = message.substring(0, index + 1);
          return newMessage;
        });
        index++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, 15);
    
    return () => clearInterval(intervalId);
  }, 50);
    return () => clearTimeout(startDelay)
  }, [message])

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 relative">
      <p className="font-medium text-gray-700">AI Assistant:</p>
      <p className="text-gray-600">{displayedMessage}</p>
      {isTyping && (
        <span className="inline-block w-2 h-4 bg-career-blue ml-1 animate-pulse absolute bottom-4 right-4"></span>
      )}
    </div>
  );
};
