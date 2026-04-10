
// Mock authentication system
// In a production app, this would be replaced with a real authentication system

type UserRole = 'admin' | 'jobseeker' | 'employer' | 'subadmin';

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

// Mock users for demonstration
const MOCK_USERS = [
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

// Store for dynamically registered users
let REGISTERED_USERS: typeof MOCK_USERS = [];

// Load registered users from localStorage on initialization
const loadRegisteredUsers = () => {
  const storedUsers = localStorage.getItem('visiondrillRegisteredUsers');
  if (storedUsers) {
    try {
      REGISTERED_USERS = JSON.parse(storedUsers);
    } catch (e) {
      localStorage.removeItem('visiondrillRegisteredUsers');
    }
  }
};

// Save registered users to localStorage
const saveRegisteredUsers = () => {
  localStorage.setItem('visiondrillRegisteredUsers', JSON.stringify(REGISTERED_USERS));
};

// Initialize registered users on module load
loadRegisteredUsers();

// Get all users (mock + registered)
const getAllUsers = () => [...MOCK_USERS, ...REGISTERED_USERS];

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

// Register a new user
export const registerUser = (userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  countryCode?: string;
  profileImage?: string;
}): User | null => {
  const allUsers = getAllUsers();
  
  // Check if user already exists
  if (allUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error('User with this email already exists');
  }

  // Generate new user ID
  const newId = (Math.max(...allUsers.map(u => parseInt(u.id)), 0) + 1).toString();
  
  // Create new user
  const newUser = {
    id: newId,
    email: userData.email,
    password: userData.password,
    name: userData.name,
    role: userData.role,
  };

  // Add to registered users
  REGISTERED_USERS.push(newUser);
  saveRegisteredUsers();

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Authenticate user with email and password
export const authenticateUser = (email: string, password: string): User | null => {
  const allUsers = getAllUsers();
  const user = allUsers.find(
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
  const allUsers = getAllUsers();
  const user = allUsers.find(u => u.id === id);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

// Check if email is already registered
export const isEmailRegistered = (email: string): boolean => {
  const allUsers = getAllUsers();
  return allUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
};

// Log out current user
export const logoutUser = (): void => {
  localStorage.removeItem('visiondrillUser');
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
