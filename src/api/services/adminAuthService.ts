import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";
import type { UserToken } from "#/entity";
import type { SignInReq, SignInRes } from "./userService";

class AdminAuthService {
  async login(data: SignInReq) {
    const res = await apiClient.post<any>({
      url: ENDPOINTS.ADMIN.LOGIN,
      data,
    });
    // With apiClient unwrapping "data" field from "success: true" response, 
    // res should be {"access": "...", "refresh": "...", "user": {...}}
    const token: UserToken = {
      accessToken: res.access || res.accessToken,
      refreshToken: res.refresh || res.refreshToken,
    };
    return {
      user: res.user,
      ...token,
    } as SignInRes;
  }

  getProfile() {
    return apiClient.get({ url: ENDPOINTS.ADMIN.PROFILE, skipErrorToast: true } as any);
  }

  updateProfile(data: { first_name?: string; last_name?: string }) {
    return apiClient.request({ url: ENDPOINTS.ADMIN.PROFILE, method: "PATCH", data });
  }

  changePassword(data: any) {
    return apiClient.post({ url: ENDPOINTS.ADMIN.CHANGE_PASSWORD, data });
  }

  forgotPassword(data: { email: string }) {
    return apiClient.post({ url: ENDPOINTS.ADMIN.FORGOT_PASSWORD, data });
  }
}

export default new AdminAuthService();
