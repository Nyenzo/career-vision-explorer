// Compatibility bridge: Gemini naming now maps to DeepSeek implementation.
export {
    deepseekService,
    deepseekService as geminiService,
} from './deepseek.service';

export type {
    GenerateRequest,
    GenerateResponse,
} from './deepseek.service';
