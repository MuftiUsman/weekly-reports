import { Alert } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const ApiKeyInput = () => {
  return (
    <Alert
      message="No API Key Needed"
      description="This application is using a pre-configured Gemini API key for summarization."
      type="info"
      showIcon
      icon={<CheckCircleOutlined />}
      className="mb-4"
    />
  );
};

export default ApiKeyInput;