import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useProPorcoData } from "@/hooks/useProPorcoData";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { usuario, logout } = useProPorcoData();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="h-16 flex items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-sidebar-foreground" />
        <div>
          <h1 className="font-semibold text-foreground">Pró Porco</h1>
          <p className="text-sm text-muted-foreground">{usuario?.fazenda}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{usuario?.nome}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}