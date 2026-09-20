import { api } from "./axios";

export interface UserItem {
  id: number;
  name: string | null;
  email: string;
  role: "user" | "admin" | "superadmin";
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "user" | "admin" | "superadmin";
  isBlocked?: boolean;
}

export interface PaginatedUsersResponse {
  users: UserItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserInput {
  name?: string;
  email: string;
  password?: string;
  role: "user" | "admin" | "superadmin";
}

export interface CreateUserResponseData {
  user: UserItem;
  generatedPassword?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: "user" | "admin" | "superadmin";
}

export class UserService {
  /**
   * List users with pagination, search filter, and role/blocked filters
   */
  static async listUsers(params: ListUsersParams = {}): Promise<PaginatedUsersResponse> {
    const response = await api.get<{ success: boolean; data: PaginatedUsersResponse }>(
      "/admin/users",
      { params }
    );
    return response.data.data;
  }

  /**
   * Get single user details by ID
   */
  static async getUserById(id: number): Promise<UserItem> {
    const response = await api.get<{ success: boolean; data: { user: UserItem } }>(
      `/admin/users/${id}`
    );
    return response.data.data.user;
  }

  /**
   * Create a single user. Triggers background welcome email with login credentials.
   */
  static async createUser(data: CreateUserInput): Promise<CreateUserResponseData> {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: CreateUserResponseData;
    }>("/admin/users", data);
    return response.data.data;
  }

  /**
   * Update existing user details (name, email, role)
   */
  static async updateUser(id: number, data: UpdateUserInput): Promise<UserItem> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: { user: UserItem };
    }>(`/admin/users/${id}`, data);
    return response.data.data.user;
  }

  /**
   * Block user account and revoke all active refresh sessions
   */
  static async blockUser(id: number): Promise<UserItem> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: { user: UserItem };
    }>(`/admin/users/${id}/block`);
    return response.data.data.user;
  }

  /**
   * Unblock user account
   */
  static async unblockUser(id: number): Promise<UserItem> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: { user: UserItem };
    }>(`/admin/users/${id}/unblock`);
    return response.data.data.user;
  }

  /**
   * Permanently delete user account
   */
  static async deleteUser(id: number): Promise<{ id: number; email: string }> {
    const response = await api.delete<{
      success: boolean;
      message: string;
      data: { user: { id: number; email: string } };
    }>(`/admin/users/${id}`);
    return response.data.data.user;
  }
}
