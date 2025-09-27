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
      <Card className="w-full max-w-md shadow-primary">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <PiggyBank className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Pró Porco</CardTitle>
          <CardDescription className="text-white/80">
            Sistema de Gestão Suinícola
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-white">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-white text-primary hover:bg-white/90 font-medium"
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
          
          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <p className="text-white/80 text-sm font-medium mb-2">Dados de acesso demo:</p>
            <p className="text-white text-sm">Email: admin@prorporco.com</p>
            <p className="text-white text-sm">Senha: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}