import { adminRepository } from './admin.repository';

export class AdminService {
  getDashboardStats() {
    return adminRepository.getDashboardStats();
  }

  getReports(filter?: { startDate?: string | null; endDate?: string | null }) {
    return adminRepository.getReports(filter);
  }
}

export const adminService = new AdminService();
