"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  extractJobDescription,
  generateInterviewFromForm,
} from "@/lib/actions/general.action";

type InputMode = "voice" | "form" | "jd" | "pdf";
type Step = "input" | "preview";

interface InterviewGeneratorProps {
  userName: string;
  userId: string;
  children: React.ReactNode;
}

const LEVELS = ["Junior", "Mid", "Senior"] as const;
const TYPES = ["Technical", "Behavioral", "Mixed"] as const;
const QUESTION_COUNTS = [3, 5, 7, 10] as const;

const InterviewGenerator = ({
  userName,
  userId,
  children,
}: InterviewGeneratorProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<InputMode>("voice");
  const [step, setStep] = useState<Step>("input");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jdText, setJdText] = useState("");
  const [error, setError] = useState("");


  const [role, setRole] = useState("");
  const [level, setLevel] = useState<string>("Junior");
  const [techstack, setTechstack] = useState("");
  const [type, setType] = useState<string>("Technical");
  const [amount, setAmount] = useState<number>(5);

  const resetForm = () => {
    setRole("");
    setLevel("Junior");
    setTechstack("");
    setType("Technical");
    setAmount(5);
    setJdText("");
    setStep("input");
    setError("");
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    setStep("input");
    setError("");
  };


  const handleExtract = async (text: string) => {
    if (!text.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setIsExtracting(true);
    setError("");

    try {
      const result = await extractJobDescription(text);
      setRole(result.role);
      setLevel(result.level);
      setTechstack(result.techstack);
      setType(result.type);
      setStep("preview");
    } catch (err) {
      console.error("Extraction error:", err);
      setError("Failed to extract details. Please try again or use the form.");
    } finally {
      setIsExtracting(false);
    }
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      setError("Please upload a PDF or text file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB.");
      return;
    }

    setIsExtracting(true);
    setError("");

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        setJdText(text);
        await handleExtract(text);
      } else {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });

        setJdText(text);
        await handleExtract(text);
      }
    } catch (err) {
      console.error("File upload error:", err);
      setError("Failed to read file. Try pasting the text instead.");
      setIsExtracting(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleGenerate = async () => {
    if (!role.trim()) {
      setError("Please enter a job role.");
      return;
    }
    if (!techstack.trim()) {
      setError("Please enter at least one technology.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const result = await generateInterviewFromForm({
        role: role.trim(),
        level,
        techstack: techstack.trim(),
        type,
        amount,
        userid: userId,
      });

      if (result.success && result.interviewId) {
        router.push(`/interview/${result.interviewId}`);
      } else {
        setError("Failed to generate interview. Please try again.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: "voice" as InputMode, label: "Voice", icon: "" },
    { id: "form" as InputMode, label: "Form", icon: "" },
    { id: "jd" as InputMode, label: "Paste JD", icon: "" },
    { id: "pdf" as InputMode, label: "Upload File", icon: "" },
  ];

  return (
    <div className="flex flex-col gap-6">

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleModeChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer",
              mode === tab.id
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>


      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 animate-fadeIn">
          {error}
        </div>
      )}


      {mode === "voice" && (
        <div className="animate-fadeIn">{children}</div>
      )}


      {mode === "form" && (
        <div className="animate-fadeIn">
          <Card className="p-6 border-slate-200">
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                Manual Setup
              </h3>
              <p className="text-sm text-text-muted">
                Fill in the details to generate your mock interview.
              </p>
            </div>
            <FormFields
              role={role}
              setRole={setRole}
              level={level}
              setLevel={setLevel}
              techstack={techstack}
              setTechstack={setTechstack}
              type={type}
              setType={setType}
              amount={amount}
              setAmount={setAmount}
            />
            <div className="mt-6">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-11 font-semibold bg-primary text-white hover:bg-primary-dark"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    Generating Questions...
                  </span>
                ) : (
                  "Generate Interview →"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}


      {mode === "jd" && step === "input" && (
        <div className="animate-fadeIn">
          <Card className="p-6 border-slate-200">
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                Paste Job Description
              </h3>
              <p className="text-sm text-text-muted">
                Paste a job description and we&apos;ll extract the details
                automatically using AI.
              </p>
            </div>
            <div className="space-y-4">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here...&#10;&#10;Example:&#10;We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and Next.js..."
                className="w-full min-h-[200px] rounded-lg border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y"
              />
              <Button
                onClick={() => handleExtract(jdText)}
                disabled={isExtracting || !jdText.trim()}
                className="w-full h-11 font-semibold bg-primary text-white hover:bg-primary-dark"
              >
                {isExtracting ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    Extracting with AI...
                  </span>
                ) : (
                  "Extract & Preview →"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}


      {mode === "pdf" && step === "input" && (
        <div className="animate-fadeIn">
          <Card className="p-6 border-slate-200">
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                Upload Job Description
              </h3>
              <p className="text-sm text-text-muted">
                Upload a PDF or text file (max 5MB, 1-4 pages) and we&apos;ll
                extract the details.
              </p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                "border-slate-300 hover:border-primary hover:bg-primary-50/30",
                isExtracting && "pointer-events-none opacity-60"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {isExtracting ? (
                <div className="flex flex-col items-center gap-3">
                  <LoadingSpinner size="lg" />
                  <p className="text-sm font-medium text-text-secondary">
                    Reading & extracting with AI...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="size-14 rounded-full bg-orange-50 flex items-center justify-center text-2xl">
                    
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Click to upload a file
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      PDF or TXT — max 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}


      {(mode === "jd" || mode === "pdf") && step === "preview" && (
        <div className="animate-fadeIn">
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-text-primary">
                  Review Extracted Details
                </h3>
                <p className="text-sm text-text-muted">
                  Verify and adjust the AI-extracted fields before generating.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                <span className="size-1.5 rounded-full bg-green-500" />
                AI Extracted
              </span>
            </div>

            <FormFields
              role={role}
              setRole={setRole}
              level={level}
              setLevel={setLevel}
              techstack={techstack}
              setTechstack={setTechstack}
              type={type}
              setType={setType}
              amount={amount}
              setAmount={setAmount}
            />

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setStep("input");
                }}
                className="flex-1 h-11"
              >
                ← Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-[2] h-11 font-semibold bg-primary text-white hover:bg-primary-dark"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    Generating Questions...
                  </span>
                ) : (
                  "Generate Interview →"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};



interface FormFieldsProps {
  role: string;
  setRole: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  techstack: string;
  setTechstack: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  amount: number;
  setAmount: (v: number) => void;
}

const FormFields = ({
  role,
  setRole,
  level,
  setLevel,
  techstack,
  setTechstack,
  type,
  setType,
  amount,
  setAmount,
}: FormFieldsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

    <div className="space-y-2 sm:col-span-2">
      <Label className="text-text-secondary font-medium text-sm">
        Job Role
      </Label>
      <Input
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="e.g. Frontend Developer, Data Scientist"
        className="h-11 bg-white border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>


    <div className="space-y-2">
      <Label className="text-text-secondary font-medium text-sm">
        Experience Level
      </Label>
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={cn(
              "flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer",
              level === l
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-text-secondary border-border hover:border-primary/50"
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>


    <div className="space-y-2">
      <Label className="text-text-secondary font-medium text-sm">
        Interview Type
      </Label>
      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer",
              type === t
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-text-secondary border-border hover:border-primary/50"
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>


    <div className="space-y-2 sm:col-span-2">
      <Label className="text-text-secondary font-medium text-sm">
        Tech Stack
      </Label>
      <Input
        value={techstack}
        onChange={(e) => setTechstack(e.target.value)}
        placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
        className="h-11 bg-white border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <p className="text-xs text-text-muted">Separate technologies with commas</p>
    </div>


    <div className="space-y-2 sm:col-span-2">
      <Label className="text-text-secondary font-medium text-sm">
        Number of Questions
      </Label>
      <div className="flex gap-2">
        {QUESTION_COUNTS.map((c) => (
          <button
            key={c}
            onClick={() => setAmount(c)}
            className={cn(
              "flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer",
              amount === c
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-text-secondary border-border hover:border-primary/50"
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  </div>
);



const LoadingSpinner = ({ size = "sm" }: { size?: "sm" | "lg" }) => (
  <svg
    className={cn(
      "animate-spin",
      size === "sm" ? "size-4" : "size-8"
    )}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default InterviewGenerator;
