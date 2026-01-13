
import React from 'react';
import { 
    ShoppingCart, LayoutGrid, ChevronRight, Trash2, Filter, Search, Clock, Bookmark, 
    Store, House, ShoppingBag, User, ChevronLeft, ChevronDown, Plus, Minus, Copy, 
    Download, Share2, Send, MoreHorizontal, CircleUser, Wallet, TrendingUp, PieChart, 
    Pencil, Users, Bell, CircleHelp, Headset, LogOut, UserPlus, Shield, FileText, 
    Banknote, Gauge, Camera, X, PackageOpen, ClipboardList, UserCog, ArrowRightLeft, 
    Palette, IdCard, Truck, CircleX, CircleCheck, Check, Moon, Sun, Blocks, Ticket, 
    Image as LucideImage, MapPin, Phone, StickyNote, Tags, Handshake, Warehouse 
} from 'lucide-react';

interface IconProps {
  className?: string;
  active?: boolean;
}

// --- Header Icons ---
export const CartIcon: React.FC<IconProps> = ({ className }) => (
    <ShoppingCart className={className} />
);

export const GridIcon: React.FC<IconProps> = ({ className, active }) => (
    <LayoutGrid className={className} strokeWidth={active ? 2.5 : 1.5} />
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className }) => (
    <ChevronRight className={className} />
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <Trash2 className={className} />
);


// --- Search/Filter Icons ---
export const FilterIcon: React.FC<IconProps> = ({ className }) => (
    <Filter className={className} />
);

export const SearchIcon: React.FC<IconProps> = ({ className }) => (
    <Search className={className} />
);

export const ClockIcon: React.FC<IconProps> = ({ className }) => (
    <Clock className={className} />
);


// --- Product Card Icon ---
export const BookmarkIcon: React.FC<IconProps & { filled?: boolean }> = ({ className, filled }) => (
    <Bookmark className={className} fill={filled ? "currentColor" : "none"} />
);

// --- Bottom Nav Icons (Updated: Removed fill logic, kept strokeWidth) ---
export const StoreIcon: React.FC<IconProps> = ({ className }) => (
    <Store className={className} strokeWidth={1.5} />
);

export const HomeIcon: React.FC<IconProps> = ({ className }) => (
    <House className={className} strokeWidth={1.5} />
);

export const BagIcon: React.FC<IconProps> = ({ className }) => (
    <ShoppingBag className={className} strokeWidth={1.5} />
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
    <User className={className} strokeWidth={1.5} />
);


// --- General Icons ---
export const ChevronLeftIcon: React.FC<IconProps> = ({ className }) => (
    <ChevronLeft className={className} />
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
    <ChevronDown className={className} />
);

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <Plus className={className} />
);

export const MinusIcon: React.FC<IconProps> = ({ className }) => (
    <Minus className={className} />
);

export const CopyIcon: React.FC<IconProps> = ({ className }) => (
    <Copy className={className} />
);

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <Download className={className} />
);

export const ShareIcon: React.FC<IconProps> = ({ className }) => (
    <Share2 className={className} />
);

export const SendIcon: React.FC<IconProps> = ({ className }) => (
    <Send className={className} />
);

export const ThreeDotsIcon: React.FC<IconProps> = ({ className }) => (
    <MoreHorizontal className={className} />
);


// --- Account Page Icons ---
export const AvatarIcon: React.FC<IconProps> = ({ className }) => (
    <CircleUser className={className} />
);

export const WalletIcon: React.FC<IconProps> = ({ className }) => (
    <Wallet className={className} />
);

export const ChartUpIcon: React.FC<IconProps> = ({ className }) => (
    <TrendingUp className={className} />
);

export const ChartPieIcon: React.FC<IconProps> = ({ className }) => (
    <PieChart className={className} />
);

export const PencilIcon: React.FC<IconProps> = ({ className }) => (
    <Pencil className={className} />
);

