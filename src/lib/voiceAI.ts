
// ElevenLabs voice AI integration
// This connects to the ElevenLabs API for text-to-speech functionality

type VoiceConfig = {
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
  useSpeakerBoost: boolean;
};

type ElevenLabsConfig = {
  apiKey: string | null;
  defaultVoice: VoiceConfig;
};

// Default configuration
export const elevenLabsConfig: ElevenLabsConfig = {
  apiKey: null, // This should be set by the user
  defaultVoice: {
    voiceId: "9BWtsMINqrJLrRacOk9x", // "Aria" voice
    model: "eleven_multilingual_v2",
    stability: 0.5,
    similarityBoost: 0.75,
    useSpeakerBoost: true
  }
};

// Function to convert text to speech using ElevenLabs API
export const textToSpeech = async (
  text: string, 
  voiceConfig?: Partial<VoiceConfig>
): Promise<HTMLAudioElement | null> => {
  if (!elevenLabsConfig.apiKey) {
    console.error("ElevenLabs API key not configured");
    return null;
  }
  
  try {
    // Merge default config with any custom voice settings
    const voice = { ...elevenLabsConfig.defaultVoice, ...voiceConfig };
    
    // Make a real API call to ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsConfig.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: voice.model,
        voice_settings: {
          stability: voice.stability,
          similarity_boost: voice.similarityBoost,
          use_speaker_boost: voice.useSpeakerBoost
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("ElevenLabs API error:", error);
      return null;
    }

    // Convert the response to a blob and create a URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create and return the audio element
    const audio = new Audio(audioUrl);
    return audio;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    return null;
  }
};

// Function to initialize the voice AI with an API key
export const initializeVoiceAI = (apiKey: string): boolean => {
  try {
    // Validate API key (in a real app, we might make a test API call)
    if (!apiKey || apiKey.length < 10) {
      console.error("Invalid API key format");
      return false;
    }
    
    // Store the API key in the config
    elevenLabsConfig.apiKey = apiKey;
    return true;
  } catch (error) {
    console.error("Error initializing Voice AI:", error);
    return false;
  }
};

// Function to get available voices (real API call)
export const getAvailableVoices = async (): Promise<{ id: string, name: string }[]> => {
  if (!elevenLabsConfig.apiKey) {
    return [
      { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
      { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
      { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
      { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" }
    ];
  }
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': elevenLabsConfig.apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }
    
    const data = await response.json();
    return data.voices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name
    }));
  } catch (error) {
    console.error("Error fetching voices:", error);
    // Return default voices on error
    return [
      { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
      { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
      { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
      { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" }
    ];
  }
};

// Function to speak a text immediately
export const speak = async (text: string): Promise<void> => {
  const audio = await textToSpeech(text);
  if (audio) {
    audio.play();
  }
};

// Function to create a natural-sounding pause
export const createPause = (seconds: number = 1): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

// Function to read a series of text chunks with pauses in between
export const readSequence = async (textChunks: string[], pauseSeconds: number = 0.5): Promise<void> => {
  for (const chunk of textChunks) {
    await speak(chunk);
    await createPause(pauseSeconds);
  }
};
