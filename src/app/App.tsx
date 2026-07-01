import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpRight,
  BarChart2,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  Command,
  CreditCard,
  Download,
  DownloadCloud,
  Eye,
  FileText,
  Filter,
  Globe2,
  Landmark,
  LayoutDashboard,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { roles } from "../../packages/shared/src/contracts.mjs";

type Row = Record<string, string | number>;
type NavItem = { Icon: LucideIcon; label: string; path: string; dot?: boolean; roles?: string[] };
type PageConfig = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  kpis: KPI[];
  chart: "area" | "bar" | "line" | "pie";
  tableTitle: string;
  rows: Row[];
  columns: string[];
  insights: string[];
  actions: string[];
  tabs: string[];
  timeline: { title: string; detail: string; time: string; tone: "green" | "red" | "yellow" | "blue" }[];
};
type KPI = { label: string; value: string; change: string; tone: "green" | "red" | "blue" | "yellow"; data: { v: number }[] };
type AuthUser = { id: string; email: string; name: string; role: string; organization_id: string; mfa_enabled: boolean };
type AuthState = { access_token: string; refresh_token: string; user: AuthUser } | null;

const red = "#E53935";
const indigo = "#6366F1";
const green = "#10B981";
const yellow = "#F59E0B";
const blue = "#06B6D4";

const money = (value: number) => `INR ${value.toLocaleString("en-IN")}`;
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
const AUTH_STORAGE_KEY = "finops-auth-session";