export const BookmarkOutlineIcon: React.FC<IconProps> = ({ className }) => (
    <Bookmark className={className} />
);

export const UsersIcon: React.FC<IconProps> = ({ className }) => (
    <Users className={className} />
);

export const BellIcon: React.FC<IconProps> = ({ className }) => (
    <Bell className={className} />
);

export const QuestionIcon: React.FC<IconProps> = ({ className }) => (
    <CircleHelp className={className} />
);

export const SupportIcon: React.FC<IconProps> = ({ className }) => (
    <Headset className={className} />
);

export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
    <LogOut className={className} />
);

export const EditIcon: React.FC<IconProps> = PencilIcon;

export const UserPlusIcon: React.FC<IconProps> = ({ className }) => (
    <UserPlus className={className} />
);

export const ShieldIcon: React.FC<IconProps> = ({ className }) => (
    <Shield className={className} />
);

export const FileContractIcon: React.FC<IconProps> = ({ className }) => (
    <FileText className={className} />
);

export const MoneyCheckDollarIcon: React.FC<IconProps> = ({ className }) => (
    <Banknote className={className} />
);


// --- Admin Icons ---
export const GaugeHighIcon: React.FC<IconProps> = ({ className }) => (
    <Gauge className={className} />
);

export const CameraIcon: React.FC<IconProps> = ({ className }) => (
    <Camera className={className} />
);

export const XMarkIcon: React.FC<IconProps> = ({ className }) => (
    <X className={className} />
);

export const BoxOpenIcon: React.FC<IconProps> = ({ className }) => (
    <PackageOpen className={className} />
);

export const ClipboardListIcon: React.FC<IconProps> = ({ className }) => (
    <ClipboardList className={className} />
);

export const UsersGearIcon: React.FC<IconProps> = ({ className }) => (
    <UserCog className={className} />
);

export const MoneyBillTransferIcon: React.FC<IconProps> = ({ className }) => (
    <ArrowRightLeft className={className} />
);

export const PaletteIcon: React.FC<IconProps> = ({ className }) => (
    <Palette className={className} />
);

export const IdCardIcon: React.FC<IconProps> = ({ className }) => (
    <IdCard className={className} />
);

// --- Order Status Icons ---
export const TruckIcon: React.FC<IconProps> = ({ className }) => (
    <Truck className={className} />
);

export const XCircleIcon: React.FC<IconProps> = ({ className }) => (
    <CircleX className={className} />
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <CircleCheck className={className} />
);

export const CheckIcon: React.FC<IconProps> = ({ className }) => (
    <Check className={className} />
);

// --- Theme Icons ---
export const MoonIcon: React.FC<IconProps> = ({ className }) => (
    <Moon className={className} />
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
    <Sun className={className} />
);

export const CubesStackIcon: React.FC<IconProps> = ({ className }) => (
  <Blocks className={className} />
);

export const TicketIcon: React.FC<IconProps> = ({ className }) => (
    <Ticket className={className} strokeWidth={1.5} />
);

export const ImageIcon: React.FC<IconProps> = ({ className }) => (
    <LucideImage className={className} />
);

// --- NEW Icons for Checkout ---
export const MapPinIcon: React.FC<IconProps> = ({ className }) => (
    <MapPin className={className} />
);

export const PhoneIcon: React.FC<IconProps> = ({ className }) => (
    <Phone className={className} />
);

export const NoteIcon: React.FC<IconProps> = ({ className }) => (
    <StickyNote className={className} />
);

export const TagIcon: React.FC<IconProps> = ({ className }) => (
    <Tags className={className} />
);

// NEW: Supplier Icons
export const HandshakeIcon: React.FC<IconProps> = ({ className }) => (
    <Handshake className={className} />
);

export const WarehouseIcon: React.FC<IconProps> = ({ className }) => (
    <Warehouse className={className} />
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className }) => (
    <i className={`fa-brands fa-whatsapp ${className}`} />
);
