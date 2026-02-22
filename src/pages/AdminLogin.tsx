import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação deve ter pelo menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkIfAdmin() {
      if (user && !authLoading) {
        const { data } = await supabase.rpc('is_current_user_admin');
        if (data === true) {
          navigate('/admin', { replace: true });
        }
      }
    }
    checkIfAdmin();
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    try {
      if (isSignupMode) {
        signupSchema.parse({ email, password, confirmPassword });
      } else {
        loginSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string; confirmPassword?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
          if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (isSignupMode) {
        const { error } = await signUp(email, password);
        
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Este email já está cadastrado. Faça login.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Conta criada com sucesso! Aguarde a promoção para admin.');
        setIsSignupMode(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Credenciais inválidas. Verifique seu email e senha.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Email não confirmado. Verifique sua caixa de entrada.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        // Check if user is admin after login
        const { data: isAdmin } = await supabase.rpc('is_current_user_admin');
        
        if (isAdmin !== true) {
          await supabase.auth.signOut();
          toast.error('Acesso negado. Apenas administradores podem entrar.');
          return;
        }

        toast.success('Login realizado com sucesso!');
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      toast.error('Erro ao processar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            {isSignupMode ? (
              <UserPlus className="w-8 h-8 text-primary" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {isSignupMode ? 'Criar Conta Admin' : 'Área Administrativa'}
            </CardTitle>
            <CardDescription className="mt-2">
              {isSignupMode 
                ? 'Crie sua conta para solicitar acesso de administrador'
                : 'Acesso restrito a administradores'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {isSignupMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignupMode ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                <>
                  {isSignupMode ? (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Conta
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              className="text-sm"
              onClick={() => {
                setIsSignupMode(!isSignupMode);
                setErrors({});
                setPassword('');
                setConfirmPassword('');
              }}
              disabled={isLoading}
            >
              {isSignupMode 
                ? 'Já tem conta? Faça login'
                : 'Não tem conta? Cadastre-se'
              }
            </Button>
          </div>

          <div className="mt-2 text-center">
            <Button 
              variant="link" 
              className="text-muted-foreground text-sm"
              onClick={() => navigate('/')}
            >
              Voltar para o site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
