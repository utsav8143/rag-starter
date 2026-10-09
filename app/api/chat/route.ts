import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  tool,
  toUIMessageStream,
  UIMessage,
  isStepCount,
} from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { createResource } from '@/lib/actions/resources';
import {findRelevantContent} from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-3.8-flash"),
     instructions: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    Only respond to questions using information form tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    tools: {
      addResource: tool({
        description:`add a resource to your knowledge base.
        If the user provides a random piece of knowledge unprompted,use this tool withot asking for confirmation.`,
        inputSchema:z.object({
          content:z
          .string()
          .describe('the content o resouce to add to the knowledge base'),
        }),
        execute:async({content})=> createResource({content}),
      }),
      getInformation: tool({
        description:`get  information from your knowledge base to answer questions.`,
        inputSchema:z.object({
          question:z.string().describe('the users question'),
      }),
      execute: async({question}) => findRelevantContent(question),
    }),
  }
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}