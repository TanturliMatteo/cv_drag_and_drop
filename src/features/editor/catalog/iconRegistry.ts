import {
  Award,
  Briefcase,
  Calendar,
  Check,
  GraduationCap,
  Globe,
  Link,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import { DEFAULT_ICON } from "../model/defaults";

// Icone scelte per un CV. Nel blocco si salva solo il nome (`content`): resta
// una semplice stringa nel modello, e l'SVG prende il colore del blocco.
export const ICONS: Record<string, LucideIcon> = {
  star: Star,
  mail: Mail,
  phone: Phone,
  "map-pin": MapPin,
  globe: Globe,
  link: Link,
  user: User,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  award: Award,
  calendar: Calendar,
  check: Check,
};

// Nome sconosciuto o vuoto → icona di default, mai un blocco vuoto.
export const iconFor = (name: string): LucideIcon =>
  ICONS[name] ?? ICONS[DEFAULT_ICON];
