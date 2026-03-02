import { useState, useEffect } from 'react';
import { Button, Input, Alert, Space, Typography, Steps } from 'antd';
import { LogoutOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Paragraph, Link } = Typography;

interface FabricAuthProps {
  onAuthChange: (token: string | null, user: any) => void;
}

export default function FabricAuth({ onAuthChange }: FabricAuthProps) {
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem('fabric_token')
  );
  const [user, setUser] = useState<any>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fabricUrl = import.meta.env.VITE_FABRIC_URL || 'http://localhost:8000';

  useEffect(() => {
    if (token) {
      // Decode JWT to get user info (simple decode, no verification needed here)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userInfo = {
          email: payload.email || payload.sub,
          name: payload.name || 'User'
        };
        setUser(userInfo);
        onAuthChange(token, payload);
      } catch (e) {
        console.error('Failed to decode token:', e);
        setError('Invalid token format. Please make sure you copied the entire JWT token.');
        setToken(null);
        sessionStorage.removeItem('fabric_token');
      }
    } else {
      setUser(null);
      onAuthChange(null, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token, not onAuthChange to avoid infinite loop

  const handleManualToken = () => {
    const trimmedToken = tokenInput.trim();

    if (!trimmedToken) {
      setError('Please paste your token');
      return;
    }

    // Basic JWT format validation (should have 3 parts separated by dots)
    if (trimmedToken.split('.').length !== 3) {
      setError('Invalid token format. JWT tokens have 3 parts separated by dots (.)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to decode the token to validate it's a valid JWT
      const payload = JSON.parse(atob(trimmedToken.split('.')[1]));

      // Store token
      sessionStorage.setItem('fabric_token', trimmedToken);
      setToken(trimmedToken);
      setTokenInput('');
      setError(null);

      console.log('Token connected successfully:', payload);
    } catch (e) {
      console.error('Token validation error:', e);
      setError('Invalid token. Please make sure you copied the complete JWT token.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('fabric_token');
    setToken(null);
    setUser(null);
    setTokenInput('');
    setError(null);
  };

  const openFabric = () => {
    window.open(fabricUrl, '_blank');
  };

  if (token && user) {
    return (
      <div>
        <Alert
          message="✅ Connected to Fabric"
          description={
            <div>
              <p className="mb-1"><strong>User:</strong> {user.name}</p>
              <p className="mb-0"><strong>Email:</strong> {user.email}</p>
            </div>
          }
          type="success"
          showIcon
        />
        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="mt-4"
          block
        >
          Disconnect from Fabric
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Alert
        message="Not Connected to Fabric"
        description="Connect to Fabric to automatically fetch your timesheet data"
        type="info"
        showIcon
        className="mb-4"
      />

      <Steps
        direction="vertical"
        size="small"
        current={-1}
        items={[
          {
            title: 'Open Fabric',
            description: (
              <div>
                <Button type="link" onClick={openFabric} className="p-0">
                  Open {fabricUrl}
                </Button>
                <Paragraph type="secondary" className="mb-0 mt-1" style={{ fontSize: '12px' }}>
                  Log in with your Google account if not already logged in
                </Paragraph>
              </div>
            ),
            icon: <span>1</span>
          },
          {
            title: 'Open DevTools',
            description: (
              <Paragraph type="secondary" className="mb-0" style={{ fontSize: '12px' }}>
                Press <strong>F12</strong> (or right-click → Inspect) and go to the <strong>Network</strong> tab
              </Paragraph>
            ),
            icon: <span>2</span>
          },
          {
            title: 'Find an API Request',
            description: (
              <Paragraph type="secondary" className="mb-0" style={{ fontSize: '12px' }}>
                Navigate anywhere in Fabric (e.g., click on Timesheets). Look for any request starting with <code>/api/v1/</code>
              </Paragraph>
            ),
            icon: <span>3</span>
          },
          {
            title: 'Copy the Token',
            description: (
              <Paragraph type="secondary" className="mb-0" style={{ fontSize: '12px' }}>
                Click on the request → <strong>Headers</strong> tab → Find <strong>Authorization: Bearer ...</strong> → Copy the long string <em>after</em> "Bearer " (not including "Bearer ")
              </Paragraph>
            ),
            icon: <span>4</span>
          },
          {
            title: 'Paste Below',
            description: null,
            icon: <span>5</span>
          }
        ]}
      />

      <div className="mt-4">
        <Input.Password
          placeholder="Paste your JWT token here (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onPressEnter={handleManualToken}
          size="large"
        />

        <Button
          type="primary"
          onClick={handleManualToken}
          loading={loading}
          block
          size="large"
          className="mt-3"
          icon={!loading ? <CheckCircleOutlined /> : undefined}
        >
          {loading ? 'Connecting...' : 'Connect with Token'}
        </Button>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mt-3"
          />
        )}
      </div>

      <Alert
        message="💡 Tip"
        description="The token should start with 'eyJ' and have two dots (.) in it. Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0..."
        type="info"
        className="mt-4"
        showIcon
      />
    </div>
  );
}
