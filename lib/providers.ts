export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  apiKeyPlaceholder: string;
  apiDocsUrl: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    apiKeyPlaceholder: 'sk-...',
    apiDocsUrl: 'https://platform.openai.com/api-keys',
    models: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Good balance of intelligence and speed',
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model, but slower and more expensive',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Latest model with improved capabilities',
      },
    ],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    apiKeyPlaceholder: 'Co-...',
    apiDocsUrl: 'https://dashboard.cohere.com/api-keys',
    models: [
      {
        id: 'command',
        name: 'Command',
        description: 'General purpose model for various tasks',
      },
      {
        id: 'command-light',
        name: 'Command Light',
        description: 'Faster and more cost-effective version',
      },
      {
        id: 'command-r',
        name: 'Command R',
        description: 'Advanced reasoning capabilities',
      },
      {
        id: 'command-r-plus',
        name: 'Command R+',
        description: 'Most powerful model with enhanced reasoning',
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    apiKeyPlaceholder: 'sk-ant-...',
    apiDocsUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Most powerful model for complex tasks',
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Balanced performance and cost',
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Fast and cost-effective',
      },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    apiKeyPlaceholder: 'your-mistral-api-key',
    apiDocsUrl: 'https://console.mistral.ai/api-keys/',
    models: [
      {
        id: 'mistral-small',
        name: 'Mistral Small',
        description: 'Efficient model for general tasks',
      },
      {
        id: 'mistral-medium',
        name: 'Mistral Medium',
        description: 'Balanced performance model',
      },
      {
        id: 'mistral-large',
        name: 'Mistral Large',
        description: 'Most capable Mistral model',
      },
    ],
  },
];

export function getProviderById(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find(provider => provider.id === id);
}

export function getDefaultModelForProvider(providerId: string): string {
  const provider = getProviderById(providerId);
  return provider?.models[0]?.id || '';
}
