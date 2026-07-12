import type { CSSProperties } from "react";
import {
  Radar, Plug, PlugZap, ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight,
  ChevronDown, ChevronRight, Search, SearchX, SearchCheck, LayoutGrid,
  Download, Terminal, CircleCheckBig, Gift, UserPlus, BookOpen, ExternalLink,
  Database, Play, Sparkles, MessageSquare, TrendingUp, FileChartColumn, Compass,
  ChartLine, Swords, ChartPie, Camera, ClipboardCheck, Settings2, Gauge, Link2,
  FileText, Briefcase, Bot, CalendarDays, Telescope, GitCompare, Network, Quote,
  Activity, Megaphone, Copy, Check, X, Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";

// Maps the kebab-case icon names used in the skills data to lucide-react components.
const ICONS: Record<string, LucideIcon> = {
  radar: Radar,
  plug: Plug,
  "plug-zap": PlugZap,
  "arrow-down": ArrowDown,
  "arrow-up-right": ArrowUpRight,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  search: Search,
  "search-x": SearchX,
  "search-check": SearchCheck,
  "layout-grid": LayoutGrid,
  download: Download,
  terminal: Terminal,
  "check-circle-2": CircleCheckBig,
  gift: Gift,
  "user-plus": UserPlus,
  "book-open": BookOpen,
  "external-link": ExternalLink,
  database: Database,
  play: Play,
  sparkles: Sparkles,
  "message-square": MessageSquare,
  "trending-up": TrendingUp,
  "file-bar-chart": FileChartColumn,
  compass: Compass,
  "line-chart": ChartLine,
  swords: Swords,
  "pie-chart": ChartPie,
  camera: Camera,
  "clipboard-check": ClipboardCheck,
  "settings-2": Settings2,
  gauge: Gauge,
  "link-2": Link2,
  "file-text": FileText,
  briefcase: Briefcase,
  bot: Bot,
  "calendar-days": CalendarDays,
  telescope: Telescope,
  "git-compare": GitCompare,
  network: Network,
  quote: Quote,
  activity: Activity,
  megaphone: Megaphone,
  copy: Copy,
  check: Check,
  x: X,
  image: ImageIcon,
};

export default function Icon({
  name,
  size = 16,
  style,
  className,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  // Design used width/height in px via inline style; keep color inheritance.
  return <Cmp size={size} style={style} className={className} aria-hidden />;
}
