
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { GameConfig, Question } from '../types';

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey });
}

export const generateTriviaImage = async (topic: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `A vibrant, high-quality, aesthetically pleasing image representing the topic of ${topic} for a trivia game.` }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in response");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate an image for the topic. Please try again.");
    }
};

export const generateTriviaQuestions = async (config: GameConfig): Promise<Question[]> => {
    const ai = getAiClient();
    const { topic, numQuestions, difficulty, language } = config;
    
    const prompt = `Generate ${numQuestions} multiple-choice trivia questions about ${topic}.
    The difficulty level should be ${difficulty}.
    The questions should be in ${language}.
    For each question, provide exactly 4 options.
    One of the options must be the correct answer.
    The 'answer' field must exactly match one of the strings in the 'options' array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    answer: { type: Type.STRING }
                                },
                                required: ["question", "options", "answer"]
                            }
                        }
                    },
                    required: ["questions"]
                },
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
            // Validate that we got the right number of questions and that they are structured correctly
            const questions = parsedResponse.questions.slice(0, numQuestions);
            if (questions.length === 0) throw new Error("AI returned no questions.");
            return questions.map((q: any) => ({
                question: q.question,
                options: q.options.length === 4 ? q.options : [...q.options, "None of the above"].slice(0, 4),
                answer: q.answer,
            }));
        }
        
        throw new Error("Invalid response structure from AI");
    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Failed to generate trivia questions. The topic might be too specific or there was an API issue.");
    }
};
