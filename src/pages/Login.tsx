import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProPorcoData } from "@/hooks/useProPorcoData";
import { PiggyBank, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("admin@prorporco.com");
  const [senha, setSenha] = useState("123456");
  const { usuario, authInitialized, login, loading } = useProPorcoData();
  const { toast } = useToast();

  if (!authInitialized) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>;
  }

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sucesso = await login(email, senha);
    
    if (sucesso) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Pró Porco",
      });
    } else {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-primary bg-white/95 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <PiggyBank className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Pró Porco</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sistema de Gestão Suinícola
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-white border-input text-foreground placeholder:text-muted-foreground h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-foreground font-semibold">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="bg-white border-input text-foreground placeholder:text-muted-foreground h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-semibold h-11 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
            <p className="text-foreground text-sm font-semibold mb-2">Dados de acesso demo:</p>
            <p className="text-muted-foreground text-sm font-medium">Email: admin@prorporco.com</p>
            <p className="text-muted-foreground text-sm font-medium">Senha: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}