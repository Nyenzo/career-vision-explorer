
// Mock authentication system
// In a production app, this would be replaced with a real authentication system

type UserRole = 'admin' | 'jobseeker' | 'employer' | 'freelancer';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Default mock users for demonstration
const DEFAULT_USERS = [
  {
    id: '1',
    email: 'admin@visiondrill.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as UserRole,
  },
  {
    id: '2',
    email: 'employer@visiondrill.com',
    password: 'employer123',
    name: 'Employer User',
    role: 'employer' as UserRole,
  },
  {
    id: '3',
    email: 'jobseeker@visiondrill.com',
    password: 'jobseeker123',
    name: 'Jobseeker User',
    role: 'jobseeker' as UserRole,
  },
  {
    id: '4',
    email: 'subadmin@visiondrill.com',
    password: 'subadmin123',
    name: 'SubAdmin User',
    role: 'subadmin' as UserRole,
  },
];

// Initialize users from localStorage or use defaults
const initializeUsers = () => {
  const storedUsers = localStorage.getItem('visiondrillUsers');
  if (storedUsers) {
    try {
      return JSON.parse(storedUsers);
    } catch (e) {
      console.error('Error parsing stored users:', e);
    }
  }
  // If no stored users or error parsing, use defaults and store them
  localStorage.setItem('visiondrillUsers', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};

// Mock users for demonstration - will be extended dynamically
let MOCK_USERS = initializeUsers();

// Helper function to persist users to localStorage
const persistUsers = () => {
  localStorage.setItem('visiondrillUsers', JSON.stringify(MOCK_USERS));
};

// Initialize auth state from localStorage if available
const getInitialAuthState = (): AuthState => {
  const storedUser = localStorage.getItem('visiondrillUser');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return { user, isAuthenticated: true };
    } catch (e) {
      localStorage.removeItem('visiondrillUser');
    }
  }
  return { user: null, isAuthenticated: false };
};

// Create new user account
export const createUser = (userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  countryCode?: string;
  profileImage?: string;
}): User | null => {
  // Check if user already exists
  const existingUser = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === userData.email.toLowerCase()
  );

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const newUser = {
    id: (MOCK_USERS.length + 1).toString(),
    email: userData.email,
    password: userData.password,
    name: userData.name,
    role: userData.role,
  };

  // Add to mock users array
  MOCK_USERS.push(newUser);

  // Persist users to localStorage
  persistUsers();

  // Store additional user data in localStorage for profile completion
  const profileData = {
    phoneNumber: userData.phoneNumber,
    countryCode: userData.countryCode,
    profileImage: userData.profileImage,
  };
  localStorage.setItem(`visiondrillProfile_${newUser.id}`, JSON.stringify(profileData));

  console.log('Created new user:', newUser);
  console.log('Updated MOCK_USERS:', MOCK_USERS);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Authenticate user with email and password
export const authenticateUser = (email: string, password: string): User | null => {
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    // Store user in localStorage
    localStorage.setItem('visiondrillUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }

  return null;
};

// Get user by ID (for impersonation)
export const getUserById = (id: string): User | null => {
  const user = MOCK_USERS.find(u => u.id === id);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

// Log out current user
export const logoutUser = (): void => {
  localStorage.removeItem('visiondrillUser');
  localStorage.removeItem('visiondrillImpersonation');
};

// Get current user
export const getCurrentUser = (): User | null => {
  const { user } = getInitialAuthState();
  return user;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const { isAuthenticated } = getInitialAuthState();
  return isAuthenticated;
};

// Check if user has specific role
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user !== null && user.role === role;
};
