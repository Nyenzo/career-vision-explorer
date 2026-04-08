import { useEffect, useState } from "react";

interface TypingQuestionProps {
  question: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  typingSpeed?: number;
}

export const TypingQuestion = ({
    question,
    children,
    icon,
    className = "",
    typingSpeed = 30
}: TypingQuestionProps) => {
    const [displayedQuestion, setDisplayedQuestion] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [showContent, setShowContent] = useState(false)

    useEffect(() => {
        // Reset state when question changes
        setIsTyping(true);
        setDisplayedQuestion("");
        setShowContent(false);

        // small delay to ensure state is reset
        const startDelay = setTimeout(() => {
            let index = 0;

            const intervalId = setInterval(() => {
                if (index < question.length) {
                    setDisplayedQuestion(question.substring(0, index + 1));
                    index++;
                } else {
                    setIsTyping(false);
                    clearInterval(intervalId);
                    // show content after typing is complete
                    setTimeout(() => setShowContent(true), 200);
                }
            }, typingSpeed);
            return () => clearInterval(intervalId)
        }, 100);

        return () => clearTimeout(startDelay);
    }, [question, typingSpeed]);


    return (
        <div className={`space-y-4 ${className}`}>
            {icon && (
                <div className="flex items-center justify-center mb-4">
                    {icon}
                </div>

            )}
        <h3 className="text-lg font-semibold text-center min-h-[28px]">
            {displayedQuestion}
            {isTyping && (
                <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse"></span>
            )}
        </h3>

        {/* content appears with fade-in after typing is complete */}
        <div className={`transition-opacity duration-300 ${
            showContent ? 'opacity-100' : 'opacity-0'
        }`}>
            {children}
        </div>

        
        </div>
    )
}