
interface DemoCredentialsProps {
  loginType: 'admin' | 'jobseeker' | 'employer';
}

interface Credentials {
  email: string;
  password: string;
}

export const DemoCredentials = ({ loginType }: DemoCredentialsProps) => {
  const getLoginCredentials = (): Credentials => {
    switch (loginType) {
      case 'admin':
        return { email: 'admin@visiondrill.com', password: 'admin123' };
      case 'employer':
        return { email: 'employer@visiondrill.com', password: 'employer123' };
      case 'jobseeker':
        return { email: 'jobseeker@visiondrill.com', password: 'jobseeker123' };
    }
  };
  
  const credentials = getLoginCredentials();
  
  return (
    <div className="w-full text-sm text-gray-500">
      <p>Demo Credentials for {loginType} login:</p>
      <div className="mt-1 p-2 bg-gray-50 rounded-md">
        <p><strong>Email:</strong> {credentials.email}</p>
        <p><strong>Password:</strong> {credentials.password}</p>
      </div>
    </div>
  );
};
