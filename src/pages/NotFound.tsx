import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PiggyBank, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <PiggyBank className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Página não encontrada</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            A página que você está procurando não existe ou foi movida para outro local.
          </p>
        </div>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary-hover">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
