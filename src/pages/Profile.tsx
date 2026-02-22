import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Loader2, ArrowLeft, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PushNotificationSettings } from '@/components/notifications/PushNotificationSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  username: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
    .optional()
    .or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
  confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ username?: string }>({});

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfileId(data.id);
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Erro ao carregar perfil',
          description: 'Não foi possível carregar seus dados.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Allowed image formats
  const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MIN_DIMENSION = 100; // Minimum 100x100 pixels
  const MAX_DIMENSION = 4096; // Maximum 4096x4096 pixels

  const validateImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Não foi possível ler a imagem'));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Reset input to allow selecting the same file again
    e.target.value = '';

    // Validate file format
    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Formatos aceitos: JPEG, PNG, WebP ou GIF.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast({
        title: 'Arquivo muito grande',
        description: `A imagem tem ${sizeMB}MB. O tamanho máximo é 5MB.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate image dimensions
    try {
      const { width, height } = await validateImageDimensions(file);
      
      if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
        toast({
          title: 'Imagem muito pequena',
          description: `A imagem deve ter no mínimo ${MIN_DIMENSION}x${MIN_DIMENSION} pixels. Sua imagem tem ${width}x${height}.`,
          variant: 'destructive',
        });
        return;
      }

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        toast({
          title: 'Imagem muito grande',
          description: `A imagem deve ter no máximo ${MAX_DIMENSION}x${MAX_DIMENSION} pixels. Sua imagem tem ${width}x${height}.`,
          variant: 'destructive',
        });
        return;
      }
    } catch (error) {
      toast({
        title: 'Erro ao ler imagem',
        description: 'Não foi possível processar a imagem. Tente outro arquivo.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrlWithTimestamp })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(avatarUrlWithTimestamp);
      toast({
        title: 'Avatar atualizado!',
        description: 'Sua foto de perfil foi alterada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erro ao enviar avatar',
        description: 'Não foi possível atualizar sua foto.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    const result = profileSchema.safeParse({ username });
    if (!result.success) {
      const fieldErrors: { username?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'username') {
          fieldErrors.username = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() || null })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas informações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const result = passwordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    setPasswordErrors({});
    setIsChangingPassword(true);

    try {
      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setPasswordErrors({ currentPassword: 'Senha atual incorreta' });
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: 'Não foi possível atualizar sua senha.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e segurança
            </p>
          </div>
        </div>

        {/* Personal Info Card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize seu nome e foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Clique para alterar sua foto (máx. 2MB)
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nome</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu nome"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Atualize sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={passwordErrors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={passwordErrors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword ? (
                <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres, com letras maiúsculas, minúsculas e números
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={passwordErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleChangePassword} 
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                variant="secondary"
                className="gap-2"
              >
                {isChangingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications Settings */}
        <PushNotificationSettings />
      </div>
    </DashboardLayout>
  );
}
