"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisposalRecommendationCard } from "@/components/disposal/DisposalRecommendationCard";
import { DisposalGuideSidebar } from "@/components/disposal/DisposalGuideSidebar";
import {
  Camera,
  Upload,
  Sparkles,
  X,
} from "lucide-react";
import { useState, useRef, Suspense, useMemo } from "react";
import type { CvClassification } from "@/lib/classify/types";
import {
  getDisposalFromAssistantMessage,
  getLastDisposalRecommendation,
} from "@/lib/disposal/messages";
import { stripJsonFromText } from "@/lib/parsers/disposal";

function ChatPageContent() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const cvClassificationRef = useRef<CvClassification | null>(null);
  const [lastCvClassification, setLastCvClassification] =
    useState<CvClassification | null>(null);
  const [classifyError, setClassifyError] = useState<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            cvClassification: cvClassificationRef.current,
          },
        }),
      }),
    []
  );
  const { messages, sendMessage, status, error } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";
  const lastRecommendation = getLastDisposalRecommendation(messages);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(event.target.files);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(event.target.files);
    }
  };

  const handleSubmit = async () => {
    if ((input.trim() || files) && !isLoading) {
      setClassifyError(null);
      cvClassificationRef.current = null;

      if (files && files.length > 0) {
        try {
          const formData = new FormData();
          formData.append("image", files[0]);
          const response = await fetch("/api/classify", {
            method: "POST",
            body: formData,
          });
          if (response.ok) {
            const classification = (await response.json()) as CvClassification;
            cvClassificationRef.current = classification;
            setLastCvClassification(classification);
          } else {
            const payload = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;
            setClassifyError(
              payload?.error ??
                "Material detector offline — guidance will use vision AI only"
            );
            setLastCvClassification(null);
          }
        } catch {
          setClassifyError(
            "Material detector failed — guidance will use vision AI only"
          );
          setLastCvClassification(null);
        }
      } else {
        setLastCvClassification(null);
      }

      sendMessage({
        text: input || "What is this and where should it go for disposal in Kenya?",
        files: files,
      });
      setInput("");
      setFiles(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    if (!files) return;
    const dt = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });
    setFiles(dt.files.length > 0 ? dt.files : undefined);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">
            BinBuddy Sorting Desk
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Share a photo of what you&apos;re discarding and receive material labels,
            disposal steps, and Kenya-specific notes in one view.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg h-[700px] flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0">
                <CardTitle>Add a Photo</CardTitle>
                <CardDescription>
                  Camera or gallery — one item per check works best
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <Conversation className="flex-1">
                  <ConversationContent className="gap-6 px-6">
                    {messages.length === 0 ? (
                      <ConversationEmptyState
                        icon={<Sparkles className="w-12 h-12" />}
                        title="What are you throwing away?"
                        description="Capture or upload a picture to see where it should go"
                      >
                        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => cameraInputRef.current?.click()}
                            className="gap-2"
                          >
                            <Camera className="w-5 h-5" />
                            Take Photo
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-2"
                          >
                            <Upload className="w-5 h-5" />
                            Upload Image
                          </Button>
                        </div>
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleCameraCapture}
                          className="hidden"
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </ConversationEmptyState>
                    ) : (
                      messages.map((message) => {
                        if (message.role === "user") {
                          const textContent = message.parts
                            .filter((part) => part.type === "text")
                            .map((part) => (part as { text: string }).text)
                            .join("");

                          const imageParts = message.parts.filter(
                            (part): part is FileUIPart =>
                              part.type === "file" &&
                              part.mediaType?.startsWith("image/") === true
                          );

                          return (
                            <Message from={message.role} key={message.id}>
                              <MessageContent>
                                {imageParts.length > 0 && (
                                  <div className="mb-2 space-y-2">
                                    {imageParts.map((part, idx) =>
                                      part.url ? (
                                        <div
                                          key={idx}
                                          className="relative rounded-lg overflow-hidden border border-border"
                                        >
                                          <img
                                            src={part.url}
                                            alt={`Uploaded image ${idx + 1}`}
                                            className="w-full max-w-md h-auto"
                                          />
                                        </div>
                                      ) : null
                                    )}
                                  </div>
                                )}
                                {textContent && (
                                  <MessageResponse>{textContent}</MessageResponse>
                                )}
                              </MessageContent>
                            </Message>
                          );
                        }

                        if (message.role === "assistant") {
                          const { recommendation, intro } =
                            getDisposalFromAssistantMessage(message);

                          if (recommendation?.item) {
                            return (
                              <Message from={message.role} key={message.id}>
                                <MessageContent>
                                  <DisposalRecommendationCard
                                    recommendation={recommendation}
                                    intro={intro}
                                    cvClassification={lastCvClassification}
                                  />
                                </MessageContent>
                              </Message>
                            );
                          }

                          const textContent = message.parts
                            .filter((part) => part.type === "text")
                            .map((part) => (part as { text: string }).text)
                            .join("");
                          const displayText = stripJsonFromText(textContent);
                          if (!displayText.trim()) return null;

                          return (
                            <Message from={message.role} key={message.id}>
                              <MessageContent>
                                <MessageResponse>{displayText}</MessageResponse>
                              </MessageContent>
                            </Message>
                          );
                        }

                        return null;
                      })
                    )}
                    {isLoading && <Loader />}
                    {classifyError && (
                      <div className="bg-amber-500/10 text-amber-800 dark:text-amber-200 rounded-lg px-4 py-2 text-sm">
                        {classifyError}
                      </div>
                    )}
                    {error && (
                      <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 text-sm">
                        Error: {error.message}
                      </div>
                    )}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>

                <div className="p-4 border-t border-border flex-shrink-0 space-y-3">
                  {files && files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(files).map((file, idx) => (
                        <div key={idx} className="relative group">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeFile(idx)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Camera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <PromptInput onSubmit={handleSubmit} className="relative">
                    <PromptInputTextarea
                      value={input}
                      placeholder="Optional note — e.g. 'broken' or 'food inside'..."
                      onChange={(e) => setInput(e.currentTarget.value)}
                      className="pr-14 min-h-[52px] max-h-[200px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                    <PromptInputSubmit
                      status={isLoading ? "streaming" : "ready"}
                      disabled={!input.trim() && !files}
                      className="absolute bottom-2 right-2"
                    />
                  </PromptInput>
                </div>
              </CardContent>
            </Card>
          </div>

          <DisposalGuideSidebar
            recommendation={lastRecommendation}
            cvClassification={lastCvClassification}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

function ChatPageLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageLoading />}>
      <ChatPageContent />
    </Suspense>
  );
}
