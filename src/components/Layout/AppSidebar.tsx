import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  PiggyBank, 
  Home,
  Package,
  Utensils,
  Heart,
  Scale,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    description: "Visão geral da fazenda"
  },
  {
    title: "Suínos",
    url: "/porcos",
    icon: PiggyBank,
    description: "Gestão do rebanho"
  },
  {
    title: "Piquetes",
    url: "/piquetes", 
    icon: Home,
    description: "Controle de instalações"
  },
  {
    title: "Insumos",
    url: "/insumos",
    icon: Package,
    description: "Estoque e materiais"
  },
  {
    title: "Alimentação",
    url: "/alimentacao",
    icon: Utensils,
    description: "Registro de alimentação"
  },
  {
    title: "Sanidade",
    url: "/sanidade",
    icon: Heart,
    description: "Controle sanitário"
  },
  {
    title: "Pesagem",
    url: "/pesagem",
    icon: Scale,
    description: "Controle de peso"
  },
  {
    title: "Vendas",
    url: "/vendas",
    icon: ShoppingCart,
    description: "Gestão de vendas"
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: DollarSign,
    description: "Controle financeiro"
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: FileText,
    description: "Relatórios e análises"
  }
];

export function AppSidebar() {
  const { open } = useSidebar();
  const collapsed = !open;
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-sidebar-primary">Pró Porco</h2>
                <p className="text-xs text-sidebar-foreground/70">Gestão Suinícola</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-4 py-2">
            {!collapsed && "Navegação"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild className="mx-2">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) => getNavCls({ isActive })}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="block truncate">{item.title}</span>
                          {!collapsed && (
                            <span className="block text-xs opacity-70 truncate">
                              {item.description}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings at bottom */}
        <div className="mt-auto border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="mx-2 my-2">
                <NavLink 
                  to="/configuracoes" 
                  className={({ isActive }) => getNavCls({ isActive })}
                  title={collapsed ? "Configurações" : undefined}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Configurações</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}