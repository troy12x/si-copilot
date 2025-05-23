"use client";

import { useState, useEffect } from "react";
import { 
  DatasetSplit, 
  ColumnDefinition, 
  TemplateVariable, 
  AVAILABLE_MODELS,
  APIProvider,
  DEFAULT_PROVIDER
} from "@/lib/api-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatasetConfigProps {
  onGenerate: (config: any) => void;
  isGenerating: boolean;
  error: string;
  initialConfig?: any; // Optional initial configuration for editing existing datasets
}

export default function DatasetConfig({ onGenerate, isGenerating, error, initialConfig }: DatasetConfigProps) {
  // Load config from localStorage if available using session ID
  const loadConfigFromLocalStorage = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      // Get the session ID from URL or sessionStorage
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionId = urlParams.get('session');
      const sessionId = urlSessionId || sessionStorage.getItem('dataset_session_id');
      
      // Use session-specific key if available
      const configKey = sessionId ? `dataset_config_${sessionId}` : 'dataset_config_temp';
      
      const savedConfig = localStorage.getItem(configKey);
      console.log(`Loading from localStorage with key ${configKey}:`, savedConfig);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        console.log('Parsed localStorage config:', parsed);
        return parsed;
      }
    } catch (err) {
      console.error('Error loading config from localStorage:', err);
    }
    return null;
  };
  
  // Get the initial config from localStorage or props
  const getInitialConfig = () => {
    // Priority: 1. initialConfig from props (for editing), 2. localStorage, 3. defaults
    if (initialConfig) {
      console.log('Using initialConfig from props');
      return initialConfig;
    }
    
    const localStorageConfig = loadConfigFromLocalStorage();
    if (localStorageConfig) {
      console.log('Using config from localStorage');
      return localStorageConfig;
    }
    
    console.log('Using default config');
    return {};
  };
  
  const localConfig = getInitialConfig();
  console.log('Final localConfig:', localConfig);
  
  // Get the session ID for use throughout the component
  const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session');
    return urlSessionId || sessionStorage.getItem('dataset_session_id');
  };
  
  const sessionId = getSessionId();
  console.log('Current session ID:', sessionId);
  
  // Initialize state with initialConfig values if provided, otherwise use defaults
  // Direct localStorage approach for useCase with session ID
  const [useCase, setUseCase] = useState(() => {
    // Check if we have a direct value in localStorage first with session ID
    if (typeof window !== 'undefined') {
      // Try session-specific key first
      const sessionKey = sessionId ? `useCase_${sessionId}` : 'useCase_direct';
      const directUseCase = localStorage.getItem(sessionKey);
      
      if (directUseCase) {
        console.log(`Found direct useCase in localStorage with key ${sessionKey}:`, directUseCase);
        return directUseCase;
      }
      
      // Fallback to non-session key for backward compatibility
      const legacyUseCase = localStorage.getItem('useCase_direct');
      if (legacyUseCase && !sessionId) {
        console.log('Found legacy useCase in localStorage:', legacyUseCase);
        return legacyUseCase;
      }
    }
    // Fall back to localConfig or default
    return localConfig?.useCase || "Q&A Dataset";
  });
  
  // Direct localStorage approach for template with session ID
  const [template, setTemplate] = useState(() => {
    // Check if we have a direct value in localStorage first with session ID
    if (typeof window !== 'undefined') {
      // Try session-specific key first
      const sessionKey = sessionId ? `template_${sessionId}` : 'template_direct';
      const directTemplate = localStorage.getItem(sessionKey);
      
      if (directTemplate) {
        console.log(`Found direct template in localStorage with key ${sessionKey}:`, directTemplate);
        return directTemplate;
      }
      
      // Fallback to non-session key for backward compatibility
      const legacyTemplate = localStorage.getItem('template_direct');
      if (legacyTemplate && !sessionId) {
        console.log('Found legacy template in localStorage:', legacyTemplate);
        return legacyTemplate;
      }
    }
    // Fall back to localConfig or default
    return localConfig?.template || "Sure, here is your final output:\n{{output}}";
  });
  
  const [numSamples, setNumSamples] = useState(localConfig?.numSamples || 5);
  const [selectedModel, setSelectedModel] = useState(localConfig?.model || AVAILABLE_MODELS[0].id);
  const [maxTokens, setMaxTokens] = useState(localConfig?.maxTokens || 4000);
  const [useCustomFormat, setUseCustomFormat] = useState(localConfig?.useCustomFormat || false);
  const [customFormat, setCustomFormat] = useState(localConfig?.customFormat || '{ "messages": [{ "role": "user", "content": "{{input}}" }, { "role": "assistant", "content": "{{output}}" }] }');
  const [customFormatColumnName, setCustomFormatColumnName] = useState(localConfig?.customFormatColumnName || 'messages');
  const [provider, setProvider] = useState<APIProvider>(localConfig?.provider || DEFAULT_PROVIDER);
  
  // Initialize columns with initialConfig values or defaults
  const [columns, setColumns] = useState<ColumnDefinition[]>(
    localConfig?.columns?.length > 0 
      ? localConfig.columns 
      : [
          { name: "input", type: "string", description: "The question or prompt for the model" },
          { name: "output", type: "string", description: "The answer or response from the model" }
        ]
  );
  
  // Initialize variables with initialConfig values or defaults
  const [variables, setVariables] = useState<TemplateVariable[]>(
    localConfig?.variables?.length > 0 
      ? localConfig.variables 
      : [{ name: "output", description: "The generated answer or response from the model" }]
  );
  
  // Initialize splits with initialConfig values or defaults
  const [splits, setSplits] = useState<DatasetSplit[]>(
    localConfig?.splits?.length > 0 
      ? localConfig.splits 
      : [{ name: "train", percentage: 100 }]
  );
  
  // Save config to localStorage whenever it changes using session ID
  const saveConfigToLocalStorage = () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get the session ID from URL or sessionStorage
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionId = urlParams.get('session');
      const sessionId = urlSessionId || sessionStorage.getItem('dataset_session_id');
      
      // Use session-specific key if available
      const configKey = sessionId ? `dataset_config_${sessionId}` : 'dataset_config_temp';
      
      const configToSave = {
        useCase,
        template,
        numSamples,
        model: selectedModel,
        maxTokens,
        useCustomFormat,
        customFormat,
        customFormatColumnName,
        columns,
        variables,
        splits
      };
      localStorage.setItem(configKey, JSON.stringify(configToSave));
      console.log(`Saved config to localStorage with key ${configKey}`);
      
      // Save direct values for useCase and template with session-specific keys
      if (useCase) {
        // Save with session-specific key if available
        if (sessionId) {
          localStorage.setItem(`useCase_${sessionId}`, useCase);
        } else {
          // Fallback to non-session key for backward compatibility
          localStorage.setItem('useCase_direct', useCase);
        }
      }
      
      if (template) {
        // Save with session-specific key if available
        if (sessionId) {
          localStorage.setItem(`template_${sessionId}`, template);
        } else {
          // Fallback to non-session key for backward compatibility
          localStorage.setItem('template_direct', template);
        }
      }
    } catch (err) {
      console.error('Error saving config to localStorage:', err);
    }
  };
  
  // Save config to localStorage whenever any value changes
  useEffect(() => {
    // Don't save if we're using initialConfig from props (editing mode)
    if (!initialConfig) {
      saveConfigToLocalStorage();
    }
  }, [useCase, template, numSamples, selectedModel, maxTokens, useCustomFormat, 
      customFormat, customFormatColumnName, columns, variables, splits]);

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "string", description: "" }]);
  };

  const updateColumn = (index: number, field: keyof ColumnDefinition, value: string) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = { ...updatedColumns[index], [field]: value };
    setColumns(updatedColumns);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const addVariable = () => {
    setVariables([...variables, { name: "", description: "" }]);
  };

  const updateVariable = (index: number, field: keyof TemplateVariable, value: string) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    setVariables(updatedVariables);
  };

  const removeVariable = (index: number) => {
    if (variables.length > 1) {
      setVariables(variables.filter((_, i) => i !== index));
    }
  };
  
  const addSplit = () => {
    setSplits([...splits, { name: "", percentage: 0 }]);
  };

  const updateSplit = (index: number, field: keyof DatasetSplit, value: any) => {
    const updatedSplits = [...splits];
    if (field === 'percentage') {
      updatedSplits[index] = { ...updatedSplits[index], [field]: parseInt(value) || 0 };
    } else {
      updatedSplits[index] = { ...updatedSplits[index], [field]: value };
    }
    setSplits(updatedSplits);
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = () => {
    // Validate the configuration
    if (!useCase) {
      alert("Please enter a use case");
      return;
    }
    
    if (!template) {
      alert("Please enter a template");
      return;
    }
    
    if (columns.length === 0) {
      alert("Please add at least one column");
      return;
    }
    
    if (numSamples <= 0 || numSamples > 50) {
      alert("Number of samples must be between 1 and 50");
      return;
    }
    
    // Validate that the selected model is compatible with the provider
    const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel);
    if (selectedModelInfo && selectedModelInfo.provider !== provider) {
      // Update provider to match the selected model
      setProvider(selectedModelInfo.provider);
    }
    
    // Create the configuration object
    const config = {
      useCase,
      template,
      columns,
      variables,
      numSamples,
      model: selectedModel,
      maxTokens,
      splits,
      useCustomFormat,
      customFormat,
      customFormatColumnName,
      provider // Include the selected API provider
    };
    
    // Call the onGenerate callback with the configuration
    onGenerate(config);
  };

  return (
    <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg p-6 ">
      <h2 className="text-xl font-semibold mb-6 text-black dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
        Dataset Configuration
      </h2>
      
      {/* Use Case */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-black dark:text-white">
          Use Case
        </label>
        <textarea
          value={useCase}
          onChange={(e) => {
            setUseCase(e.target.value);
            // Direct save to localStorage with a dedicated key
            if (typeof window !== 'undefined') {
              localStorage.setItem('useCase_direct', e.target.value);
              console.log('Directly saved useCase to localStorage:', e.target.value);
            }
          }}
          placeholder="Describe the purpose of this dataset (e.g., 'A dataset of scientific articles with abstracts and citations')"
          className="w-full p-3 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white"
          rows={3}
        />
      </div>
      
      {/* Template */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-black dark:text-white">
          Output Template
        </label>
        <textarea
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            // Direct save to localStorage with a dedicated key
            if (typeof window !== 'undefined') {
              localStorage.setItem('template_direct', e.target.value);
              console.log('Directly saved template to localStorage:', e.target.value);
            }
          }}
          placeholder="Define the output format with template variables (e.g., '**Reasoning**\n{{thinking}}\n\n**Conclusion**\n{{result}}')"
          className="w-full p-3 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white font-mono"
          rows={5}
        />
      </div>
      
      {/* Custom JSON Format */}
      <div className="mb-6 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="custom-format-toggle" className="text-sm font-medium text-black dark:text-white cursor-pointer">
              Custom JSON Format
            </Label>
            <div className="text-xs text-gray-500 dark:text-gray-400">(For chat-style datasets)</div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="custom-format-toggle"
              checked={useCustomFormat}
              onCheckedChange={setUseCustomFormat}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {useCustomFormat ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
        
        {useCustomFormat && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Column Name:
              </label>
              <Input
                value={customFormatColumnName}
                onChange={(e) => setCustomFormatColumnName(e.target.value)}
                className="h-8 text-sm"
                placeholder="messages"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                (This will be the column name for your formatted data)
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Define a custom JSON format for your dataset. Use <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{'{{columnName}}'}</code> to reference column values.
            </p>
            <textarea
              value={customFormat}
              onChange={(e) => setCustomFormat(e.target.value)}
              className="w-full p-3 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white font-mono text-sm"
              rows={7}
              placeholder='[ { "from": "user", "value": "{{input}}" }, { "from": "assistant", "value": "{{output}}" } ]'
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Example: Chat format with user and assistant messages
              </div>
              <Button
                type="button"
                onClick={() => setCustomFormat('[ { "from": "user", "value": "{{input}}" }, { "from": "assistant", "value": "{{output}}" } ]')}
                variant="outline"
                size="sm"
                className="text-xs text-black bg-white border border-gray-300 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer hover:cursor-pointer rounded-full"
              >
                Reset to Default
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Columns */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-black dark:text-white">
            Columns
          </label>
          <Button
            type="button"
            onClick={addColumn}
            variant="outline"
            size="sm"
            className="text-black bg-white border border-gray-300 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer hover:cursor-pointer rounded-full"
          >
            Add Column
          </Button>
        </div>
        
        {columns.map((column, index) => (
          <div key={index} className="flex gap-2 mb-2 items-start">
            <div className="flex-1">
              <Input
                type="text"
                value={column.name}
                onChange={(e) => updateColumn(index, "name", e.target.value)}
                placeholder="Column name"
                className="w-full p-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-black text-black dark:text-white text-sm"
              />
            </div>
            <div className="w-24">
              <Select 
                defaultValue={column.type} 
                onValueChange={(value) => updateColumn(index, "type", value as any)}
              >
                <SelectTrigger className="w-full p-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black text-black dark:text-white border border-gray-100 dark:border-gray-800">
                  <SelectGroup>
                    <SelectItem value="string" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">String</SelectItem>
                    <SelectItem value="number" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Number</SelectItem>
                    <SelectItem value="boolean" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Boolean</SelectItem>
                    <SelectItem value="array" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Array</SelectItem>
                    <SelectItem value="object" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Object</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                type="text"
                value={column.description}
                onChange={(e) => updateColumn(index, "description", e.target.value)}
                placeholder="Description"
                className="w-full p-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-black text-black dark:text-white text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={() => removeColumn(index)}
              variant="ghost"
              size="sm"
              className="p-2 text-red-500 hover:text-white hover:bg-red-600 transition-all duration-200 cursor-pointer hover:cursor-pointer"
              disabled={columns.length <= 1}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      
      {/* Template Variables */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-black dark:text-white">
            Template Variables
          </label>
          <Button
            type="button"
            onClick={addVariable}
            variant="outline"
            size="sm"
            className="text-black bg-white border border-gray-300 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer hover:cursor-pointer rounded-full"
          >
            Add Variable
          </Button>
        </div>
        
        {variables.map((variable, index) => (
          <div key={index} className="flex gap-2 mb-2 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={variable.name}
                onChange={(e) => updateVariable(index, "name", e.target.value)}
                placeholder="Variable name (without {{ }})"
                className="w-full p-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white text-sm"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={variable.description}
                onChange={(e) => updateVariable(index, "description", e.target.value)}
                placeholder="Description"
                className="w-full p-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={() => removeVariable(index)}
              variant="ghost"
              size="sm"
              className="p-2 text-red-500 hover:text-white hover:bg-red-600 transition-all duration-200 cursor-pointer hover:cursor-pointer"
              disabled={variables.length <= 1}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      
      {/* Dataset Splits */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-black ">
            Dataset Splits
          </label>
          <Button
            type="button"
            onClick={addSplit}
            variant="outline"
            size="sm"
            className="text-black bg-white border border-gray-300 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer hover:cursor-pointer rounded-full"
          >
            Add Split
          </Button>
        </div>
        
        {splits.map((split, index) => (
          <div key={index} className="flex gap-2 mb-2 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={split.name}
                onChange={(e) => updateSplit(index, "name", e.target.value)}
                placeholder="Split name (e.g., train, test, validation)"
                className="w-full p-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={() => removeSplit(index)}
              variant="ghost"
              size="sm"
              className="p-2 text-red-500 hover:text-white hover:bg-red-600 transition-all duration-200 cursor-pointer hover:cursor-pointer"
              disabled={splits.length <= 1}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      {/* API Provider Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-black dark:text-white">
          API Provider
        </label>
        <Select value={provider} onValueChange={(value: APIProvider) => setProvider(value)}>
          <SelectTrigger className="w-full p-3 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white">
            <SelectValue placeholder="Select API provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="togetherAI" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Together AI</SelectItem>
              <SelectItem value="veniceAI" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Venice AI</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Model Selection - filtered by provider */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-black dark:text-white">
          AI Model
        </label>
        <Select 
          value={selectedModel} 
          onValueChange={(value) => {
            setSelectedModel(value);
            // When model changes, ensure the provider matches the model's provider
            const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === value);
            if (selectedModelInfo && selectedModelInfo.provider !== provider) {
              setProvider(selectedModelInfo.provider);
            }
          }}
        >
          <SelectTrigger className="w-full p-3 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-black text-black dark:text-white border border-gray-100 dark:border-gray-800">
            <SelectGroup>
              {AVAILABLE_MODELS
                .filter(model => model.provider === provider)
                .map((model) => (
                  <SelectItem key={model.id} value={model.id} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                    {model.name} - {model.description}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {/* Number of Samples */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-black dark:text-white">
          Number of Samples
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={numSamples}
          onChange={(e) => setNumSamples(parseInt(e.target.value))}
          className="w-full p-3 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-black text-black dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white"
        />
      </div>
      
      {/* Max Tokens Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-black dark:text-white">
            Output Length
          </label>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black rounded px-2 py-1 text-sm">
            {maxTokens}
          </div>
        </div>
        <div className="relative">
          {/* Custom slider with colored progress track */}
          <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-lg">
            {/* White progress track */}
            <div 
              className="absolute top-0 left-0 h-full bg-white dark:bg-white rounded-l-lg" 
              style={{ width: `${((maxTokens - 1000) / (32000 - 1000)) * 100}%` }}
            ></div>
            {/* Slider input (positioned on top) */}
            <input
              type="range"
              min="1000"
              max="32000"
              step="1000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Slider thumb/ball */}
            <div 
              className="absolute top-0 h-4 w-4 bg-blue-500 rounded-full -mt-1 transform -translate-x-1/2"
              style={{ left: `${((maxTokens - 1000) / (32000 - 1000)) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1K</span>
            <span>32K</span>
          </div>
        </div>
      </div>
      
      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        size="lg"
        variant="outline"
        className="w-full transition-all duration-200 bg-white text-black hover:bg-black hover:text-white group cursor-pointer hover:cursor-pointer border border-gray-300"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black group-hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4 text-black group-hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Generate Dataset
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
