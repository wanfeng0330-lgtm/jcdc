'use client';

import {
  ShieldCheck,
  FlaskConical,
  Bot,
  BarChart3,
  ImageIcon,
  Video,
  Mic,
  FileText,
  Smartphone,
  Search,
  Brain,
  Drama,
  Eye,
  BarChart2,
  RefreshCw,
  Download,
  User,
  Settings,
  Handshake,
  Globe,
  BookOpen,
  Newspaper,
  Target,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Siren,
  Clock,
  Zap,
  CheckCircle2,
  ScanSearch,
  ScanFace,
  ShieldAlert,
  Activity,
  Shield,
  BrainCircuit,
  Radio,
  Network,
  Fingerprint,
  MessagesSquare,
  ScanLine,
  type LucideIcon,
} from 'lucide-react';

// 图标映射：将 emoji/符号名映射到 Lucide 组件
export const iconMap: Record<string, LucideIcon> = {
  // 功能图标
  shield_check: ShieldCheck,
  flask: FlaskConical,
  bot: Bot,
  bar_chart: BarChart3,
  
  // 文件类型
  image: ImageIcon,
  video: Video,
  audio: Mic,
  text: FileText,
  screenshot: Smartphone,
  
  // 分析步骤
  search: Search,
  brain: Brain,
  drama: Drama,
  eye: Eye,
  bar_chart_2: BarChart2,
  refresh: RefreshCw,
  
  // 工作流
  download: Download,
  user: User,
  settings: Settings,
  handshake: Handshake,
  globe: Globe,
  book: BookOpen,
  newspaper: Newspaper,
  
  // 仪表盘
  target: Target,
  alert: AlertTriangle,
  lightbulb: Lightbulb,
  trend_up: TrendingUp,
  siren: Siren,
  clock: Clock,
  zap: Zap,
  check: CheckCircle2,
  
  // 特殊
  scan_search: ScanSearch,
  scan_face: ScanFace,
  shield_alert: ShieldAlert,
  activity: Activity,
  shield: Shield,
  brain_circuit: BrainCircuit,
  radio: Radio,
  network: Network,
  fingerprint: Fingerprint,
  messages: MessagesSquare,
  scan_line: ScanLine,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return <span className={className} style={{ fontSize: size }}>{name}</span>;
  }
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}

// 预设的带背景圆形图标
interface IconCircleProps {
  name: string;
  size?: number;
  bgClassName?: string;
  iconClassName?: string;
}

export function IconCircle({ name, size = 20, bgClassName = 'bg-accent/15', iconClassName = 'text-accent' }: IconCircleProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClassName}`}>
      <IconComponent size={size} className={iconClassName} strokeWidth={1.5} />
    </div>
  );
}
