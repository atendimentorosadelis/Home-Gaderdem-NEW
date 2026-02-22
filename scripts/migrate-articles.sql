-- ================================================================
-- SCRIPT DE MIGRAÇÃO DE ARTIGOS E DADOS
-- Para: Home Garden Manual
-- De: gcdwdjacrxmdsciwqtlc (Lovable Cloud)
-- Para: lhtetfcujdzulfyekiub (Novo Supabase)
-- 
-- INSTRUÇÕES:
-- 1. Execute database-schema-export.sql PRIMEIRO
-- 2. Execute migrate-all-data.sql SEGUNDO
-- 3. Execute ESTE script POR ÚLTIMO
--
-- IMPORTANTE: Todas as URLs foram atualizadas automaticamente!
-- ================================================================

-- ================================================================
-- PROFILES (usuários)
-- NOTA: Você precisa criar os usuários no Auth do novo Supabase
-- e então atualizar os user_id abaixo com os novos UUIDs
-- ================================================================

INSERT INTO public.profiles (id, user_id, email, username, avatar_url, created_at, updated_at)
VALUES
  ('0713272b-8b68-41dd-8ff0-ad6fdec1b406', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'wallistonluiz@gmail.com', 'Walliston', 
   'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/avatars/98213c01-0dae-4c0b-8ebe-f6351c5f54f1/avatar.png', 
   '2026-01-19 21:30:58.026079+00', '2026-01-20 14:56:09.641376+00'),
  ('4470531e-b723-4153-a2e1-208fd53f7f7c', '68aa7f45-d05b-4961-94ab-b14857a7406f', 'zetsubo.bh@gmail.com', 'Keven', 
   'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/avatars/68aa7f45-d05b-4961-94ab-b14857a7406f/avatar.webp', 
   '2026-01-20 04:14:14.978325+00', '2026-01-20 13:48:33.726468+00'),
  ('69ee9454-3518-43a2-8c6b-9b1f8d9feb20', 'ae1cd1bd-03c5-4cd7-ade6-4eae573b672f', 'rafaeldepereiradantas2026@outlook.com', 'Alan Garcia', 
   NULL, '2026-01-20 14:33:12.824386+00', '2026-01-20 16:10:51.425041+00'),
  ('ad27a845-6163-413f-8db1-faf6ca9795bb', 'c972186d-078d-410f-95e7-bea767bda052', 'antonioalan1985@hotmail.com', 'Alan', 
   NULL, '2026-01-21 03:33:30.593313+00', '2026-01-21 03:41:45.096181+00')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- USER ROLES
-- ================================================================

INSERT INTO public.user_roles (id, user_id, role, created_at)
VALUES
  ('9f46835b-8135-4f13-b04b-71343853a374', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'admin', '2026-01-19 21:30:58.026079+00'),
  ('ddbabe0b-3155-4e7c-b4ae-a3cd8fd02dbf', '68aa7f45-d05b-4961-94ab-b14857a7406f', 'admin', '2026-01-20 04:14:16.766404+00'),
  ('87955be7-9913-4671-ad0a-238b9acb3ab1', 'ae1cd1bd-03c5-4cd7-ade6-4eae573b672f', 'user', '2026-01-20 14:33:12.824386+00'),
  ('65b6faab-55cb-4fe8-b6e2-976fbe77db56', 'ae1cd1bd-03c5-4cd7-ade6-4eae573b672f', 'admin', '2026-01-20 14:33:13.943449+00'),
  ('267a8868-3816-4d03-915f-68b4b695f135', 'c972186d-078d-410f-95e7-bea767bda052', 'user', '2026-01-21 03:33:30.593313+00'),
  ('04c420fd-f2b2-4d42-963a-2fea2e086bbc', 'c972186d-078d-410f-95e7-bea767bda052', 'admin', '2026-01-21 03:33:32.129051+00')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- ARTIGOS (content_articles)
-- Todas as URLs atualizadas para o novo Supabase!
-- ================================================================

