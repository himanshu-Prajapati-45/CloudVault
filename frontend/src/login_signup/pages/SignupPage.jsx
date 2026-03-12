import { AuthCard } from '../components/AuthCard';
import { InputField } from '../components/InputField';
import { GoogleButton } from '../components/GoogleButton';
import { Divider } from '../components/Divider';
import '../styles/auth.css';

export const SignupPage = () => {
  return (
    <div className="auth-container">
      <AuthCard>
        <h2>Sign Up</h2>
        <InputField label="Name" type="text" placeholder="Enter full name" />
        <InputField label="Email" type="email" placeholder="Enter email" />
        <InputField label="Password" type="password" placeholder="Create password" />
        <button className="submit-btn">Sign Up</button>
        <Divider />
        <GoogleButton />
      </AuthCard>
    </div>
  );
};
