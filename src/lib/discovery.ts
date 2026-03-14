import type {
  AIGenerationForm,
  DiscoveryMessage,
  DiscoveryMissingInput,
} from '../types'

export const discoveryMissingInputLabels: Record<DiscoveryMissingInput, string> = {
  offerta: 'Offerta / descrizione',
  buyer_personas: 'Buyer personas',
  obiezioni: 'Obiezioni / review negative',
}

export function createInitialDiscoveryMessages(): DiscoveryMessage[] {
  return [
    {
      id: 'assistant-initial',
      role: 'assistant',
      content:
        'Senti, prima di scriverti una landing in stile Signora Market Copy mi servono 3 cose precise: 1) link della landing o descrizione dettagliata dell offerta, 2) buyer personas, 3) recensioni negative / obiezioni reali oppure link Amazon da cui ricavarle. Mandami pure tutto insieme o partiamo dal primo punto.',
    },
  ]
}

export function hasOfferInput(form: AIGenerationForm) {
  return Boolean(
    form.productDescription.trim() ||
      form.productName.trim() ||
      form.brandName.trim() ||
      form.productCategory.trim(),
  )
}

export function hasPersonaInput(form: AIGenerationForm) {
  return Boolean(form.targetAudience.trim())
}

export function hasObjectionInput(form: AIGenerationForm) {
  return Boolean(
    form.painPoints.trim() || form.proofPoints.trim() || form.faqsContext.trim(),
  )
}

export function getDiscoveryMissingInputs(form: AIGenerationForm): DiscoveryMissingInput[] {
  const missing: DiscoveryMissingInput[] = []

  if (!hasOfferInput(form)) {
    missing.push('offerta')
  }

  if (!hasPersonaInput(form)) {
    missing.push('buyer_personas')
  }

  if (!hasObjectionInput(form)) {
    missing.push('obiezioni')
  }

  return missing
}

export function isDiscoveryReady(form: AIGenerationForm) {
  return getDiscoveryMissingInputs(form).length === 0
}
