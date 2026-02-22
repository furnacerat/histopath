import OpenAI from "openai";
import { Flashcard, Question, Slide, Topic, TroubleshootingScenario } from "../types";
import { getCachedImage, cacheImage } from "../lib/imageCache";

// Vite exposes VITE_* env vars via import.meta.env
const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || "";

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

// Helper: call gpt-4o and parse JSON response
async function chatJSON<T>(prompt: string): Promise<T> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  const text = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(text);
}

// Helper: call gpt-4o for plain text
async function chatText(systemPrompt: string, userMessage: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });
  return completion.choices[0]?.message?.content || "";
}

export const geminiService = {
  async generateSlides(count: number = 5): Promise<Slide[]> {
    const result = await chatJSON<{ slides: any[] }>(`Generate ${count} histology slides for a virtual slide box.
    Each slide should represent a real organ or tissue type.
    For each slide, provide:
    1. title - a clear slide title (e.g., "Skeletal Muscle", "Small Intestine").
    2. description - a descriptive paragraph about the histological features.
    3. topic - one of: 'Fixation', 'Processing & Embedding', 'Microtomy', 'Staining', 'Special Stains', 'Lab Operations & Safety', 'Anatomy & Physiology'.
    4. imagePrompt - a detailed DALL-E prompt for the histology slide image (e.g., "H&E stained skeletal muscle tissue showing long cylindrical fibers with peripherally located nuclei and visible striations, photomicrograph, 400x magnification").
    5. magnification - typical magnification (e.g., "100x", "400x").
    6. stain - typical stain used (e.g., "H&E", "PAS", "Masson's Trichrome").
    
    Return as JSON: { "slides": [ ...array of slide objects... ] }`);

    const data = result.slides || [];

    const slidesWithImages = await Promise.all(data.map(async (item: any, index: number) => {
      try {
        const imageUrl = await geminiService.generateImage(item.imagePrompt);
        return { id: `slide-${Date.now()}-${index}`, ...item, imageUrl };
      } catch (e) {
        console.warn("Failed to generate image for slide:", item.title);
        return { id: `slide-${Date.now()}-${index}`, ...item, imageUrl: null };
      }
    }));

    return slidesWithImages;
  },

  async generateFlashcards(topic: Topic, count: number = 5): Promise<Flashcard[]> {
    const result = await chatJSON<{ flashcards: any[] }>(`Generate ${count} high-quality histology flashcards for the topic: ${topic}.
    Focus on state license requirements (ASCP HT/HTL standards).
    Each flashcard must have: question (string) and answer (string).
    Return as JSON: { "flashcards": [ ...array... ] }`);

    const data = result.flashcards || [];
    return data.map((item: any, index: number) => ({
      id: `fc-${topic}-${Date.now()}-${index}`,
      topic,
      ...item,
    }));
  },

  async generateQuiz(topic: Topic | 'Comprehensive', count: number = 10): Promise<Question[]> {
    const topicPrompt = topic === 'Comprehensive'
      ? "all major histology topics (Fixation, Processing, Microtomy, Staining, Safety)"
      : topic;

    const result = await chatJSON<{ questions: any[] }>(`Generate a ${count}-question multiple-choice quiz for histology state license preparation.
    Topic: ${topicPrompt}.
    Each question must have:
    - text: the question string
    - options: array of exactly 4 answer strings
    - correctAnswer: integer index (0-3) of the correct option
    - explanation: detailed explanation for the correct answer
    - topic: the specific sub-topic
    
    Focus on technical accuracy and license exam standards.
    Return as JSON: { "questions": [ ...array... ] }`);

    const data = result.questions || [];
    return data.map((item: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      ...item,
    }));
  },

  async generateSpotterQuiz(count: number = 5): Promise<Question[]> {
    const result = await chatJSON<{ questions: any[] }>(`Generate a ${count}-question "Spotter" quiz for histology.
    Each question is based on identifying a tissue, organ, or structure from a microscopy image.
    Each question must have:
    - text: the question string (ask the student to identify the tissue/structure)
    - options: array of exactly 4 answer strings
    - correctAnswer: integer index (0-3)
    - explanation: detailed explanation
    - topic: the histology topic
    - imagePrompt: a detailed DALL-E prompt to generate the microscopy image (e.g., "H&E stained kidney glomerulus photomicrograph at 400x magnification showing Bowman's capsule and capillary tufts")
    
    Return as JSON: { "questions": [ ...array... ] }`);

    const data = result.questions || [];

    const questionsWithImages = await Promise.all(data.map(async (item: any, index: number) => {
      try {
        const imageUrl = await geminiService.generateImage(item.imagePrompt);
        return { id: `spot-${Date.now()}-${index}`, ...item, imageUrl };
      } catch (e) {
        console.warn("Failed to generate image for question:", item.text?.substring(0, 50));
        return { id: `spot-${Date.now()}-${index}`, ...item, imageUrl: null };
      }
    }));

    return questionsWithImages;
  },

  async generateTroubleshootingScenarios(count: number = 3): Promise<TroubleshootingScenario[]> {
    const result = await chatJSON<{ scenarios: any[] }>(`Generate ${count} unique histology lab troubleshooting scenarios.
    Each scenario describes a common processing, microtomy, or staining error.
    Use diverse problems (e.g., chatter, pale nuclei, crunchy tissue, water spots, folding, air bubbles, uneven staining, contamination, washboarding, Venetian blind effect, nuclear bubbling, etc.).
    Each scenario must have:
    - title: catchy title for the problem
    - problemDescription: description of the visible problem
    - observation: microscopic observation
    - options: array of exactly 4 possible diagnoses
    - correctOptionIndex: integer (0-3) index of the correct diagnosis
    - explanation: detailed explanation of cause and fix
    - imagePrompt: a detailed DALL-E prompt for a microscopy image showing this artifact (e.g., "H&E stained liver tissue section showing chatter artifact with thin parallel lines across the section, photomicrograph")
    
    Return as JSON: { "scenarios": [ ...array... ] }`);

    const data = result.scenarios || [];

    const scenariosWithImages = await Promise.all(data.map(async (item: any, index: number) => {
      try {
        const imageUrl = await geminiService.generateImage(item.imagePrompt);
        return { id: `ts-${Date.now()}-${index}`, ...item, imageUrl };
      } catch (e) {
        console.warn("Failed to generate image for scenario:", item.title);
        return { id: `ts-${Date.now()}-${index}`, ...item, imageUrl: null };
      }
    }));

    return scenariosWithImages;
  },

  async startCommuterChat(history: { role: 'user' | 'model'; text: string }[], userProfile: any) {
    const systemPrompt = `You are "Commuter Companion", an AI histology tutor designed for hands-free or quick-interaction learning during a commute.
    
    Your goal is to:
    1. Lead a dynamic, verbal-first conversation about histology.
    2. ALWAYS end your turn with a clear, concise question for the user.
    3. Adapt to the user's level based on their profile: ${JSON.stringify(userProfile)}.
    4. If they answer correctly, give a brief "Great job!" or "Exactly!" and immediately move to a slightly harder question or a related sub-topic.
    5. If they struggle, provide a quick, memorable mnemonic or a 1-sentence explanation, then ask a simpler follow-up question.
    6. Keep your responses very short (1-3 sentences) so they are easy to listen to.
    7. Use a friendly, encouraging, and professional tone.
    
    Current Session Context:
    - Recent Success Rate: ${userProfile.recentSuccessRate * 100}%
    - Difficulty: ${userProfile.difficulty}
    
    Think of yourself as a supportive mentor sitting in the passenger seat.`;

    // Map history: Gemini uses 'model' role, OpenAI uses 'assistant'
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map(h => ({
        role: (h.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: h.text,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    return completion.choices[0]?.message?.content || "";
  },

  async generateSpeech(text: string): Promise<{ data: string; mimeType: string }> {
    console.log("Generating speech (OpenAI TTS) for:", text.substring(0, 60));
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text,
        response_format: "mp3",
      });

      // Convert the response stream to a base64 string
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);

      console.log("OpenAI TTS: audio generated successfully");
      return { data: base64, mimeType: "audio/mpeg" };
    } catch (err: any) {
      console.error("OpenAI TTS error:", err?.message || err);
      throw err;
    }
  },

  async generateRecommendation(score: number, total: number, topicResults: Record<string, { correct: number; total: number }>): Promise<string> {
    const percentage = Math.round((score / total) * 100);
    const resultsSummary = Object.entries(topicResults)
      .map(([topic, data]) => `${topic}: ${data.correct}/${data.total}`)
      .join(", ");

    return chatText(
      "You are an expert histology exam coach. Be encouraging and specific.",
      `A student just completed a histology practice quiz.
      Score: ${score}/${total} (${percentage}%).
      Topic Breakdown: ${resultsSummary}.
      
      Provide a brief, encouraging, and specific study recommendation.
      Identify the weakest area and suggest what they should focus on next.
      Keep it under 3 sentences. Use Markdown.`
    );
  },

  async askTutor(question: string, context?: string): Promise<string> {
    return chatText(
      "You are an expert Histology License Tutor. Provide clear, accurate, and encouraging explanations based on ASCP and state licensing standards. Use Markdown for formatting.",
      `${context ? `Context: ${context}\n\n` : ""}Student question: "${question}"`
    );
  },

  async generateImage(prompt: string): Promise<string> {
    // Build the full enriched prompt used for DALL-E
    const fullPrompt = `Realistic photomicrograph of histology slide: ${prompt}. Scientific microscopy image, high detail, medical quality.`;

    // Check cache first (Supabase → IndexedDB) — if hit, return immediately (free!)
    const cached = await getCachedImage(fullPrompt);
    if (cached) {
      console.log('🗄️ Image served from cache:', prompt.substring(0, 40));
      return cached;
    }

    // Cache miss — generate via DALL-E using b64_json to avoid CORS issues
    console.log('🎨 Generating new image via DALL-E:', prompt.substring(0, 40));
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json", // Get base64 directly — no cross-origin fetch needed
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data returned from DALL-E");

    const dataUrl = `data:image/png;base64,${b64}`;

    // Persist to Supabase (shared) + IndexedDB (local) for all future devices
    await cacheImage(fullPrompt, dataUrl);
    console.log('💾 Image cached successfully');

    return dataUrl;
  },
};
