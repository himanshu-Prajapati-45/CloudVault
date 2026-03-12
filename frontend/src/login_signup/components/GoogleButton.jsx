import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleButton({ onError }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            await googleLogin(credentialResponse.credential);
            navigate('/dashboard');
          } catch (err) {
            if (onError) onError(err.message || 'Google Auth failed');
          }
        }}
        onError={() => {
          if (onError) onError('Google Auth failed');
        }}
        useOneTap
        theme="outline"
        size="large"
        text="continue_with"
      />
    </div>
  );
}