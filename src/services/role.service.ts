import { apiClient } from '../lib/api-client';

export interface UserRoles {
  roles: string[];
  active_role: string;
  message?: string;
}

export interface RoleSwitch {
  active_role: string;
  message: string;
}

class RoleService {
  private readonly BASE_PATH = '/roles';

  async getMyRoles(): Promise<UserRoles> {
    return apiClient.get<UserRoles>(`${this.BASE_PATH}/my`);
  }

  async switchRole(role: string): Promise<RoleSwitch> {
    return apiClient.post<RoleSwitch>(`${this.BASE_PATH}/switch`, { role });
  }

  async addRole(role: string): Promise<UserRoles> {
    return apiClient.post<UserRoles>(`${this.BASE_PATH}/add`, { role });
  }

  async removeRole(role: string): Promise<{ message: string }> {
    return apiClient.delete(`${this.BASE_PATH}/${role}`);
  }

  // Helper method to check if user can switch to a specific role
  async canSwitchToRole(targetRole: string): Promise<boolean> {
    try {
      const { roles } = await this.getMyRoles();
      return roles.includes(targetRole);
    } catch {
      return false;
    }
  }

  // Helper method to check if user has multiple roles
  async hasMultipleRoles(): Promise<boolean> {
    try {
      const { roles } = await this.getMyRoles();
      return roles.length > 1;
    } catch {
      return false;
    }
  }
}

export const roleService = new RoleService();
