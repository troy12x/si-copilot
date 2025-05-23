// AI API clients for dataset generation
import axios from 'axios';

// In a production environment, these should be stored in environment variables
// For this demo, we're using the provided keys directly

// API Keys from environment variables
const API_KEYS = {
  togetherAI: process.env.TOGETHER_AI_API_KEY || '',
  veniceAI: process.env.VENICE_AI_API_KEY || ''
};

// API Endpoints
const API_ENDPOINTS = {
  togetherAI: 'https://api.together.xyz/v1/chat/completions',
  veniceAI: 'https://api.venice.ai/api/v1/chat/completions'
};

// API Provider type
export type APIProvider = 'togetherAI' | 'veniceAI';

// Default API provider
export const DEFAULT_PROVIDER: APIProvider = 'veniceAI';

export interface ModelPricing {
  inputPrice: number; // Price per 1M tokens for input
  outputPrice: number; // Price per 1M tokens for output
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  pricing: ModelPricing;
  provider: APIProvider;
}

// Together AI Models
export const TOGETHER_AI_MODELS: AIModel[] = [
  {
    id: "Qwen/Qwen3-235B-A22B-fp8-tput",
    name: "Qwen3 235B",
    description: "Qwen's largest and most capable model",
    pricing: { inputPrice: 0.24, outputPrice: 0.40 },
    provider: 'togetherAI'
  },
  {
    id: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
    name: "Llama 4 Scout Instruct",
    description: "Meta's flagship open model",
    pricing: { inputPrice: 0.24, outputPrice: 0.40 },
    provider: 'togetherAI'
  },
  {
    id: "mistralai/Mistral-7B-Instruct-v0.2",
    name: "Mistral 7B",
    description: "Efficient and powerful instruction model",
    pricing: { inputPrice: 0.24, outputPrice: 0.40 },
    provider: 'togetherAI'
  },
  {
    id: "togethercomputer/StripedHyena-Nous-7B",
    name: "StripedHyena 7B",
    description: "Efficient model with strong reasoning",
    pricing: { inputPrice: 0.24, outputPrice: 0.40 },
    provider: 'togetherAI'
  }
];

// Venice AI Models
export const VENICE_AI_MODELS: AIModel[] = [
  {
    id: "llama-3.2-3b",
    name: "Llama 3.2 3B",
    description: "Efficient and compact Llama model from Venice AI",
    pricing: { inputPrice: 0.20, outputPrice: 0.30 },
    provider: 'veniceAI'
  }
];

// Combined available models from all providers
export const AVAILABLE_MODELS: AIModel[] = [
  ...TOGETHER_AI_MODELS,
  ...VENICE_AI_MODELS
];

export interface GenerationRequest {
  model: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  provider?: APIProvider;
}

export interface ColumnDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
}

