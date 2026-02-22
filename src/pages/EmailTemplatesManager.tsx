import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PermissionGate } from '@/components/PermissionGate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { invokeEdgeFunction } from '@/lib/edge-functions';
import { 
  Mail, 
  Check, 
  Eye, 
  ArrowLeft,
  Sparkles,
  Palette,
  Leaf,
  Moon,
  Square,
  Sunrise
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  html_template: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Mapeamento de ícones - suporta nomes antigos e novos do banco
const templateIcons: Record<string, React.ElementType> = {
  // Nomes antigos (banco externo)
  'Elegante Verde': Leaf,
  'Minimalista Branco': Square,
  'Nature Garden': Sparkles,
  'Dark Professional': Moon,
  'Moderno Flat': Palette,
  // Nomes novos (seed)
  'Clássico Verde': Leaf,
  'Moderno Minimalista': Square,
  'Natureza Vibrante': Sparkles,
  'Elegante Escuro': Moon,
  'Jardim Floral': Palette,
  'Aurora Botânica': Sunrise,
};

// Mapeamento de cores - suporta nomes antigos e novos do banco
const templateColors: Record<string, string> = {
  // Nomes antigos (banco externo)
  'Elegante Verde': 'from-green-700 to-green-900',
  'Minimalista Branco': 'from-gray-200 to-gray-400',
  'Nature Garden': 'from-lime-500 to-green-600',
  'Dark Professional': 'from-gray-800 to-gray-950',
  'Moderno Flat': 'from-amber-500 to-orange-600',
  // Nomes novos (seed)
  'Clássico Verde': 'from-green-700 to-green-900',
  'Moderno Minimalista': 'from-gray-200 to-gray-400',
  'Natureza Vibrante': 'from-lime-500 to-green-600',
  'Elegante Escuro': 'from-gray-800 to-gray-950',
  'Jardim Floral': 'from-amber-500 to-orange-600',
  'Aurora Botânica': 'from-indigo-500 via-teal-500 to-green-500',
};

// Templates com tema escuro (para escolher logo correto)
const darkThemeTemplates = [
  'Dark Professional', 'Elegante Escuro',
  'Nature Garden', 'Natureza Vibrante',
  'Aurora Botânica'
];

// Templates com texto claro (para ajuste de contraste)
const lightTextTemplates = [
  'Minimalista Branco', 'Moderno Minimalista'
];

function EmailTemplatesManagerContent() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [socialSettings, setSocialSettings] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetchTemplates();
    fetchSocialSettings();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await invokeEdgeFunction<{
        success: boolean;
        templates: EmailTemplate[];
        socialSettings: Record<string, unknown>;
        error?: string;
      }>('get-email-templates', {});

      if (error) throw error;
      
      if (data && data.success) {
        setTemplates(data.templates || []);
        setSocialSettings(data.socialSettings || {});
      } else {
        throw new Error(data?.error || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  // Social settings are now fetched together with templates
  const fetchSocialSettings = async () => {
    // No-op - social settings are fetched in fetchTemplates
  };

  const setAsDefault = async (templateId: string) => {
    setUpdatingId(templateId);
    try {
      const { data, error } = await invokeEdgeFunction<{
        success: boolean;
        error?: string;
      }>('update-email-template', { templateId });

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to set default template');
      }

      toast.success('Template definido como padrão!');
      await fetchTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
      toast.error('Erro ao definir template padrão');
    } finally {
      setUpdatingId(null);
    }
  };

  // Generate dynamic social icons based on admin settings using local SVGs
  const generateDynamicSocialIcons = () => {
    const platforms = ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'pinterest', 'tiktok'];
    // Usar ícones locais para evitar bloqueio de CDN em emails
    const iconUrls: Record<string, string> = {
      facebook: 'https://homegardenmanual.lovable.app/images/social/facebook.svg',
      instagram: 'https://homegardenmanual.lovable.app/images/social/instagram.svg',
      twitter: 'https://homegardenmanual.lovable.app/images/social/twitter.svg',
      youtube: 'https://homegardenmanual.lovable.app/images/social/youtube.svg',
      linkedin: 'https://homegardenmanual.lovable.app/images/social/linkedin.svg',
      pinterest: 'https://homegardenmanual.lovable.app/images/social/pinterest.svg',
      tiktok: 'https://homegardenmanual.lovable.app/images/social/tiktok.svg',
    };
    const altNames: Record<string, string> = {
      facebook: 'Facebook', instagram: 'Instagram', twitter: 'X',
      youtube: 'YouTube', linkedin: 'LinkedIn', pinterest: 'Pinterest', tiktok: 'TikTok',
    };

    const enabledPlatforms = platforms.filter(p => socialSettings[`${p}_enabled`] === true);

    if (enabledPlatforms.length === 0) {
      return '<!-- Nenhuma rede social habilitada -->';
    }

    return enabledPlatforms
      .map(platform => {
        const url = socialSettings[platform] as string;
        const hasUrl = url && url.trim() !== '';
        const iconStyle = `display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.15); margin: 0 6px; text-decoration: none;`;
        
        if (hasUrl) {
          return `<a href="${url}" style="${iconStyle}"><img src="${iconUrls[platform]}" alt="${altNames[platform]}" width="20" height="20" style="display: block;" /></a>`;
        } else {
          return `<span style="${iconStyle} opacity: 0.6;"><img src="${iconUrls[platform]}" alt="${altNames[platform]}" width="20" height="20" style="display: block;" /></span>`;
        }
      })
      .join('');
  };

  const getPreviewHtml = (template: EmailTemplate) => {
    const isDarkTheme = darkThemeTemplates.includes(template.name);
    const logoUrl = isDarkTheme 
      ? 'https://homegardenmanual.lovable.app/images/logo-email-dark.png'
      : 'https://homegardenmanual.lovable.app/images/logo-email-light.png';
    
    const sampleData = {
      name: 'Maria Silva',
      content: '<p>Muito obrigado por entrar em contato conosco!</p><p>Recebemos sua mensagem e nossa equipe está analisando sua solicitação. Em breve retornaremos com mais informações.</p><p>Continue explorando nosso site para mais dicas de jardinagem!</p><p>Atenciosamente,<br>Equipe Home Garden Manual</p>',
      original_message: 'Olá, gostaria de saber mais sobre como cuidar de plantas suculentas em apartamentos com pouca luz natural. Vocês podem me ajudar?',
      year: new Date().getFullYear().toString(),
    };

    const socialHtml = generateDynamicSocialIcons();
    
    return template.html_template
      .replace(/\{\{logo_url\}\}/g, logoUrl)
      .replace(/\{\{site_name\}\}/g, 'Home Garden Manual')
      .replace(/\{\{name\}\}/g, sampleData.name)
      .replace(/\{\{user_name\}\}/g, sampleData.name) // Suportar ambos placeholders
      .replace(/\{\{content\}\}/g, sampleData.content)
      .replace(/\{\{original_message\}\}/g, sampleData.original_message)
      .replace(/\{\{year\}\}/g, sampleData.year)
      .replace(/\{\{email\}\}/g, 'exemplo@email.com')
      .replace(/\{\{unsubscribe_url\}\}/g, 'https://homegardenmanual.lovable.app/unsubscribe?email=exemplo@email.com')
      .replace(/\{\{social_icons\}\}/g, socialHtml);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/settings')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Templates de E-mail
              </h1>
              <p className="text-muted-foreground">
                Escolha o template padrão para respostas de contato
              </p>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const IconComponent = templateIcons[template.name] || Mail;
              const gradientClass = templateColors[template.name] || 'from-primary to-primary/80';
              const isUpdating = updatingId === template.id;

              return (
                <Card 
                  key={template.id} 
                  className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    template.is_default ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                >
                  {/* Mini HTML Preview */}
                  <div className="h-40 relative overflow-hidden bg-gray-100">
                    <iframe
                      srcDoc={getPreviewHtml(template)}
                      className="w-[600px] h-[800px] transform scale-[0.22] origin-top-left pointer-events-none"
                      title={`Preview ${template.name}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    {/* Badge overlay */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className={`${gradientClass} bg-gradient-to-r text-white border-0 shadow-md`}>
                        <IconComponent className="h-3 w-3 mr-1" />
                        {template.name}
                      </Badge>
                      {template.is_default && (
                        <Badge className="bg-primary text-primary-foreground border-0 shadow-md">
                          <Check className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Card Header with name */}
                  <div className={`h-12 bg-gradient-to-br ${gradientClass} px-4 flex items-center`}>
                    <div className={lightTextTemplates.includes(template.name) ? 'text-gray-800' : 'text-white'}>
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      {!template.is_default && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => setAsDefault(template.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Usar Este
                            </>
                          )}
                        </Button>
                      )}
                      {template.is_default && (
                        <Button
                          size="sm"
                          className="flex-1"
                          variant="secondary"
                          disabled
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Em Uso
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Como funciona?</h4>
                <p className="text-sm text-muted-foreground">
                  O template escolhido será usado automaticamente para todas as respostas de mensagens de contato, 
                  tanto manuais quanto automáticas (IA). A saudação "Olá [Nome]" e a assinatura são gerenciadas 
                  pelo template, garantindo consistência visual em todas as comunicações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Visualização de como o e-mail será exibido para o destinatário
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-100 rounded-lg p-4 min-h-[500px]">
            {previewTemplate && (
              <iframe
                srcDoc={getPreviewHtml(previewTemplate)}
                className="w-full h-full min-h-[500px] bg-white rounded shadow-sm"
                title="Email Preview"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Fechar
            </Button>
            {previewTemplate && !previewTemplate.is_default && (
              <Button 
                onClick={() => {
                  setAsDefault(previewTemplate.id);
                  setPreviewTemplate(null);
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Usar Este Template
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function EmailTemplatesManager() {
  return (
    <PermissionGate permission="can_manage_email_templates">
      <EmailTemplatesManagerContent />
    </PermissionGate>
  );
}
