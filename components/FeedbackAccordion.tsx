"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface FeedbackAccordionProps {
  categoryScores: CategoryScore[];
}

const FeedbackAccordion = ({ categoryScores }: FeedbackAccordionProps) => {
  return (
    <Accordion type="multiple" className="w-full">
      {categoryScores.map((category, index) => {
        const scoreColor =
          category.score >= 80
            ? "text-green-600"
            : category.score >= 60
              ? "text-blue-600"
              : category.score >= 40
                ? "text-amber-600"
                : "text-red-600";

        const bgColor =
          category.score >= 80
            ? "bg-green-50"
            : category.score >= 60
              ? "bg-blue-50"
              : category.score >= 40
                ? "bg-amber-50"
                : "bg-red-50";

        return (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 w-full pr-4">
                <span
                  className={cn(
                    "inline-flex items-center justify-center text-xs font-bold px-2.5 py-1 rounded-md",
                    bgColor,
                    scoreColor
                  )}
                >
                  {category.score}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {category.name}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-text-secondary leading-relaxed pl-11">
                {category.comment}
              </p>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default FeedbackAccordion;
