import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { info } from "@actions/core";

const LLM_MODELS = [
  {
    name: "claude-3-5-sonnet-20241022",
    createAi: createAnthropic,
  },
  {
    name: "gpt-4o-mini",
    createAi: createOpenAI,
  },
];

export async function runPrompt({
  prompt,
  systemPrompt,
  schema,
}: {
  prompt: string;
  systemPrompt?: string;
  schema: z.ZodObject<any, any>;
}) {
  const model = LLM_MODELS.find((m) => m.name === process.env.LLM_MODEL);
  if (!model) {
    throw new Error(`Unknown LLM model: ${process.env.LLM_MODEL}`);
  }

  const llm = model.createAi({ apiKey: process.env.LLM_API_KEY });
  const { object, usage } = await generateObject({
    model: llm(model.name),
    prompt,
    system: systemPrompt,
    schema,
  });

  if (process.env.DEBUG) {
    info(`usage: \n${JSON.stringify(usage, null, 2)}`);
  }

  return object;
}