import React from 'react';
import { Input, Typography, Alert, Space, Select } from 'antd';
import { KeyOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

type Provider = 'gemini' | 'groq';

interface ApiKeyInputProps {
  apiKey: string | null;
  provider: Provider;
  onKeyChange: (key: string) => void;
  onProviderChange: (provider: Provider) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  provider,
  onKeyChange,
  onProviderChange
}) => {
  const hasGeminiEnvKey = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hasGroqEnvKey = !!import.meta.env.VITE_GROQ_API_KEY;

  const hasEnvKey =
    provider === 'gemini' ? hasGeminiEnvKey : hasGroqEnvKey;

  const providerLabel =
    provider === 'gemini' ? 'Gemini' : 'Groq';

  const providerLink =
    provider === 'gemini'
      ? 'https://aistudio.google.com/app/apikey'
      : 'https://console.groq.com/keys';

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <div>
        <Text strong>AI Provider</Text>
        <Select
          value={provider}
          onChange={(value: Provider) => onProviderChange(value)}
          className="w-full mb-3"
        >
          <Option value="gemini">Google Gemini</Option>
          <Option value="groq">Groq</Option>
        </Select>

        <Text strong>{providerLabel} API Key</Text>
        <p className="text-xs text-gray-500 mb-2">
          Enter your personal {providerLabel} API key to override the default system key.
          Get one at{' '}
          <a
            href={providerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {providerLabel} Console
          </a>.
        </p>

        <Input.Password
          placeholder={`Paste your ${providerLabel} API key here...`}
          prefix={<KeyOutlined className="text-gray-400" />}
          value={apiKey || ''}
          onChange={(e) => onKeyChange(e.target.value)}
          allowClear
          className="w-full"
        />
      </div>

      {apiKey ? (
        <Alert
          message="Using Custom API Key"
          description={`Your personal ${providerLabel} API key will be used for all summary generations.`}
          type="success"
          showIcon
        />
      ) : hasEnvKey ? (
        <Alert
          message="Using Default System Key"
          description={`No personal key provided. Using the built-in ${providerLabel} system key.`}
          type="info"
          showIcon
        />
      ) : (
        <Alert
          message="No API Key Found"
          description="Please provide a key above, otherwise the app will use a basic local fallback summarizer."
          type="warning"
          showIcon
        />
      )}
    </Space>
  );
};

export default ApiKeyInput;