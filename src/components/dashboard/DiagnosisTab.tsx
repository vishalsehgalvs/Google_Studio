
"use client";

import { useState, useRef, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Mic, Upload, X, Loader2, AlertCircle, Volume2, ShieldCheck, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import { imageBasedDiagnosis } from '@/ai/flows/image-based-diagnosis';
import { voiceQueryToText } from '@/ai/flows/voice-query-to-text';
import { useToast } from "@/hooks/use-toast";
import { voiceBasedInformationDelivery } from '@/ai/flows/voice-based-information-delivery';
import { Progress } from '../ui/progress';
import { answerFollowUp } from '@/ai/flows/continuous-query';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { useUser } from '@/context/UserContext';
import { saveDiagnosis } from '@/lib/db';
import { useTranslation } from '@/context/LanguageContext';

type DiagnosisResult = {
  disease: string;
  remedies: string;
  confidenceScore: number;
};

type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
};

export default function DiagnosisTab() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  
  const { playAudio, stopAudio, isPlaying, isLoading: isAudioLoading, audioSrc } = useAudioPlayer();
  const { user } = useUser();
  const { languageCode, t } = useTranslation();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [currentSpokenText, setCurrentSpokenText] = useState("");


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setDiagnosis(null);
      setError(null);
      setChatHistory([]);
    }
  };

  const handleDiagnose = async () => {
    if (!imagePreview || !user) return;
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);
    setChatHistory([]);
    try {
      const result = await imageBasedDiagnosis({ 
        photoDataUri: imagePreview,
        language: languageCode || 'en',
      });
      setDiagnosis(result.diagnosis);
      saveDiagnosis(user.id, {
        id: `diag_${Date.now()}`,
        userId: user.id,
        imageDataUri: imagePreview,
        ...result.diagnosis,
        timestamp: new Date().toISOString(),
      });
      toast({ title: "Diagnosis Saved", description: "The result has been saved to your farm history." });
    } catch (e) {
      console.error(e);
      setError(t('diagnosisTab.error.failedDiagnosis'));
      toast({
        variant: "destructive",
        title: "Diagnosis Error",
        description: "Could not get diagnosis from the image."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakDiagnosis = async () => {
    if (!diagnosis) return;
    const textToSpeak = `${t('diagnosisTab.diseaseIdentified')}: ${diagnosis.disease}. ${t('diagnosisTab.suggestedRemedies')}: ${diagnosis.remedies}`;
    
    if (isPlaying && currentSpokenText === textToSpeak) {
      stopAudio();
      setCurrentSpokenText("");
      return;
    }

    setCurrentSpokenText(textToSpeak);
    try {
      const { audioDataUri } = await voiceBasedInformationDelivery({ text: textToSpeak });
      playAudio(audioDataUri);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate audio.",
      });
      setCurrentSpokenText("");
    }
  };
  
  const startRecording = async () => {
    setTranscript('');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const result = await voiceQueryToText({ audioDataUri: base64Audio });
            setTranscript(result.text);
            if(diagnosis) {
              setFollowUpQuestion(result.text);
            }
          } catch (e) {
             console.error(e);
             setError(t('diagnosisTab.error.failedTranscription'));
             toast({ variant: "destructive", title: "Transcription Error", description: "Could not understand audio." });
          } finally {
             setIsTranscribing(false);
          }
        };
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied. Please enable it in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpQuestion.trim() || !diagnosis) return;

    const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: followUpQuestion }];
    setChatHistory(newHistory);
    setFollowUpQuestion("");
    setIsAnswering(true);
    
    try {
      const context = `The diagnosed disease is ${diagnosis.disease}. The suggested remedies are: ${diagnosis.remedies}.`;
      const result = await answerFollowUp({ 
          question: followUpQuestion, 
          context,
          language: languageCode || 'en',
      });
      setChatHistory([...newHistory, { sender: 'ai', text: result.answer }]);
    } catch(e) {
      console.error(e);
      const errorMessage = "Sorry, I couldn't answer that question. Please try again.";
      setChatHistory([...newHistory, { sender: 'ai', text: errorMessage }]);
      toast({ variant: "destructive", title: "Error", description: "Failed to get an answer." });
    } finally {
      setIsAnswering(false);
    }
  };
  
  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><ImageIcon className="text-primary"/>{t('diagnosisTab.title')}</CardTitle>
          <CardDescription>{t('diagnosisTab.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
             <Input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="image-upload" />
             <label htmlFor="image-upload" className="cursor-pointer">
                {imagePreview ? (
                    <div className="relative w-full h-64">
                         <Image src={imagePreview} alt="Crop preview" fill className="object-contain rounded-md" data-ai-hint="plant disease" />
                         <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={(e) => { e.preventDefault(); setImagePreview(null); setImageFile(null); setDiagnosis(null); setChatHistory([]); }}>
                             <X className="h-4 w-4"/>
                         </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-10 w-10"/>
                        <p>{t('diagnosisTab.uploadPrompt')}</p>
                    </div>
                )}
             </label>
          </div>
          {imageFile && (
            <div className="text-sm text-muted-foreground">
              {t('diagnosisTab.selectedFile', { fileName: imageFile.name })}
            </div>
          )}
        </CardContent>
        <CardFooter>
            <Button onClick={handleDiagnose} disabled={!imagePreview || isLoading || !user} className="w-full bg-accent hover:bg-accent/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {isLoading ? t('diagnosisTab.diagnosing') : t('diagnosisTab.diagnosePlant')}
            </Button>
        </CardFooter>
      </Card>

      <div className="space-y-8">
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Mic className="text-primary"/>{t('diagnosisTab.voiceQueryTitle')}</CardTitle>
                <CardDescription>{t('diagnosisTab.voiceQueryDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <Button onClick={handleMicClick} size="lg" variant={isRecording ? 'destructive' : 'outline'} className="rounded-full w-20 h-20 border-accent text-accent hover:bg-accent/10 hover:text-accent">
                    <Mic className={`h-8 w-8 ${isRecording ? 'animate-pulse' : ''}`}/>
                </Button>
                <p className="text-sm text-muted-foreground">{isRecording ? t('diagnosisTab.recording') : t('diagnosisTab.tapToSpeak')}</p>
                {isTranscribing && (
                    <div className="flex items-center text-sm text-primary"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('diagnosisTab.transcribing')}</div>
                )}
                {transcript && !isTranscribing &&(
                    <div className="w-full p-3 bg-muted rounded-md text-center">
                        <p className="font-semibold">{t('diagnosisTab.youSaid')}</p>
                        <p className="italic">"{transcript}"</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {(isLoading || diagnosis || error) && (
            <Card className="shadow-lg border-primary/20 animate-in fade-in-50">
              <CardHeader>
                  <CardTitle className="font-headline text-xl">{t('diagnosisTab.resultTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                  {isLoading && <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/> <p>{t('diagnosisTab.analyzing')}</p></div>}
                  {error && <div className="text-destructive flex items-center gap-2"><AlertCircle className="h-5 w-5"/> <p>{error}</p></div>}
                  {diagnosis && (
                      <div className="space-y-4">
                          <div>
                              <h3 className="font-bold text-lg text-primary">{t('diagnosisTab.diseaseIdentified')}</h3>
                              <p>{diagnosis.disease}</p>
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-primary">{t('diagnosisTab.suggestedRemedies')}</h3>
                              <p className="whitespace-pre-wrap">{diagnosis.remedies}</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-primary flex items-center gap-2"><ShieldCheck size={20}/>{t('diagnosisTab.confidenceScore')}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <Progress value={diagnosis.confidenceScore * 100} className="w-full h-3" />
                                <span className="font-mono text-sm">{(diagnosis.confidenceScore * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <Button onClick={handleSpeakDiagnosis} variant="outline" size="sm" className="mt-4 border-accent text-accent hover:bg-accent/10 hover:text-accent">
                            <Volume2 className={`mr-2 h-4 w-4 ${(isPlaying && currentSpokenText.startsWith(t('diagnosisTab.diseaseIdentified'))) || isAudioLoading ? "animate-pulse" : ""}`} />
                            {(isPlaying && currentSpokenText.startsWith(t('diagnosisTab.diseaseIdentified'))) ? t('diagnosisTab.stop') : (isAudioLoading && currentSpokenText.startsWith(t('diagnosisTab.diseaseIdentified'))) ? t('diagnosisTab.loading') : t('diagnosisTab.readAloud')}
                          </Button>

                          <div className="pt-4 border-t border-border">
                            <h3 className="font-bold text-lg text-primary flex items-center gap-2"><MessageCircle size={20} /> {t('diagnosisTab.followUpTitle')}</h3>
                            <ScrollArea className="h-48 w-full rounded-md border p-4 mt-2 bg-muted/50">
                                <div className="space-y-4">
                                  {chatHistory.map((msg, index) => (
                                      <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                          <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                              <p className="text-sm">{msg.text}</p>
                                          </div>
                                      </div>
                                  ))}
                                  {isAnswering && <div className="flex justify-start"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
                                </div>
                            </ScrollArea>
                            <div className="mt-4 flex gap-2">
                                <Textarea 
                                  value={followUpQuestion}
                                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                                  placeholder={t('diagnosisTab.typeQuestion')}
                                  className="flex-1"
                                  rows={1}
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleFollowUpSubmit();
                                      }
                                  }}
                                />
                                <Button onClick={handleFollowUpSubmit} disabled={isAnswering || !followUpQuestion.trim()}>
                                    <Send className="h-4 w-4"/>
                                </Button>
                            </div>
                          </div>

                      </div>
                  )}
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
