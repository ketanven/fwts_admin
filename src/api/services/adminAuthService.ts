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
    // Adapter for Django SimpleJWT which returns 'access' and 'refresh'
    const token: UserToken = {
      accessToken: res.access || res.accessToken,
      refreshToken: res.refresh || res.refreshToken,
    };
    // If backend returns user info, use it. Otherwise, defaults or separate call needed.
    // Assuming backend returns user object or we need to fetch it.
    // For now, mapping what we have.
    return {
      ...res,
      ...token,
    } as SignInRes;
  }

  getProfile() {
    return apiClient.get({ url: ENDPOINTS.ADMIN.PROFILE });
  }

  changePassword(data: any) {
    return apiClient.post({ url: ENDPOINTS.ADMIN.CHANGE_PASSWORD, data });
  }

  forgotPassword(data: any) {
    return apiClient.post({ url: ENDPOINTS.ADMIN.FORGOT_PASSWORD, data });
  }
}

export default new AdminAuthService();
