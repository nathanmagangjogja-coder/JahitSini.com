import {
  Scissors,
  Shirt,
  Maximize2,
  Briefcase,
  Pen,
  PlusCircle,
  Wrench,
  Zap,
  CircleDot,
  RefreshCw,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  scissors: Scissors,
  shirt: Shirt,
  maximize: Maximize2,
  briefcase: Briefcase,
  needle: Pen,
  "patch-plus": PlusCircle,
  suture: Wrench,
  zap: Zap,
  "circle-dot": CircleDot,
  "refresh-cw": RefreshCw,
};

interface ServiceIconProps {
  name: string;
  className?: string;
}

export function ServiceIcon({ name, className = "h-6 w-6" }: ServiceIconProps) {
  const Icon = iconMap[name] || Scissors;
  return <Icon className={className} />;
}
