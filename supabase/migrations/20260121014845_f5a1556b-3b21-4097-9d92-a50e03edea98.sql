-- ============================================
-- SISTEMA DE PILOTO AUTOMÁTICO
-- ============================================

-- Tabela de configuração do piloto automático
CREATE TABLE public.auto_generation_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  publish_immediately BOOLEAN NOT NULL DEFAULT false,
  daily_limit INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de agendamentos semanais
CREATE TABLE public.auto_generation_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time_slot TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_of_week, time_slot)
);

-- Tabela de logs de execução
CREATE TABLE public.auto_generation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.content_articles(id) ON DELETE SET NULL,
  topic_used TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error', 'skipped')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_ms INTEGER
);

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE public.auto_generation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_generation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_generation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- auto_generation_config: Apenas admins podem ver e gerenciar
CREATE POLICY "Admins can manage auto generation config"
  ON public.auto_generation_config FOR ALL
  USING (is_current_user_admin());

CREATE POLICY "Service role can manage config"
  ON public.auto_generation_config FOR ALL
  USING (auth.role() = 'service_role');

-- auto_generation_schedules: Apenas admins podem ver e gerenciar
CREATE POLICY "Admins can manage schedules"
  ON public.auto_generation_schedules FOR ALL
  USING (is_current_user_admin());

CREATE POLICY "Service role can manage schedules"
  ON public.auto_generation_schedules FOR ALL
  USING (auth.role() = 'service_role');

-- auto_generation_logs: Apenas admins podem ver, service_role pode inserir
CREATE POLICY "Admins can view logs"
  ON public.auto_generation_logs FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Service role can manage logs"
  ON public.auto_generation_logs FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- TRIGGER PARA ATUALIZAR updated_at
-- ============================================

CREATE TRIGGER update_auto_generation_config_updated_at
  BEFORE UPDATE ON public.auto_generation_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INSERIR CONFIGURAÇÃO INICIAL
-- ============================================

INSERT INTO public.auto_generation_config (enabled, topics, publish_immediately, daily_limit)
VALUES (false, '[]'::jsonb, false, 5);

-- ============================================
-- HABILITAR REALTIME PARA LOGS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.auto_generation_logs;