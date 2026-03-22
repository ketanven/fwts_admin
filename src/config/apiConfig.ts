export const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

export const ENDPOINTS = {
  ADMIN: {
    LOGIN: 'admin/login/',
    PROFILE: 'admin/profile/',
    CHANGE_PASSWORD: 'admin/change-password/',
    FORGOT_PASSWORD: 'admin/forgot-password/',
    USERS: 'admin/users/',
    ROLES: 'admin/roles/',
    PERMISSIONS: 'admin/permissions/',
    STAFF: 'admin/staff/',
    DASHBOARD_STATS: 'admin/dashboard/stats/',
    DASHBOARD_REVENUE_CHART: 'admin/dashboard/revenue-chart/',
    DASHBOARD_TASK_STATS: 'admin/dashboard/task-stats/',
    DASHBOARD_ACTIVITY: 'admin/dashboard/activity/',
    DASHBOARD_ANALYSIS: 'admin/dashboard/analysis/',
    INVOICES: 'admin/invoices/',
    FREELANCERS: 'admin/freelancers/',
    REPORT_TEMPLATES: 'admin/reports/templates/',
    REPORT_GENERATE: 'admin/reports/generate/',
    REPORT_RUNS: 'admin/reports/runs/',
  },
};

