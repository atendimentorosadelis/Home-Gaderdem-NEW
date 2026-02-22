import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle, XCircle, Loader2, ArrowLeft, MailX } from 'lucide-react';

type UnsubscribeStatus = 'initial' | 'loading' | 'success' | 'error' | 'not-found' | 'already-unsubscribed';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const successFromUrl = searchParams.get('success') === 'true';
  const alreadyFromUrl = searchParams.get('already') === 'true';
  const errorFromUrl = searchParams.get('error');
  
  const [email, setEmail] = useState(emailFromUrl);
  const [status, setStatus] = useState<UnsubscribeStatus>('initial');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle automatic unsubscribe results from edge function redirect
  useEffect(() => {
    if (successFromUrl) {
      setStatus('success');
    } else if (alreadyFromUrl) {
      setStatus('already-unsubscribed');
    } else if (errorFromUrl === 'not-found') {
      setStatus('not-found');
    } else if (errorFromUrl === 'invalid') {
      setErrorMessage('Link de cancelamento inválido ou expirado.');
      setStatus('error');
    } else if (errorFromUrl === 'server') {
      setErrorMessage('Ocorreu um erro no servidor. Tente novamente.');
      setStatus('error');
    } else if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [successFromUrl, alreadyFromUrl, errorFromUrl, emailFromUrl]);

  const handleUnsubscribe = async () => {
    if (!email.trim()) {
      setErrorMessage('Por favor, insira seu e-mail.');
      setStatus('error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor, insira um e-mail válido.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Check if subscriber exists
      const { data: subscriber, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching subscriber:', fetchError);
        setErrorMessage('Ocorreu um erro ao processar sua solicitação.');
        setStatus('error');
        return;
      }

      if (!subscriber) {
        setStatus('not-found');
        return;
      }

      if (!subscriber.is_active) {
        setStatus('already-unsubscribed');
        return;
      }

      // Update subscriber to inactive
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('id', subscriber.id);

      if (updateError) {
        console.error('Error updating subscriber:', updateError);
        setErrorMessage('Não foi possível cancelar sua inscrição. Tente novamente.');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
      setStatus('error');
    }
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MailX className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Cancelar Inscrição</CardTitle>
            <CardDescription>
              Cancele sua inscrição na newsletter do Home Garden Manual
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'initial' || status === 'error' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {status === 'error' && errorMessage && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <XCircle className="h-4 w-4 shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={handleUnsubscribe} 
                    className="w-full"
                    variant="destructive"
                  >
                    Cancelar Inscrição
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Você deixará de receber nossas novidades e dicas sobre jardinagem e decoração.
                  </p>
                </div>
              </>
            ) : status === 'loading' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Processando sua solicitação...</p>
              </div>
            ) : status === 'success' ? (
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Inscrição Cancelada</h3>
                <p className="text-muted-foreground mb-6">
                  Você foi removido da nossa lista de newsletter. Sentiremos sua falta! 🌱
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Mudou de ideia? Você pode se inscrever novamente a qualquer momento no nosso site.
                </p>
                <Link to="/">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao Site
                  </Button>
                </Link>
              </div>
            ) : status === 'not-found' ? (
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">E-mail Não Encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  O e-mail <strong>{email}</strong> não está registrado em nossa newsletter.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStatus('initial')}
                    className="w-full"
                  >
                    Tentar Outro E-mail
                  </Button>
                  <Link to="/" className="block">
                    <Button variant="ghost" className="w-full gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Voltar ao Site
                    </Button>
                  </Link>
                </div>
              </div>
            ) : status === 'already-unsubscribed' ? (
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Já Cancelado</h3>
                <p className="text-muted-foreground mb-6">
                  O e-mail <strong>{email}</strong> já não recebe nossa newsletter.
                </p>
                <Link to="/">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao Site
                  </Button>
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