-- Artigo 1: Dicas de Design Interno para Sala
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, affiliate_banner_image, affiliate_banner_image_mobile, affiliate_banner_url, gallery_images, external_links)
VALUES (
  '5ee4d034-e756-4cf2-938a-16ab80901fed',
  '0713272b-8b68-41dd-8ff0-ad6fdec1b406',
  'Dicas de Design Interno para Sala: Transforme Seu Espaço',
  'dicas-de-design-interno-para-sala-transforme-seu-espaco',
  'Decoração',
  'decoracao',
  'Transforme sua sala em um espaço acolhedor e estiloso com dicas práticas de design interno que unem conforto e funcionalidade.',
  E'## Introdução\n\nA sala de estar é o coração da casa, um espaço onde a família se reúne, amigos são recebidos e momentos preciosos são vividos. Transformar este ambiente em um local confortável e esteticamente agradável pode parecer um desafio, mas com algumas dicas práticas de design interno, é possível criar uma sala que seja tanto funcional quanto bonita.\n\nNeste artigo, exploraremos diversas dicas e truques para otimizar o design interno da sua sala, abordando desde a escolha das cores até a disposição dos móveis.\n\n## Escolha das Cores\n\nA paleta de cores escolhida para a sua sala pode influenciar diretamente na sensação de espaço e conforto. Aqui estão algumas dicas para a seleção de cores:\n\n1. **Opte por Tons Neutros**: Cores neutras, como bege, cinza e tons pastéis, são sempre escolhas seguras. Elas criam um ambiente sereno e podem facilmente ser combinadas com outras cores mais vibrantes em acessórios e detalhes.\n\n2. **Use Cores para Destacar**: Adicione toques de cor através de almofadas, tapetes ou obras de arte. Isso permite que você mude a aparência da sala sem grandes reformas.\n\n3. **Considere a Iluminação**: A luz natural pode alterar a aparência das cores. Teste diferentes amostras de tinta em várias paredes para observar como elas ficam ao longo do dia.\n\n### Exemplos de Combinações\n\nPara um visual moderno, combine cinza claro com detalhes em amarelo mostarda. Se preferir algo mais clássico, tons de marrom com azul marinho podem criar uma atmosfera sofisticada.\n\n## Mobiliário e Disposição\n\nA escolha dos móveis e sua disposição são cruciais para o conforto e funcionalidade da sala.\n\n- **Escolha Móveis Proporcionais**: Em uma sala pequena, móveis grandes podem fazer o espaço parecer ainda menor. Opte por peças proporcionais ao espaço disponível.\n- **Priorize o Conforto**: Sofás e poltronas devem ser confortáveis, já que são os itens mais usados na sala. Teste-os antes de comprar.\n- **Crie Pontos Focais**: Um ponto focal pode ser uma lareira, uma TV ou uma obra de arte. Organize os móveis de modo que eles direcionem a atenção para esse ponto.\n\n### Dicas Práticas\n\n1. **Use Tapetes para Delimitar Espaços**: Tapetes podem ajudar a definir áreas em uma sala, especialmente em layouts abertos.\n2. **Aposte em Prateleiras**: Prateleiras bem decoradas podem adicionar personalidade e são ótimas para guardar livros e objetos decorativos.\n\n## Iluminação Adequada\n\nA iluminação pode transformar o ambiente. Aqui estão algumas dicas para acertar na iluminação:\n\n- **Variedade de Fontes de Luz**: Use uma combinação de iluminação direta e indireta. Luminárias de chão, abajures e luzes embutidas podem criar diferentes atmosferas.\n- **Luzes Dimerizáveis**: Instalar dimmers permite ajustar a intensidade da luz conforme a necessidade, criando um ambiente mais acolhedor.\n\n### Exemplos Reais\n\nUma luminária pendente sobre a mesa de centro pode servir como um ponto de destaque e criar um cenário intimista. Para mais dicas, confira este artigo sobre [iluminação no design de interiores](https://www.archdaily.com/catalog/us/products/17537/lighting-design-archdaily).\n\n## Decoração e Acessórios\n\nOs detalhes fazem toda a diferença no design interno. Veja como escolher os acessórios certos:\n\n- **Obras de Arte**: Podem ser usadas para adicionar cor e interesse visual. Escolha peças que reflitam seu estilo pessoal.\n- **Plantas**: Além de purificarem o ar, as plantas trazem vida e frescor ao ambiente. Opte por espécies como samambaias e suculentas, que são fáceis de cuidar.\n\n### Dicas de Estilo\n\n1. **Mix de Texturas**: Combine diferentes materiais como madeira, metal e tecidos para adicionar profundidade ao design.\n2. **Equilíbrio Visual**: Mantenha a harmonia na disposição dos acessórios, evitando o excesso de objetos.\n\n## Conclusão\n\nTransformar sua sala em um ambiente acolhedor e estiloso não precisa ser complicado. Com as dicas certas de design interno, você pode renovar seu espaço, tornando-o não apenas mais bonito, mas também mais funcional.\n\nPronto para começar? Pegue um caderno, faça uma lista das mudanças que gostaria de implementar e mãos à obra! Se precisar de mais inspiração, confira este [blog de design de interiores](https://www.houzz.com/ideabooks).\n\nEsperamos que estas dicas tenham sido úteis e inspiradoras. Compartilhe suas ideias e resultados conosco nos comentários!',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/cover-1768936084761-jt1wg3.webp',
  'design interno, sala de estar, decoração, dicas de decoração, mobiliário',
  ARRAY['design de interiores', 'sala de estar', 'decoração', 'dicas', 'cores', 'iluminação'],
  '4 min',
  'published',
  '2026-01-19 22:06:21.831+00',
  '2026-01-19 22:06:35.123765+00',
  '2026-01-20 05:05:05.705061+00',
  1,
  0,
  false,
  NULL,
  NULL,
  NULL,
  '[]'::jsonb,
  '[{"text": "Iluminação no Design de Interiores", "url": "https://www.archdaily.com/catalog/us/products/17537/lighting-design-archdaily"}, {"text": "Blog de Design de Interiores", "url": "https://www.houzz.com/ideabooks"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 2: Dicas Essenciais de Design de Interiores para Salas de Jantar
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, gallery_images, external_links)
VALUES (
  'fd2f272b-b912-4e27-ba89-466688ad3c47',
  '0713272b-8b68-41dd-8ff0-ad6fdec1b406',
  'Dicas Essenciais de Design de Interiores para Salas de Jantar Perfeitas',
  'dicas-essenciais-de-design-de-interiores-para-salas-de-jantar-perfeitas',
  'Decoração',
  'decoracao',
  'Transforme sua sala de jantar em um espaço perfeito com dicas de design que unem estilo, conforto e funcionalidade para momentos especiais.',
  E'## Introdução\n\nA sala de jantar é mais do que apenas um espaço para fazer refeições; é um local de encontro, onde amigos e familiares se reúnem para compartilhar momentos especiais. Com o design certo, você pode transformar sua sala de jantar em um espaço convidativo e funcional. Neste artigo, vamos explorar dicas práticas e inspiradoras para criar a sala de jantar perfeita.\n\n## Planejamento do Espaço\n\nAntes de comprar móveis ou escolher uma paleta de cores, é crucial planejar o espaço da sua sala de jantar. Considere o tamanho do ambiente e como ele se conecta com o restante da casa.\n\n### Avaliação do Espaço\n\n1. **Medição**: Meça o espaço disponível para evitar a compra de móveis que não cabem adequadamente.\n2. **Fluxo de Tráfego**: Certifique-se de que há espaço suficiente para circulação ao redor da mesa de jantar.\n\n### Escolha dos Móveis\n\nA escolha dos móveis é fundamental para o design de uma sala de jantar prática e estilosa.\n\n- **Mesa de Jantar**: Opte por uma mesa que se adapta ao espaço e ao número de pessoas que você costuma receber. Mesas extensíveis são uma ótima opção para maximizar a funcionalidade.\n- **Cadeiras**: Conforto é essencial. Escolha cadeiras que complementem o estilo da mesa e ofereçam conforto para refeições prolongadas.\n\n## Paleta de Cores\n\nAs cores podem definir o tom de qualquer ambiente. Para a sala de jantar, a escolha da paleta de cores deve criar um ambiente acolhedor e convidativo.\n\n### Dicas de Cores\n\n- **Neutros**: Tons neutros como bege, cinza e off-white são clássicos e versáteis.\n- **Cores Vibrantes**: Use cores vibrantes em detalhes, como almofadas ou obras de arte, para adicionar personalidade.\n\n## Iluminação Adequada\n\nA iluminação é um dos elementos mais importantes no design de uma sala de jantar. Ela deve ser funcional, além de criar a atmosfera desejada.\n\n1. **Lustres**: Um lustre sobre a mesa de jantar pode ser a peça central do design. Escolha um que complemente seu estilo.\n2. **Luz Regulável**: Instale dimmers para ajustar a intensidade da luz de acordo com a ocasião.\n\n## Decoração e Acessórios\n\nDecorar sua sala de jantar com acessórios adequados pode fazer uma grande diferença.\n\n### Elementos Decorativos\n\n- **Obras de Arte**: Uma grande pintura ou galeria de quadros pode ser o ponto focal da sala.\n- **Espelhos**: Espelhos podem ampliar visualmente o espaço e aumentar a luminosidade.\n\n## Exemplos Reais e Inspirações\n\nPara inspiração, confira alguns exemplos de designs de salas de jantar bem-sucedidos:\n\n- **Estilo Escandinavo**: Conhecido por sua simplicidade e funcionalidade, o estilo escandinavo usa cores claras e materiais naturais. [Veja mais aqui](https://www.houzz.com/photos/scandinavian-dining-room-ideas-phbr1-bp~t_722~s_22848).\n- **Estilo Industrial**: Mesas de madeira maciça e luminárias de metal fazem parte do charme deste estilo. [Confira exemplos](https://www.decoist.com/industrial-dining-room/).\n\n## Conclusão\n\nCriar a sala de jantar perfeita requer planejamento e atenção aos detalhes. Ao considerar o espaço, a escolha dos móveis, as cores e a iluminação, você pode transformar seu ambiente em um local acolhedor e elegante. Comece hoje mesmo a planejar sua sala de jantar dos sonhos e compartilhe suas ideias e transformações conosco!\n\nPara mais dicas sobre design de interiores, visite [Architectural Digest](https://www.architecturaldigest.com/).\n\nDeixe seu comentário abaixo sobre quais dicas você mais gostou e compartilhe suas fotos de antes e depois da sua sala de jantar.',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/dicas-essenciais-de-design-de-interiores-para-salas-de-jantar-perfeitas/cover-1768876469522-ed5hh8.png',
  'design de interiores, sala de jantar, decoração, estilo, funcionalidade',
  ARRAY['design de interiores', 'sala de jantar', 'decoração', 'estilo', 'funcionalidade', 'iluminação'],
  '3 min',
  'published',
  '2026-01-19 23:09:20.387+00',
  '2026-01-19 23:09:32.930576+00',
  '2026-01-21 01:33:35.913892+00',
  3,
  0,
  false,
  '["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/dicas-essenciais-de-design-de-interiores-para-salas-de-jantar-perfeitas/cover-1768876024669-4d7qzv.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/dicas-essenciais-de-design-de-interiores-para-salas-de-jantar-perfeitas/cover-1768876346556-8ehtp1.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/dicas-essenciais-de-design-de-interiores-para-salas-de-jantar-perfeitas/cover-1768876378016-aulbku.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/dicas-essenciais-de-design-de-interiores-para-salas-de-jantar-perfeitas/cover-1768876448493-9huutp.png"]'::jsonb,
  '[{"text": "Veja mais aqui", "url": "https://www.houzz.com/photos/scandinavian-dining-room-ideas-phbr1-bp~t_722~s_22848"}, {"text": "Confira exemplos", "url": "https://www.decoist.com/industrial-dining-room/"}, {"text": "Architectural Digest", "url": "https://www.architecturaldigest.com/"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 3: Dicas Essenciais de Arquitetura em Estilo Colonial
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, gallery_images, external_links)
VALUES (
  '0b8110bd-d52c-4433-95a0-b0f937070265',
  '0713272b-8b68-41dd-8ff0-ad6fdec1b406',
  'Dicas Essenciais de Arquitetura em Estilo Colonial',
  'dicas-essenciais-de-arquitetura-em-estilo-colonial',
  'Decoração',
  'decoracao',
  'Inspire-se com dicas práticas para incorporar o charme do estilo colonial na sua casa e criar um ambiente sofisticado e histórico.',
  E'## Introdução\n\nA arquitetura em estilo colonial é um encantador lembrete das eras passadas, caracterizada por suas linhas elegantes e detalhes ornamentais. Este estilo, que remonta ao período colonial, é conhecido pela sua simetria, telhados de duas águas e o uso generoso de materiais naturais. Incorporar o estilo colonial na decoração da sua casa pode trazer uma sensação de história e sofisticação ao espaço.\n\n## Características do Estilo Colonial\n\nO estilo colonial é bastante versátil e pode ser visto em várias formas ao redor do mundo, dependendo da influência cultural de cada região. No entanto, algumas características são comuns:\n\n1. **Simetria:** As casas coloniais são frequentemente simétricas com janelas dispostas uniformemente.\n2. **Materiais Naturais:** O uso de madeira, pedra e tijolos é predominante.\n3. **Telhados de Duas Águas:** Este tipo de telhado é típico, permitindo um sótão ou loft.\n4. **Portas e Janelas com Molduras Detalhadas:** As portas são geralmente centrais com molduras ornamentadas, e as janelas têm venezianas funcionais.\n\n### Exemplos Reais\n\nUm exemplo clássico de arquitetura colonial pode ser visto em Williamsburg, Virgínia, onde as casas preservam a autenticidade do século XVIII. Outro exemplo é a arquitetura colonial espanhola em Porto Rico, que apresenta varandas elaboradas e pátios internos.\n\n## Dicas para Incorporar o Estilo Colonial\n\n### 1. **Escolha de Materiais**\n\nOptar por materiais naturais é essencial. Utilize madeira para pisos e móveis, pedra para lareiras e tijolos aparentes para um autêntico toque colonial.\n\n### 2. **Cores e Texturas**\n\nAs cores neutras são predominantes no estilo colonial. Tons de branco, bege, e cinza claro, combinados com texturas de madeira, criam um ambiente acolhedor e elegante.\n\n### 3. **Mobiliário Adequado**\n\nEscolha móveis de madeira maciça com acabamentos clássicos. Peças como aparadores, mesas de jantar robustas e cadeiras com encostos altos são ideais.\n\n### 4. **Elementos Decorativos**\n\nIncorpore elementos decorativos como molduras, rodapés largos e cornijas. Lustres de ferro ou bronze e espelhos com molduras elaboradas complementam o visual.\n\n### 5. **Iluminação**\n\nA iluminação deve ser suave e difusa. Utilize luminárias de teto com design clássico e abajures com bases de cerâmica ou metal.\n\n## Projetos DIY para um Toque Colonial\n\n### 1. **Pintura Envelhecida em Móveis**\n\nTransforme móveis antigos com técnicas de pintura envelhecida para dar a eles um aspecto colonial.\n\n### 2. **Instalação de Molduras Decorativas**\n\nAdicione molduras a portas e janelas para criar uma sensação de profundidade e detalhe arquitetônico.\n\n## Conclusão\n\nAdotar o estilo colonial em sua casa pode ser um projeto gratificante, trazendo elegância e um charme atemporal. Esperamos que estas dicas inspirem você a recriar esse estilo clássico em seu próprio espaço.\n\nPara mais informações sobre como implementar o estilo colonial, confira [Este Guia de Decoração Colonial](https://www.architecturaldigest.com).\n\nSe você deseja explorar mais sobre os materiais usados no design colonial, visite [Este Artigo sobre Materiais Coloniais](https://www.housebeautiful.com).',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/cover-1768869294230-mok1ux.png',
  'arquitetura colonial, estilo colonial, design de interiores, decoração clássica, casa colonial',
  ARRAY['arquitetura colonial', 'decoração clássica', 'estilo colonial', 'design de interiores', 'elementos arquitetônicos'],
  '3 min',
  'published',
  '2026-01-20 00:36:07.035+00',
  '2026-01-20 00:36:19.329291+00',
  '2026-01-20 20:37:20.141063+00',
  2,
  0,
  false,
  '["https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768869298721-h4ud1p.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768869302789-n73p5z.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768869306053-ukojv6.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768869317660-8fbqk5.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768869320887-c3020g.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768869324258-rt89wu.png"]'::jsonb,
  '[{"text": "Este Guia de Decoração Colonial", "url": "https://www.architecturaldigest.com"}, {"text": "Este Artigo sobre Materiais Coloniais", "url": "https://www.housebeautiful.com"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 4: Dicas de Design Interno para Lareiras
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, gallery_images, external_links)
VALUES (
  'b0374928-d4f5-4f7f-af45-b437191519fc',
  '0713272b-8b68-41dd-8ff0-ad6fdec1b406',
  'Dicas de Design Interno para Lareiras: Estilo e Conforto',
  'dicas-de-design-interno-para-lareiras-estilo-e-conforto',
  'Decoração',
  'decoracao',
  'Transforme sua lareira em um ponto focal elegante e acolhedor com dicas práticas de design interno que unem estilo e conforto em sua casa.',
  E'## Introdução\n\nA lareira é um elemento de design que pode transformar qualquer ambiente em um espaço acolhedor e convidativo. Mais do que apenas uma fonte de calor, ela pode ser o ponto focal de uma sala, trazendo estilo e funcionalidade. Neste artigo, vamos explorar dicas práticas e criativas para integrar a lareira ao design interno da sua casa, tornando-a um destaque estético e prático.\n\n## Escolha do Estilo\n\nA primeira etapa para decorar uma lareira é escolher um estilo que complemente o restante da decoração da casa. Algumas opções populares incluem:\n\n1. **Moderno**: Linhas limpas, uso de materiais como vidro e metal, e uma paleta de cores neutras.\n2. **Rústico**: Materiais naturais como pedra e madeira, com uma sensação acolhedora e caseira.\n3. **Clássico**: Molduras ornamentadas, cores ricas e acabamentos detalhados.\n4. **Minimalista**: Foco em simplicidade e funcionalidade, com poucos elementos decorativos.\n\n### Exemplos Reais\n\n- Uma lareira moderna pode ser destacada com uma moldura de metal escovado e cercada por paredes de concreto polido para um visual industrial chic.\n- Para um toque rústico, considere usar pedras empilhadas ao redor da lareira e móveis de madeira robusta.\n\n## Integração com o Ambiente\n\nPara que a lareira se integre harmoniosamente ao ambiente, considere os seguintes aspectos:\n\n- **Paleta de Cores**: Harmonize as cores da lareira com as das paredes e móveis.\n- **Materiais**: Use materiais que se repetem em outros elementos da sala, como madeira ou mármore.\n\n### Dicas Práticas\n\n1. Adicione prateleiras ao redor da lareira para exibir livros ou esculturas.\n2. Use tapetes para definir a área ao redor da lareira e adicionar textura.\n3. Incorpore plantas em vasos elegantes para um toque de natureza.\n\n## Iluminação\n\nA iluminação é crucial para destacar a lareira e criar uma atmosfera acolhedora. Considere estas opções:\n\n- **Iluminação Direcional**: Focos de luz direcionados para a lareira podem realçar suas características.\n- **Iluminação Indireta**: Luzes embutidas no teto ou arandelas nas paredes criam um brilho suave.\n- **Velas**: Adicione um charme extra com velas em diferentes alturas ao redor da lareira.\n\n## Acessórios\n\nOs acessórios certos podem fazer toda a diferença na decoração da lareira. Aqui estão algumas ideias:\n\n- **Espelhos**: Colocar um espelho acima da lareira pode ampliar visualmente o espaço.\n- **Obras de Arte**: Pendure uma pintura ou fotografia que complemente o estilo do ambiente.\n- **Ferramentas para Lareira**: Escolha ferramentas que sejam funcionais e esteticamente agradáveis.\n\n## Conclusão\n\nTransformar sua lareira em um ponto focal estiloso e acolhedor requer atenção ao estilo, integração com o ambiente, iluminação e acessórios. Com estas dicas, você pode criar um espaço que não só aquece, mas também encanta. Comece hoje mesmo a planejar a renovação da sua lareira e transforme o coração da sua casa.\n\n### Chamada para Ação\n\nQuer mais dicas de decoração? Siga nosso blog para ficar por dentro das últimas tendências e truques de design de interiores!',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/dicas-de-design-interno-para-lareiras-estilo-e-conforto/cover-1768871849888-g90bca.png',
  'lareira, design interno, decoração, ambiente acolhedor, ideias para lareira',
  ARRAY['lareira', 'design de interiores', 'decoração', 'ambiente interno', 'estilo'],
  '3 min',
  'published',
  '2026-01-20 01:00:07.042+00',
  '2026-01-20 01:00:19.367285+00',
  '2026-01-20 20:37:16.944735+00',
  3,
  0,
  false,
  '["https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768870742604-xbum8x.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768870745629-gq4f3p.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768870751622-mecv24.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768870755840-2kwxv9.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768870760075-akcgav.png", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768870763554-urrvgt.png"]'::jsonb,
  '[{"text": "Ideias de Design de Lareiras", "url": "https://www.houzz.com/photos/fireplace"}, {"text": "Tendências de Decoração de Interiores", "url": "https://www.architecturaldigest.com/interiors"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 5: Dicas de Design para Piscina e Área Gourmet
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, gallery_images, external_links)
VALUES (
  '2326a1d3-e489-4766-ad45-de460b4f5b71',
  '0713272b-8b68-41dd-8ff0-ad6fdec1b406',
  'Dicas de Design para Piscina e Área Gourmet Integrada',
  'dicas-de-design-para-piscina-e-area-gourmet-integrada',
  'Decoração',
  'decoracao',
  'Transforme sua piscina e área gourmet em um oásis de estilo com dicas práticas que unem beleza, conforto e funcionalidade para seu lar.',
  E'## Introdução\n\nUma piscina bem projetada e uma área gourmet integrada podem transformar completamente a atmosfera de sua casa, oferecendo um espaço perfeito para relaxamento e entretenimento. Com o design certo, esses elementos combinam beleza estética, conforto e funcionalidade. Neste artigo, vamos explorar dicas práticas para criar um design interno excepcional para sua piscina e área gourmet.\n\n## Planejamento do Espaço\n\nAntes de iniciar qualquer projeto de design, é crucial planejar o espaço adequadamente. Considere o tamanho total da área disponível e como deseja que cada seção interaja uma com a outra.\n\n### Dicas de Planejamento\n\n1. **Defina as Zonas de Uso**: Separe áreas para nadar, relaxar e cozinhar. Isso ajuda a maximizar o uso do espaço e a evitar congestionamento.\n2. **Acessibilidade**: Certifique-se de que há caminhos claros e seguros entre a piscina e a área gourmet.\n3. **Privacidade**: Use plantas, cercas ou painéis decorativos para criar um ambiente reservado.\n\n## Escolha de Materiais\n\nOs materiais selecionados para sua piscina e área gourmet devem ser duráveis e resistentes às condições climáticas, enquanto também proporcionam um apelo estético.\n\n### Materiais Recomendados\n\n- **Pisos Antiderrapantes**: Escolha materiais como pedra natural ou porcelanato para evitar acidentes.\n- **Móveis à Prova d''Água**: Opte por móveis de teca, alumínio ou materiais sintéticos que resistam à umidade.\n- **Azulejos de Vidro na Piscina**: Eles adicionam cor e brilho à água, criando um efeito visual deslumbrante.\n\n## Iluminação\n\nA iluminação adequada pode transformar sua piscina e área gourmet em um refúgio mágico ao anoitecer.\n\n### Dicas de Iluminação\n\n1. **Luzes Subaquáticas**: Instale luzes LED dentro da piscina para criar um ambiente acolhedor e seguro.\n2. **Luzes de Cordão**: Use luzes de cordão ao redor da área gourmet para adicionar um toque festivo.\n3. **Iluminação de Paisagismo**: Destaque árvores e plantas com spots de luz para um visual sofisticado.\n\n## Elementos Decorativos\n\nAdicionar elementos decorativos é uma maneira excelente de personalizar o espaço e torná-lo mais acolhedor.\n\n### Idéias de Decoração\n\n- **Arte de Parede à Prova d''Água**: Instale peças de arte ao ar livre para dar um toque pessoal.\n- **Almofadas e Tapetes**: Use tecidos de exterior para adicionar cor e conforto à área de estar.\n- **Jardins Verticais**: Crie um jardim vertical para uma explosão de verde sem ocupar muito espaço.\n\n## Sustentabilidade\n\nIncorporar práticas sustentáveis não só é benéfico para o meio ambiente, mas também pode economizar dinheiro a longo prazo.\n\n### Práticas Sustentáveis\n\n1. **Sistemas de Recolha de Água da Chuva**: Utilize a água da chuva para irrigação de plantas.\n2. **Painéis Solares**: Considere a instalação de painéis solares para aquecer a água da piscina.\n3. **Materiais Reciclados**: Use materiais reciclados para móveis e decoração.\n\n## Exemplos Reais\n\nUm exemplo de design de sucesso é a casa de veraneio do arquiteto John Doe, que utilizou uma combinação de pedra natural e madeira de demolição para criar um espaço harmonioso e sustentável. Você pode ver mais sobre o projeto [aqui](https://www.archdaily.com).\n\n## Conclusão\n\nTransformar sua piscina e área gourmet em um espaço de sonho é possível com planejamento cuidadoso e atenção aos detalhes. Esperamos que estas dicas tenham inspirado você a começar seu projeto. Não hesite em compartilhar suas ideias e experiências na seção de comentários abaixo!\n\nPara mais informações e inspiração, confira este [artigo](https://www.houzz.com) sobre design de exteriores.',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/cover-1768920503043-wp5ejp.webp',
  'piscina, área gourmet, design de interiores, decoração de exteriores, dicas de design',
  ARRAY['piscina', 'área gourmet', 'design de interiores', 'decoração', 'espaço externo'],
  '3 min',
  'published',
  '2026-01-20 14:48:50.229+00',
  '2026-01-20 14:49:01.675756+00',
  '2026-01-21 01:33:26.257228+00',
  2,
  0,
  false,
  '["https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768920506147-00y5lg.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768920509336-41rnds.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768920511755-q5q8hx.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768920514284-f6x6q5.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768920516722-pgu45a.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768920519290-ozd7sa.webp"]'::jsonb,
  '[{"text": "ArchDaily", "url": "https://www.archdaily.com"}, {"text": "Houzz", "url": "https://www.houzz.com"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 6: Transforme seu Banheiro com Dicas de Design Interno
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, gallery_images, external_links)
VALUES (
  '9e36224d-3127-4170-85c0-d4ca08f5769b',
  '0713272b-8b68-41dd-8ff0-ad6fdec1b406',
  'Transforme seu Banheiro com Dicas de Design Interno',
  'transforme-seu-banheiro-com-dicas-de-design-interno',
  'Decoração',
  'decoracao',
  'Transforme seu banheiro com dicas práticas e elegantes de design interno, aumentando a funcionalidade e a estética do seu espaço.',
  E'## Introdução\n\nO banheiro é um dos espaços mais importantes da casa, mas muitas vezes é negligenciado quando se trata de design de interiores. Um banheiro bem projetado não só melhora a estética da sua casa, como também aumenta a funcionalidade e o conforto do espaço. Neste artigo, exploraremos dicas práticas e elegantes para transformar seu banheiro em um ambiente acolhedor e estiloso.\n\n## Planejamento do Espaço\n\nAntes de começar qualquer projeto de renovação, é crucial planejar o espaço disponível. Um bom planejamento pode maximizar a funcionalidade e a estética do banheiro.\n\n### Avaliação das Necessidades\n\n1. **Determine o Uso do Banheiro**: Considere quem vai usar o banheiro e com que frequência. Um banheiro para hóspedes terá necessidades diferentes de um banheiro principal.\n2. **Espaço de Armazenamento**: Avalie se o espaço atual é suficiente para armazenar toalhas, produtos de higiene pessoal e outros itens essenciais.\n\n## Escolha de Materiais\n\nA escolha dos materiais é essencial para garantir durabilidade e estilo. Optar por materiais de alta qualidade pode fazer uma grande diferença no resultado final.\n\n### Materiais Recomendados\n\n- **Porcelanato**: Durável e fácil de limpar, é ideal para pisos e paredes.\n- **Mármore**: Oferece um visual sofisticado, mas requer manutenção regular.\n- **Vidro Temperado**: Ótimo para boxes de chuveiro, proporcionando um visual moderno e arejado.\n\n## Cores e Iluminação\n\nAs cores e a iluminação podem transformar o ambiente, criando uma sensação de espaço e conforto.\n\n### Paleta de Cores\n\n1. **Tons Neutros**: Cores como branco, bege e cinza são clássicas e atemporais.\n2. **Contrastes**: Utilize contrastes, como preto e branco, para um visual moderno e elegante.\n\n### Iluminação Adequada\n\n- **Luz Natural**: Aproveite ao máximo a luz natural, utilizando cortinas leves ou janelas maiores.\n- **Iluminação Artificial**: Instale luzes LED em locais estratégicos, como acima do espelho e no teto.\n\n## Acessórios e Funcionalidade\n\nOs acessórios certos podem adicionar personalidade e funcionalidade ao banheiro.\n\n### Dicas para Escolher Acessórios\n\n1. **Toalhas e Tapetes**: Escolha tecidos de alta qualidade que complementem a paleta de cores.\n2. **Espelhos**: Use espelhos grandes para aumentar a sensação de espaço.\n3. **Plantas**: Adicione plantas que se adaptam bem a ambientes úmidos, como samambaias e lírios da paz.\n\n## Conclusão\n\nTransformar seu banheiro em um espaço elegante e funcional é mais fácil do que parece. Com planejamento cuidadoso e a escolha certa de materiais e acessórios, você pode criar um ambiente que não só atende às suas necessidades diárias, mas também reflete seu estilo pessoal. Não hesite em buscar inspiração e começar a planejar a renovação do seu banheiro hoje mesmo!\n\nPara mais dicas sobre decoração de interiores, confira este [artigo detalhado](https://www.architecturaldigest.com/story/bathroom-design-tips).\n\n## Chamada para Ação\n\nGostou das dicas? Compartilhe suas ideias de design de banheiro nos comentários abaixo e inspire outras pessoas a transformar seus espaços!',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/transforme-seu-banheiro-com-dicas-de-design-interno/cover-1768932566966-ri2bcv.webp',
  'banheiro, design interno, decoração, renovação de banheiro, dicas de design, banheiro moderno',
  ARRAY['banheiro', 'design de interiores', 'renovação', 'decoração', 'estilo', 'elegância', 'funcionalidade'],
  '3 min',
  'published',
  '2026-01-20 18:08:17.025+00',
  '2026-01-20 18:08:28.182368+00',
  '2026-01-21 00:55:29.181079+00',
  3,
  0,
  false,
  '["https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768932476983-kmaqvt.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768932468157-pifhp1.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768932470793-03zsda.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768932472580-rix98d.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768932474607-03jpby.webp"]'::jsonb,
  '[{"text": "Dicas de Design de Interiores", "url": "https://www.architecturaldigest.com/story/bathroom-design-tips"}, {"text": "Materiais de Construção para Banheiros", "url": "https://www.houzz.com/magazine/bathroom-materials-buyers-guide-stsetivw-vs~1078330"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 7: Transforme Seu Espaço com um Jardim Encantador
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, gallery_images, external_links)
VALUES (
  '5b8bf4ac-fb65-473c-8cda-22f0fdc194cb',
  '0713272b-8b68-41dd-8ff0-ad6fdec1b406',
  'Transforme Seu Espaço com um Jardim Encantador',
  'transforme-seu-espaco-com-um-jardim-encantador',
  'Jardim',
  'jardim',
  'Transforme seu espaço ao ar livre em um oásis verde com dicas práticas e inspirações incríveis para criar um jardim encantador em casa.',
  E'## Introdução\n\nCultivar um jardim não é apenas uma maneira de embelezar sua casa, mas também uma excelente forma de se reconectar com a natureza e criar um espaço de paz e tranquilidade. Independente do tamanho do seu espaço, há sempre um tipo de jardim que pode ser adaptado para suas necessidades e desejos. Neste artigo, vamos explorar diversas ideias e dicas práticas para ajudá-lo a transformar seu espaço ao ar livre em um verdadeiro oásis verde.\n\n## Escolhendo o Tipo de Jardim Ideal\n\nAntes de começar a plantar, é importante decidir que tipo de jardim você deseja criar. As opções são muitas, e cada uma delas traz uma estética e um propósito diferentes.\n\n### Jardins Verticais\n\nOs jardins verticais são perfeitos para quem tem pouco espaço, mas ainda quer um toque verde em casa. Eles são fáceis de manter e podem ser instalados tanto em ambientes internos quanto externos.\n\n- **Dica 1:** Escolha plantas que se adaptem bem ao cultivo vertical, como samambaias, heras e suculentas.\n- **Dica 2:** Utilize estruturas modulares que facilitem a irrigação e manutenção.\n\n### Jardins de Ervas\n\nPerfeitos para quem adora cozinhar, os jardins de ervas são práticos e podem ser cultivados em pequenos vasos ou canteiros.\n\n- **Dica 1:** Plante ervas como manjericão, alecrim e hortelã, que crescem bem em ambientes ensolarados.\n- **Dica 2:** Coloque-os perto da cozinha para facilitar o acesso durante o preparo das refeições.\n\n## Planejamento e Design do Jardim\n\nUm planejamento cuidadoso pode fazer toda a diferença na criação de um jardim funcional e bonito.\n\n### Análise do Espaço\n\nAntes de começar, faça uma análise do espaço disponível, considerando fatores como luz solar, tipo de solo e clima.\n\n- **Dica 1:** Mapeie as áreas que recebem mais sol e sombra ao longo do dia.\n- **Dica 2:** Considere o uso de terraços ou níveis para criar interesse visual.\n\n### Escolha de Plantas\n\nA seleção das plantas deve considerar tanto a estética quanto a compatibilidade com o ambiente.\n\n- **Dica 1:** Opte por plantas nativas, que são mais adaptadas ao clima local e requerem menos manutenção.\n- **Dica 2:** Misture plantas perenes e anuais para garantir cor e vida durante o ano todo.\n\n## Manutenção do Jardim\n\nA manutenção regular é essencial para manter o jardim saudável e bonito.\n\n### Rega e Solo\n\nA rega correta e a qualidade do solo são fundamentais para o crescimento das plantas.\n\n- **Dica 1:** Instale um sistema de irrigação automática para garantir uma rega uniforme.\n- **Dica 2:** Adube o solo regularmente com compostos orgânicos para melhorar sua fertilidade.\n\n### Controle de Pragas\n\nManter as pragas sob controle é crucial para a saúde do jardim.\n\n- **Dica 1:** Use soluções naturais, como óleo de neem, para combater insetos sem prejudicar o ambiente.\n- **Dica 2:** Introduza predadores naturais, como joaninhas, que ajudam a controlar pragas de maneira ecológica.\n\n## Exemplos de Jardins Inspiradores\n\nPara ajudá-lo a visualizar o potencial do seu espaço, aqui estão alguns exemplos de jardins que podem servir de inspiração.\n\n1. **Jardim Zen**: Ideal para quem busca um espaço de meditação, com pedras, areia e algumas plantas ornamentais.\n2. **Jardim de Borboletas**: Inclua plantas que atraem borboletas, como lantana e lavanda, para um espetáculo natural.\n3. **Jardim Sustentável**: Use técnicas de permacultura para criar um jardim que respeite o meio ambiente e seja autossuficiente.\n\n## Conclusão\n\nCriar um jardim é uma jornada de criatividade e paciência, mas os resultados podem ser extremamente gratificantes. Ao planejar cuidadosamente e dedicar um tempo para a manutenção, você pode transformar qualquer espaço em um paraíso verde. Agora é a hora de colocar as mãos na terra e começar seu projeto de jardim dos sonhos. Para mais inspirações e dicas, confira este [blog de jardinagem](https://www.jardineiro.net) e comece sua jornada verde hoje mesmo!\n\n## Recursos Adicionais\n\n- [Como fazer um jardim vertical](https://www.minhacasaminhacara.com.br/como-fazer-jardim-vertical/)\n- [Dicas de paisagismo sustentável](https://casa.abril.com.br/jardins/10-dicas-de-paisagismo-sustentavel/)',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/cover-1768940048119-19dxli.webp',
  'jardim, paisagismo, decoração de jardim, plantas, dicas de jardinagem',
  ARRAY['jardim', 'paisagismo', 'plantas', 'decoração', 'DIY', 'natureza', 'sustentabilidade'],
  '4 min',
  'published',
  '2026-01-20 20:14:42.416+00',
  '2026-01-20 20:14:53.346298+00',
  '2026-01-21 01:33:04.606142+00',
  2,
  0,
  false,
  '["https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768940051585-ricqgs.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768940054513-p9vz85.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768940057504-55rv1j.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768940060117-ad0b1y.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768940063513-tyscvt.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768940068724-0rtbpz.webp"]'::jsonb,
  '[{"text": "Como fazer um jardim vertical", "url": "https://www.minhacasaminhacara.com.br/como-fazer-jardim-vertical/"}, {"text": "Dicas de paisagismo sustentável", "url": "https://casa.abril.com.br/jardins/10-dicas-de-paisagismo-sustentavel/"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 8: Cuidados Essenciais para um Jardim Saudável e Vibrante
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, affiliate_banner_image, affiliate_banner_image_mobile, affiliate_banner_url, gallery_images, external_links)
VALUES (
  '1d21c736-888e-4201-a28a-a7ba2e8b82b1',
  '0713272b-8b68-41dd-8ff0-ad6fdec1b406',
  'Cuidados Essenciais para um Jardim Saudável e Vibrante',
  'cuidados-essenciais-para-um-jardim-saudavel-e-vibrante',
  'Jardim',
  'jardim',
  'Aprenda a cuidar do seu jardim com dicas práticas e exemplos reais para manter suas plantas sempre saudáveis.',
  E'## Introdução\n\nCuidar de um jardim é uma atividade recompensadora que não apenas embeleza o ambiente, mas também promove uma sensação de bem-estar. No entanto, manter um jardim saudável requer atenção a diversos detalhes, desde a escolha das plantas até os cuidados diários.\n\nNeste artigo, vamos explorar os cuidados essenciais que você deve ter para garantir que seu jardim se mantenha sempre verde e vibrante. Vamos abordar técnicas de plantio, irrigação, fertilização, controle de pragas e mais.\n\n## Escolha das Plantas\n\nA seleção das plantas é um dos primeiros passos para o sucesso do seu jardim. É importante considerar o clima da sua região, o tipo de solo e a quantidade de luz solar disponível.\n\n### Dicas para Escolher Plantas\n\n1. **Conheça o Clima Local**: Escolha plantas que se adaptem bem ao clima da sua região. Plantas nativas geralmente são uma boa opção, pois estão adaptadas às condições locais.\n2. **Verifique o Tipo de Solo**: Alguns solos são mais arenosos, enquanto outros são argilosos. Identifique o tipo de solo do seu jardim e escolha plantas que prosperem nesse ambiente.\n3. **Considere a Luz Solar**: Algumas plantas precisam de sol pleno, enquanto outras preferem sombra parcial. Observe o seu jardim para entender a incidência de luz em diferentes áreas.\n\n## Técnicas de Plantio\n\nO plantio adequado é crucial para o desenvolvimento saudável das plantas. Aqui estão algumas técnicas básicas para ajudar no plantio:\n\n### Passo a Passo para o Plantio\n\n1. **Prepare o Solo**: Remova ervas daninhas e pedras, e adicione matéria orgânica para enriquecer o solo.\n2. **Cave Buracos de Plantio**: Faça buracos com o dobro do tamanho do torrão da planta.\n3. **Plante na Profundidade Certa**: A planta deve ser colocada na mesma profundidade em que estava no vaso.\n\n## Irrigação Adequada\n\nA água é vital para o crescimento das plantas, mas a quantidade e a frequência de irrigação variam de acordo com a espécie e o clima.\n\n### Dicas de Irrigação\n\n- **Irrigue pela Manhã ou ao Entardecer**: Isso ajuda a reduzir a evaporação e garante que a água chegue às raízes.\n- **Utilize Sistemas de Irrigação**: Sistemas de gotejamento ou aspersores automáticos são eficientes e economizam água.\n\n## Fertilização do Solo\n\nA fertilização correta fornece os nutrientes necessários para o crescimento robusto das plantas.\n\n### Tipos de Fertilizantes\n\n- **Orgânicos**: Compostos por matéria natural, como esterco e compostagem, são sustentáveis e melhoram a estrutura do solo.\n- **Químicos**: Oferecem nutrientes específicos, mas é necessário seguir as instruções de uso para evitar danos.\n\n## Controle de Pragas e Doenças\n\nManter as pragas e doenças sob controle é essencial para a saúde do jardim. Métodos naturais são preferíveis para minimizar o impacto ambiental.\n\n### Métodos de Controle\n\n- **Plantas Companheiras**: Algumas plantas repelem naturalmente pragas, como a calêndula.\n- **Remédios Caseiros**: Misturas de água com sabão podem ser eficazes contra pulgões.\n\n## Conclusão\n\nUm jardim bem cuidado não só é uma fonte de beleza, mas também de tranquilidade e satisfação pessoal. Com as dicas e práticas abordadas neste artigo, você estará melhor equipado para manter suas plantas saudáveis e seu jardim vibrante.\n\nNão perca a oportunidade de continuar aprendendo sobre jardinagem. Inscreva-se em nosso boletim informativo para mais dicas e truques!',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/cover-1768941861022-st7nag.webp',
  'cuidados com o jardim, manutenção de plantas, dicas de jardinagem, plantio saudável, jardinagem sustentável',
  ARRAY['jardim', 'plantação', 'cuidados com plantas', 'paisagismo', 'horticultura', 'dicas de jardinagem'],
  '3 min',
  'published',
  '2026-01-20 20:51:01.115+00',
  '2026-01-20 20:51:12.021934+00',
  '2026-01-21 18:04:05.395634+00',
  3,
  2,
  true,
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/banners/1d21c736-888e-4201-a28a-a7ba2e8b82b1-banner-1768947464713.png',
  'https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/banners/1d21c736-888e-4201-a28a-a7ba2e8b82b1-banner-mobile-1768949949321.webp',
  'https://www.terabyteshop.com.br/produto/38336/fonte-gigabyte-gp-p650g-pg5-650w-80-plus-gold-pfc-ativo-pcie-51-atx-31-preta',
  '["https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768941929709-nc7zuw.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768941992601-jdo8n8.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768942056092-143i53.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768942118657-npgqms.webp", "https://lhtetfcujdzulfyekiub.supabase.co/storage/v1/object/public/article-images/article/gallery-1768942182289-kahb70.webp"]'::jsonb,
  '[{"text": "Jardim Sustentável", "url": "https://www.jardimsustentavel.com"}, {"text": "Plantas Nativas para Jardim", "url": "https://www.plantasnativas.com.br"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 9: Paisagismo Residencial: Transforme Seu Jardim em um Oásis
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, gallery_images, external_links)
VALUES (
  '2156ccd8-109c-410b-829b-5a299fde725c',
  '4470531e-b723-4153-a2e1-208fd53f7f7c',
  'Paisagismo Residencial: Transforme Seu Jardim em um Oásis',
  'paisagismo-residencial-transforme-seu-jardim-em-um-oasis',
  'Jardim',
  'jardim',
  'Descubra como criar um jardim dos sonhos com projetos de paisagismo residencial, incluindo caminhos, pergolados e iluminação.',
  E'## Introdução\n\nO paisagismo residencial é uma arte que transforma áreas externas em verdadeiros oásis de beleza e funcionalidade. Um projeto bem planejado pode incrementar não apenas o visual da sua casa, mas também seu valor de mercado e qualidade de vida. Neste artigo, exploraremos diversos elementos fundamentais para o paisagismo, como jardins, caminhos, pergolados, fontes, iluminação externa e espaços de convívio, oferecendo dicas práticas e exemplos inspiradores.\n\n## Planejamento do Jardim\n\nAntes de iniciar qualquer projeto de paisagismo, é crucial realizar um planejamento cuidadoso. Considere os seguintes passos:\n\n1. **Análise do Terreno**: Avalie o terreno quanto ao tipo de solo, inclinação, drenagem e exposição solar.\n2. **Definição de Estilo**: Escolha um estilo que complemente a arquitetura da sua casa, seja ele moderno, tropical, rústico ou minimalista.\n3. **Orçamento**: Estabeleça um orçamento realista para garantir que todos os elementos desejados possam ser incluídos sem comprometer sua viabilidade financeira.\n\n### Escolha de Plantas\n\nA seleção de plantas é uma etapa fundamental no paisagismo. Opte por espécies nativas, pois elas tendem a se adaptar melhor ao clima local e exigem menos manutenção.\n\n- **Plantas de Sombra**: Samambaias e hostas são ideais para áreas sombreadas.\n- **Plantas de Sol**: Lavanda e alecrim prosperam em locais ensolarados.\n\n## Caminhos e Trilhas\n\nOs caminhos são essenciais para direcionar o tráfego e criar fluidez no jardim. Existem várias opções de materiais para caminhos, cada um oferecendo um visual distinto:\n\n- **Pedras Naturais**: Conferem um aspecto rústico e são duráveis.\n- **Madeira**: Ideal para um toque mais natural e acolhedor.\n- **Pavimentos de Tijolos**: Oferecem um visual clássico e podem ser dispostos em padrões interessantes.\n\n## Pergolados e Estruturas\n\nPergolados são estruturas versáteis que podem servir como pontos focais no jardim ou áreas de convívio cobertas. Considere os seguintes materiais e estilos:\n\n- **Madeira**: Tradicional e esteticamente agradável, mas requer manutenção regular.\n- **Metal**: Durável e moderno, ideal para jardins com estilo contemporâneo.\n\n### Dicas para Pergolados\n\n1. **Integração com o Jardim**: Use trepadeiras como jasmim ou glicínia para cobrir o pergolado e integrar a estrutura ao ambiente natural.\n2. **Iluminação**: Adicione luzes pendentes para criar um ambiente acolhedor à noite.\n\n## Fontes e Elementos Aquáticos\n\nFontes e lagos não só embelezam o jardim, mas também trazem um elemento de tranquilidade com o som suave da água corrente.\n\n- **Fontes de Pedra**: Duráveis e oferecem um visual tradicional.\n- **Lagos com Peixes**: Criam um ecossistema no jardim e são visualmente interessantes.\n\n## Iluminação Externa\n\nA iluminação é crucial para transformar o jardim em um espaço utilizável e seguro após o anoitecer. Considere estas opções:\n\n- **Luzes de Caminho**: Guiam os visitantes com segurança através do jardim.\n- **Iluminação de Destaque**: Focaliza elementos-chave como árvores ou esculturas.\n- **Luzes Solares**: Sustentáveis e fáceis de instalar, ideais para iluminar áreas sem acesso fácil à eletricidade.\n\n## Espaços de Convívio\n\nOs espaços de convívio são essenciais para aproveitar ao máximo o jardim. Desde áreas de estar até cozinhas externas, as possibilidades são infinitas.\n\n### Dicas para Espaços de Convívio\n\n1. **Móveis Confortáveis**: Invista em móveis resistentes às intempéries para garantir durabilidade.\n2. **Sombra Adequada**: Use guarda-sóis ou cortinas para proporcionar sombra durante os dias ensolarados.\n3. **Fogueiras e Lareiras Externas**: Criam um ponto de encontro acolhedor para as noites frias.\n\n## Conclusão\n\nAo considerar todos esses elementos, o paisagismo residencial pode transformar seu jardim em um espaço de beleza e funcionalidade. Não se esqueça de planejar cuidadosamente e integrar cada componente de forma harmoniosa. Para mais inspiração e dicas, confira [Melhores Jardins](https://www.melhoresjardins.com) e [Paisagismo Criativo](https://www.paisagismocriativo.com). Transforme seu espaço externo em um verdadeiro oásis e desfrute de momentos inesquecíveis com família e amigos.',
  NULL,
  'paisagismo residencial, jardins, caminhos, pergolados, fontes, iluminação externa',
  ARRAY['paisagismo', 'jardins', 'pergolados', 'fontes', 'iluminação', 'espaços de convívio'],
  '4 min',
  'published',
  '2026-01-21 02:20:27.508+00',
  '2026-01-21 02:20:27.546764+00',
  '2026-01-21 02:20:27.546764+00',
  0,
  0,
  false,
  '[]'::jsonb,
  '[{"text": "Melhores Jardins", "url": "https://www.melhoresjardins.com"}, {"text": "Paisagismo Criativo", "url": "https://www.paisagismocriativo.com"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Artigo 10: Transforme Sua Casa com Design Industrial
INSERT INTO public.content_articles (id, author_id, title, slug, category, category_slug, excerpt, body, cover_image, keywords, tags, read_time, status, published_at, created_at, updated_at, likes_count, affiliate_clicks_count, affiliate_banner_enabled, gallery_images, external_links)
VALUES (
  '6dbfe658-c670-4776-80eb-77ab5b3d0455',
  '4470531e-b723-4153-a2e1-208fd53f7f7c',
  'Transforme Sua Casa com Design Industrial: Dicas e Inspirações',
  'transforme-sua-casa-com-design-industrial-dicas-e-inspiracoes',
  'Decoração',
  'decoracao',
  'Descubra como o design industrial pode transformar sua casa com tijolos aparentes, tubulações expostas, e muito mais.',
  E'## Introdução\n\nO design industrial vem ganhando destaque no mundo da decoração de interiores, trazendo elementos que antes eram considerados rústicos e inacabados para o centro das atenções. Com uma mistura de tijolos aparentes, tubulações expostas, metal, concreto e iluminação pendente vintage, este estilo confere um ar moderno, urbano e sofisticado aos espaços. Neste artigo, exploraremos como você pode incorporar o design industrial na sua casa, criando ambientes únicos e cheios de personalidade.\n\n## O que é Design Industrial?\n\nOriginado nos lofts de Nova York durante os anos 50 e 60, o design industrial abraça a estética dos edifícios industriais e fábricas. Caracterizado pelo uso de materiais brutos e pela exposição de estruturas arquitetônicas, este estilo valoriza a funcionalidade e a simplicidade.\n\n### Elementos Principais do Design Industrial\n\n1. **Tijolos Aparentes**: Os tijolos aparentes são um dos elementos mais icônicos do design industrial. Eles adicionam textura e calor a um ambiente. Se a sua casa não possui uma parede de tijolos original, considere usar papel de parede que imita tijolos ou revestimentos especiais.\n\n2. **Tubulações Expostas**: Ao invés de esconder as tubulações, o design industrial as transforma em parte da decoração. Tubulações de metal podem ser pintadas ou deixadas em seu estado bruto para um visual mais autêntico.\n\n3. **Metal e Concreto**: O uso de metal e concreto é essencial. Móveis com estrutura de metal ou detalhes em concreto são perfeitos para incorporar este estilo.\n\n4. **Iluminação Pendente Vintage**: As luminárias pendentes com um toque vintage são ideais para completar o visual industrial. Busque lâmpadas de filamento ou luminárias de metal com acabamento desgastado.\n\n## Como Aplicar o Design Industrial em sua Casa\n\n### Sala de Estar\n\nPara trazer o design industrial para sua sala de estar, comece com uma base neutra. Paredes de tijolos aparentes ou pintadas em tons de cinza funcionam bem. Adicione sofás de couro escuro, mesas de centro com estrutura de metal e luminárias pendentes.\n\n- **Dica 1**: Use móveis multifuncionais que combinam com o tema industrial, como uma estante de metal que também funciona como divisória de ambientes.\n\n### Cozinha\n\nNa cozinha, o design industrial pode ser incorporado através de prateleiras abertas de metal, bancadas de concreto e eletrodomésticos em aço inoxidável.\n\n- **Dica 2**: Instale luminárias pendentes sobre a ilha da cozinha para um toque de iluminação dramático.\n\n### Quarto\n\nTransforme seu quarto em um santuário industrial com uma parede de cabeceira de tijolos aparentes, uma cama com estrutura de metal e luminárias de cabeceira vintage.\n\n- **Dica 3**: Utilize roupas de cama em tons neutros para manter a paleta de cores coesa e clássica.\n\n## Exemplos Reais e Inspirações\n\nMuitos designers renomados utilizam o design industrial em seus projetos. Um exemplo icônico é o [The Line Hotel](https://www.thelinehotel.com/), em Los Angeles, que combina perfeitamente o charme industrial com o conforto moderno.\n\nOutro exemplo é o loft do designer [Tom Dixon](https://www.tomdixon.net/), que mostra como o design industrial pode ser sofisticado e acolhedor.\n\n## Conclusão\n\nO design industrial é uma escolha ousada e estilosa para quem busca um ambiente moderno e urbano. Ao incorporar elementos como tijolos aparentes, tubulações expostas, metal e concreto, você pode transformar qualquer espaço em um verdadeiro refúgio industrial. Experimente estas dicas em sua própria casa e desfrute de um ambiente cheio de personalidade.\n\nQuer saber mais sobre como aplicar o design industrial na sua casa? Confira nosso guia completo sobre [decoração industrial](https://www.houzz.com/).\n\n## Chamada para Ação\n\nCompartilhe suas ideias de design industrial conosco! Poste uma foto do seu espaço nas redes sociais com a hashtag #MeuEspacoIndustrial e inspire outros a transformar suas casas.',
  NULL,
  'design industrial, tijolos aparentes, tubulações expostas, metal, concreto, iluminação pendente, decoração',
  ARRAY['design industrial', 'tijolos aparentes', 'tubulações expostas', 'iluminação pendente', 'concreto', 'metal'],
  '3 min',
  'published',
  '2026-01-21 02:37:55.426+00',
  '2026-01-21 02:37:55.522051+00',
  '2026-01-21 02:37:55.522051+00',
  0,
  0,
  false,
  '[]'::jsonb,
  '[{"text": "The Line Hotel", "url": "https://www.thelinehotel.com/"}, {"text": "Tom Dixon", "url": "https://www.tomdixon.net/"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- NEWSLETTER SUBSCRIBERS
-- ================================================================

INSERT INTO public.newsletter_subscribers (id, email, is_active, source, subscribed_at)
VALUES
  ('16d1cb88-6a40-4d26-9982-c6182d972863', 'wallistonluiz@gmail.com', true, 'footer', '2026-01-20 15:36:50.203444+00')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- CONTACT MESSAGES
-- ================================================================

INSERT INTO public.contact_messages (id, name, email, subject, message, status, ip_hash, created_at, updated_at)
VALUES
  ('c6f79619-e58e-45dc-bc84-1baf98d07eb7', 'Teste', 'test@example.com', 'Dúvida sobre conteúdo', 'Teste de logo no email', 'read', '66ff82ceb6cbbc8fdf2582e96b833dea9ae9a19b611cf477311549e6f5281b98', '2026-01-20 19:35:23.234923+00', '2026-01-20 21:36:52.019125+00'),
  ('7580788a-6ea1-417e-bb1b-9d6239484bc4', 'Walliston Luiz', 'wallistonluiz@gmail.com', 'Sugestão de artigo', 'Quero ver um tema de sitio', 'replied', 'f786a25ae139d6fda0af4e45fc5dd8fdca616ca97f4037c8b14229a0b2f59b14', '2026-01-20 16:40:32.677224+00', '2026-01-20 23:18:12.737788+00')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- GENERATION HISTORY
-- ================================================================

INSERT INTO public.generation_history (id, user_id, topic, article_id, article_title, status, created_at)
VALUES
  ('48e29ab2-34dd-4c51-9047-3e2ae2508689', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'Decoração', '5ee4d034-e756-4cf2-938a-16ab80901fed', 'Dicas de Design Interno para Sala: Transforme Seu Espaço', 'success', '2026-01-19 22:06:35.123765+00'),
  ('960c433b-58bb-40fc-90d6-72213b1904de', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'Decoração', 'fd2f272b-b912-4e27-ba89-466688ad3c47', 'Dicas Essenciais de Design de Interiores para Salas de Jantar Perfeitas', 'success', '2026-01-19 23:09:32.930576+00'),
  ('b98d2cb2-8425-4d1a-bb24-7dbb475f46e8', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'Dicas de arquitetura em estilo colonial', '0b8110bd-d52c-4433-95a0-b0f937070265', 'Dicas Essenciais de Arquitetura em Estilo Colonial', 'success', '2026-01-20 00:35:25.207185+00'),
  ('a8876b40-8abd-4013-881a-edb5627d0075', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'Dicas de design interno para lareira', 'b0374928-d4f5-4f7f-af45-b437191519fc', 'Dicas de Design Interno para Lareiras: Estilo e Conforto', 'success', '2026-01-20 00:59:25.447136+00'),
  ('6bc80a96-2fc8-4aa8-9fa3-2fb167422f8c', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'Dicas de design interno para piscina, área gourmet', '2326a1d3-e489-4766-ad45-de460b4f5b71', 'Dicas de Design para Piscina e Área Gourmet Integrada', 'success', '2026-01-20 14:48:40.332393+00'),
  ('a2a36793-00f7-4449-a872-9a61b885b674', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'Dicas de design interno para banheiro', '9e36224d-3127-4170-85c0-d4ca08f5769b', 'Transforme seu Banheiro com Dicas de Design Interno', 'success', '2026-01-20 18:08:00.128228+00'),
  ('1a777dfd-94be-4d0f-a507-fb1cbead2b29', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'Jardim: jardim', '5b8bf4ac-fb65-473c-8cda-22f0fdc194cb', 'Transforme Seu Espaço com um Jardim Encantador', 'success', '2026-01-20 20:14:30.230352+00'),
  ('edbbcb57-5b91-43af-861b-8fc0a25c9bba', '98213c01-0dae-4c0b-8ebe-f6351c5f54f1', 'Jardim: cuidados com a plantação', '1d21c736-888e-4201-a28a-a7ba2e8b82b1', 'Cuidados Essenciais para um Jardim Saudável e Vibrante', 'success', '2026-01-20 20:50:46.611387+00')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- FIM DO SCRIPT
-- Execute após criar os usuários no Auth do novo Supabase
-- ================================================================