export interface DatasetSplit {
  name: string;
  percentage: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostCalculation {
  promptCost: number;
  completionCost: number;
  totalCost: number;
}

export interface DatasetConfig {
  useCase: string;
  template: string;
  columns: ColumnDefinition[];
  variables: TemplateVariable[];
  numSamples: number;
  model: string;
  maxTokens?: number;
  splits: DatasetSplit[];
  useCustomFormat?: boolean;
  customFormat?: string;
  customFormatColumnName?: string;
  provider?: APIProvider; // API provider selection
}

export interface DatasetGenerationResult {
  [key: string]: any[] | TokenUsage | CostCalculation | undefined;
  tokenUsage?: TokenUsage;
  costCalculation?: CostCalculation;
}

export async function generateDataset(config: DatasetConfig): Promise<DatasetGenerationResult> {
  const { 
    useCase, 
    template, 
    columns, 
    variables, 
    numSamples, 
    model, 
    maxTokens = 4000, 
    splits, 
    useCustomFormat, 
    customFormat, 
    customFormatColumnName,
    provider = DEFAULT_PROVIDER // Default to Together AI if not specified
  } = config;
  
  // Construct the prompt for dataset generation
  const prompt = `
You are a SI Copilot for AI training. Generate ${numSamples} high-quality, DIVERSE and UNIQUE samples for the following use case:

USE CASE:
${useCase}

COLUMNS:
${columns.map(col => `- ${col.name} (${col.type}): ${col.description}`).join('\n')}

TEMPLATE VARIABLES:
${variables.map(v => `- {{${v.name}}}: ${v.description}`).join('\n')}

OUTPUT FORMAT:
${template}

IMPORTANT INSTRUCTIONS:
1. Generate ${numSamples} COMPLETELY DIFFERENT samples in JSON format.
2. Each sample MUST be unique and distinct from all others - DO NOT repeat similar content.
3. For jokes or creative content, ensure each sample has a different theme, structure, and punchline.
4. Make sure to replace all template variables with appropriate content based on their descriptions.
5. Maximize diversity in the generated data - avoid repetitive patterns, themes, or structures.
6. Each sample should feel like it was created independently, not as variations of the same template.

The quality of your work will be judged on how diverse and unique each sample is compared to the others.
`;

  try {
    // Get the appropriate API endpoint and key based on the provider
    const apiEndpoint = API_ENDPOINTS[provider];
    const apiKey = API_KEYS[provider];
    
    // Common request parameters
    const messages = [
      { role: "system", content: "You are a helpful AI assistant that generates diverse, high-quality datasets for AI training." },
      { role: "user", content: prompt }
    ];
    
    let response;
    
    // Make API request based on the provider
    if (provider === 'togetherAI') {
      // Together AI request format
      response = await axios.post(
        apiEndpoint,
        {
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
    } else if (provider === 'veniceAI') {
      // Venice AI request format
      response = await axios.post(
        apiEndpoint,
        {
          model: model,
          messages: messages,
          temperature: 0.7,
          max_completion_tokens: maxTokens // Venice AI uses max_completion_tokens instead of max_tokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept-Encoding': 'gzip, br'
          }
        }
      );
    } else {
      throw new Error(`Unsupported API provider: ${provider}`);
    }

    // Extract token usage from the response based on provider
    let tokenUsage: TokenUsage;
    
    if (provider === 'togetherAI') {
      tokenUsage = {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
      };
    } else if (provider === 'veniceAI') {
      // Venice AI might have a different response format for token usage
      // Adjust this based on actual Venice AI response structure
      tokenUsage = {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0
      };
    } else {
      // Default fallback if provider is unknown
      tokenUsage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      };
    }
    
    // Calculate cost based on the model used
    const selectedModel = AVAILABLE_MODELS.find(m => m.id === model && m.provider === provider);
    const costCalculation: CostCalculation = {
      promptCost: (tokenUsage.promptTokens / 1000000) * (selectedModel?.pricing.inputPrice || 0.24),
      completionCost: (tokenUsage.completionTokens / 1000000) * (selectedModel?.pricing.outputPrice || 0.40),
      totalCost: 0
    };
    costCalculation.totalCost = costCalculation.promptCost + costCalculation.completionCost;

    // Get the generated text from the response based on provider
    let generatedText: string;
    
    if (provider === 'togetherAI') {
      generatedText = response.data.choices[0].message.content;
    } else if (provider === 'veniceAI') {
      // Venice AI response format
      generatedText = response.data.choices[0].message.content;
      // Note: Adjust this if Venice AI has a different response structure
    } else {
      throw new Error(`Unsupported API provider: ${provider}`);
    }
    
    // Try to extract JSON from the response
    try {
      // First, try to find JSON array pattern in the text
      const jsonArrayMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      let dataset;
      
      // Custom function to repair and parse JSON, handling React components and malformed JSON
      function repairJSON(text: string, expectedCount: number = 5): any[] {
        console.log(`Attempting to repair JSON and extract ${expectedCount} items`);
        
        // Check if the text contains React/JSX components
        const containsReactComponents = /return\s*\(.*<.*>|<div|<span|<p|<button|className=|import\s+React/i.test(text);
        
        // If it contains React components, extract useful data or return fallback
        if (containsReactComponents) {
          console.log("Detected React components in response, extracting data");
          
          // Try to extract text content from the components
          const textContent = [];
          
          // Extract text between tags
          const textMatches = text.match(/>([^<]+)</g) || [];
          for (const match of textMatches) {
            const content = match.replace(/^>|<$/g, '').trim();
            if (content) {
              textContent.push(content);
            }
          }
          
          // Extract text from JSX attributes
          const attrMatches = text.match(/[\"']([^\"']+)[\"']/g) || [];
          for (const match of attrMatches) {
            const content = match.replace(/^[\"']|[\"']$/g, '').trim();
            if (content && content.length > 5 && !content.includes('=')) {
              textContent.push(content);
            }
          }
          
          // Create synthetic dataset items from extracted text
          if (textContent.length > 0) {
            const items = [];
            for (let i = 0; i < Math.min(textContent.length, expectedCount); i++) {
              items.push({
                id: i + 1,
                input: textContent[i],
                output: `Response for ${textContent[i]}`,
                extracted: true
              });
            }
            
            // If we didn't get enough items, pad with generated ones
            if (items.length < expectedCount) {
              for (let i = items.length; i < expectedCount; i++) {
                items.push({
                  id: i + 1,
                  input: `Generated sample ${i + 1}`,
                  output: `Generated content for sample ${i + 1}`,
                  generated: true
                });
              }
            }
            
            return items;
          }
        }
        
        // Standard JSON repair for non-React responses
        // Basic cleanup
        let cleaned = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control chars
                       .replace(/`/g, '\"')  // Replace backticks with double quotes
                       .replace(/\\'/g, "'") // Fix escaped single quotes
                       .replace(/\\n/g, " ") // Replace newlines with spaces
                       .replace(/\\r/g, " ") // Replace carriage returns
                       .replace(/\\t/g, " "); // Replace tabs

        // Try to extract complete JSON array first
        const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/g);
        if (arrayMatch) {
          try {
            // Try to parse the entire array
            const parsedArray = JSON.parse(arrayMatch[0]);
            if (Array.isArray(parsedArray) && parsedArray.length > 0) {
              // If we got enough items, return them
              if (parsedArray.length >= expectedCount) {
                return parsedArray;
              }
              // Otherwise, pad with generated items
              const paddedArray = [...parsedArray];
              for (let i = parsedArray.length; i < expectedCount; i++) {
                paddedArray.push({
                  id: i + 1,
                  input: `Generated sample ${i + 1}`,
                  output: `Generated content for sample ${i + 1}`,
                  generated: true
                });
              }
              return paddedArray;
            }
          } catch (e) {
            console.log("Array parsing failed, trying to extract individual objects");
          }
        }

        // Extract what looks like JSON objects, filtering out mathematical expressions
        const allMatches = cleaned.match(/\{[^{}]*\}/g) || [];
        const objectMatches = allMatches.filter(match => {
          // Filter out mathematical expressions like {1/3}
          if (/^\{\s*\d+\s*\/\s*\d+\s*\}$/.test(match)) return false;
          
          // Filter out single word expressions like {solve}
          if (/^\{\s*[a-zA-Z]+\s*\}$/.test(match)) return false;
          
          // Filter out simple numbers like {36}
          if (/^\{\s*\d+\s*\}$/.test(match)) return false;
          
          // Must contain at least one colon to be a valid JSON object
          if (!match.includes(':')) return false;
          
          return true;
        });
        
        // If we found potential objects, try to repair and parse them
        if (objectMatches.length > 0) {
          const objects = [];
          
          for (const objText of objectMatches) {
            try {
              // Skip React-like objects
              if (objText.includes('return') || objText.includes('className')) {
                continue;
              }
              
              // Repair common JSON issues in this object
              let repairedObj = objText
                // Ensure property names are quoted
                .replace(/([{,])\s*([\w\d_]+)\s*:/g, '$1\"$2\":')
                // Replace single quotes with double quotes for values
                .replace(/:\s*'([^']*)'\s*([,}])/g, ':\"$1\"$2')
                // Fix trailing commas
                .replace(/,\s*}/g, '}');
                
              // Try to parse the repaired object
              const parsedObj = JSON.parse(repairedObj);
              objects.push(parsedObj);
            } catch (e) {
              console.warn("Could not parse object:", objText.substring(0, 50) + "...");
              // Skip this object and continue with others
            }
          }
          
          if (objects.length > 0) {
            // If we got enough objects, return them
            if (objects.length >= expectedCount) {
              return objects;
            }
            
            // Otherwise, pad with generated items
            for (let i = objects.length; i < expectedCount; i++) {
              objects.push({
                id: i + 1,
                input: `Generated sample ${i + 1}`,
                output: `Generated content for sample ${i + 1}`,
                generated: true
              });
            }
            
            return objects;
          }
        }
        
        // If we couldn't extract valid objects, generate the expected number of items
        const fallbackItems = [];
        for (let i = 0; i < expectedCount; i++) {
          fallbackItems.push({ 
            id: i + 1, 
            input: `Generated sample ${i + 1}`,
            output: `Generated content for sample ${i + 1}`,
            generated: true,
            note: "Generated as fallback when JSON parsing failed" 
          });
        }
        
        return fallbackItems;
      }
      
      if (jsonArrayMatch) {
        try {
          // Preprocess the JSON string to handle problematic escape sequences
          let jsonStr = jsonArrayMatch[0];
          
          // Replace problematic escape sequences
          jsonStr = jsonStr
            // Handle escaped quotes and backslashes
            .replace(/\\(?![\"'\\/bfnrt])/g, '\\\\')
            // Handle Unicode escape sequences
            .replace(/\\u([0-9a-fA-F]{0,3}[^0-9a-fA-F])/g, '\\\\u$1')
            // Remove invalid escape sequences
            .replace(/\\([^\"'\\/bfnrtu])/g, '$1');
          
          // First try standard JSON parsing with preprocessed string
          dataset = JSON.parse(jsonStr);
        } catch (e) {
          console.log("Standard JSON parsing failed, attempting repair", e);
          // Fall back to our custom JSON repair function with expected count from config
          const expectedCount = config.numSamples || 5;
          dataset = repairJSON(jsonArrayMatch[0], expectedCount);
        }
      } else {
        // If no JSON array was found, try to extract individual objects
        const expectedCount = config.numSamples || 5;
        dataset = repairJSON(generatedText, expectedCount);
      }
      
      // If still no valid dataset, try to generate one from the text content
      if (!dataset) {
        // Extract structured data from the text response
        // This is a fallback for when the model doesn't return proper JSON
        console.log("Generating synthetic dataset from text response");
        
        // Split the text by lines and try to extract meaningful data
        const lines = generatedText.split('\n').filter((line: string) => line.trim().length > 0);
        
        // Create a simple dataset with the text content
        dataset = [];
        
        // If the response starts with "<think>" or similar patterns, it's likely following the template
        const isTemplateResponse = generatedText.includes('<think>') || 
                                  generatedText.includes('**reasoning**') ||
                                  generatedText.includes('**Reasoning**');
        
        if (isTemplateResponse) {
          // Create one sample per chunk of text that follows the template pattern
          const chunks = generatedText.split(/(?:\d+\.\s*|Sample\s*\d+:)/g)
            .filter((chunk: string) => chunk.trim().length > 0);
          
          for (const chunk of chunks) {
            dataset.push({
              content: chunk.trim(),
              generated: true
            });
          }
        } else {
          // Just create a single sample with the whole text
          dataset = [{
            content: generatedText,
            generated: true
          }];
        }
      }
      
      // Split the dataset according to the specified splits
      if (!Array.isArray(dataset)) {
        dataset = [dataset]; // Ensure we have an array
      }
      
      // If no splits are defined, return all data in a 'train' split
      if (!splits || splits.length === 0) {
        return { train: dataset };
      }
      
      // Calculate the actual number of samples for each split
      const result: {[key: string]: any[]} = {};
      let remainingItems = [...dataset];
      let totalPercentage = 0;
      
      // Process all splits except the last one
      for (let i = 0; i < splits.length - 1; i++) {
        const split = splits[i];
        totalPercentage += split.percentage;
        const itemCount = Math.floor((split.percentage / 100) * dataset.length);
        result[split.name] = remainingItems.slice(0, itemCount);
        remainingItems = remainingItems.slice(itemCount);
      }
      
      // Last split gets all remaining items
      const lastSplit = splits[splits.length - 1];
      result[lastSplit.name] = remainingItems;
      
      // Apply custom JSON format if enabled
      if (useCustomFormat && customFormat) {
        // Get the column name to use for the formatted data
        const columnName = customFormatColumnName || 'messages';
        
        // Process each split
        for (const splitName in result) {
          // Process each item in the split
          result[splitName] = result[splitName].map(item => {
            try {
              // Parse the custom format
              let formattedData = customFormat;
              
              // Replace column placeholders with actual values
              for (const column of columns) {
                const placeholder = `{{${column.name}}}`;
                const value = item[column.name] || '';
                formattedData = formattedData.replace(new RegExp(placeholder, 'g'), value);
              }
              
              // Parse the formatted data as JSON
              const parsedFormat = JSON.parse(formattedData);
              
              // Create a new object with the id and the formatted data under the specified column name
              const newItem: { id: any; [key: string]: any } = {
                id: item.id
              };
              
              // Add the formatted data under the specified column name
              newItem[columnName] = parsedFormat;
              
              return newItem;
            } catch (error) {
              console.error('Error applying custom format:', error);
              // Return the original item if formatting fails
              return {
                ...item,
                formatError: 'Failed to apply custom format'
              };
            }
          });
        }
      }
      
      // Create a new result object that includes both the dataset and metadata
      const finalResult: DatasetGenerationResult = {
        ...result,
        tokenUsage,
        costCalculation
      };
      
      return finalResult;
    } catch (parseError) {
      console.error("Failed to parse JSON from response:", parseError);
      return { error: [{ message: "Failed to parse dataset", rawResponse: generatedText }] };
    }
  } catch (error: any) {
    console.error("Error calling Together AI API:", error);
    throw new Error(`Failed to generate dataset: ${error.message}`);
  }
}
