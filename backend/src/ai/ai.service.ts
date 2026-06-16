import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiChatMessage, AiChatResponse } from '@g-hub/shared';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-3-5-haiku-latest';
const MAX_TOKENS = 1024;

// Rolle des Assistenten: knapper deutscher Marketing-Helfer für G-Hub.
const SYSTEM_PROMPT = [
  'Du bist der KI-Assistent von G-Hub, einem Marketing-Hub für ein kleines Team.',
  'Antworte auf Deutsch, freundlich, konkret und knapp (in der Regel 2–5 Sätze).',
  'Du hilfst bei Aufgaben, Tagesplanung, Kampagnen-Einordnung und Content-Ideen für Social Media.',
  'Formatiere Hervorhebungen mit **fett** und nutze Zeilenumbrüche für Aufzählungen.',
  'Wenn dir echte Daten fehlen, sage das offen und mache umsetzbare Vorschläge, statt Zahlen zu erfinden.',
].join(' ');

interface AnthropicContentBlock {
  type: string;
  text?: string;
}
interface AnthropicResponse {
  content?: AnthropicContentBlock[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  /** Sendet den Gesprächsverlauf an die Anthropic Messages-API und gibt die Antwort zurück. */
  async chat(messages: AiChatMessage[]): Promise<AiChatResponse> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'KI ist nicht konfiguriert (ANTHROPIC_API_KEY fehlt).',
      );
    }
    const model = this.config.get<string>('ANTHROPIC_MODEL') ?? DEFAULT_MODEL;

    let res: Response;
    try {
      res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
    } catch (err) {
      this.logger.error('Anthropic-Request fehlgeschlagen', err as Error);
      throw new ServiceUnavailableException('KI-Dienst nicht erreichbar.');
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      this.logger.error(`Anthropic-Fehler ${res.status}: ${detail.slice(0, 500)}`);
      throw new ServiceUnavailableException('KI-Dienst hat einen Fehler gemeldet.');
    }

    const data = (await res.json()) as AnthropicResponse;
    const reply = (data.content ?? [])
      .filter((b) => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text as string)
      .join('\n')
      .trim();

    return { reply: reply || 'Dazu habe ich gerade keine Antwort.' };
  }
}
