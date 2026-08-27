import type { Stream } from '@libp2p/interface';
import * as lp from 'it-length-prefixed';
import { fromString as u8FromString, toString as u8ToString } from 'uint8arrays';
import type { Uint8ArrayList } from 'uint8arraylist';
import type { InferenceRequest, InferenceResponse } from '@shared/types';

export const INFERENCE_PROTOCOL = '/modelbus/inference/1.0.0';
export const INFERENCE_MAX_SIZE = 32 * 1024 * 1024;

async function writeJson(stream: Stream, payload: unknown): Promise<void> {
  const json = JSON.stringify(payload);
  const bytes = u8FromString(json);
  const encoded = lp.encode([bytes], { maxDataLength: INFERENCE_MAX_SIZE });
  for (const chunk of encoded) {
    await stream.sink([chunk]);
  }
  try {
    await stream.closeWrite();
  } catch {
    /* ignore */
  }
}

async function readJson<T>(stream: Stream): Promise<T> {
  const decoded = lp.decode(stream.source, { maxDataLength: INFERENCE_MAX_SIZE });
  for await (const chunk of decoded as AsyncIterable<Uint8ArrayList>) {
    return JSON.parse(u8ToString(chunk.subarray())) as T;
  }
  throw new Error('inference: empty stream');
}

export async function writeInferenceRequest(stream: Stream, req: InferenceRequest): Promise<void> {
  await writeJson(stream, req);
}

export async function writeInferenceResponse(stream: Stream, res: InferenceResponse): Promise<void> {
  await writeJson(stream, res);
}

export async function readInferenceRequest(stream: Stream): Promise<InferenceRequest> {
  return readJson<InferenceRequest>(stream);
}

export async function readInferenceResponse(stream: Stream): Promise<InferenceResponse> {
  return readJson<InferenceResponse>(stream);
}

export type InferenceStreamHandler = (req: InferenceRequest) => Promise<InferenceResponse>;

export function serveInference(handler: InferenceStreamHandler) {
  return ({ stream }: { stream: Stream; connection: unknown }) => {
    void (async () => {
      try {
        const req = await readInferenceRequest(stream);
        const res = await handler(req);
        await writeInferenceResponse(stream, res);
      } catch (err) {
        console.error('[inference] server error:', (err as Error).message);
        try {
          await stream.close();
        } catch {
          /* ignore */
        }
      }
    })();
  };
}

export async function dialAndCallInference(
  conn: { newStream: (proto: string | string[]) => Promise<Stream> },
  req: InferenceRequest,
  protocols = [INFERENCE_PROTOCOL]
): Promise<InferenceResponse> {
  const stream = await conn.newStream(protocols);
  await writeInferenceRequest(stream, req);
  const res = await readInferenceResponse(stream);
  try {
    await stream.close();
  } catch {
    /* ignore */
  }
  return res;
}