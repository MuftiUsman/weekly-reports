import React from 'react';
import { Input, Typography, Alert, Space } from 'antd';
import { KeyOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ApiKeyInputProps {
  apiKey: string | null;
  onKeyChange: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onKeyChange }) => {
  const hasEnvKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <div>
        <Text strong>Gemini API Key</Text>
        <p className="text-xs text-gray-500 mb-2">
          Enter your personal Google Gemini API key to override the default system key.
          Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.
        </p>
        <Input.Password
          placeholder="Paste your Gemini API key here..."
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
          description="Your personal API key will be used for all summary generations."
          type="success"
          showIcon
        />
      ) : hasEnvKey ? (
        <Alert
          message="Using Default System Key"
          description="No personal key provided. Using the built-in system key."
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
