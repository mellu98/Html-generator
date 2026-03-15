import type {
  AIHealthResponse,
  DiscoveryChatRequest,
  DiscoveryChatResponse,
  GenerateCopyRequest,
  GenerateCopyResponse,
  ImageChatRequest,
  ImageChatResponse,
} from '../types'

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null

    throw new Error(errorPayload?.error || `HTTP ${response.status}`)
  }

  return (await response.json()) as T
}

export async function getAIHealth() {
  const response = await fetch('/api/health')
  return await parseJsonResponse<AIHealthResponse>(response)
}

export async function generateLandingCopy(payload: GenerateCopyRequest) {
  const response = await fetch('/api/generate-copy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return await parseJsonResponse<GenerateCopyResponse>(response)
}

export async function continueDiscoveryChat(payload: DiscoveryChatRequest) {
  const response = await fetch('/api/discovery-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return await parseJsonResponse<DiscoveryChatResponse>(response)
}

export async function generateLandingImage(payload: ImageChatRequest) {
  const response = await fetch('/api/image-chat/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return await parseJsonResponse<ImageChatResponse>(response)
}
