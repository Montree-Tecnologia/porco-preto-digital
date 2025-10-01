import { useState } from "react";
import { useProPorcoData } from "@/hooks/useProPorcoData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { User, Building2, Bell, Shield, LogOut } from "lucide-react";

export default function Configuracoes() {
  const { usuario, logout } = useProPorcoData();
  
  // Estados para formulários
  const [nomeUsuario, setNomeUsuario] = useState(usuario?.nome || "");
  const [emailUsuario, setEmailUsuario] = useState(usuario?.email || "");
  const [nomeFazenda, setNomeFazenda] = useState(usuario?.fazenda || "");
  const [enderecoFazenda, setEnderecoFazenda] = useState("");
  
  // Estados para preferências
  const [notificacaoEmail, setNotificacaoEmail] = useState(true);
  const [notificacaoSistema, setNotificacaoSistema] = useState(true);
  const [alertaPeso, setAlertaPeso] = useState(true);
  const [alertaSanidade, setAlertaSanidade] = useState(true);

  const handleSalvarPerfil = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleSalvarFazenda = () => {
    toast({
      title: "Dados da fazenda atualizados",
      description: "As informações da fazenda foram salvas com sucesso.",
    });
  };

  const handleSalvarPreferencias = () => {
    toast({
      title: "Preferências salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Sessão encerrada",
      description: "Você foi desconectado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="perfil">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="fazenda">
            <Building2 className="w-4 h-4 mr-2" />
            Fazenda
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailUsuario}
                  onChange={(e) => setEmailUsuario(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <Separator />
              <Button onClick={handleSalvarPerfil}>Salvar alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fazenda">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Fazenda</CardTitle>
              <CardDescription>
                Configure as informações da sua propriedade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeFazenda">Nome da fazenda</Label>
                <Input
                  id="nomeFazenda"
                  value={nomeFazenda}
                  onChange={(e) => setNomeFazenda(e.target.value)}
                  placeholder="Nome da propriedade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={enderecoFazenda}
                  onChange={(e) => setEnderecoFazenda(e.target.value)}
                  placeholder="Endereço completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  placeholder="Estado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área total (hectares)</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="Área em hectares"
                />
              </div>
              <Separator />
              <Button onClick={handleSalvarFazenda}>Salvar alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Configure como você deseja receber alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por e-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={notificacaoEmail}
                  onCheckedChange={setNotificacaoEmail}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações do sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas na plataforma
                  </p>
                </div>
                <Switch
                  checked={notificacaoSistema}
                  onCheckedChange={setNotificacaoSistema}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de peso</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando animais atingirem peso ideal
                  </p>
                </div>
                <Switch
                  checked={alertaPeso}
                  onCheckedChange={setAlertaPeso}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de sanidade</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre vacinas e tratamentos pendentes
                  </p>
                </div>
                <Switch
                  checked={alertaSanidade}
                  onCheckedChange={setAlertaSanidade}
                />
              </div>
              <Separator />
              <Button onClick={handleSalvarPreferencias}>Salvar preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha atual</Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <Separator />
                <Button>Alterar senha</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessão</CardTitle>
                <CardDescription>
                  Gerencie sua sessão no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