const AuthContext = createContext<{
  auth: AuthState;
  login: (email: string, password: string) => Promise<{ mfaRequired?: boolean; mfaToken?: string }>;
  register: (payload: { email: string; password: string; first_name: string; last_name: string; company_name: string }) => Promise<void>;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => void;
  showDemoModal: boolean;
  setShowDemoModal: (open: boolean) => void;
}>({
  auth: null,
  login: async () => ({}),
  register: async () => { },
  verifyMfa: async () => { },
  forgotPassword: async () => "",
  resetPassword: async () => { },
  logout: () => { },
  showDemoModal: false,
  setShowDemoModal: () => { },
});

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? "Request failed");
  return body?.data as T;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.user && !parsed.user.name) {
        parsed.user.name = `${parsed.user.first_name || ""} ${parsed.user.last_name || ""}`.trim();
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [showDemoModal, setShowDemoModal] = useState(false);
  const persist = (next: AuthState) => {
    if (next && next.user && !next.user.name) {
      next.user.name = `${next.user.first_name || ""} ${next.user.last_name || ""}`.trim();
    }
    setAuth(next);
    if (next) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  };
  const value = {
    auth,
    login: async (email: string, password: string) => {
      const data = await apiRequest<AuthState & { mfa_required?: boolean; mfa_token?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.mfa_required) return { mfaRequired: true, mfaToken: data.mfa_token };
      persist(data);
      return {};
    },
    register: async (payload: { email: string; password: string; first_name: string; last_name: string; company_name: string }) => {
      const data = await apiRequest<AuthState>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...payload, accept_terms: true }),
      });
      persist(data);
    },
    verifyMfa: async (mfaToken: string, code: string) => {
      const data = await apiRequest<AuthState>("/auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({ mfa_token: mfaToken, code }),
      });
      persist(data);
    },
    forgotPassword: async (email: string) => {
      const data = await apiRequest<{ message: string; reset_token?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return data.reset_token ?? "";
    },
    resetPassword: async (token: string, password: string) => {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
    },
    logout: () => persist(null),
    showDemoModal,
    setShowDemoModal,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

const navItems: NavItem[] = [
  { Icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { Icon: TrendingUp, label: "Financial Overview", path: "/financial-overview" },
  { Icon: ArrowRightLeft, label: "Transactions", path: "/transactions" },
  { Icon: FileText, label: "Invoices", path: "/invoices" },
  { Icon: CreditCard, label: "Payments", path: "/payments" },
  { Icon: Landmark, label: "Treasury", path: "/treasury" },
  { Icon: Building2, label: "Vendors", path: "/vendors" },
  { Icon: Users, label: "Customers", path: "/customers" },
  { Icon: Wallet, label: "Budgets", path: "/budgets" },
  { Icon: Activity, label: "Cash Flow", path: "/cash-flow" },
  { Icon: BarChart2, label: "Analytics", path: "/analytics" },
  { Icon: TrendingDown, label: "Forecasting", path: "/forecasting" },
  { Icon: ShieldAlert, label: "Fraud Center", path: "/fraud-center" },
  { Icon: ShieldCheck, label: "Compliance Center", path: "/compliance-center" },
  { Icon: Bot, label: "AI Copilot", path: "/ai-copilot", dot: true },
  { Icon: BarChart3, label: "Reports", path: "/reports" },
];

const bottomNav: NavItem[] = [
  { Icon: Search, label: "Global Search", path: "/search" },
  { Icon: DownloadCloud, label: "Export Center", path: "/export-center" },
  { Icon: Bell, label: "Notifications", path: "/notifications" },
  { Icon: Users, label: "Team", path: "/team" },
  { Icon: Settings, label: "Settings", path: "/settings" },
  { Icon: User, label: "Profile", path: "/profile" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const trendData = months.map((month, index) => ({
  month,
  revenue: [18, 22, 19, 25, 21, 24.56, 27.4, 29.1][index],
  expenses: [14, 16, 18, 17, 18.5, 18.32, 19.1, 20.4][index],
  cash: [3, 5, 3.5, 6, 4, 4.82, 6.7, 7.2][index],
  forecast: [19, 23, 21, 26, 23, 25.8, 28.7, 31.5][index],
}));

const expenseBreakdownData = [
  { name: "Payroll", value: 35, color: red },
  { name: "Cloud", value: 22, color: indigo },
  { name: "Marketing", value: 18, color: blue },
  { name: "Operations", value: 15, color: yellow },
  { name: "Other", value: 10, color: green },
];

const transactions = [
  { id: "TXN-92481", date: "2026-06-28", account: "HDFC Operating", counterparty: "Microsoft Azure", type: "Cloud", amount: money(345000), status: "Settled", risk: "Low" },
  { id: "TXN-92480", date: "2026-06-28", account: "ICICI Payroll", counterparty: "Employee Payroll Batch", type: "Payroll", amount: money(18240000), status: "Settled", risk: "Low" },
  { id: "TXN-92479", date: "2026-06-27", account: "Axis AP", counterparty: "Phantom Supplies Ltd", type: "Procurement", amount: money(1240000), status: "Review", risk: "Critical" },
  { id: "TXN-92478", date: "2026-06-26", account: "HDFC Operating", counterparty: "Salesforce India", type: "SaaS", amount: money(196000), status: "Pending", risk: "Medium" },
  { id: "TXN-92477", date: "2026-06-25", account: "SBI Collections", counterparty: "Nexus Retail Group", type: "Receivable", amount: money(5600000), status: "Settled", risk: "Low" },
  { id: "TXN-92476", date: "2026-06-24", account: "Axis AP", counterparty: "Accenture Services", type: "Consulting", amount: money(845200), status: "Approved", risk: "Medium" },
];

const invoices = [
  { id: "INV-2026-0892", vendor: "Accenture Services", due: "2026-07-04", owner: "Priya Nair", amount: money(845200), status: "Urgent", stage: "CFO approval" },
  { id: "INV-2026-0891", vendor: "Microsoft Azure", due: "2026-07-07", owner: "Rahul Shah", amount: money(345000), status: "Review", stage: "PO match" },
  { id: "INV-2026-0890", vendor: "AWS Services", due: "2026-07-08", owner: "Anika Rao", amount: money(296000), status: "Pending", stage: "Tax validation" },
  { id: "INV-2026-0889", vendor: "Salesforce CRM", due: "2026-07-12", owner: "Kabir Sethi", amount: money(196000), status: "Approved", stage: "Payment queued" },
  { id: "INV-2026-0888", vendor: "Deloitte India", due: "2026-07-16", owner: "Meera Iyer", amount: money(1260000), status: "Review", stage: "Contract check" },
];

const vendors = [
  { vendor: "Microsoft Azure", category: "Cloud", spend: money(4140000), risk: "Low", score: 92, status: "Preferred" },
  { vendor: "Accenture Services", category: "Consulting", spend: money(8120000), risk: "Medium", score: 78, status: "Active" },
  { vendor: "Phantom Supplies Ltd", category: "Procurement", spend: money(1240000), risk: "Critical", score: 31, status: "Blocked" },
  { vendor: "Salesforce CRM", category: "SaaS", spend: money(2352000), risk: "Low", score: 88, status: "Active" },
  { vendor: "Deloitte India", category: "Audit", spend: money(3760000), risk: "Low", score: 84, status: "Active" },
];

const customers = [
  { customer: "Nexus Retail Group", segment: "Enterprise", arr: money(67200000), health: "Excellent", invoices: 18, owner: "Asha Menon" },
  { customer: "Orion Manufacturing", segment: "Enterprise", arr: money(43800000), health: "Good", invoices: 11, owner: "Vikram Bose" },
  { customer: "Zenith Health", segment: "Mid Market", arr: money(21600000), health: "Watch", invoices: 9, owner: "Neha Kapoor" },
  { customer: "Metro Logistics", segment: "Enterprise", arr: money(51200000), health: "Excellent", invoices: 14, owner: "Aman Gupta" },
  { customer: "Aster Foods", segment: "Mid Market", arr: money(14400000), health: "Good", invoices: 7, owner: "Ira Thomas" },
];

const fraudAlerts = [
  { severity: "Critical", title: "Duplicate payment detected", detail: "INR 345,000 paid twice to Accenture Services", owner: "Fraud Ops", status: "Open" },
  { severity: "High", title: "New vendor spike", detail: "Phantom Supplies crossed 8x category median", owner: "AP Risk", status: "Escalated" },
  { severity: "Medium", title: "Late approval pattern", detail: "Three related invoices approved after business hours", owner: "Controls", status: "Investigating" },
  { severity: "High", title: "Bank detail change", detail: "Vendor bank account changed 18 hours before payment", owner: "Treasury", status: "Held" },
];

const complianceIssues = [
  { id: "CMP-1008", area: "GST filing", entity: "Tech Synapse Pro Ltd", severity: "High", due: "2026-07-03", status: "Evidence needed" },
  { id: "CMP-1007", area: "SOX control", entity: "AP approvals", severity: "Medium", due: "2026-07-10", status: "Testing" },
  { id: "CMP-1006", area: "TDS reconciliation", entity: "Vendor payouts", severity: "Low", due: "2026-07-15", status: "On track" },
  { id: "CMP-1005", area: "Data retention", entity: "Invoices archive", severity: "Medium", due: "2026-07-18", status: "Policy review" },
];

const reports = [
  { report: "Monthly CFO Pack", owner: "Arjun Mehra", period: "Jun 2026", status: "Ready", updated: "Today 09:20" },
  { report: "Board Revenue Bridge", owner: "Meera Iyer", period: "Q2 2026", status: "Draft", updated: "Today 08:40" },
  { report: "Vendor Risk Register", owner: "Fraud Ops", period: "Jun 2026", status: "Ready", updated: "Yesterday 18:10" },
  { report: "GST Compliance Evidence", owner: "Tax Team", period: "Jun 2026", status: "Review", updated: "Yesterday 16:55" },
];

const baseKpis: KPI[] = [
  { label: "Revenue", value: "INR 24.56 Cr", change: "+12.5%", tone: "green", data: [{ v: 18 }, { v: 22 }, { v: 19 }, { v: 25 }, { v: 21 }, { v: 24.56 }] },
  { label: "Expenses", value: "INR 18.32 Cr", change: "+8.2%", tone: "red", data: [{ v: 14 }, { v: 16 }, { v: 18 }, { v: 17 }, { v: 18.5 }, { v: 18.32 }] },
  { label: "Profit", value: "INR 6.28 Cr", change: "+18.3%", tone: "green", data: [{ v: 4 }, { v: 6 }, { v: 1 }, { v: 8 }, { v: 2.5 }, { v: 6.28 }] },
  { label: "Cash Flow", value: "INR 4.82 Cr", change: "+5.7%", tone: "green", data: [{ v: 3 }, { v: 5 }, { v: 3.5 }, { v: 6 }, { v: 4 }, { v: 4.82 }] },
  { label: "Risk Score", value: "62", change: "High risk", tone: "red", data: [{ v: 44 }, { v: 48 }, { v: 51 }, { v: 49 }, { v: 57 }, { v: 62 }] },
];

const pageConfigs: Record<string, PageConfig> = {
  "/financial-overview": {
    title: "Financial Overview",
    subtitle: "Revenue, expense, profit, and working-capital performance across entities.",
    icon: TrendingUp,
    kpis: baseKpis,
    chart: "area",
    tableTitle: "Entity Performance",
    rows: [
      { entity: "India SaaS", revenue: "INR 11.8 Cr", expenses: "INR 7.1 Cr", margin: "39.8%", variance: "+6.2%" },
      { entity: "APAC Services", revenue: "INR 6.4 Cr", expenses: "INR 5.3 Cr", margin: "17.1%", variance: "-1.4%" },
      { entity: "Cloud Marketplace", revenue: "INR 4.7 Cr", expenses: "INR 3.2 Cr", margin: "31.9%", variance: "+3.7%" },
      { entity: "Support Operations", revenue: "INR 1.6 Cr", expenses: "INR 2.7 Cr", margin: "-68.8%", variance: "-4.5%" },
    ],
    columns: ["entity", "revenue", "expenses", "margin", "variance"],
    insights: ["Operating margin improved 240 bps after cloud optimization.", "Collections are 6 days faster in enterprise accounts.", "APAC Services has the largest unfavorable variance."],
    actions: ["Close month", "Export pack", "Create variance note"],
    tabs: ["P&L", "Balance Sheet", "Working Capital"],
    timeline: [
      { title: "Month-end close completed", detail: "27 of 29 ledgers reconciled", time: "Today 09:10", tone: "green" },
      { title: "Variance note requested", detail: "APAC Services travel spend", time: "Yesterday", tone: "yellow" },
    ],
  },
  "/transactions": {
    title: "Transactions",
    subtitle: "Bank, card, and ledger movements with AI-assisted categorization.",
    icon: ArrowRightLeft,
    kpis: [
      { label: "Settled", value: "2,418", change: "+9.4%", tone: "green", data: baseKpis[0].data },
      { label: "Pending", value: "186", change: "-4.1%", tone: "green", data: baseKpis[3].data },
      { label: "In Review", value: "27", change: "+3", tone: "yellow", data: baseKpis[4].data },
      { label: "Failed", value: "8", change: "-2", tone: "green", data: baseKpis[2].data },
    ],
    chart: "bar",
    tableTitle: "Recent Transactions",
    rows: transactions,
    columns: ["id", "date", "account", "counterparty", "type", "amount", "status", "risk"],
    insights: ["AI categorized 96.4% of transactions without manual rules.", "One procurement payment is held for vendor verification.", "Payroll cleared with zero bank rejects."],
    actions: ["Add transaction", "Reconcile", "Export CSV"],
    tabs: ["All", "Bank", "Cards", "Ledger"],
    timeline: [
      { title: "Bank sync completed", detail: "HDFC, ICICI, Axis refreshed", time: "12 min ago", tone: "green" },
      { title: "Payment held", detail: "Phantom Supplies needs approval", time: "2h ago", tone: "red" },
    ],
  },
  "/invoices": {
    title: "Invoice Management",
    subtitle: "AP invoice intake, approvals, PO matching, and payment scheduling.",
    icon: FileText,
    kpis: [
      { label: "Open invoices", value: "342", change: "+18", tone: "yellow", data: baseKpis[1].data },
      { label: "Approved", value: "INR 8.6 Cr", change: "+11.1%", tone: "green", data: baseKpis[0].data },
      { label: "Blocked", value: "14", change: "+4", tone: "red", data: baseKpis[4].data },
      { label: "Avg cycle", value: "3.2 days", change: "-1.1d", tone: "green", data: baseKpis[2].data },
    ],
    chart: "bar",
    tableTitle: "Invoice Queue",
    rows: invoices,
    columns: ["id", "vendor", "due", "owner", "amount", "status", "stage"],
    insights: ["Duplicate invoice prevention avoided INR 6.9L this month.", "18 invoices can be paid early for discount capture.", "CFO approval queue has two SLA breaches."],
    actions: ["Upload invoice", "Approve selected", "Schedule payments"],
    tabs: ["Inbox", "Approvals", "Payments", "Exceptions"],
    timeline: [
      { title: "Invoice uploaded", detail: "Deloitte India audit retainer", time: "23 min ago", tone: "blue" },
      { title: "PO match failed", detail: "AWS quantity variance", time: "1h ago", tone: "yellow" },
    ],
  },
  "/vendors": {
    title: "Vendors",
    subtitle: "Vendor intelligence, spend concentration, risk, contracts, and onboarding.",
    icon: Building2,
    kpis: [
      { label: "Active vendors", value: "486", change: "+12", tone: "green", data: baseKpis[0].data },
      { label: "Preferred spend", value: "72%", change: "+5.8%", tone: "green", data: baseKpis[2].data },
      { label: "High risk", value: "9", change: "+2", tone: "red", data: baseKpis[4].data },
      { label: "Savings found", value: "INR 1.4 Cr", change: "+22%", tone: "blue", data: baseKpis[3].data },
    ],
    chart: "pie",
    tableTitle: "Vendor Intelligence",
    rows: vendors,
    columns: ["vendor", "category", "spend", "risk", "score", "status"],
    insights: ["Cloud spend can be consolidated across three suppliers.", "One blocked vendor has pending bank verification.", "Preferred vendor usage increased to 72%."],
    actions: ["Add vendor", "Run risk scan", "Renew contract"],
    tabs: ["Directory", "Risk", "Contracts", "Onboarding"],
    timeline: [
      { title: "Risk scan completed", detail: "486 vendors screened", time: "Today 07:30", tone: "green" },
      { title: "Bank change blocked", detail: "Phantom Supplies Ltd", time: "Yesterday", tone: "red" },
    ],
  },
  "/customers": {
    title: "Customers",
    subtitle: "Enterprise customer revenue, collections, health, and account ownership.",
    icon: Users,
    kpis: [
      { label: "ARR", value: "INR 192 Cr", change: "+14.2%", tone: "green", data: baseKpis[0].data },
      { label: "DSO", value: "31 days", change: "-6d", tone: "green", data: baseKpis[3].data },
      { label: "At risk ARR", value: "INR 9.8 Cr", change: "-2.1%", tone: "green", data: baseKpis[2].data },
      { label: "NDR", value: "118%", change: "+4%", tone: "blue", data: baseKpis[0].data },
    ],
    chart: "area",
    tableTitle: "Customer Accounts",
    rows: customers,
    columns: ["customer", "segment", "arr", "health", "invoices", "owner"],
    insights: ["Nexus Retail renewal expansion is forecast at INR 8.4 Cr.", "Zenith Health has two invoices approaching overdue.", "Enterprise segment contributes 84% of collections."],
    actions: ["Create invoice", "Send reminder", "Export aging"],
    tabs: ["Accounts", "Aging", "Collections", "Health"],
    timeline: [
      { title: "Payment received", detail: "Nexus Retail paid INR 56L", time: "46 min ago", tone: "green" },
      { title: "Reminder sent", detail: "Zenith Health invoice aging", time: "3h ago", tone: "yellow" },
    ],
  },
  "/budgets": {
    title: "Budget Planning",
    subtitle: "Department budgets, approvals, variance tracking, and scenario planning.",
    icon: Wallet,
    kpis: [
      { label: "Budget used", value: "68%", change: "+3%", tone: "yellow", data: baseKpis[1].data },
      { label: "Approved", value: "INR 82 Cr", change: "+7.5%", tone: "green", data: baseKpis[0].data },
      { label: "Forecast gap", value: "INR 2.1 Cr", change: "-18%", tone: "green", data: baseKpis[2].data },
      { label: "Open asks", value: "17", change: "+5", tone: "blue", data: baseKpis[3].data },
    ],
    chart: "bar",
    tableTitle: "Department Budgets",
    rows: [
      { department: "Engineering", owner: "CTO", budget: "INR 28 Cr", actual: "INR 18.9 Cr", variance: "+2.4%", status: "On track" },
      { department: "Sales", owner: "CRO", budget: "INR 19 Cr", actual: "INR 14.8 Cr", variance: "+7.9%", status: "Watch" },
      { department: "Marketing", owner: "CMO", budget: "INR 12 Cr", actual: "INR 9.7 Cr", variance: "+11.2%", status: "Review" },
      { department: "G&A", owner: "COO", budget: "INR 8 Cr", actual: "INR 4.8 Cr", variance: "-3.1%", status: "On track" },
    ],
    columns: ["department", "owner", "budget", "actual", "variance", "status"],
    insights: ["Marketing campaign spend will exceed plan by INR 74L without reallocation.", "Engineering cloud optimization released INR 1.1 Cr capacity.", "Scenario B preserves 18% EBITDA target."],
    actions: ["Create scenario", "Approve budget", "Lock plan"],
    tabs: ["FY Plan", "Scenarios", "Approvals", "Variance"],
    timeline: [
      { title: "Scenario generated", detail: "Conservative growth case", time: "35 min ago", tone: "blue" },
      { title: "Budget approved", detail: "Engineering Q3 capacity", time: "Yesterday", tone: "green" },
    ],
  },
  "/cash-flow": {
    title: "Cash Flow",
    subtitle: "Treasury visibility, inflows, outflows, runway, and liquidity forecast.",
    icon: Activity,
    kpis: [
      { label: "Net cash", value: "INR 4.82 Cr", change: "+5.7%", tone: "green", data: baseKpis[3].data },
      { label: "Runway", value: "18.4 mo", change: "+1.2", tone: "green", data: baseKpis[0].data },
      { label: "Receipts", value: "INR 38 Cr", change: "+9%", tone: "green", data: baseKpis[2].data },
      { label: "Outflows", value: "INR 22 Cr", change: "-3%", tone: "green", data: baseKpis[1].data },
    ],
    chart: "bar",
    tableTitle: "Treasury Movements",
    rows: [
      { date: "2026-06-28", source: "Customer collections", inflow: "INR 5.6 Cr", outflow: "-", balance: "INR 42.1 Cr" },
      { date: "2026-06-27", source: "Payroll", inflow: "-", outflow: "INR 18.2 Cr", balance: "INR 36.5 Cr" },
      { date: "2026-06-26", source: "Vendor payments", inflow: "-", outflow: "INR 2.4 Cr", balance: "INR 54.7 Cr" },
      { date: "2026-06-25", source: "Subscription receipts", inflow: "INR 8.1 Cr", outflow: "-", balance: "INR 57.1 Cr" },
    ],
    columns: ["date", "source", "inflow", "outflow", "balance"],
    insights: ["Cash trough is projected on July 27 at INR 31.4 Cr.", "Early collections can add INR 3.7 Cr liquidity.", "Treasury recommends rolling 20% surplus into 30-day deposits."],
    actions: ["Refresh banks", "Create transfer", "Run forecast"],
    tabs: ["Daily", "Weekly", "Accounts", "Scenario"],
    timeline: [
      { title: "Bank balance synced", detail: "6 accounts updated", time: "8 min ago", tone: "green" },
      { title: "Low balance alert", detail: "Axis AP projected below threshold", time: "2h ago", tone: "yellow" },
    ],
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Financial analytics, cohort trends, variance drivers, and executive metrics.",
    icon: BarChart2,
    kpis: [
      { label: "Gross margin", value: "72.4%", change: "+1.8%", tone: "green", data: baseKpis[0].data },
      { label: "EBITDA", value: "19.6%", change: "+2.2%", tone: "green", data: baseKpis[2].data },
      { label: "Rule accuracy", value: "96.4%", change: "+0.7%", tone: "blue", data: baseKpis[3].data },
      { label: "Anomalies", value: "31", change: "-12", tone: "green", data: baseKpis[4].data },
    ],
    chart: "line",
    tableTitle: "Metric Drivers",
    rows: [
      { metric: "Revenue growth", driver: "Enterprise expansion", impact: "+INR 2.4 Cr", confidence: "94%", owner: "Revenue Ops" },
      { metric: "Cloud COGS", driver: "Reserved instances", impact: "-INR 62L", confidence: "91%", owner: "FinOps" },
      { metric: "Sales spend", driver: "Partner incentives", impact: "+INR 48L", confidence: "86%", owner: "Sales Ops" },
      { metric: "Collections", driver: "Auto reminders", impact: "-6 DSO", confidence: "89%", owner: "AR" },
    ],
    columns: ["metric", "driver", "impact", "confidence", "owner"],
    insights: ["Enterprise expansion explains 61% of revenue upside.", "Cloud COGS optimization is compounding month over month.", "Anomaly rate decreased after new approval thresholds."],
    actions: ["Create dashboard", "Save view", "Share insight"],
    tabs: ["Executive", "Revenue", "Spend", "Operations"],
    timeline: [
      { title: "Insight promoted", detail: "Cloud COGS driver added to CFO pack", time: "1h ago", tone: "blue" },
      { title: "Metric refreshed", detail: "Revenue cohort model updated", time: "Today 06:00", tone: "green" },
    ],
  },
  "/forecasting": {
    title: "Forecasting",
    subtitle: "AI forecasts for revenue, expenses, cash, runway, and risk scenarios.",
    icon: TrendingDown,
    kpis: [
      { label: "Forecast revenue", value: "INR 31.5 Cr", change: "+7.8%", tone: "green", data: baseKpis[0].data },
      { label: "Accuracy", value: "94.1%", change: "+2.3%", tone: "blue", data: baseKpis[2].data },
      { label: "Cash trough", value: "INR 31.4 Cr", change: "+INR 2.6 Cr", tone: "green", data: baseKpis[3].data },
      { label: "Risk cases", value: "6", change: "-2", tone: "green", data: baseKpis[4].data },
    ],
    chart: "area",
    tableTitle: "Forecast Scenarios",
    rows: [
      { scenario: "Base case", revenue: "INR 31.5 Cr", expense: "INR 20.4 Cr", ebitda: "22.1%", confidence: "94%" },
      { scenario: "Conservative", revenue: "INR 28.8 Cr", expense: "INR 20.1 Cr", ebitda: "18.4%", confidence: "87%" },
      { scenario: "Upside", revenue: "INR 34.2 Cr", expense: "INR 21.0 Cr", ebitda: "24.8%", confidence: "78%" },
      { scenario: "Stress", revenue: "INR 24.9 Cr", expense: "INR 19.7 Cr", ebitda: "11.9%", confidence: "72%" },
    ],
    columns: ["scenario", "revenue", "expense", "ebitda", "confidence"],
    insights: ["Base case predicts INR 31.5 Cr revenue for August.", "Expense inflation sensitivity is highest in cloud and payroll.", "Stress case still preserves 12 months runway."],
    actions: ["Run model", "Lock forecast", "Compare scenarios"],
    tabs: ["Revenue", "Expense", "Cash", "Risk"],
    timeline: [
      { title: "Forecast refreshed", detail: "Latest bank and CRM data included", time: "19 min ago", tone: "green" },
      { title: "Scenario changed", detail: "Sales hiring shifted by 30 days", time: "Yesterday", tone: "blue" },
    ],
  },
  "/fraud-center": {
    title: "Fraud Center",
    subtitle: "Fraud detection, anomaly triage, payment holds, and investigation workflows.",
    icon: ShieldAlert,
    kpis: [
      { label: "Alerts", value: "31", change: "-12", tone: "green", data: baseKpis[4].data },
      { label: "Blocked value", value: "INR 18.9L", change: "+INR 8.4L", tone: "red", data: baseKpis[1].data },
      { label: "False positive", value: "6.2%", change: "-1.5%", tone: "green", data: baseKpis[2].data },
      { label: "Mean triage", value: "42 min", change: "-18m", tone: "green", data: baseKpis[3].data },
    ],
    chart: "line",
    tableTitle: "Fraud Alerts",
    rows: fraudAlerts,
    columns: ["severity", "title", "detail", "owner", "status"],
    insights: ["Duplicate payment model blocked INR 3.45L today.", "New vendor risk is concentrated in procurement category.", "Bank detail changes should require dual approval this week."],
    actions: ["Open case", "Hold payments", "Export evidence"],
    tabs: ["Alerts", "Cases", "Rules", "Evidence"],
    timeline: [
      { title: "Payment hold placed", detail: "Phantom Supplies Ltd", time: "12 min ago", tone: "red" },
      { title: "Case resolved", detail: "Duplicate Accenture payment reversed", time: "Yesterday", tone: "green" },
    ],
  },
  "/compliance-center": {
    title: "Compliance Center",
    subtitle: "GST, SOX, audit evidence, policy controls, and remediation tracking.",
    icon: ShieldCheck,
    kpis: [
      { label: "Open issues", value: "12", change: "-5", tone: "green", data: baseKpis[2].data },
      { label: "Controls pass", value: "97.2%", change: "+1.1%", tone: "green", data: baseKpis[0].data },
      { label: "Evidence ready", value: "84%", change: "+9%", tone: "blue", data: baseKpis[3].data },
      { label: "High severity", value: "1", change: "-2", tone: "green", data: baseKpis[4].data },
    ],
    chart: "bar",
    tableTitle: "Compliance Issues",
    rows: complianceIssues,
    columns: ["id", "area", "entity", "severity", "due", "status"],
    insights: ["GST filing has one missing vendor credit note.", "SOX approval control passed 97.2% of samples.", "Evidence collection is ahead of audit schedule."],
    actions: ["Upload evidence", "Assign owner", "Generate audit pack"],
    tabs: ["Issues", "Controls", "Evidence", "Policies"],
    timeline: [
      { title: "Evidence attached", detail: "SOX AP approval sample", time: "28 min ago", tone: "green" },
      { title: "Compliance recommendation", detail: "Tighten bank detail change policy", time: "2h ago", tone: "blue" },
    ],
  },
  "/reports": {
    title: "Reports",
    subtitle: "Board packs, CFO reporting, compliance exports, and AI report generation.",
    icon: BarChart3,
    kpis: [
      { label: "Reports ready", value: "18", change: "+6", tone: "green", data: baseKpis[0].data },
      { label: "Drafts", value: "7", change: "-2", tone: "green", data: baseKpis[2].data },
      { label: "Scheduled", value: "24", change: "+4", tone: "blue", data: baseKpis[3].data },
      { label: "Downloads", value: "1,284", change: "+31%", tone: "green", data: baseKpis[0].data },
    ],
    chart: "area",
    tableTitle: "Report Library",
    rows: reports,
    columns: ["report", "owner", "period", "status", "updated"],
    insights: ["AI generated the CFO executive summary with 92% confidence.", "Board pack needs one variance note before sharing.", "Vendor risk register is ready for compliance review."],
    actions: ["Generate report", "Schedule", "Download PDF"],
    tabs: ["Library", "Scheduled", "Templates", "Exports"],
    timeline: [
      { title: "Report generated", detail: "Monthly CFO Pack", time: "Today 09:20", tone: "green" },
      { title: "Template updated", detail: "Board Revenue Bridge", time: "Yesterday", tone: "blue" },
    ],
  },
  "/payments": {
    title: "Payments",
    subtitle: "Payout workflows, payment runs, rails, beneficiaries, and transaction holds.",
    icon: CreditCard,
    kpis: [
      { label: "Total payments", value: "2", change: "+1", tone: "green", data: baseKpis[0].data },
      { label: "Pending", value: "1", change: "+0", tone: "yellow", data: baseKpis[1].data },
      { label: "Held", value: "1", change: "+0", tone: "red", data: baseKpis[4].data },
      { label: "Rails", value: "3", change: "Active", tone: "blue", data: baseKpis[2].data },
    ],
    chart: "bar",
    tableTitle: "Payment Operations",
    rows: [],
    columns: ["id", "beneficiary", "amount", "rail", "status"],
    insights: ["One payment to Phantom Supplies is held for validation.", "Dual authorization is active for wires over INR 50L.", "Standard settlement cycles are within normal bounds."],
    actions: ["Create payment", "Release hold", "Export run"],
    tabs: ["All", "Pending", "Held", "Completed"],
    timeline: [
      { title: "Payment generated", detail: "Accenture Services Wire batch", time: "1h ago", tone: "blue" },
      { title: "Fraud lock active", detail: "Phantom Supplies payment held", time: "Yesterday", tone: "red" },
    ],
  },
  "/treasury": {
    title: "Treasury",
    subtitle: "Bank balances, liquidity forecasting, intercompany transfers, and sync status.",
    icon: Landmark,
    kpis: [
      { label: "Accounts", value: "4", change: "Syncing", tone: "green", data: baseKpis[0].data },
      { label: "Total cash", value: "INR 50.8 Cr", change: "+5.7%", tone: "green", data: baseKpis[3].data },
      { label: "Sync rate", value: "Realtime", change: "Plaid", tone: "blue", data: baseKpis[2].data },
      { label: "Base currency", value: "INR", change: "Primary", tone: "green", data: baseKpis[0].data },
    ],
    chart: "line",
    tableTitle: "Bank Account Liquidity",
    rows: [],
    columns: ["id", "institution", "account_type", "masked_number", "balance_current", "sync_status"],
    insights: ["Treasury recommends rolling 20% surplus cash into liquid yields.", "Axis AP account shows low projected balance threshold.", "All Plaid feeds are active and sync successfully."],
    actions: ["Connect account", "Transfer funds", "Refresh sync"],
    tabs: ["Accounts", "Transfers", "Liquidity", "Sync Logs"],
    timeline: [
      { title: "Feeds synced", detail: "6 corporate accounts sync complete", time: "10m ago", tone: "green" },
      { title: "Transfer verified", detail: "HDFC to Axis intercompany sweep", time: "2h ago", tone: "blue" },
    ],
  },
};

function toneColor(tone: KPI["tone"]) {
  return tone === "green" ? green : tone === "red" ? red : tone === "yellow" ? yellow : blue;
}

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const Sparkline = React.memo(function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div style={{ width: 64, height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

const KpiCard = React.memo(function KpiCard({ kpi }: { kpi: KPI }) {
  const color = toneColor(kpi.tone);
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] text-gray-500 font-medium truncate">{kpi.label}</div>
          <div className="text-[17px] font-bold text-gray-900 mt-0.5 leading-tight truncate">{kpi.value}</div>
          <div className="flex items-center gap-0.5 mt-1">
            {kpi.tone === "red" ? <ArrowUpRight size={9} style={{ color }} /> : <ArrowUpRight size={9} style={{ color }} />}
            <span className="text-[10px] font-medium" style={{ color }}>{kpi.change}</span>
            <span className="text-[10px] text-gray-400 ml-0.5 truncate">vs plan</span>
          </div>
        </div>
        <Sparkline data={kpi.data} color={color} />
      </div>
    </div>
  );
});

function Button({
  children,
  onClick,
  tone = "light",
  Icon,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "red" | "light" | "ghost";
  Icon?: LucideIcon;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors",
        tone === "red" && !disabled && "bg-red-600 text-white hover:bg-red-700",
        tone === "red" && disabled && "bg-red-300 text-white cursor-not-allowed",
        tone === "light" && !disabled && "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
        tone === "light" && disabled && "border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed",
        tone === "ghost" && !disabled && "text-gray-500 hover:bg-gray-50",
        tone === "ghost" && disabled && "text-gray-300 cursor-not-allowed"
      )}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
}

function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "red" | "green" | "yellow" | "blue" | "gray" }) {
  const cls = {
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-600",
    gray: "bg-gray-100 text-gray-600",
  }[tone];
  return <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold", cls)}>{children}</span>;
}

function statusTone(value: string | number): "red" | "green" | "yellow" | "blue" | "gray" {
  const text = String(value).toLowerCase();
  if (text.includes("critical") || text.includes("urgent") || text.includes("blocked") || text.includes("high") || text.includes("held")) return "red";
  if (text.includes("review") || text.includes("pending") || text.includes("watch") || text.includes("medium") || text.includes("draft")) return "yellow";
  if (text.includes("ready") || text.includes("approved") || text.includes("settled") || text.includes("active") || text.includes("excellent") || text.includes("low") || text.includes("on track")) return "green";
  if (text.includes("testing") || text.includes("preferred") || text.includes("good")) return "blue";
  return "gray";
}

function ChartBlock({ type, title }: { type: PageConfig["chart"]; title: string }) {
  const commonTooltip = {
    contentStyle: { fontSize: 10, border: "1px solid #E5E7EB", borderRadius: 8, padding: "4px 8px" },
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[12px] font-semibold text-gray-800">{title}</div>
          <div className="text-[20px] font-bold text-gray-900 leading-tight mt-0.5">INR 24.56 Cr</div>
        </div>
        <div className="flex gap-1 mt-0.5">
          {["Monthly", "Quarterly", "Yearly"].map((p, i) => (
            <button key={p} className={cn("text-[9px] px-2 py-0.5 rounded font-medium border", i === 0 ? "bg-red-600 text-white border-red-600" : "text-gray-500 hover:bg-gray-50 border-gray-200")}>{p}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        {type === "pie" ? (
          <PieChart>
            <Pie data={expenseBreakdownData} cx="50%" cy="50%" innerRadius={58} outerRadius={82} dataKey="value" strokeWidth={0}>
              {expenseBreakdownData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip {...commonTooltip} />
          </PieChart>
        ) : type === "bar" ? (
          <BarChart data={trendData} barSize={12} margin={{ top: 12, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip {...commonTooltip} />
            <Bar dataKey="revenue" fill={green} radius={[3, 3, 0, 0]} />
            <Bar dataKey="expenses" fill={red} radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={trendData} margin={{ top: 12, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip {...commonTooltip} />
            <Line dataKey="revenue" stroke={red} strokeWidth={2} dot={false} />
            <Line dataKey="cash" stroke={indigo} strokeWidth={2} dot={false} />
            <Line dataKey="forecast" stroke={green} strokeWidth={2} dot={false} strokeDasharray="4 3" />
          </LineChart>
        ) : (
          <AreaChart data={trendData} margin={{ top: 12, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={red} stopOpacity={0.15} />
                <stop offset="95%" stopColor={red} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip {...commonTooltip} />
            <Area type="monotone" dataKey="revenue" stroke={red} strokeWidth={2} fill="url(#revGrad)" dot={false} />
            <Area type="monotone" dataKey="expenses" stroke={indigo} strokeWidth={1.5} fill="transparent" dot={false} strokeDasharray="4 2" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function DataTable({ title, rows, columns, onOpen }: { title: string; rows: Row[]; columns: string[]; onOpen: (row: Row) => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase()));
  const visible = filtered.slice((page - 1) * 5, page * 5);
  const pages = Math.max(1, Math.ceil(filtered.length / 5));
  useEffect(() => setPage(1), [query]);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100">
        <div className="text-[12px] font-semibold text-gray-800 mr-auto">{title}</div>
        <div className="relative w-full sm:w-56">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search table..." className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] outline-none focus:border-gray-300" />
        </div>
        <Button Icon={Filter}>Filter</Button>
        <Button Icon={SlidersHorizontal}>Columns</Button>
      </div>
      {visible.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((column) => (
                  <th key={column} className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wide text-gray-500">{column.replace(/_/g, " ")}</th>
                ))}
                <th className="px-4 py-2 text-right text-[9px] font-bold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row, index) => (
                <tr key={index} className="border-t border-gray-50 hover:bg-gray-50/70">
                  {columns.map((column) => (
                    <td key={column} className="px-4 py-2.5 text-[10px] text-gray-700 whitespace-nowrap">
                      {["status", "risk", "severity", "health"].includes(column) ? <Badge tone={statusTone(row[column])}>{row[column]}</Badge> : String(row[column])}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => onOpen(row)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100" aria-label="Open details">
                      <Eye size={12} className="text-gray-500" />
                    </button>
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100" aria-label="More actions">
                      <MoreHorizontal size={12} className="text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No records found" detail="Adjust search or filter settings to show more results." />
      )}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span className="text-[10px] text-gray-500">Showing {visible.length} of {filtered.length} records</span>
        <div className="flex items-center gap-1">
          <Button onClick={() => setPage(Math.max(1, page - 1))}>Prev</Button>
          <span className="px-2 text-[10px] font-semibold text-gray-600">{page}/{pages}</span>
          <Button onClick={() => setPage(Math.min(pages, page + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 transition-opacity">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 p-5 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Lock size={20} />
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">Restricted Action</h2>
          <p className="text-[12px] text-gray-500 mt-1">Sign in or create an account to use this feature.</p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={onClose}>Dismiss</Button>
          <Button tone="red" onClick={() => { onClose(); navigate("/auth/login"); }}>Sign in</Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
        <Search size={15} className="text-gray-400" />
      </div>
      <div className="text-[12px] font-semibold text-gray-800">{title}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{detail}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 rounded-xl bg-white border border-gray-100 shadow-sm animate-pulse" />)}
    </div>
  );
}

function DetailDialog({ row, onClose, onApprove, onReject }: { row: Row | null; onClose: () => void; onApprove?: () => void; onReject?: () => void }) {
  if (!row) return null;
  const isInvoice = "raw_id" in row;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <div className="text-[13px] font-bold text-gray-900">Record details</div>
            <div className="text-[10px] text-gray-500">Enterprise workflow metadata</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center">
            <X size={14} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {Object.entries(row).filter(([key]) => key !== "raw_id").map(([key, value]) => (
            <div key={key} className="rounded-lg bg-gray-50 border border-gray-100 p-2">
              <div className="text-[9px] uppercase font-bold text-gray-400">{key}</div>
              <div className="text-[11px] font-semibold text-gray-800 mt-0.5 break-words">{String(value)}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
          <Button onClick={onClose}>Cancel</Button>
          {isInvoice && onReject && <Button tone="red" onClick={onReject}>Reject</Button>}
          {isInvoice && onApprove && <Button tone="red" Icon={CheckCircle2} onClick={onApprove}>Approve</Button>}
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <button className="absolute inset-0 bg-black/20" onClick={onClose} aria-label="Close drawer" />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl border-l border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="text-[13px] font-bold text-gray-900">{title}</div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center"><X size={14} /></button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100%-57px)]">{children}</div>
      </div>
    </div>
  );
}

function exportCsv(filename: string, rows: Row[]) {
  const headers = Object.keys(rows[0] ?? {});
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPdf(filename: string, title: string, rows: Row[]) {
  const content = `<html><head><title>${title}</title><style>body{font-family:Inter,Arial;padding:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;font-size:12px}h1{font-size:18px}</style></head><body><h1>${title}</h1><table><tbody>${rows.map((row) => `<tr>${Object.values(row).map((v) => `<td>${String(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(content);
    win.document.close();
    win.focus();
    win.print();
  } else {
    exportCsv(filename, rows);
  }
}

function Page({ config }: { config: PageConfig }) {
  const location = useLocation();
  const { auth, setShowDemoModal } = useAuth();
  const [rows, setRows] = useState<Row[]>(config.rows);
  const [kpis, setKpis] = useState<KPI[]>(config.kpis);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Row | null>(null);
  const [drawer, setDrawer] = useState(false);

  const fetchData = async () => {
    if (!auth?.access_token) {
      setRows(config.rows);
      setKpis(config.kpis);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (location.pathname === "/transactions") {
        const res = await apiRequest<any[]>("/transactions", {}, auth.access_token);
        const mapped = res.map((t: any) => ({
          id: t.reference || t.id,
          date: t.posted_date,
          account: t.bank_account_id === "acc_2" ? "ICICI Payroll" : "HDFC Operating",
          counterparty: t.description,
          type: t.category_id || "Procurement",
          amount: `INR ${Math.abs(t.amount).toLocaleString()}`,
          status: t.status,
          risk: t.flag_status === "flagged" ? "Critical" : "Low",
          raw_id: t.id,
        }));
        setRows(mapped);
        const updatedKpis = [...config.kpis];
        updatedKpis[0] = { ...updatedKpis[0], value: String(mapped.length) };
        setKpis(updatedKpis);
      } else if (location.pathname === "/invoices") {
        const res = await apiRequest<any[]>("/invoices", {}, auth.access_token);
        const mapped = res.map((inv: any) => ({
          id: inv.invoice_number,
          vendor: inv.vendor_id === "vnd_1" ? "Microsoft Azure" : "Accenture Services",
          due: inv.due_date,
          owner: inv.status === "approved" ? "Arjun Mehra" : "Priya Nair",
          amount: `INR ${inv.amount.toLocaleString()}`,
          status: inv.status === "approved" ? "Approved" : "Pending",
          stage: inv.po_match_status === "matched" ? "CFO approval" : "PO match",
          raw_id: inv.id,
        }));
        setRows(mapped);
        const updatedKpis = [...config.kpis];
        updatedKpis[0] = { ...updatedKpis[0], value: String(mapped.length) };
        setKpis(updatedKpis);
      } else if (location.pathname === "/vendors") {
        const res = await apiRequest<any[]>("/vendors", {}, auth.access_token);
        const mapped = res.map((v: any) => ({
          vendor: v.vendor,
          category: v.category,
          spend: `INR ${v.spend.toLocaleString()}`,
          risk: v.risk,
          score: v.score,
          status: v.status,
        }));
        setRows(mapped);
        const updatedKpis = [...config.kpis];
        updatedKpis[0] = { ...updatedKpis[0], value: String(mapped.length) };
        setKpis(updatedKpis);
      } else if (location.pathname === "/customers") {
        const res = await apiRequest<any[]>("/customers", {}, auth.access_token);
        const mapped = res.map((c: any) => ({
          customer: c.customer,
          segment: c.segment,
          arr: `INR ${c.arr.toLocaleString()}`,
          health: c.health,
          invoices: c.invoices,
          owner: c.owner,
        }));
        setRows(mapped);
        const updatedKpis = [...config.kpis];
        updatedKpis[0] = { ...updatedKpis[0], value: String(mapped.length) };
        setKpis(updatedKpis);
      } else if (location.pathname === "/payments") {
        const res = await apiRequest<any[]>("/payments", {}, auth.access_token);
        const mapped = res.map((p: any) => ({
          id: p.id,
          beneficiary: p.beneficiary_name,
          amount: `INR ${p.amount.toLocaleString()}`,
          rail: p.rail.toUpperCase(),
          status: p.status,
          raw_id: p.id,
        }));
        setRows(mapped);
        const updatedKpis = [...config.kpis];
        updatedKpis[0] = { ...updatedKpis[0], value: String(mapped.length) };
        setKpis(updatedKpis);
      } else if (location.pathname === "/treasury") {
        const res = await apiRequest<any[]>("/bank-accounts", {}, auth.access_token);
        const mapped = res.map((a: any) => ({
          id: a.id,
          institution: a.institution_name,
          account_type: a.account_type.toUpperCase(),
          masked_number: a.masked_number,
          balance_current: `INR ${a.balance_current.toLocaleString()}`,
          sync_status: a.sync_status,
          raw_id: a.id,
        }));
        setRows(mapped);
        const updatedKpis = [...config.kpis];
        updatedKpis[0] = { ...updatedKpis[0], value: String(mapped.length) };
        setKpis(updatedKpis);
      } else {
        setRows(config.rows);
        setKpis(config.kpis);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setRows(config.rows);
      setKpis(config.kpis);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname, auth?.access_token]);

  const handleAction = async (row: any, action: string) => {
    if (!auth) {
      setShowDemoModal(true);
      return;
    }
    if (!row) return;
    try {
      const rawId = row.raw_id || row.id;
      if (location.pathname === "/invoices") {
        if (action === "approve") {
          await apiRequest(`/invoices/${rawId}/approve`, { method: "POST" }, auth.access_token);
        } else if (action === "reject") {
          await apiRequest(`/invoices/${rawId}/reject`, { method: "POST", body: JSON.stringify({ reason: "Rejected via UI" }) }, auth.access_token);
        }
      }
      setSelected(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (amount: number) => {
    if (!auth) {
      setShowDemoModal(true);
      return;
    }
    try {
      if (location.pathname === "/invoices") {
        await apiRequest("/invoices/upload", {
          method: "POST",
          body: JSON.stringify({ file_name: "manual-upload.pdf", amount }),
        }, auth.access_token);
      } else if (location.pathname === "/transactions") {
        await apiRequest("/transactions", {
          method: "POST",
          body: JSON.stringify({ amount: -amount, description: "Manual payment flow" }),
        }, auth.access_token);
      } else if (location.pathname === "/payments") {
        await apiRequest("/payments", {
          method: "POST",
          body: JSON.stringify({ amount, rail: "wire", beneficiary_name: "Manual Beneficiary", beneficiary_account_number: "●●●●9999" }),
        }, auth.access_token);
      }
      setDrawer(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...config, rows }} onCsv={() => exportCsv(config.title.toLowerCase().replace(/\s+/g, "-"), rows)} onPdf={() => exportPdf(config.title, config.title, rows)} onDrawer={() => { if (!auth) { setShowDemoModal(true); } else { setDrawer(true); } }} />
      {loading ? <LoadingSkeleton /> : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}</div>}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 xl:col-span-8">
          <ChartBlock type={config.chart} title={`${config.title} Trend`} />
        </div>
        <div className="col-span-12 xl:col-span-4 space-y-3">
          <InsightsPanel insights={config.insights} />
          <Timeline items={config.timeline} />
        </div>
      </div>
      <Tabs labels={config.tabs} />
      <DataTable title={config.tableTitle} rows={rows} columns={config.columns} onOpen={setSelected} />
      <DetailDialog row={selected} onClose={() => setSelected(null)} onApprove={() => handleAction(selected, "approve")} onReject={() => handleAction(selected, "reject")} />
      <Drawer open={drawer} title={`${config.title} actions`} onClose={() => setDrawer(false)}>
        <EnterpriseForm actions={config.actions} onSubmit={handleCreate} />
      </Drawer>
    </div>
  );
}

function PageHeader({ config, onCsv, onPdf, onDrawer }: { config: PageConfig; onCsv: () => void; onPdf: () => void; onDrawer: () => void }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="mr-auto">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">
          <Link to="/dashboard" className="hover:text-red-600">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-600">{config.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center"><config.icon size={14} className="text-red-600" /></div>
          <div>
            <h1 className="text-[17px] font-bold text-gray-900 leading-tight">{config.title}</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">{config.subtitle}</p>
          </div>
        </div>
      </div>
      <Button Icon={Download} onClick={onCsv}>CSV</Button>
      <Button Icon={FileText} onClick={onPdf}>PDF</Button>
      <Button Icon={Printer} onClick={() => window.print()}>Print</Button>
      <Button tone="red" Icon={Plus} onClick={onDrawer}>{config.actions[0]}</Button>
    </div>
  );
}

function Tabs({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(labels[0]);
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-1 shadow-sm inline-flex flex-wrap gap-1">
      {labels.map((label) => (
        <button key={label} onClick={() => setActive(label)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-semibold", active === label ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-50")}>{label}</button>
      ))}
    </div>
  );
}

function InsightsPanel({ insights }: { insights: string[] }) {
  const icons = [TrendingUp, AlertTriangle, Sparkles, AlertCircle];
  const colors = [green, yellow, indigo, red];
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-semibold text-gray-800">AI Insights</div>
        <Badge tone="green">Live</Badge>
      </div>
      <div className="space-y-3">
        {insights.map((text, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={text} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${colors[i % colors.length]}18` }}>
                <Icon size={11} style={{ color: colors[i % colors.length] }} />
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed">{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Timeline({ items }: { items: PageConfig["timeline"] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="text-[12px] font-semibold text-gray-800 mb-3">Activity Feed</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.title} className="flex gap-2 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", item.tone === "green" && "bg-green-500", item.tone === "red" && "bg-red-500", item.tone === "yellow" && "bg-yellow-500", item.tone === "blue" && "bg-blue-500")} />
            <div>
              <div className="text-[10px] font-semibold text-gray-800">{item.title}</div>
              <div className="text-[9px] text-gray-500">{item.detail}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnterpriseForm({ actions, onSubmit }: { actions: string[]; onSubmit?: (amount: number) => void }) {
  const [amount, setAmount] = useState("");
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => (
          <button key={action} className={cn("rounded-xl border p-3 text-left hover:bg-gray-50", i === 0 ? "border-red-100 bg-red-50" : "border-gray-100 bg-white")}>
            <div className="text-[11px] font-bold text-gray-900">{action}</div>
            <div className="text-[9px] text-gray-500 mt-1">Applies workflow controls and audit history.</div>
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-[10px] font-semibold text-gray-600">Amount</span>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] outline-none focus:border-gray-300" placeholder="Enter amount" />
      </label>
      <Button tone="red" Icon={CheckCircle2} onClick={() => onSubmit && onSubmit(Number(amount))}>Submit workflow</Button>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [data, setData] = useState<{ kpis: KPI[]; ai_summary: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.access_token) {
      // Demo Mode
      const mergedKpis = [
        { label: "Revenue", value: "INR 24.56 Cr", change: "+12.5%", tone: "green" as const, data: baseKpis[0].data },
        { label: "Expenses", value: "INR 18.32 Cr", change: "+8.2%", tone: "red" as const, data: baseKpis[1].data },
        { label: "Profit", value: "INR 6.28 Cr", change: "+18.3%", tone: "green" as const, data: baseKpis[2].data },
        { label: "Cash Flow", value: "INR 4.82 Cr", change: "+5.7%", tone: "green" as const, data: baseKpis[3].data },
        { label: "Risk Score", value: "62", change: "High risk", tone: "red" as const, data: baseKpis[4].data },
      ];
      setData({ kpis: mergedKpis, ai_summary: "Revenue is ahead of plan, cash runway is healthy, and vendor risk requires review." });
      setLoading(false);
      return;
    }
    setLoading(true);
    apiRequest<{ kpis: any[]; ai_summary: string }>("/dashboard/summary", {}, auth.access_token)
      .then((res) => {
        const mergedKpis = res.kpis.map((k, i) => ({
          ...k,
          tone: (k.change.includes("-") || k.change.includes("High") || k.label === "Expenses") ? ("red" as const) : ("green" as const),
          data: baseKpis[i % baseKpis.length]?.data ?? baseKpis[0].data
        }));
        setData({ kpis: mergedKpis, ai_summary: res.ai_summary });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [auth?.access_token]);

  const pendingApprovals = invoices.slice(0, 4);
  const topRiskVendors = vendors.sort((a, b) => Number(a.score) - Number(b.score)).slice(0, 4);

  if (loading || !data) {
    return <LoadingSkeleton />;
  }

  const greetingName =
    auth?.user?.name
      ? auth.user.name.split(" ")[0]
      : "Guest";

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[17px] font-bold text-gray-900">Good morning, {greetingName}</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Here's what's happening with your business today.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {data.kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-4"><ChartBlock type="area" title="Financial Overview" /></div>
        <div className="col-span-12 lg:col-span-4"><ExpenseBreakdown /></div>
        <div className="col-span-12 lg:col-span-4">
          <InsightsPanel insights={[data.ai_summary, "3 vendors show unusual payment patterns requiring review.", "AI forecasts 15% cost reduction opportunity in Operations.", "2 compliance issues need immediate attention in GST filing."]} />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-3"><MiniList title="Pending Approvals" count="4" rows={pendingApprovals} onView={() => navigate("/invoices")} /></div>
        <div className="col-span-12 lg:col-span-3"><ChartBlock type="bar" title="Cash Flow Forecast" /></div>
        <div className="col-span-12 lg:col-span-3"><MiniList title="Top Risk Vendors" rows={topRiskVendors} onView={() => navigate("/vendors")} /></div>
        <div className="col-span-12 lg:col-span-3"><MiniAlerts onView={() => navigate("/fraud-center")} /></div>
      </div>
      <AiWidget />
    </div>
  );
}

function ExpenseBreakdown() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm h-full">
      <div className="text-[12px] font-semibold text-gray-800 mb-3">Expense Breakdown</div>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expenseBreakdownData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                {expenseBreakdownData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[9px] text-gray-400 leading-none">Total</div>
            <div className="text-[13px] font-bold text-gray-900 leading-tight">INR 18.32</div>
            <div className="text-[9px] text-gray-400 leading-none">Cr</div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {expenseBreakdownData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: item.color }} />
              <span className="text-[10px] text-gray-600 flex-1">{item.name}</span>
              <span className="text-[10px] font-semibold text-gray-800">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniList({ title, count, rows, onView }: { title: string; count?: string; rows: Row[]; onView: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-semibold text-gray-800">{title}</div>
        {count ? <Badge tone="yellow">{count}</Badge> : <button onClick={onView} className="text-[10px] text-red-500 font-medium">View all</button>}
      </div>
      <div className="space-y-1">
        {rows.map((row, i) => (
          <button key={i} onClick={onView} className="w-full flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-left">
            <div className="min-w-0 pr-2">
              <div className="text-[10px] font-medium text-gray-800 truncate">{String(row.vendor ?? row.id ?? row.customer)}</div>
              <div className="text-[9px] text-gray-400 truncate">{String(row.amount ?? row.spend ?? row.category)}</div>
            </div>
            <Badge tone={statusTone(String(row.status ?? row.risk))}>{String(row.status ?? row.risk)}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniAlerts({ onView }: { onView: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-semibold text-gray-800">Fraud Alerts</div>
        <Badge tone="red">3</Badge>
      </div>
      <div className="space-y-1">
        {fraudAlerts.slice(0, 3).map((alert) => (
          <button key={alert.title} onClick={onView} className="w-full flex gap-2 py-1.5 border-b border-gray-50 last:border-0 text-left">
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", alert.severity === "Critical" ? "bg-red-600" : "bg-orange-500")} />
            <div>
              <div className="text-[10px] font-medium text-gray-800">{alert.title}</div>
              <div className="text-[9px] text-gray-500">{alert.detail}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AiWidget() {
  const [chatInput, setChatInput] = useState("");
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="bg-red-600 flex items-center justify-center px-3 py-3 flex-shrink-0"><Bot size={20} className="text-white" /></div>
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[12px] font-bold text-gray-900">FinOps AI Copilot</span>
            <Badge tone="green">Online</Badge>
          </div>
          <div className="flex flex-col lg:flex-row gap-3">
            <button onClick={() => navigate("/ai-copilot")} className="flex-1 bg-gray-50 rounded-lg p-2.5 text-[10px] text-gray-700 leading-relaxed border border-gray-100 text-left">
              Hello. Revenue has grown <strong>12.5%</strong> this month, but I detected <span className="text-red-600 font-medium">3 vendors</span> with unusual payment patterns. <span className="text-blue-500">View details -&gt;</span>
            </button>
            <div className="flex-1">
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {["Personalized Budget", "Ask AI", "30 Min Sync", "Quick Report"].map((action) => <button key={action} onClick={() => navigate("/ai-copilot")} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-200 whitespace-nowrap font-medium">{action}</button>)}
              </div>
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask anything about your finances..." className="flex-1 text-[10px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none placeholder-gray-400 focus:border-gray-300" />
                <button onClick={() => navigate("/ai-copilot")} className="bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-700 flex-shrink-0"><Send size={11} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiCopilotPage() {
  const { auth, setShowDemoModal } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([
    { role: "ai", text: "Hello! I am your FinOps AI Copilot. Ask me about duplicate payments, vendor anomalies, or bank cash positioning." }
  ]);
  const [input, setInput] = useState("");
  const [agentStatus, setAgentStatus] = useState("Idle");
  const [telemetry, setTelemetry] = useState<any>({ totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatencyMs: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchConversations = async () => {
    if (!auth?.access_token) return;
    try {
      const res = await apiRequest<any[]>("/ai/conversations", {}, auth.access_token);
      setConversations(res);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTelemetry = async () => {
    if (!auth?.access_token) return;
    try {
      const res = await apiRequest<any>("/ai/evaluate", { method: "POST" }, auth.access_token);
      setTelemetry(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async (id: string) => {
    if (!auth) {
      setCurrentConvoId(id);
      if (id === "c1") {
        setMessages([
          { role: "ai", text: "Hello! Here is the CFO Revenue Reconciliation." },
          { role: "user", text: "What is the SaaS margin driver?" },
          { role: "ai", text: "Operating margin improved due to cloud compute savings of INR 1.1 Cr." }
        ]);
      } else {
        setMessages([
          { role: "ai", text: "Duplicate checks completed." }
        ]);
      }
      return;
    }
    setCurrentConvoId(id);
    try {
      const res = await apiRequest<any[]>(`/ai/history?conversation_id=${id}`, {}, auth.access_token);
      setMessages(res.map((m) => ({ role: m.role, text: m.content })));
    } catch (e) {
      console.error(e);
    }
  };

  const startNewChat = () => {
    setCurrentConvoId(null);
    setMessages([{ role: "ai", text: "Hello! Ready to analyze your corporate finance workspace. What can I check today?" }]);
  };

  const executeSearch = async () => {
    // Local simulator or RAG context build
    setSearchResults([
      { title: "Enterprise Architecture Guide", snippet: "Section 5.3: Dual auth required on transfers over INR 50L." },
      { title: "Standard Operating Checklist", snippet: "All consulting invoices require PO matching under SOX Section 404." }
    ]);
  };

  useEffect(() => {
    if (!auth) {
      setConversations([
        { id: "c1", title: "CFO Revenue Reconciliation" },
        { id: "c2", title: "Accenture duplicate check" }
      ]);
      setTelemetry({ totalRequests: 24, totalTokens: 148200, totalCost: 0.2964, averageLatencyMs: 420 });
      return;
    }
    fetchConversations();
    fetchTelemetry();
  }, [auth?.access_token]);

  const send = async (queryText?: string) => {
    if (!auth) {
      setShowDemoModal(true);
      return;
    }
    const textToSend = queryText || input;
    if (!textToSend.trim() || !auth?.access_token) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setAgentStatus("Thinking...");

    try {
      const response = await fetch("/api/v1/ai/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: textToSend, conversation_id: currentConvoId || undefined }),
      });

      if (!response.ok) throw new Error("Stream connection failed.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamText = "";

      setMessages((prev) => [...prev, { role: "ai", text: "" }]);
      setAgentStatus("Orchestrating Specialist...");

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith("data:")) {
              if (cleanLine.includes("[DONE]")) {
                setAgentStatus("Idle");
                break;
              }
              try {
                const parsed = JSON.parse(cleanLine.slice(5).trim());
                if (parsed.text) {
                  streamText += parsed.text;
                  setMessages((prev) => {
                    const next = [...prev];
                    next[next.length - 1] = { role: "ai", text: streamText };
                    return next;
                  });
                }
                if (parsed.conversation_id) {
                  setCurrentConvoId(parsed.conversation_id);
                }
              } catch (e) { }
            }
          }
        }
      }
      fetchTelemetry();
      fetchConversations();
    } catch (e) {
      setMessages((prev) => [...prev, { role: "ai", text: "Error streaming response from AI Gateway." }]);
      setAgentStatus("Error");
    }
  };

  const templates = [
    { name: "CFO Summary", prompt: "Draft a CFO brief P&L statement." },
    { name: "Duplicate Risk Check", prompt: "Check Accenture payments for duplicates." },
    { name: "Compliance Check", prompt: "Enumerate missing SOX checklist approvals." }
  ];

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/analytics"], title: "AI Copilot", subtitle: "AI financial assistant, insights, report generation, risk analysis, and recommendations.", icon: Bot, actions: ["New session"], rows: [] }} onCsv={() => { }} onPdf={() => { }} onDrawer={startNewChat} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard kpi={{ label: "AI Requests", value: String(telemetry.totalRequests || 0), change: "+14%", tone: "blue", data: baseKpis[0].data }} />
        <KpiCard kpi={{ label: "Tokens Processed", value: (telemetry.totalTokens || 0).toLocaleString(), change: "Live stats", tone: "indigo", data: baseKpis[2].data }} />
        <KpiCard kpi={{ label: "Cost Incurred", value: `$${(telemetry.totalCost || 0).toFixed(4)}`, change: "Estimated", tone: "yellow", data: baseKpis[3].data }} />
        <KpiCard kpi={{ label: "Avg Latency", value: `${telemetry.averageLatencyMs || 0} ms`, change: "Roundtrip", tone: "green", data: baseKpis[1].data }} />
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left Side: History & Library */}
        <div className="col-span-12 xl:col-span-3 space-y-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-[12px] font-bold text-gray-800 mb-2">Sessions History</div>
            <div className="space-y-1 max-h-40 overflow-auto">
              {conversations.map((c) => (
                <button key={c.id} onClick={() => loadHistory(c.id)} className={cn("w-full text-left rounded-lg px-2.5 py-2 text-[11px] hover:bg-gray-50 flex items-center justify-between border border-transparent", currentConvoId === c.id && "bg-red-50/50 border-red-100/50 text-red-700 font-semibold")}>
                  <span className="truncate">{c.title}</span>
                  <ChevronRight size={10} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-[12px] font-bold text-gray-800 mb-2">Prompt Library</div>
            <div className="space-y-1.5">
              {templates.map((t) => (
                <button key={t.name} onClick={() => send(t.prompt)} className="w-full text-left rounded-lg border border-gray-100 bg-gray-50/50 p-2 hover:bg-gray-50">
                  <div className="text-[10px] font-bold text-gray-800">{t.name}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5 truncate">{t.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Chat Console */}
        <div className="col-span-12 xl:col-span-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[12px] font-bold text-gray-900">AI Assistant Console</div>
              <div className="text-[10px] text-gray-500">Supervisor status: <span className="font-semibold text-red-600">{agentStatus}</span></div>
            </div>
            <Badge tone={agentStatus === "Idle" ? "green" : "red"}>{agentStatus === "Idle" ? "Ready" : "Busy"}</Badge>
          </div>
          <div className="p-4 flex-1 overflow-auto space-y-3 bg-gray-50/50">
            {messages.map((message, index) => (
              <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[82%] rounded-xl px-3 py-2 text-[11px] leading-relaxed", message.role === "user" ? "bg-red-600 text-white" : "bg-white border border-gray-100 text-gray-700 shadow-sm whitespace-pre-wrap")}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100 flex gap-2 bg-white">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask supervisor agent..." className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] outline-none focus:border-gray-300" />
            <Button tone="red" Icon={Send} onClick={() => send()}>Send</Button>
          </div>
        </div>

        {/* Right Side: RAG Search & Recommendations */}
        <div className="col-span-12 xl:col-span-3 space-y-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-[12px] font-bold text-gray-800 mb-2">Knowledge Base Search</div>
            <div className="flex gap-1.5 mb-2">
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search standard controls..." className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] outline-none" />
              <button onClick={executeSearch} className="px-2.5 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold">Find</button>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-auto">
              {searchResults.map((r, i) => (
                <div key={i} className="border-b border-gray-50 pb-1.5 last:border-0 last:pb-0">
                  <div className="text-[9px] font-bold text-gray-700">{r.title}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">{r.snippet}</div>
                </div>
              ))}
            </div>
          </div>
          <DataTable title="AI Audit Safeguards" rows={[
            { check: "Prompt Guard", status: "Active", level: "Low Risk" },
            { check: "SOX Boundary", status: "Active", level: "Protected" },
            { check: "TDS Validator", status: "Active", level: "Verified" }
          ]} columns={["check", "status", "level"]} onOpen={() => { }} />
        </div>
      </div>
    </div>
  );
}
function FraudCenterPage() {
  const { auth, setShowDemoModal } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchAlerts = async () => {
    if (!auth) {
      setAlerts([
        { id: "flg_1", title: "Duplicate payment detected", type: "Duplicate Check", severity: "Critical", reason: "INR 345,000 paid twice to Accenture Services" },
        { id: "flg_2", title: "New vendor spike", type: "Concentration", severity: "High", reason: "Phantom Supplies crossed 8x category median" },
        { id: "flg_3", title: "Late approval pattern", type: "Approval anomaly", severity: "Medium", reason: "Three related invoices approved after business hours" },
        { id: "flg_4", title: "Bank detail change", type: "Credential change", severity: "High", reason: "Vendor bank account changed 18 hours before payment" },
      ]);
      setLoading(false);
      return;
    }
    try {
      const res = await apiRequest<any[]>("/intelligence/fraud-alerts", {}, auth.access_token);
      setAlerts(res);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const triggerScan = async () => {
    if (!auth) {
      setShowDemoModal(true);
      return;
    }
    setScanning(true);
    try {
      const res = await apiRequest<any[]>("/intelligence/fraud-alerts/scan", { method: "POST" }, auth.access_token);
      setAlerts(res);
      setScanning(false);
    } catch (e) {
      console.error(e);
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [auth?.access_token]);

  if (loading) return <LoadingSkeleton />;

  const criticalCount = alerts.filter((a) => a.severity === "Critical").length;
  const mediumCount = alerts.filter((a) => a.severity === "Medium").length;

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/fraud-center"], title: "Fraud Center", subtitle: "Real-time duplicate payment matching, weekend anomaly scans, and vendor risk scores.", icon: ShieldAlert, actions: ["Run fraud scan"], rows: [] }} onCsv={() => { }} onPdf={() => { }} onDrawer={triggerScan} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard kpi={{ label: "Critical Alerts", value: String(criticalCount), change: "Require review", tone: "red", data: baseKpis[4].data }} />
        <KpiCard kpi={{ label: "Medium Alerts", value: String(mediumCount), change: "Soft warnings", tone: "yellow", data: baseKpis[3].data }} />
        <KpiCard kpi={{ label: "Vendor Risk Rating", value: "Critical (1)", change: "Phantom Supplies", tone: "red", data: baseKpis[2].data }} />
        <KpiCard kpi={{ label: "Scan Engine Status", value: scanning ? "Scanning..." : "Active", change: "Continuous sync", tone: "green", data: baseKpis[0].data }} />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <DataTable title="Active Threat Flags" rows={alerts.map(a => ({ id: a.id.slice(0, 8), title: a.title, type: a.type, severity: a.severity, reason: a.reason }))} columns={["id", "title", "type", "severity", "reason"]} onOpen={() => { }} />
        </div>
        <div className="col-span-12 xl:col-span-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="text-[12px] font-bold text-gray-800">AI Threat Explainer</div>
          <div className="rounded-lg bg-red-50/50 border border-red-100/50 p-3 space-y-2">
            <div className="text-[11px] font-bold text-red-800">High Concentration Risk Alert</div>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              We identified dual invoice submissions and weekend transactions. This frequently correlates with phishing or bank credential adjustments prior to payout execution.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <div className="text-[10px] font-bold text-gray-700">Audit Checkpoints</div>
            <div className="text-[9px] text-gray-500 mt-1 leading-relaxed">
              Scan run time: {new Date().toLocaleTimeString()}<br />
              Total items analyzed: 12 transactions, 4 AP invoices, 2 payment orders.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForecastingPage() {
  const { auth, setShowDemoModal } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.access_token) {
      // Demo Mode
      const mockForecasts = trendData.map((t) => ({
        month: t.month,
        revenue: t.revenue * 10000000,
        expenses: t.expenses * 10000000,
        cash: t.cash * 10000000,
        forecast: t.forecast * 10000000,
      }));
      setData({
        forecasts: mockForecasts,
        accuracy: 94.1,
        commentary: "AI modeling projects continued cash positioning safety. Expenses are projected to grow linearly within the Q3 roadmap targets.",
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    apiRequest<any>("/intelligence/forecasts", {}, auth.access_token)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [auth?.access_token]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/forecasting"], title: "AI Projections & Forecasts", subtitle: "AI models modeling revenue trends, budget variances, and cash runways.", icon: TrendingDown, actions: ["Refresh models"], rows: [] }} onCsv={() => { }} onPdf={() => { }} onDrawer={() => { if (!auth) { setShowDemoModal(true); } }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <KpiCard kpi={{ label: "Cash Projection (Dec)", value: `INR ${(data.forecasts[5].cash / 10000000).toFixed(2)} Cr`, change: "+14.2% growth", tone: "green", data: baseKpis[0].data }} />
        <KpiCard kpi={{ label: "Forecast Accuracy", value: `${data.accuracy}%`, change: "Mean Absolute Error", tone: "indigo", data: baseKpis[2].data }} />
        <KpiCard kpi={{ label: "Operating Runway", value: "18 Months", change: "At current burn rate", tone: "blue", data: baseKpis[3].data }} />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-[12px] font-bold text-gray-800 mb-3">6-Month Trend Matrix</div>
          <DataTable title="Forecast Projections" rows={data.forecasts.map((f: any) => ({
            month: f.month,
            revenue: `INR ${(f.revenue / 10000000).toFixed(2)} Cr`,
            expenses: `INR ${(f.expenses / 10000000).toFixed(2)} Cr`,
            cash: `INR ${(f.cash / 10000000).toFixed(2)} Cr`,
            forecast: `INR ${(f.forecast / 10000000).toFixed(2)} Cr`
          }))} columns={["month", "revenue", "expenses", "cash", "forecast"]} onOpen={() => { }} />
        </div>
        <div className="col-span-12 xl:col-span-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="text-[12px] font-bold text-gray-800">Forecast Commentary</div>
          <p className="text-[11px] text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
            {data.commentary}
          </p>
        </div>
      </div>
    </div>
  );
}

function FinancialHealthPage() {
  const { auth } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!auth) {
      setHealth({
        healthScore: 84,
        rating: "Good rating",
        recommendations: [
          { id: "1", severity: "High", recommendation: "Consolidate duplicate SaaS vendors", impact: "Saves INR 3.45L", area: "Procurement" },
          { id: "2", severity: "Medium", recommendation: "Refactor AP approval bounds", impact: "Improves audit time by 2 days", area: "Compliance" },
          { id: "3", severity: "Low", recommendation: "Re-run GST inputs", impact: "Tax variance mitigation", area: "Taxation" }
        ]
      });
      setSummary({
        cash_position: "INR 42.1 Cr",
        unapproved_invoices: 4,
        fraud_warnings: 2,
        rawText: "FinOps Copilot executive board brief:\n\n1. Cash runways are healthy spanning 18.4 months of operations.\n2. Cloud spend concentration index is high across three vendors.\n3. GST credit reconciliations are ahead of timeline targets."
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      apiRequest<any>("/intelligence/financial-health", {}, auth.access_token),
      apiRequest<any>("/intelligence/executive-summary", {}, auth.access_token)
    ]).then(([hRes, sRes]) => {
      setHealth(hRes);
      setSummary(sRes);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  }, [auth?.access_token]);

  if (loading) return <LoadingSkeleton />;

  const copyBrief = () => {
    if (!summary?.rawText) return;
    navigator.clipboard.writeText(summary.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/compliance-center"], title: "Financial Intelligence Hub", subtitle: "Financial Health Score, executive board brief, and AI optimization recommendations.", icon: ShieldCheck, actions: [copied ? "Copied!" : "Copy Brief"], rows: [] }} onCsv={() => { }} onPdf={() => window.print()} onDrawer={copyBrief} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard kpi={{ label: "Health Score", value: `${health.healthScore}/100`, change: health.rating, tone: "green", data: baseKpis[0].data }} />
        <KpiCard kpi={{ label: "Cash Position", value: summary.cash_position, change: "Active reserves", tone: "blue", data: baseKpis[3].data }} />
        <KpiCard kpi={{ label: "AP Unapproved", value: String(summary.unapproved_invoices), change: "Invoice count", tone: "yellow", data: baseKpis[1].data }} />
        <KpiCard kpi={{ label: "Fraud Risks Found", value: String(summary.fraud_warnings), change: "Requires review", tone: "red", data: baseKpis[4].data }} />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 xl:col-span-7 bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="text-[12px] font-bold text-gray-800">CFO Board Brief Executive Summary</div>
          <pre className="text-[10px] text-gray-600 leading-relaxed font-mono bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-auto whitespace-pre-wrap h-64">
            {summary.rawText}
          </pre>
        </div>
        <div className="col-span-12 xl:col-span-5 bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="text-[12px] font-bold text-gray-800">AI Actionable Recommendations</div>
          <div className="space-y-2">
            {health.recommendations.map((rec: any) => (
              <div key={rec.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 flex items-start gap-2.5">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", rec.severity === "High" ? "bg-red-500" : rec.severity === "Medium" ? "bg-yellow-500" : "bg-blue-500")} />
                <div>
                  <div className="text-[10px] font-bold text-gray-800">{rec.recommendation}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{rec.impact} ({rec.area})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const { auth, setShowDemoModal } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("fraud");
  const [previewReport, setPreviewReport] = useState<any>(null);

  const fetchReports = async () => {
    if (!auth) {
      const mockReports = [
        { id: "rep_1", report: "Monthly CFO Pack", period: "Jun 2026", status: "Ready", updated: "Today 09:20", content: "Monthly P&L breakdown outlines EBITDA performance stability. SaaS India gross margin sits robust at 39.8%. Cloud optimization savings tracked." },
        { id: "rep_2", report: "Board Revenue Bridge", period: "Q2 2026", status: "Draft", updated: "Today 08:40", content: "Board deck review: Expansion of enterprise tier ARR has scaled operational runway metrics ahead of plan targets." },
        { id: "rep_3", report: "Vendor Risk Register", period: "Jun 2026", status: "Ready", updated: "Yesterday 18:10", content: "Screened all 486 vendors. Found 2 anomalies regarding duplicate payment thresholds and bank routing revisions." }
      ];
      setReports(mockReports);
      setLoading(false);
      return;
    }
    try {
      const res = await apiRequest<any[]>("/reports", {}, auth.access_token);
      setReports(res);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!auth) {
      setShowDemoModal(true);
      return;
    }
    try {
      const res = await apiRequest<any>("/reports/generate", {
        method: "POST",
        body: JSON.stringify({ type: reportType }),
      }, auth.access_token);
      setPreviewReport(res);
      fetchReports();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [auth?.access_token]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/reports"], title: "Reports Hub", subtitle: "AI-generated financial briefs, Board packages, and transaction audits.", icon: BarChart3, actions: ["Generate report"], rows: [] }} onCsv={() => { }} onPdf={() => { }} onDrawer={handleGenerate} />

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 xl:col-span-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="text-[12px] font-bold text-gray-800">Generate Board Deck</div>
          <div className="space-y-2">
            <label className="block">
              <span className="text-[10px] text-gray-500 font-semibold">Report Category</span>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] outline-none">
                <option value="fraud">AI Fraud Scan & Vulnerabilities</option>
                <option value="forecast">Forecasting Projections</option>
                <option value="expense">Expense Concentration Pack</option>
                <option value="budget">Department Budget Variances</option>
              </select>
            </label>
            <Button tone="red" Icon={Plus} onClick={handleGenerate}>Run AI Generator</Button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <DataTable title="Generated Statement Library" rows={reports.map(r => ({ id: r.id.slice(0, 8), title: r.report, period: r.period, status: r.status, updated: r.updated, raw_id: r.id }))} columns={["id", "title", "period", "status", "updated"]} onOpen={(row) => {
            const fullReport = reports.find(r => r.id === row.raw_id);
            setPreviewReport(fullReport);
          }} />
        </div>
      </div>

      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <div className="text-[13px] font-bold text-gray-900">{previewReport.report || "Report Preview"}</div>
                <div className="text-[10px] text-gray-500">Period: {previewReport.period} | Generated by AI Agent</div>
              </div>
              <button onClick={() => setPreviewReport(null)} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                <X size={14} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 bg-gray-50/50">
              <pre className="text-[10px] font-mono text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-auto bg-white border border-gray-100 rounded-lg p-3">
                {previewReport.content}
              </pre>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
              <Button onClick={() => setPreviewReport(null)}>Close</Button>
              <Button tone="red" Icon={Printer} onClick={() => window.print()}>Print</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/analytics"], title: "Financial Analytics", subtitle: "EBITDA performance margins, CAC optimization ratios, and budget variances.", icon: BarChart2, actions: ["Analyze trend"], rows: [] }} onCsv={() => { }} onPdf={() => { }} onDrawer={() => { }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard kpi={{ label: "APAC EBITDA Margin", value: "17.1%", change: "-1.4% variance", tone: "yellow", data: baseKpis[3].data }} />
        <KpiCard kpi={{ label: "SaaS EBITDA Margin", value: "39.8%", change: "+6.2% variance", tone: "green", data: baseKpis[0].data }} />
        <KpiCard kpi={{ label: "Budget Burn Rate", value: "68%", change: "Within target limit", tone: "green", data: baseKpis[2].data }} />
        <KpiCard kpi={{ label: "Monthly Gross Profit", value: "INR 14.7 Cr", change: "+11.1%", tone: "blue", data: baseKpis[1].data }} />
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 xl:col-span-8">
          <ChartBlock type="line" title="Gross Revenue Trend Line" />
        </div>
        <div className="col-span-12 xl:col-span-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="text-[12px] font-bold text-gray-800">Category Expense Index</div>
          <div className="space-y-2">
            {[
              { name: "Cloud & Infrastructure", value: "INR 4.14 Cr", percent: "42%" },
              { name: "Consulting Operations", value: "INR 2.84 Cr", percent: "28%" },
              { name: "Enterprise Audits", value: "INR 1.26 Cr", percent: "18%" }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div className="text-[10px] text-gray-600 font-semibold">{item.name}</div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-800">{item.value}</div>
                  <div className="text-[8px] text-gray-400 font-semibold">{item.percent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPage() {
  const { auth } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    if (!auth) {
      const q = val.toLowerCase();
      const hits: any[] = [];
      transactions.forEach((t) => {
        if (t.counterparty.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) {
          hits.push({ type: "Transaction", title: t.counterparty, subtitle: `${t.id} | ${t.amount} | ${t.status}` });
        }
      });
      invoices.forEach((i) => {
        if (i.vendor.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)) {
          hits.push({ type: "Invoice", title: i.vendor, subtitle: `${i.id} | ${i.amount} | ${i.status}` });
        }
      });
      vendors.forEach((v) => {
        if (v.vendor.toLowerCase().includes(q)) {
          hits.push({ type: "Vendor", title: v.vendor, subtitle: `${v.category} | ${v.spend} | Risk: ${v.risk}` });
        }
      });
      customers.forEach((c) => {
        if (c.customer.toLowerCase().includes(q)) {
          hits.push({ type: "Customer", title: c.customer, subtitle: `${c.segment} | ARR: ${c.arr} | Health: ${c.health}` });
        }
      });
      setResults(hits.slice(0, 12));
      return;
    }
    try {
      const res = await apiRequest<any[]>(`/search?q=${encodeURIComponent(val)}`, {}, auth.access_token);
      setResults(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/analytics"], title: "Global Search Engine", subtitle: "Unified enterprise-wide query across transactions, invoices, and folders.", icon: Search, actions: ["Reset Search"], rows: [] }} onCsv={() => { }} onPdf={() => { }} onDrawer={() => handleSearch("")} />

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm max-w-xl">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Type keywords: Azure, Accenture, HDFC, duplicate..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-600 placeholder-gray-400 outline-none focus:border-gray-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {results.map((hit, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-2 hover:border-gray-200 transition-colors">
            <Badge tone="blue">{hit.type}</Badge>
            <div className="text-[11px] font-bold text-gray-800 leading-tight">{hit.title}</div>
            <div className="text-[10px] text-gray-500 leading-relaxed">{hit.subtitle}</div>
          </div>
        ))}
        {query && !results.length && (
          <div className="col-span-full py-8 text-center text-[11px] text-gray-400">
            No matching entries found in organization collections.
          </div>
        )}
      </div>
    </div>
  );
}

function ExportCenterPage() {
  const { auth, setShowDemoModal } = useAuth();
  const [resource, setResource] = useState("transactions");
  const [format, setFormat] = useState("csv");

  const handleDownload = () => {
    if (!auth) {
      // Mock local CSV export for transactions/invoices
      let rowsToExport: Row[] = [];
      if (resource === "transactions") rowsToExport = transactions;
      else if (resource === "invoices") rowsToExport = invoices;
      else rowsToExport = vendors;
      exportCsv(`${resource}_export`, rowsToExport);
      return;
    }
    const url = `/api/v1/export?resource=${resource}&format=${format}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${auth.access_token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const fileUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = `${resource}_export.${format === "excel" ? "xls" : format}`;
        a.click();
        URL.revokeObjectURL(fileUrl);
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/analytics"], title: "Data Export Center", subtitle: "Export audit trails, payment registers, and monthly ledger worksheets.", icon: Download, actions: ["Run export job"], rows: [] }} onCsv={() => { }} onPdf={() => { }} onDrawer={handleDownload} />

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm max-w-md space-y-3">
        <div className="text-[12px] font-bold text-gray-800">Configure Data Export</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] text-gray-500 font-semibold">Select Collection</span>
            <select value={resource} onChange={(e) => setResource(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] outline-none">
              <option value="transactions">Ledger Transactions</option>
              <option value="invoices">AP Invoices</option>
              <option value="payments">Scheduled Payouts</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] text-gray-500 font-semibold">Target Format</span>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] outline-none">
              <option value="csv">Standard CSV File</option>
              <option value="json">Raw JSON Payload</option>
              <option value="excel">Microsoft Excel (XLS)</option>
            </select>
          </label>
        </div>
        <Button tone="red" Icon={Download} onClick={handleDownload}>Initiate File Download</Button>
      </div>
    </div>
  );
}

function NotificationsPage() {
  const { auth, setShowDemoModal } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    if (!auth) {
      const data = [
        { id: "1", type: "system", message: "Dual authorization enabled on payments over INR 50L.", priority: "Medium", created_at: new Date().toISOString(), status: "Unread" },
        { id: "2", type: "fraud", message: "Duplicate payment check: INR 345,000 flagged to Accenture Services.", priority: "Critical", created_at: new Date().toISOString(), status: "Unread" },
        { id: "3", type: "compliance", message: "GST filing missing vendor credit note for India SaaS.", priority: "High", created_at: new Date().toISOString(), status: "Read" },
      ];
      const mapped = data.map((n) => ({
        ...n,
        time: "12 min ago",
      }));
      setRows(mapped);
      setLoading(false);
      return;
    }
    apiRequest<any[]>("/notifications", {}, auth.access_token)
      .then((data) => {
        const mapped = data.map((n) => ({
          ...n,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setRows(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, [auth?.access_token]);

  const handleOpen = (row: any) => {
    if (!auth) {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "Read" } : r));
      return;
    }
    apiRequest(`/notifications/${row.id}/read`, { method: "POST" }, auth.access_token)
      .then(() => {
        fetchNotifications();
      })
      .catch(console.error);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/analytics"], title: "Notifications", subtitle: "Real-time alerts, approvals, system events, and finance workflow updates.", icon: Bell, actions: ["Mark all read"] }} onCsv={() => exportCsv("notifications", rows)} onPdf={() => exportPdf("Notifications", "Notifications", rows)} onDrawer={() => { if (!auth) { setShowDemoModal(true); } }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard kpi={{ label: "Open", value: String(rows.filter(r => r.status === "Unread").length), change: "", tone: "blue", data: baseKpis[3].data }} />
        <KpiCard kpi={{ label: "Critical", value: String(rows.filter(r => r.priority === "Critical").length), change: "", tone: "red", data: baseKpis[2].data }} />
        <KpiCard kpi={{ label: "SLA", value: "96%", change: "+3%", tone: "green", data: baseKpis[0].data }} />
        <KpiCard kpi={{ label: "Automated", value: "84%", change: "+7%", tone: "blue", data: baseKpis[3].data }} />
      </div>
      <DataTable title="Notifications Workspace" rows={rows} columns={["type", "message", "priority", "time", "status"]} onOpen={handleOpen} />
    </div>
  );
}

function TeamPage() {
  const { auth, setShowDemoModal } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    if (!auth) {
      const data = [
        { id: "1", first_name: "Arjun", last_name: "Mehra", role: "admin", status: "active" },
        { id: "2", first_name: "Priya", last_name: "Nair", role: "finance_manager", status: "active" },
        { id: "3", first_name: "Rahul", last_name: "Shah", role: "accountant", status: "active" }
      ];
      const mapped = data.map((u) => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        role: u.role,
        team: u.role === "admin" ? "FP&A" : "Accounting",
        permissions: u.role === "admin" ? "Admin" : "Editor",
        status: u.status === "active" ? "Active" : "Suspended",
      }));
      setRows(mapped);
      setLoading(false);
      return;
    }
    apiRequest<any[]>("/users", {}, auth.access_token)
      .then((data) => {
        const mapped = data.map((u) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          role: u.role,
          team: u.role === "admin" ? "FP&A" : "Accounting",
          permissions: u.role === "admin" ? "Admin" : "Editor",
          status: u.status === "active" ? "Active" : "Suspended",
        }));
        setRows(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [auth?.access_token]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/analytics"], title: "Team", subtitle: "Role-based access, approvals, ownership, and finance operations assignments.", icon: Users, actions: ["Invite member"] }} onCsv={() => exportCsv("team", rows)} onPdf={() => exportPdf("Team", "Team Members", rows)} onDrawer={() => { if (!auth) { setShowDemoModal(true); } }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard kpi={{ label: "Total Members", value: String(rows.length), change: "", tone: "blue", data: baseKpis[3].data }} />
        <KpiCard kpi={{ label: "Active", value: String(rows.filter(r => r.status === "Active").length), change: "", tone: "green", data: baseKpis[0].data }} />
        <KpiCard kpi={{ label: "Admins", value: String(rows.filter(r => r.role === "admin").length), change: "", tone: "green", data: baseKpis[1].data }} />
        <KpiCard kpi={{ label: "Pending", value: "0", change: "", tone: "yellow", data: baseKpis[2].data }} />
      </div>
      <DataTable title="Team Directory" rows={rows} columns={["name", "role", "team", "permissions", "status"]} onOpen={() => { }} />
    </div>
  );
}

function SettingsPage() {
  const { auth, setShowDemoModal } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dense, setDense] = usePersistedState("finops-density", true);
  const [shortcuts, setShortcuts] = usePersistedState("finops-shortcuts", true);
  const [exports, setExports] = usePersistedState("finops-auto-exports", false);

  useEffect(() => {
    if (!auth) {
      setOrg({
        name: "Tech Synapse Pro Ltd",
        base_currency: "INR",
        timezone: "Asia/Kolkata",
        mfa_enforced: false
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    apiRequest<any>("/organization", {}, auth.access_token)
      .then((data) => {
        setOrg(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [auth?.access_token]);

  if (loading || !org) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/analytics"], title: "Settings", subtitle: "Organization, theme, notifications, shortcuts, exports, and persistence controls.", icon: Settings, actions: ["Save settings"], rows: [] }} onCsv={() => exportCsv("settings", [{ dense: String(dense), shortcuts: String(shortcuts), exports: String(exports) }])} onPdf={() => window.print()} onDrawer={() => { if (!auth) { setShowDemoModal(true); } }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <SettingsCard title="Organization" icon={Building2} fields={[org.name, `${org.base_currency} Base Currency`, `${org.timezone} Timezone`]} />
        <SettingsCard title="Security" icon={Lock} fields={["SAML enabled", "Quarterly access review", org.mfa_enforced ? "MFA Enforced" : "MFA Optional"]} />
        <SettingsCard title="Integrations" icon={Globe2} fields={["HDFC Bank", "Zoho Books", "Salesforce", "Slack"]} />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="text-[12px] font-bold text-gray-900 mb-3">Preferences</div>
        <ToggleRow label="Dense enterprise layout" value={dense} onChange={setDense} />
        <ToggleRow label="Keyboard shortcuts" value={shortcuts} onChange={setShortcuts} />
        <ToggleRow label="Auto-export monthly reports" value={exports} onChange={setExports} />
      </div>
    </div>
  );
}

function UtilityPage({ title, subtitle, icon, rows, columns }: { title: string; subtitle: string; icon: LucideIcon; rows: Row[]; columns: string[] }) {
  return (
    <div className="space-y-3">
      <PageHeader config={{ ...pageConfigs["/analytics"], title, subtitle, icon, rows, columns, actions: [`Add ${title}`] }} onCsv={() => exportCsv(title.toLowerCase(), rows)} onPdf={() => exportPdf(title, title, rows)} onDrawer={() => { }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard kpi={{ label: "Open", value: String(rows.length), change: "+2", tone: "blue", data: baseKpis[3].data }} />
        <KpiCard kpi={{ label: "Critical", value: "2", change: "-1", tone: "green", data: baseKpis[2].data }} />
        <KpiCard kpi={{ label: "SLA", value: "96%", change: "+3%", tone: "green", data: baseKpis[0].data }} />
        <KpiCard kpi={{ label: "Automated", value: "84%", change: "+7%", tone: "blue", data: baseKpis[3].data }} />
      </div>
      <DataTable title={`${title} Workspace`} rows={rows} columns={columns} onOpen={() => { }} />
    </div>
  );
}

function SettingsCard({ title, icon: Icon, fields }: { title: string; icon: LucideIcon; fields: string[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center"><Icon size={14} className="text-red-600" /></div>
        <div className="text-[12px] font-bold text-gray-900">{title}</div>
      </div>
      <div className="space-y-2">
        {fields.map((field) => <div key={field} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-[10px] text-gray-700"><span>{field}</span><Badge tone="green">Active</Badge></div>)}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
      <div className="text-[11px] font-semibold text-gray-700">{label}</div>
      <button onClick={() => onChange(!value)} className={cn("h-5 w-9 rounded-full p-0.5 transition-colors", value ? "bg-red-600" : "bg-gray-200")}>
        <span className={cn("block h-4 w-4 rounded-full bg-white transition-transform", value && "translate-x-4")} />
      </button>
    </div>
  );
}

function usePersistedState(key: string, initial: boolean): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(() => localStorage.getItem(key) ? localStorage.getItem(key) === "true" : initial);
  const update = (next: boolean) => {
    setValue(next);
    localStorage.setItem(key, String(next));
  };
  return [value, update];
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  if (!open) return null;
  const items = [...navItems, ...bottomNav].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-20">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-gray-100">
          <Command size={14} className="text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder="Search pages, actions, reports..." className="flex-1 text-[12px] outline-none" />
          <button onClick={onClose}><X size={14} className="text-gray-400" /></button>
        </div>
        <div className="p-2 max-h-80 overflow-auto">
          {items.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); onClose(); }} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-50">
              <item.Icon size={14} className="text-gray-500" />
              <span className="text-[11px] font-semibold text-gray-700">{item.label}</span>
              <span className="ml-auto text-[9px] text-gray-400">Enter</span>
            </button>
          ))}
          {!items.length && <EmptyState title="No commands found" detail="Try another page, report, or finance action." />}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { auth, logout } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!auth?.access_token) {
      setSessions([
        { id: "ses_demo", ip_address: "127.0.0.1", user_agent: "Mozilla/5.0 (Demo)", created_at: new Date().toISOString() }
      ]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<any[]>("/sessions", {}, auth.access_token);
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [auth?.access_token]);

  const handleRevoke = async (id: string) => {
    if (!auth) return;
    try {
      await apiRequest(`/sessions/${id}`, { method: "DELETE" }, auth.access_token);
      fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };

  if (!auth) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
        <User size={32} className="mx-auto text-gray-400 mb-3" />
        <h2 className="text-[13px] font-bold text-gray-900">Demo User Profile</h2>
        <p className="text-[11px] text-gray-500 mt-1">Please register or log in to view and manage active security sessions.</p>
      </div>
    );
  }

  const rolePermissions = roles[auth.user.role as keyof typeof roles] || [];

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[17px] font-bold text-gray-900">Security Profile</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Manage your credentials, roles, permissions, and active device sessions.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-[12px] font-bold text-gray-900 border-b border-gray-100 pb-2">Account Details</h2>
          <div className="space-y-2">
            <div>
              <div className="text-[9px] font-semibold text-gray-400 font-mono">FULL NAME</div>
              <div className="text-[12px] font-semibold text-gray-800 mt-0.5">{auth.user.name}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold text-gray-400 font-mono">EMAIL ADDRESS</div>
              <div className="text-[12px] font-semibold text-gray-800 mt-0.5">{auth.user.email}</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold text-gray-400 font-mono">ROLE ASSIGNMENT</div>
              <div className="text-[12px] font-semibold text-gray-800 mt-0.5"><Badge tone="blue">{auth.user.role.toUpperCase()}</Badge></div>
            </div>
            <div>
              <div className="text-[9px] font-semibold text-gray-400 font-mono">ORGANIZATION ID</div>
              <div className="text-[12px] font-semibold text-gray-800 mt-0.5 font-mono">{auth.user.organization_id}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
          <h2 className="text-[12px] font-bold text-gray-900 border-b border-gray-100 pb-2">Active Security Role Permissions</h2>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {rolePermissions.map((p: string) => (
              <Badge key={p} tone="green">{p}</Badge>
            ))}
            {!rolePermissions.length && <Badge tone="gray">No active permissions</Badge>}
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Permissions are enforced at the API gateway layer using secure JWT authorization claims.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h2 className="text-[12px] font-bold text-gray-900 border-b border-gray-100 pb-2">Active Device Sessions</h2>
        {loading ? (
          <div className="text-center py-4 text-[11px] text-gray-400">Loading active sessions...</div>
        ) : !sessions.length ? (
          <div className="text-center py-4 text-[11px] text-gray-400">No active sessions found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((s: any) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-gray-800">{s.ip_address}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5 truncate max-w-md">{s.user_agent}</div>
                  <div className="text-[8px] text-gray-400 mt-0.5">Started at: {new Date(s.created_at).toLocaleString()}</div>
                </div>
                {s.revoked_at ? (
                  <Badge tone="red">REVOKED</Badge>
                ) : (
                  <Button tone="light" onClick={() => handleRevoke(s.id)}>Revoke session</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] px-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-[480px]">
        <Link to="/auth/login" className="flex items-center justify-center gap-2 mb-5">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <span className="text-[15px] font-bold text-gray-900">FinOps AI Copilot</span>
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h1 className="text-[18px] font-bold text-gray-900">{title}</h1>
          <p className="text-[12px] text-gray-500 mt-1 mb-4">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function AuthInput({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold text-gray-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        type={type}
        placeholder={placeholder}
        className={cn(
          "mt-1 w-full rounded-lg border bg-gray-50 px-3 py-2 text-[12px] outline-none transition-colors",
          error
            ? "border-red-300 focus:border-red-500"
            : "border-gray-200 focus:border-gray-300"
        )}
      />
      {error && <span className="text-[10px] text-red-500 mt-1 block">{error}</span>}
    </label>
  );
}

function validateEmail(email: string): string {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email address format";
  return "";
}

function validatePassword(password: string): string {
  if (!password) return "Password is required";
  if (password.length < 12) return "Password must be at least 12 characters";
  return "";
}

function validateRequired(value: string, fieldLabel: string): string {
  if (!value || !value.trim()) return `${fieldLabel} is required`;
  return "";
}

function calculatePasswordStrength(password: string): number {
  if (!password || password.length < 12) return 0;
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;
  const score = calculatePasswordStrength(password);

  let text = "Too short";
  let toneColor = "bg-gray-200";
  let textColor = "text-gray-400";

  if (password.length >= 12) {
    if (score <= 1) {
      text = "Weak";
      toneColor = "bg-red-500";
      textColor = "text-red-500";
    } else if (score === 2) {
      text = "Fair";
      toneColor = "bg-amber-500";
      textColor = "text-amber-500";
    } else if (score === 3) {
      text = "Good";
      toneColor = "bg-indigo-500";
      textColor = "text-indigo-500";
    } else if (score === 4) {
      text = "Strong";
      toneColor = "bg-emerald-500";
      textColor = "text-emerald-500";
    }
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-semibold">
        <span className="text-gray-500">Password strength:</span>
        <span className={textColor}>{text}</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((i) => {
          let fill = false;
          if (password.length >= 12) {
            fill = score >= i;
          }
          return (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                fill ? toneColor : "bg-gray-100"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function LoginPage() {
  const { auth, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("arjun@techsynapse.example");
  const [password, setPassword] = useState("SecurePass123!");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (auth) return <Navigate to="/dashboard" replace />;

  const errors = {
    email: validateEmail(email),
    password: validateRequired(password, "Password"),
  };

  const isFormValid = !Object.values(errors).some(err => err !== "");

  const handleBlur = (key: string) => () => {
    setTouched({ ...touched, [key]: true });
  };

  const submit = async () => {
    const allTouched = { email: true, password: true };
    setTouched(allTouched);

    if (!isFormValid) return;

    setError("");
    try {
      const result = await login(email, password);
      if (result.mfaRequired && result.mfaToken) navigate("/auth/mfa", { state: { mfaToken: result.mfaToken } });
      else navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your enterprise finance workspace.">
      <div className="space-y-3">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">{error}</div>}
        <AuthInput
          label="Email"
          value={email}
          onChange={setEmail}
          onBlur={handleBlur("email")}
          error={touched.email ? errors.email : ""}
        />
        <AuthInput
          label="Password"
          value={password}
          onChange={setPassword}
          type="password"
          onBlur={handleBlur("password")}
          error={touched.password ? errors.password : ""}
        />
        <Button tone="red" Icon={Lock} onClick={submit} disabled={!isFormValid}>Sign in</Button>
        <div className="flex items-center justify-between text-[11px]">
          <Link className="text-red-600 font-semibold" to="/auth/register">Create account</Link>
          <Link className="text-gray-500" to="/auth/forgot-password">Forgot password?</Link>
        </div>
      </div>
    </AuthShell>
  );
}

function RegisterPage() {
  const { register, auth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "SecurePass123!", first_name: "", last_name: "", company_name: "" });
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (auth) return <Navigate to="/dashboard" replace />;
  const update = (key: keyof typeof form) => (value: string) => {
    setForm({ ...form, [key]: value });
  };
  const handleBlur = (key: string) => () => {
    setTouched({ ...touched, [key]: true });
  };

  const errors = {
    first_name: validateRequired(form.first_name, "First name"),
    last_name: validateRequired(form.last_name, "Last name"),
    company_name: validateRequired(form.company_name, "Company name"),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
  };

  const isFormValid = !Object.values(errors).some(err => err !== "");

  const submit = async () => {
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    if (!isFormValid) return;

    setError("");
    try {
      await register(form);
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <AuthShell title="Create your organization" subtitle="Set up the first admin account and tenant workspace.">
      <div className="space-y-3">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">{error}</div>}
        <div className="grid grid-cols-2 gap-2">
          <AuthInput
            label="First name"
            value={form.first_name}
            onChange={update("first_name")}
            onBlur={handleBlur("first_name")}
            error={touched.first_name ? errors.first_name : ""}
          />
          <AuthInput
            label="Last name"
            value={form.last_name}
            onChange={update("last_name")}
            onBlur={handleBlur("last_name")}
            error={touched.last_name ? errors.last_name : ""}
          />
        </div>
        <AuthInput
          label="Company"
          value={form.company_name}
          onChange={update("company_name")}
          onBlur={handleBlur("company_name")}
          error={touched.company_name ? errors.company_name : ""}
        />
        <AuthInput
          label="Email"
          value={form.email}
          onChange={update("email")}
          onBlur={handleBlur("email")}
          error={touched.email ? errors.email : ""}
        />
        <div>
          <AuthInput
            label="Password"
            value={form.password}
            onChange={update("password")}
            onBlur={handleBlur("password")}
            type="password"
            error={touched.password ? errors.password : ""}
          />
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className={cn(
              "inline-block w-1.5 h-1.5 rounded-full transition-all duration-300",
              form.password.length >= 12 ? "bg-emerald-500" : "bg-red-400"
            )} />
            <span>Minimum 12 characters.</span>
          </div>
          <PasswordStrengthIndicator password={form.password} />
        </div>
        <Button tone="red" Icon={Building2} onClick={submit} disabled={!isFormValid}>Create workspace</Button>
        <Link className="block text-[11px] text-gray-500" to="/auth/login">Already have an account?</Link>
      </div>
    </AuthShell>
  );
}

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    email: validateEmail(email),
  };

  const isFormValid = !Object.values(errors).some(err => err !== "");

  const handleBlur = (key: string) => () => {
    setTouched({ ...touched, [key]: true });
  };

  const submit = async () => {
    setTouched({ email: true });
    if (!isFormValid) return;

    const resetToken = await forgotPassword(email);
    setToken(resetToken);
    setMessage("If an account exists, a reset link has been sent.");
  };

  return (
    <AuthShell title="Reset access" subtitle="Receive a secure password reset link.">
      <div className="space-y-3">
        {message && <div className="rounded-lg bg-green-50 px-3 py-2 text-[11px] font-semibold text-green-600">{message}</div>}
        <AuthInput
          label="Email"
          value={email}
          onChange={setEmail}
          onBlur={handleBlur("email")}
          error={touched.email ? errors.email : ""}
        />
        <Button tone="red" Icon={Mail} onClick={submit} disabled={!isFormValid}>Send reset link</Button>
        {token && <div className="rounded-lg bg-gray-50 border border-gray-100 p-2 text-[10px] text-gray-500 break-all">Development reset token: {token}</div>}
      </div>
    </AuthShell>
  );
}

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("SecurePass123!");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    token: validateRequired(token, "Reset token"),
    password: validatePassword(password),
  };

  const isFormValid = !Object.values(errors).some(err => err !== "");

  const handleBlur = (key: string) => () => {
    setTouched({ ...touched, [key]: true });
  };

  const submit = async () => {
    setTouched({ token: true, password: true });
    if (!isFormValid) return;

    await resetPassword(token, password);
    navigate("/auth/login");
  };

  return (
    <AuthShell title="Set new password" subtitle="Use your reset token to restore access.">
      <div className="space-y-3">
        <AuthInput
          label="Reset token"
          value={token}
          onChange={setToken}
          onBlur={handleBlur("token")}
          error={touched.token ? errors.token : ""}
        />
        <div>
          <AuthInput
            label="New password"
            value={password}
            onChange={setPassword}
            type="password"
            onBlur={handleBlur("password")}
            error={touched.password ? errors.password : ""}
          />
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className={cn(
              "inline-block w-1.5 h-1.5 rounded-full transition-all duration-300",
              password.length >= 12 ? "bg-emerald-500" : "bg-red-400"
            )} />
            <span>Minimum 12 characters.</span>
          </div>
          <PasswordStrengthIndicator password={password} />
        </div>
        <Button tone="red" Icon={Lock} onClick={submit} disabled={!isFormValid}>Reset password</Button>
      </div>
    </AuthShell>
  );
}

function MfaPage() {
  const { verifyMfa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    code: validateRequired(code, "Verification code"),
  };

  const isFormValid = !Object.values(errors).some(err => err !== "");

  const handleBlur = (key: string) => () => {
    setTouched({ ...touched, [key]: true });
  };

  const mfaToken = (location.state as { mfaToken?: string } | null)?.mfaToken ?? "";
  const submit = async () => {
    setTouched({ code: true });
    if (!isFormValid) return;

    try {
      await verifyMfa(mfaToken, code);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "MFA verification failed");
    }
  };

  return (
    <AuthShell title="Two-factor authentication" subtitle="Enter the six-digit authenticator code.">
      <div className="space-y-3">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">{error}</div>}
        <AuthInput
          label="Code"
          value={code}
          onChange={setCode}
          placeholder="123456"
          onBlur={handleBlur("code")}
          error={touched.code ? errors.code : ""}
        />
        <Button tone="red" Icon={ShieldCheck} onClick={submit} disabled={!isFormValid}>Verify</Button>
      </div>
    </AuthShell>
  );
}

function OnboardingPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  if (!auth) return <Navigate to="/auth/login" replace />;
  const submit = async () => {
    await apiRequest("/organization/onboarding", {
      method: "POST",
      body: JSON.stringify({ base_currency: currency, timezone, fiscal_year_start_month: 4 }),
    }, auth.access_token);
    navigate("/dashboard");
  };
  return (
    <AuthShell title="Organization setup" subtitle="Confirm operating currency, timezone, and fiscal calendar.">
      <div className="space-y-3">
        <AuthInput label="Base currency" value={currency} onChange={setCurrency} />
        <AuthInput label="Timezone" value={timezone} onChange={setTimezone} />
        <Button tone="red" Icon={CheckCircle2} onClick={submit}>Complete onboarding</Button>
      </div>
    </AuthShell>
  );
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout, showDemoModal, setShowDemoModal } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [org, setOrg] = useState(localStorage.getItem("finops-org") ?? "Tech Synapse Pro Ltd");
  const [role, setRole] = useState(localStorage.getItem("finops-role") ?? "Finance Manager");
  const [theme, setTheme] = useState(localStorage.getItem("finops-theme") ?? "light");
  const [globalQuery, setGlobalQuery] = useState("");
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "?") setPaletteOpen(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    localStorage.setItem("finops-org", org);
    localStorage.setItem("finops-role", role);
    localStorage.setItem("finops-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [org, role, theme]);

  const searchTargets = useMemo(() => [...navItems, ...bottomNav], []);
  const matches = globalQuery ? searchTargets.filter((item) => item.label.toLowerCase().includes(globalQuery.toLowerCase())).slice(0, 5) : [];

  if (location.pathname.startsWith("/auth")) {
    return (
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/mfa" element={<MfaPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex overflow-hidden" style={{ fontFamily: "Inter, sans-serif", height: "100vh", background: "#F5F7FB" }}>
      <aside className="flex flex-col flex-shrink-0 overflow-hidden bg-white border-r border-gray-100" style={{ width: 210 }}>
        <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><Zap size={13} className="text-white" fill="white" /></div>
          <span className="text-[13px] font-bold text-gray-900 leading-tight">FinOps AI Copilot</span>
        </Link>
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {navItems.map((item) => <SidebarItem key={item.path} item={item} active={location.pathname === item.path} />)}
        </nav>
        <div className="border-t border-gray-100 px-2 pt-2 flex-shrink-0">
          {bottomNav.map((item) => <SidebarItem key={item.path} item={item} active={location.pathname === item.path} count={item.label === "Notifications" ? 5 : undefined} />)}
        </div>
        <div className="px-2 pb-3 pt-1 flex-shrink-0">
          <select value={org} onChange={(e) => setOrg(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-700 outline-none hover:bg-gray-50">
            <option>Tech Synapse Pro Ltd</option>
            <option>Synapse APAC Pte</option>
            <option>FinOps Sandbox Org</option>
          </select>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0" style={{ height: 54 }}>
          <div className="relative" style={{ flex: 1, maxWidth: 430 }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={globalQuery} onChange={(e) => setGlobalQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { navigate("/search"); } }} placeholder="Search transactions, invoices, vendors, reports..." className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-600 placeholder-gray-400 outline-none focus:border-gray-300" />
            {!!matches.length && (
              <div className="absolute left-0 right-0 top-9 z-30 bg-white rounded-xl border border-gray-100 shadow-lg p-1">
                {matches.map((item) => <button key={item.path} onClick={() => { navigate(item.path); setGlobalQuery(""); }} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-50"><item.Icon size={13} className="text-gray-500" /><span className="text-[11px] font-semibold text-gray-700">{item.label}</span></button>)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {!auth && <Badge tone="yellow">Demo Mode</Badge>}
            <Button Icon={Command} onClick={() => setPaletteOpen(true)}>Ctrl K</Button>
            <button onClick={() => navigate("/notifications")} className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50"><Bell size={15} className="text-gray-500" /><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" /></button>
            <div className="w-px h-6 bg-gray-200" />
            {auth ? (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">AM</div>
                  <div className="hidden sm:block text-left">
                    <div className="text-[12px] font-semibold text-gray-900 leading-tight">{auth.user.name}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{auth.user.role}</div>
                  </div>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-10 z-40 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                    {["Finance Manager", "Controller", "AP Analyst"].map((r) => <button key={r} onClick={() => setRole(r)} className="w-full text-left rounded-lg px-3 py-2 text-[11px] hover:bg-gray-50">{r}</button>)}
                    <button onClick={() => setTheme(theme === "light" ? "enterprise" : "light")} className="w-full text-left rounded-lg px-3 py-2 text-[11px] hover:bg-gray-50">Toggle persisted theme</button>
                    <button onClick={() => navigate("/settings")} className="w-full text-left rounded-lg px-3 py-2 text-[11px] hover:bg-gray-50">Settings</button>
                    <button onClick={() => { logout(); navigate("/auth/login"); }} className="w-full text-left rounded-lg px-3 py-2 text-[11px] text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button tone="light" onClick={() => navigate("/auth/login")}>Login</Button>
                <Button tone="red" onClick={() => navigate("/auth/register")}>Register</Button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fraud-center" element={<FraudCenterPage />} />
            <Route path="/forecasting" element={<ForecastingPage />} />
            <Route path="/compliance-center" element={<FinancialHealthPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/export-center" element={<ExportCenterPage />} />
            {Object.entries(pageConfigs).map(([path, config]) => <Route key={path} path={path} element={<Page config={config} />} />)}
            <Route path="/ai-copilot" element={<AiCopilotPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/reports/:reportId" element={<Page config={pageConfigs["/reports"]} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <DemoModal open={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </div>
  );
}

function SidebarItem({ item, active, count }: { item: NavItem; active: boolean; count?: number }) {
  return (
    <Link to={item.path} className={cn("w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12px] mb-0.5 transition-colors", active ? "bg-red-50 text-red-600 font-semibold" : "text-gray-600 hover:bg-gray-50 font-medium")}>
      <item.Icon size={14} className={active ? "text-red-600" : "text-gray-500"} />
      <span className="truncate">{item.label}</span>
      {item.dot && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
      {count && <span className="ml-auto bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 font-bold">{count}</span>}
    </Link>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
