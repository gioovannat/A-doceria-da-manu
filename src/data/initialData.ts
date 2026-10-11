import { AppDatabase } from '../types';
import heroCakeImg from '../assets/images/hero_manu_cake_1790115919579.jpg';
import vintageHeartCakeImg from '../assets/images/heart_cake_scorpio_1790121371507.jpg';
import bentoCakeImg from '../assets/images/bento_cake_clamshell_1790115999871.jpg';
import kitFestaImg from '../assets/images/kit_festa_gourmet_1790116010849.jpg';
import planilhaImg from '../assets/images/planilha_financas_1791674297243.jpg';
import chefImg from '../assets/images/chef_manu_photo_1790121605417.jpg';
import logoImg from '../assets/images/doceria_da_manu_horizontal_logo_1790120305939.jpg';

export const INITIAL_DATABASE: AppDatabase = {
  settings: {
    company_name: 'A Doceria da Manu Confeitaria Artesanal',
    short_name: 'A Doceria da Manu',
    instagram: 'https://www.instagram.com/adoceriadamanu/',
    instagram_handle: '@adoceriadamanu',
    whatsapp_number: '5598991171456',
    whatsapp_display: '+55 98 9117-1456',
    whatsapp_default_message: 'Olá, Manu! Gostaria de consultar a disponibilidade e fazer um pedido.',
    email: 'contato@adoceriadamanu.com.br',
    city: 'Paço do Lumiar',
    state: 'MA',
    neighborhood: 'Terra Livre',
    address: 'Av. Moacir Feitosa, 5 - Terra livre, São José de Ribamar - MA, 65122-783',
    area_served: ['Paço do Lumiar', 'São Luís', 'São José de Ribamar', 'Grande São Luís'],
    institutional_text: 'Transformamos açúcar em arte para celebrar os momentos mais especiais da sua vida. Bolos decorados, bentô cakes e doces artesanais com afeto e sofisticação.',
    copyright: '© A Doceria da Manu. Todos os direitos reservados.',
    atelier_status: 'aberto',
    status_custom_message: 'Produção a todo vapor! Aceitando encomendas para este mês.',
    seo: {
      title: 'A Doceria da Manu | Bolos Decorados e Doces Artesanais',
      description: 'Bolos decorados sob encomenda para casamentos e aniversários, bentô cakes, docinhos finos, kit festa na escola e cursos de confeitaria em Paço do Lumiar e Grande São Luís.',
      keywords: ['bolos decorados', 'bentô cake', 'kit festa são luis', 'doceria paço do lumiar', 'confeitaria artesanal', 'docinhos gourmet', 'bolos de casamento'],
      og_title: 'A Doceria da Manu | Bolos Decorados e Doces Artesanais',
      og_description: 'Transformamos açúcar em arte para celebrar os momentos mais especiais da sua vida. Paço do Lumiar e Grande São Luís.',
      og_image: logoImg,
      canonical: 'https://www.adoceriadamanu.com.br'
    }
  },

  home: {
    logo_url: logoImg,
    logo_alt: 'A Doceria da Manu - Confeitaria Artesanal',
    hero_top_badge: 'A Doceria da Manu | Bolos Decorados e Doces Artesanais',
    hero_title: 'Delicadeza, intenção e beleza nos detalhes',
    hero_highlight_text: 'seja qual for sua vibe.',
    hero_subtitle: 'Transformamos açúcar em arte para celebrar os momentos mais especiais da sua vida. Bolos decorados sob encomenda, bentô cakes exclusivos e kits festa inesquecíveis.',
    hero_main_image: heroCakeImg,
    hero_cta_text: 'Faça seu pedido',
    hero_secondary_cta_text: 'Explorar cardápio',
    hero_secondary_cta_link: '#cardapio',
    hero_animation_active: true,
    hero_stats: [
      { id: '1', number: '100%', label: 'Artesanal & Fresco' },
      { id: '2', number: '5.0 ★', label: 'Avaliação das clientes' },
      { id: '3', number: 'Sob Medida', label: 'Para casamentos e aniversários' }
    ],
    featured_cake: {
      active: true,
      title: 'Bolo Vintage Lambeth',
      badge: 'Destaque da Semana',
      description: 'Trabalhado em bico clássico vitoriano com cerejas ao marrasquino e recheio nobre de Ninho trufado.',
      price_display: 'A partir de R$ 145',
      image: vintageHeartCakeImg,
      cta_text: 'Quero este bolo'
    }
  },

  benefits: [
    {
      id: 'ben-1',
      icon: 'Sparkles',
      title: '100% Produção Artesanal',
      description: 'Sem bases prontas ou conservantes industriais artificiais',
      sort_order: 1,
      active: true
    },
    {
      id: 'ben-2',
      icon: 'Award',
      title: 'Ingredientes Nobres',
      description: 'Chocolate belga autêntico, manteiga de verdade e frutas frescas',
      sort_order: 2,
      active: true
    },
    {
      id: 'ben-3',
      icon: 'ShieldCheck',
      title: 'Transporte Seguro',
      description: 'Embalagens estruturadas para manter a obra de arte intacta',
      sort_order: 3,
      active: true
    },
    {
      id: 'ben-4',
      icon: 'Heart',
      title: 'Design Afetivo',
      description: 'Cada laço, flor e detalhe criado sob medida para sua festa',
      sort_order: 4,
      active: true
    }
  ],

  specialties: [
    {
      id: 'bolos-decorados',
      category: 'bolos',
      slug: 'bolos-decorados',
      title: 'Bolos Decorados & Vintage',
      subtitle: 'Sob encomenda para casamentos e aniversários',
      description: 'Criações exclusivas com técnicas contemporâneas: bolos de coração estilo retrô Lambeth, vintage piping, mensagens personalizadas e acabamentos impecáveis.',
      image: vintageHeartCakeImg,
      serves: 'A partir de 15 fatias',
      badge: 'Mais Pedido',
      seoTag: 'Bolos decorados sob encomenda',
      startingPrice: 'A partir de R$ 130',
      highlights: ['Massas amanteigadas fofinhas', 'Recheios nobres e cremosos', 'Decoração 100% personalizada'],
      sort_order: 1,
      active: true,
      featured: true
    },
    {
      id: 'bento-cake',
      category: 'bento',
      slug: 'bento-cake',
      title: 'Bentô Cake',
      subtitle: 'O queridinho para presentes e memes carinhosos',
      description: 'Mini bolo individual na lancheira ecológica (clamshell). Perfeito para aniversários íntimos, mesversários, declarações românticas ou aquela piada interna.',
      image: bentoCakeImg,
      serves: '2 a 4 porções (aprox. 400g)',
      badge: 'Tendência',
      seoTag: 'Onde comprar bentô cake para aniversário',
      startingPrice: 'A partir de R$ 45',
      highlights: ['Acompanha velinha e colherzinha', 'Frases e desenhos manuais', 'Entrega rápida disponível'],
      sort_order: 2,
      active: true,
      featured: true
    },
    {
      id: 'kit-festa',
      category: 'kits',
      slug: 'kit-festa',
      title: 'Kit Festa Completo',
      subtitle: 'Comemoração prática, farta e sofisticada',
      description: 'A solução ideal para sua celebração em casa ou no escritório. Combinação balanceada de bolo decorado, docinhos artesanais e salgadinhos quentinhos.',
      image: kitFestaImg,
      serves: 'Kits para 10, 20, 30 ou 50 pessoas',
      badge: 'Melhor Custo-Benefício',
      seoTag: 'Kit festa completo em Paço do Lumiar',
      startingPrice: 'A partir de R$ 180',
      highlights: ['Bolo + Doces + Salgados', 'Tudo fresco feito no dia', 'Embalagens seguras para transporte'],
      sort_order: 3,
      active: true,
      featured: true
    },
    {
      id: 'docinhos-finos',
      category: 'doces',
      slug: 'docinhos-finos',
      title: 'Docinhos & Brigadeiros Gourmet',
      subtitle: 'Docinhos finos para casamentos e mesas de doces',
      description: 'Elaborados com chocolate nobre e confeitos importados. Do brigadeiro belga tradicional ao ninho com Nutella, pistache artesanal e beijinho caramelizado.',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
      serves: 'Cento ou caixas presente',
      badge: 'Artesanal',
      seoTag: 'Docinhos finos para casamento',
      startingPrice: 'A partir de R$ 90/cento',
      highlights: ['Brigadeiro Belga 54%', 'Ninho com Frutas Vermelhas', 'Pistache e Amêndoas'],
      sort_order: 4,
      active: true,
      featured: true
    },
    {
      id: 'salgados-artesanais',
      category: 'salgados',
      slug: 'salgados-artesanais',
      title: 'Salgados Artesanais',
      subtitle: 'Crocantes por fora, macios e bem recheados',
      description: 'Coxinhas douradas com massa leve de batata, empadinhas que derretem na boca, quibes temperados, bolinhas de queijo e folhados finos.',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      serves: 'Fritos ou assados sob encomenda',
      badge: 'Crocância Perfeita',
      seoTag: 'Salgadinhos para festas em São Luís',
      startingPrice: 'A partir de R$ 85/cento',
      highlights: ['Fritura sequinha sem excessos', 'Recheios com frango desfiado real', 'Opções assadas premium'],
      sort_order: 5,
      active: true,
      featured: false
    },
    {
      id: 'festa-na-escola',
      category: 'escola',
      slug: 'festa-na-escola',
      title: 'Festa na Escola',
      subtitle: 'Kit festa na escola personalizado e higiênico',
      description: 'Pensado para a alegria das crianças e praticidade dos pais. Caixinhas individuais personalizadas com lanchinho, suco, mini bolo e docinhos higienizados.',
      image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      serves: 'Kits individuais por aluno',
      badge: 'Super Prático',
      seoTag: 'Kit festa na escola personalizado',
      startingPrice: 'A partir de R$ 22/aluno',
      highlights: ['Kit individual lacrado', 'Fácil de servir na sala', 'Personalização com o tema infantil'],
      sort_order: 6,
      active: true,
      featured: false
    }
  ],

  products: [
    {
      id: 'bolos-decorados',
      name: 'Bolos Decorados & Vintage',
      slug: 'bolos-decorados',
      short_description: 'Bolo decorado em formato de coração estilo Lambeth retro com laços ou cerejas.',
      full_description: 'Bolo estruturado com massa amanteigada de baunilha ou chocolate, 2 camadas generosas de recheio nobre e cobertura sedosa de buttercream ou chantininho.',
      category: 'bolos',
      main_image: vintageHeartCakeImg,
      gallery: [vintageHeartCakeImg, heroCakeImg],
      starting_price: 130,
      starting_price_display: 'R$ 130,00',
      unit: 'unidade (15 fatias)',
      minimum_notice: '48h a 72h',
      badge: 'Mais Desejado',
      active: true,
      featured: true,
      sort_order: 1,
      requires_batter: true,
      min_flavors: 2,
      max_flavors: 2,
      min_addons: 1,
      batters: [
        { id: 'bat-1', name: 'Massa Amanteigada de Baunilha', description: 'Estruturada, fofinha e com sabor aveludado', additional_price: 0, active: true },
        { id: 'bat-2', name: 'Massa de Chocolate 50% Cacau', description: 'Massa úmida e marcante com cacau nobre', additional_price: 0, active: true },
        { id: 'bat-3', name: 'Massa Red Velvet Veludo', description: 'Coloração rubi marcante e textura ultra macia', additional_price: 5, active: true },
        { id: 'bat-4', name: 'Massa Mesclada (Baunilha & Chocolate)', description: 'O equilíbrio perfeito entre os dois sabores', additional_price: 0, active: true },
      ],
      variations: [
        { id: 'var-v1', product_id: 'bolos-decorados', name: 'Pequeno (15 a 18 fatias)', description: 'Diâmetro 15cm x 12cm altura', price: 130, unit: 'unidade', lead_time: '48h', active: true },
        { id: 'var-v2', product_id: 'bolos-decorados', name: 'Médio (22 a 25 fatias)', description: 'Diâmetro 18cm x 12cm altura', price: 175, unit: 'unidade', lead_time: '48h', active: true },
        { id: 'var-v3', product_id: 'bolos-decorados', name: 'Grande (30 a 35 fatias)', description: 'Diâmetro 22cm x 12cm altura', price: 230, unit: 'unidade', lead_time: '72h', active: true },
      ],
      flavors: [
        { id: 'flav-v1', name: 'Ninho com Morangos Frescos', description: 'Creme de Leite Ninho com pedaços de morango selecionado', additional_price: 0, category: 'Mais Pedidos', active: true },
        { id: 'flav-v2', name: 'Red Velvet Supreme', description: 'Massa aveludada com recheio cremoso e geleia artesanal de frutas vermelhas', additional_price: 10, category: 'Especiais', active: true },
        { id: 'flav-v3', name: 'Brigadeiro Belga 54% Callebaut', description: 'Chocolate meio amargo puro, textura sedosa e confeitos nobres', additional_price: 5, category: 'Mais Pedidos', active: true },
        { id: 'flav-v4', name: 'Pistache Real & Framboesa', description: 'Pasta pura de pistache da Sicília com redução fresca de framboesas', additional_price: 18, category: 'Premium', active: true },
        { id: 'flav-v5', name: 'Doce de Leite com Nozes Crocantes', description: 'Doce de leite cozido artesanalmente com nozes chilenas', additional_price: 8, category: 'Clássicos', active: true },
        { id: 'flav-v6', name: 'Quatro Leites Trufado', description: 'Combinação suave de ninho, leite de coco e leite condensado', additional_price: 0, category: 'Mais Pedidos', active: true },
      ],
      packaging: [
        { id: 'pack-v1', name: 'Caixa de Transporte Segura com Visor', description: 'Caixa reforçada com berço protetor', additional_price: 0, is_required: true, active: true },
        { id: 'pack-v2', name: 'Caixa Cartonada Luxo com Laço de Cetim', description: 'Acabamento rígido premium com fita acetinada', additional_price: 25, is_required: false, active: true },
      ],
      addons: [
        { id: 'add-v1', name: 'Topo de Bolo Personalizado (Nome & Idade)', description: 'Em acrílico espelhado ou papelaria fina', price: 25, unit: 'unidade', active: true },
        { id: 'add-v2', name: 'Aplicação de Folha de Ouro 24k Comestível', description: 'Detalhes dourados no acabamento', price: 15, unit: 'aplicação', active: true },
        { id: 'add-v3', name: 'Cerejas Frescas ao Marrasquino no Topo', description: 'Cerejas vermelhas selecionadas', price: 18, unit: 'porção', active: true },
        { id: 'add-v4', name: 'Morangos Frescos Extras no Topo', description: 'Morangos banhados e frescos', price: 15, unit: 'porção', active: true },
      ]
    },
    {
      id: 'bento-cake',
      name: 'Bentô Cake',
      slug: 'bento-cake',
      short_description: 'Mini bolo de 10cm com mensagem, frase engraçada ou desenho feito à mão.',
      full_description: 'Acompanha caixinha ecológica clamshell, fita de cetim, mini velinha palito e colher descartável de bambu/biodegradável.',
      category: 'bento',
      main_image: bentoCakeImg,
      gallery: [bentoCakeImg],
      starting_price: 45,
      starting_price_display: 'R$ 45,00',
      unit: 'unidade (aprox. 400g)',
      minimum_notice: '24h',
      badge: 'Sucesso',
      active: true,
      featured: true,
      sort_order: 2,
      requires_batter: true,
      min_flavors: 1,
      max_flavors: 1,
      min_addons: 1,
      batters: [
        { id: 'bat-b1', name: 'Massa Tradicional de Baunilha', description: 'Leve e macia', additional_price: 0, active: true },
        { id: 'bat-b2', name: 'Massa de Chocolate Cacau 50%', description: 'Molhadinha e saborosa', additional_price: 0, active: true },
      ],
      variations: [
        { id: 'var-b1', product_id: 'bento-cake', name: 'Padrão Clamshell (400g)', description: 'Até 4 fatias com vela palito e colherzinha', price: 45, unit: 'unidade', lead_time: '24h', active: true },
      ],
      flavors: [
        { id: 'flav-b1', name: 'Brigadeiro Belga Tradicional', description: 'Chocolate meio amargo com confeitos crocantes', additional_price: 0, category: 'Mais Pedidos', active: true },
        { id: 'flav-b2', name: 'Ninho com Nutella Pura', description: 'Recheio de Ninho cremoso com Nutella autêntica', additional_price: 5, category: 'Mais Pedidos', active: true },
        { id: 'flav-b3', name: 'Doce de Leite Artesanal', description: 'Doce de leite suave e macio', additional_price: 0, category: 'Clássicos', active: true },
        { id: 'flav-b4', name: 'Duo Chocolate & Morango', description: 'Brigadeiro cremoso com geleia de morango', additional_price: 5, category: 'Especiais', active: true },
      ],
      packaging: [
        { id: 'pack-b1', name: 'Lancheira Clamshell Ecológica (Inclusa)', description: 'Acompanha fita de cetim, velinha e colherzinha', additional_price: 0, is_required: true, active: true },
        { id: 'pack-b2', name: 'Sacola Presente Kraft Luxo com Tag Afetiva', description: 'Embalagem especial pronta para presentear', additional_price: 12, is_required: false, active: true },
      ],
      addons: [
        { id: 'add-b1', name: 'Velinha Faísca / Estrelinha Especial', description: 'Velinha com efeito faísca cintilante', price: 8, unit: 'unidade', active: true },
        { id: 'add-b2', name: 'Desenho / Meme Complexo Personalizado', description: 'Ilustração manual complexa sob encomenda', price: 10, unit: 'unidade', active: true },
      ]
    },
    {
      id: 'kit-festa',
      name: 'Kit Festa Completo',
      slug: 'kit-festa',
      short_description: '1 Bolo decorado 20 fatias + 60 docinhos gourmet + 100 salgadinhos artesanais.',
      full_description: 'O combo perfeito para reunir a família com tranquilidade. Tudo fresquinho e entregue pronto para servir.',
      category: 'kits',
      main_image: kitFestaImg,
      gallery: [kitFestaImg],
      starting_price: 260,
      starting_price_display: 'R$ 260,00',
      unit: 'kit completo',
      minimum_notice: '72h',
      badge: 'Custo-Benefício',
      active: true,
      featured: true,
      sort_order: 3,
      variations: [
        { id: 'var-k1', product_id: 'kit-festa', name: 'Kit 10 Pessoas (Bolo 10 fatias + 30 doces + 50 salgados)', description: 'Ideal para festas íntimas', price: 180, unit: 'kit', lead_time: '48h', active: true },
        { id: 'var-k2', product_id: 'kit-festa', name: 'Kit 20 Pessoas (Bolo 20 fatias + 60 doces + 100 salgados)', description: 'Nosso kit mais vendido', price: 260, unit: 'kit', lead_time: '72h', active: true },
        { id: 'var-k3', product_id: 'kit-festa', name: 'Kit 30 Pessoas (Bolo 30 fatias + 100 doces + 150 salgados)', description: 'Para comemorações completas', price: 370, unit: 'kit', lead_time: '72h', active: true },
      ],
      flavors: [
        { id: 'flav-k1', name: 'Bolo: Ninho com Morangos Frescos', description: 'Recheio suave de Ninho com morangos', additional_price: 0, category: 'Mais Pedidos', active: true },
        { id: 'flav-k2', name: 'Bolo: Brigadeiro Belga Cremoso', description: 'O clássico preferido de todos', additional_price: 0, category: 'Mais Pedidos', active: true },
        { id: 'flav-k3', name: 'Bolo: Abacaxi com Coco Artesanal', description: 'Refrescante e molhadinho', additional_price: 0, category: 'Clássicos', active: true },
      ],
      packaging: [
        { id: 'pack-k1', name: 'Caixas de Transporte Térmicas e Berços Seguros', description: 'Embalagens completas para bolo, doces e salgados', additional_price: 0, is_required: true, active: true },
      ],
      addons: [
        { id: 'add-k1', name: 'Kit Descartáveis Luxo (20 pratos, garfos e guardanapos)', description: 'Pratos resistentes na cor do tema', price: 25, unit: 'kit', active: true },
        { id: 'add-k2', name: 'Vela Vulcão Estrelada', description: 'Efeito luminoso para a hora dos parabéns', price: 12, unit: 'unidade', active: true },
      ]
    },
    {
      id: 'docinhos-finos',
      name: 'Docinhos & Brigadeiros Gourmet',
      slug: 'docinhos-finos',
      short_description: '100 docinhos gourmet com até 4 sabores à sua escolha.',
      full_description: 'Brigadeiro Belga 54%, Ninho com Nutella, Pistache Italiano, Churros com Doce de Leite e Beijinho de Coco Fresco.',
      category: 'doces',
      main_image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80'],
      starting_price: 90,
      starting_price_display: 'R$ 90,00',
      unit: 'cento (100 un.)',
      minimum_notice: '48h',
      badge: 'Artesanal',
      active: true,
      featured: false,
      sort_order: 4,
      variations: [
        { id: 'var-d1', product_id: 'docinhos-finos', name: 'Meio Cento (50 unidades - até 2 sabores)', description: 'Caixa com 50 doces finos', price: 50, unit: 'caixa', lead_time: '24h', active: true },
        { id: 'var-d2', product_id: 'docinhos-finos', name: 'Cento Completo (100 unidades - até 4 sabores)', description: 'Cento tradicional para festas', price: 90, unit: 'cento', lead_time: '48h', active: true },
      ],
      flavors: [
        { id: 'flav-d1', name: 'Brigadeiro Belga Tradicional 54%', description: 'Confeito split Callebaut nobre', additional_price: 0, category: 'Gourmet', active: true },
        { id: 'flav-d2', name: 'Ninho com Pitanga de Nutella', description: 'Massa de Ninho macia com Nutella', additional_price: 0, category: 'Gourmet', active: true },
        { id: 'flav-d3', name: 'Pistache Siciliano com Farofa Nobre', description: 'Brigadeiro com pasta pura e crocante de pistache', additional_price: 15, category: 'Premium', active: true },
        { id: 'flav-d4', name: 'Churros com Doce de Leite Argentino', description: 'Passado no açúcar com canela e bico de doce de leite', additional_price: 0, category: 'Clássicos', active: true },
        { id: 'flav-d5', name: 'Beijinho Caramelizado com Cravo', description: 'Coco fresco ralado e textura perfeita', additional_price: 0, category: 'Clássicos', active: true },
      ],
      packaging: [
        { id: 'pack-d1', name: 'Caixa com Berço Especial para Transporte', description: 'Mantém os docinhos intactos e sem virar', additional_price: 0, is_required: true, active: true },
        { id: 'pack-d2', name: 'Caixa Presente Luxo com Visor Transparente e Laço', description: 'Ideal para lembrancinha ou presentes finos', additional_price: 18, is_required: false, active: true },
      ],
      addons: [
        { id: 'add-d1', name: 'Forminhas Florais Quatro Pétalas (50 un)', description: 'Forminhas decorativas artesanais', price: 20, unit: 'kit', active: true },
        { id: 'add-d2', name: 'Tags Personalizadas para cada Doce', description: 'Plaquinhas personalizadas com o tema', price: 15, unit: 'cento', active: true },
      ]
    },
    {
      id: 'salgados-artesanais',
      name: 'Salgados Artesanais',
      slug: 'salgados-artesanais',
      short_description: 'Cento ou meio cento de salgadinhos fritos e assados artesanais sequinhos e crocantes.',
      full_description: 'Coxinhas douradas com massa leve de batata, empadinhas que derretem na boca, quibes temperados, bolinhas de queijo e folhados finos preparados no dia da sua festa.',
      category: 'salgados',
      main_image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'],
      starting_price: 85,
      starting_price_display: 'R$ 85,00',
      unit: 'cento (100 un.)',
      minimum_notice: '48h',
      badge: 'Crocância Perfeita',
      active: true,
      featured: false,
      sort_order: 5,
      variations: [
        { id: 'var-salg-1', product_id: 'salgados-artesanais', name: 'Meio Cento (50 salgados fritos ou assados)', description: 'Até 2 sabores à escolha', price: 48, unit: 'caixa', lead_time: '24h', active: true },
        { id: 'var-salg-2', product_id: 'salgados-artesanais', name: 'Cento Completo Frito (100 salgados)', description: 'Até 4 sabores tradicionais', price: 85, unit: 'cento', lead_time: '48h', active: true },
        { id: 'var-salg-3', product_id: 'salgados-artesanais', name: 'Cento Especial Assado / Folhados (100 salgados)', description: 'Empadas e folhados nobres', price: 95, unit: 'cento', lead_time: '48h', active: true },
      ],
      flavors: [
        { id: 'flav-salg-1', name: 'Coxinha de Frango Cremosa com Requeijão', description: 'Massa leve de batata e peito de frango selecionado', additional_price: 0, category: 'Fritos', active: true },
        { id: 'flav-salg-2', name: 'Bolinha de Queijo Crocante', description: 'Massa crocante com muçarela derretida e orégano', additional_price: 0, category: 'Fritos', active: true },
        { id: 'flav-salg-3', name: 'Quibe Tradicional Árabe com Hortelã', description: 'Carne bovina temperada e hortelã fresca', additional_price: 0, category: 'Fritos', active: true },
        { id: 'flav-salg-4', name: 'Empadinha de Frango com Catupiry', description: 'Massa podre artesanal que desmancha na boca', additional_price: 0, category: 'Assados', active: true },
        { id: 'flav-salg-5', name: 'Folhado de Queijo e Presunto Royale', description: 'Massa folhada amanteigada com queijo e presunto', additional_price: 5, category: 'Assados', active: true },
        { id: 'flav-salg-6', name: 'Enroladinho de Salsicha Especial Dourado', description: 'Massa fofa assada pincelada com gergelim', additional_price: 0, category: 'Assados', active: true },
      ],
      packaging: [
        { id: 'pack-salg-1', name: 'Caixa Térmica Especial para Salgados', description: 'Mantém o calor e a crocância durante o transporte', additional_price: 0, is_required: true, active: true },
      ],
      addons: [
        { id: 'add-salg-1', name: 'Molho Rosé com Ervas Finas da Manu (Pote 200ml)', description: 'Molho artesanal para mergulhar salgadinhos', price: 12, unit: 'pote', active: true },
        { id: 'add-salg-2', name: 'Geleia de Pimenta Defumada (Pote 150ml)', description: 'Harmonização perfeita para quibes e coxinhas', price: 15, unit: 'pote', active: true },
      ]
    },
    {
      id: 'festa-na-escola',
      name: 'Festa na Escola',
      slug: 'festa-na-escola',
      short_description: 'Kits individuais completos e higiênicos para comemoração prática na sala de aula.',
      full_description: 'Pensado para a alegria das crianças e praticidade dos pais. Caixinhas individuais personalizadas com lanchinho, suco, mini bolo e docinhos higienizados.',
      category: 'escola',
      main_image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80'],
      starting_price: 22,
      starting_price_display: 'R$ 22,00/aluno',
      unit: 'kit individual por aluno',
      minimum_notice: '72h',
      badge: 'Super Prático',
      active: true,
      featured: false,
      sort_order: 6,
      variations: [
        { id: 'var-esc-1', product_id: 'festa-na-escola', name: 'Kit Escola Individual Básico (Lanche + Suco + Mini Bolo + 2 Doces)', description: 'Mínimo de 10 kits por pedido', price: 22, unit: 'kit', lead_time: '72h', active: true },
        { id: 'var-esc-2', product_id: 'festa-na-escola', name: 'Kit Escola Individual Completo (Sanduíche + 4 Salgados + Suco + Bolo + 2 Doces)', description: 'Mínimo de 10 kits por pedido', price: 28, unit: 'kit', lead_time: '72h', active: true },
      ],
      flavors: [
        { id: 'flav-esc-1', name: 'Mini Bolo: Chocolate com Brigadeiro Cremoso', description: 'O sabor favorito da criançada', additional_price: 0, category: 'Mini Bolos', active: true },
        { id: 'flav-esc-2', name: 'Mini Bolo: Cenoura Fofinho com Calda de Chocolate', description: 'Tradicional e delicioso', additional_price: 0, category: 'Mini Bolos', active: true },
        { id: 'flav-esc-3', name: 'Mini Bolo: Baunilha com Recheio Suave de Ninho', description: 'Suave e aveludado', additional_price: 0, category: 'Mini Bolos', active: true },
      ],
      packaging: [
        { id: 'pack-esc-1', name: 'Maleta Individual Lacrada e Higiênica', description: 'Caixinha com talher biodegradável e guardanapo descartável', additional_price: 0, is_required: true, active: true },
        { id: 'pack-esc-2', name: 'Maleta Personalizada com Nome e Tema da Criança', description: 'Adesivo temático colorido com nome e idade do aniversariante', additional_price: 4, is_required: false, active: true },
      ],
      addons: [
        { id: 'add-esc-1', name: 'Kit Parabéns (Chapéu Festivo + Língua de Sogra por Aluno)', description: 'Adereços divertidos para cantar os parabéns na classe', price: 3.5, unit: 'kit/aluno', active: true },
        { id: 'add-esc-2', name: 'Vela Faísca Cintilante Especial', description: 'Vela cintilante segura para a hora dos parabéns', price: 8, unit: 'unidade', active: true },
      ]
    }
  ],

  variations: [
    {
      id: 'var-1',
      product_id: 'prod-bolo-vintage',
      name: 'Pequeno (15 a 18 fatias)',
      description: 'Diâmetro 15cm x 12cm de altura',
      price: 130,
      unit: 'unidade',
      lead_time: '48h',
      active: true
    },
    {
      id: 'var-2',
      product_id: 'prod-bolo-vintage',
      name: 'Médio (22 a 25 fatias)',
      description: 'Diâmetro 18cm x 12cm de altura',
      price: 175,
      unit: 'unidade',
      lead_time: '48h',
      active: true
    },
    {
      id: 'var-3',
      product_id: 'prod-bolo-vintage',
      name: 'Grande (30 a 35 fatias)',
      description: 'Diâmetro 22cm x 12cm de altura',
      price: 230,
      unit: 'unidade',
      lead_time: '72h',
      active: true
    },
    {
      id: 'var-4',
      product_id: 'prod-bento',
      name: 'Padrão (400g - até 4 porções)',
      description: 'Lancheira individual com vela e colher',
      price: 45,
      unit: 'unidade',
      lead_time: '24h',
      active: true
    }
  ],

  flavors: [
    {
      id: 'flav-1',
      name: 'Ninho com Morangos Frescos',
      description: 'Creme aveludado de Leite Ninho com pedaços de morango selecionado',
      additional_price: 0,
      category: 'Mais Pedidos',
      active: true
    },
    {
      id: 'flav-2',
      name: 'Red Velvet Supreme',
      description: 'Massa aveludada com recheio cremoso e geleia artesanal de frutas vermelhas',
      additional_price: 10,
      category: 'Especiais',
      active: true
    },
    {
      id: 'flav-3',
      name: 'Brigadeiro Belga 54% Callebaut',
      description: 'Chocolate meio amargo puro, textura aveludada e confeitos nobres',
      additional_price: 5,
      category: 'Mais Pedidos',
      active: true
    },
    {
      id: 'flav-4',
      name: 'Pistache Real & Framboesa',
      description: 'Pasta pura de pistache da Sicília com redução fresca de framboesas',
      additional_price: 18,
      category: 'Premium',
      active: true
    },
    {
      id: 'flav-5',
      name: 'Doce de Leite com Nozes Crocantes',
      description: 'Doce de leite cozido artesanalmente com nozes chilenas selecionadas',
      additional_price: 8,
      category: 'Clássicos',
      active: true
    },
    {
      id: 'flav-6',
      name: 'Quatro Leites Trufado',
      description: 'Combinação ultra suave de leite condensado, creme de leite, ninho e leite de coco',
      additional_price: 0,
      category: 'Mais Pedidos',
      active: true
    },
    {
      id: 'flav-7',
      name: 'Duo Chocolate & Maracujá',
      description: 'Equilíbrio marcante do chocolate intenso com ganache fresca de maracujá',
      additional_price: 5,
      category: 'Especiais',
      active: true
    },
    {
      id: 'flav-8',
      name: 'Abacaxi com Coco Cremoso',
      description: 'Cozimento lento do abacaxi em pedaços com beijinho suave de coco fresco',
      additional_price: 0,
      category: 'Clássicos',
      active: true
    }
  ],

  packaging: [
    {
      id: 'pack-1',
      name: 'Caixa de Transporte Segura Padrão',
      description: 'Caixa branca reforçada com visor transparente e berço protetor',
      additional_price: 0,
      is_required: true,
      active: true
    },
    {
      id: 'pack-2',
      name: 'Caixa Cartonada Luxo com Laço de Cetim',
      description: 'Estrutura rígida de papelaria fina personalizada com acabamento dourado',
      additional_price: 25,
      is_required: false,
      active: true
    },
    {
      id: 'pack-3',
      name: 'Embalagem Individual para Presente',
      description: 'Sacola premium da Doceria da Manu com tag afetiva personalizada',
      additional_price: 12,
      is_required: false,
      active: true
    }
  ],

  addons: [
    {
      id: 'addon-1',
      name: 'Topo de Bolo Personalizado (Nome & Idade em Acrílico/Papelaria)',
      description: 'Personalizado sob medida com tema e fontes elegantes',
      price: 25,
      unit: 'unidade',
      active: true
    },
    {
      id: 'addon-2',
      name: 'Aplicação de Folha de Ouro 24k Comestível',
      description: 'Detalhes dourados refinados para bolos comemorativos',
      price: 15,
      unit: 'aplicação',
      active: true
    },
    {
      id: 'addon-3',
      name: 'Forminhas Florais Premium (Quatro Pétalas)',
      description: 'Forminhas decorativas artesanais para mesa de doces',
      price: 20,
      unit: 'kit 50 un.',
      active: true
    },
    {
      id: 'addon-4',
      name: 'Cerejas Frescas / Morangos Extras no Topo',
      description: 'Finalização abundante com frutas vermelhas selecionadas',
      price: 18,
      unit: 'porção topo',
      active: true
    }
  ],

  chef: {
    name: 'Emanuelly Santos (Manu)',
    role: 'Chef Pâtissière & Educadora',
    photo: chefImg,
    bio: 'Olá! Eu sou a Emanuelly Santos — mas a maioria das pessoas me chama carinhosamente de Manu.',
    main_story: [
      'A Confeitaria nasceu na minha vida como uma forma genuína de transformar afeto, criatividade e precisão em momentos inesquecíveis. Para mim, um bolo nunca é apenas uma sobremesa: é o centro de uma celebração, a foto que fica guardada no álbum da família e o abraço doce entre quem se ama.',
      'Cada receita que sai do meu ateliê é elaborada artesanalmente com ingredientes nobres, sem gordura vegetal hidrogenada ou excesso desnecessário de açúcar. Meu compromisso é unir um sabor acolhedor a um acabamento estético impecável, seja em bolos vintage delicados, bentô cakes divertidos ou mesas completas de casamento.'
    ],
    highlight_quote: 'Açúcar, técnica e muito amor para transformar celebrações em memórias afetivas eternas.',
    instagram: 'https://www.instagram.com/adoceriadamanu/',
    experience_years: '+5 anos transformando festas',
    coverage_region: 'Atendendo com excelência toda a região de Paço do Lumiar e Grande São Luís.',
    checkpoints: [
      '+1.500 encomendas entregues com amor',
      'Doces frescos produzidos no dia do evento',
      'Cursos online para aspirantes a confeiteiras',
      'Atendimento humanizado e personalizado'
    ]
  },

  courses: [
    {
      id: 'course-planilha',
      title: 'Planilha Inteligente de Controle Financeiro & Precificação Automática',
      badge: 'Planilha Pronta',
      image: planilhaImg,
      description: 'Saiba exatamente quanto cobrar por seus produtos, quanto cada produto gera de lucro, padronize suas receitas, saiba o valor de sua hora trabalhada e muito mais de uma forma prática e fácil.',
      price: 'R$ 67,00 (Acesso Vitalício)',
      benefits: [
        'Cálculo Automático por Ingrediente com gramatura e perdas de produção',
        'Precificação da Hora Trabalhada + Custos Fixos (água, luz, gás, embalagens)',
        'Simulador de Margem de Lucro e Ponto de Equilíbrio real',
        'Controle Diário de Entradas, Saídas e Fluxo de Caixa do Atelier'
      ],
      platform: 'Excel & Google Planilhas',
      checkout_link: 'https://wa.me/5598991171456?text=Ol%C3%A1%2C%20Manu!%20Gostaria%20de%20adquirir%20a%20Planilha%20Inteligente%20de%20Controle%20Financeiro.',
      active: true,
      sort_order: 1
    }
  ],

  business_hours: [
    { weekday: 'segunda', day_label: 'Segunda-feira', is_open: true, open_time: '09:00', close_time: '19:00' },
    { weekday: 'terca', day_label: 'Terça-feira', is_open: true, open_time: '09:00', close_time: '19:00' },
    { weekday: 'quarta', day_label: 'Quarta-feira', is_open: true, open_time: '09:00', close_time: '19:00' },
    { weekday: 'quinta', day_label: 'Quinta-feira', is_open: true, open_time: '09:00', close_time: '19:00' },
    { weekday: 'sexta', day_label: 'Sexta-feira', is_open: true, open_time: '09:00', close_time: '19:00' },
    { weekday: 'sabado', day_label: 'Sábado', is_open: true, open_time: '09:00', close_time: '19:00' },
    { weekday: 'domingo', day_label: 'Domingo e Feriados', is_open: true, open_time: '09:00', close_time: '14:00' },
  ],

  pickup_windows: [
    { id: 'win-1', label: 'Manhã', time_range: '10:00 às 12:30', active: true },
    { id: 'win-2', label: 'Tarde', time_range: '15:00 às 17:30', active: true },
    { id: 'win-3', label: 'Início da Noite', time_range: '17:30 às 19:00', active: true },
  ],

  policies: {
    cancellation_rules: [
      {
        id: 'rule-1',
        days_range: '8 dias ou mais',
        rule_title: 'Cancelamento com 8 dias ou mais antes da data',
        description: '100% dos valores pagos serão devolvidos integralmente ao cliente.',
        badge_color: 'green'
      },
      {
        id: 'rule-2',
        days_range: '4 a 7 dias',
        rule_title: 'Cancelamento de 4 a 7 dias antes da data',
        description: '50% dos valores pagos retidos para custeio do material já investido na produção e os demais 50% convertidos em Carta de Crédito para novas compras.',
        badge_color: 'amber'
      },
      {
        id: 'rule-3',
        days_range: 'Até 3 dias',
        rule_title: 'Cancelamento com até 3 dias antes da data',
        description: '100% dos valores pagos serão retidos para custeio do material, insumos e reserva da vaga na agenda.',
        badge_color: 'rose'
      }
    ],
    care_guidelines: [
      'São produtos 100% artesanais, portanto podem ocorrer sutis discrepâncias em tons e acabamento manual: cada bolo é uma obra de arte singular e exclusiva.',
      'Bolos e sobremesas devem ser armazenados sob refrigeração contínua até 1 hora antes de servir. Validade média de 5 dias refrigerado.',
      'Mantenha sempre sobre uma superfície plana e firme, em ambiente fresco, ao abrigo do calor e da luz solar direta.'
    ],
    transport_guidelines: [
      'Não realizamos entregas próprias: todos os pedidos devem ser retirados presencialmente em nosso atelier mediante prévio agendamento de horário.',
      'A retirada pode ser feita por você ou motorista particular (Uber/99 táxi). É altamente recomendado o transporte exclusivo em carros com ar-condicionado ligado.',
      'EVITE MOTOS: motocicletas são instáveis, vibram excessivamente e geram altíssimo risco de queda ou dano estrutural irreparável aos bolos decorados.',
      'Transporte sempre no assoalho plano do veículo ou no colo do passageiro, mantendo a embalagem 100% nivelada e segura durante todo o trajeto.'
    ],
    order_notice: 'Encomendas sob medida com antecedência mínima de 48h a 72h.',
    payment_terms: 'Aceitamos Pix (confirmação imediata) e cartões de crédito. Sinal de 50% para confirmação e reserva da data na agenda, e 50% restante no ato da retirada ou entrega.'
  },

  faqs: [
    {
      id: 'faq-1',
      question: 'Com quantos dias de antecedência devo pedir meu bolo decorado?',
      answer: 'Para bolos decorados personalizados, kits festa e docinhos finos, recomendamos encomendar com antecedência mínima de 3 a 5 dias úteis, garantindo a sua data em nossa agenda de produção. Para datas especiais (fins de semana e feriados) ou casamentos, sugerimos antecedência de 15 a 30 dias. Para bentô cakes, consulte disponibilidade no WhatsApp para pedidos com 24h a 48h de antecedência.',
      sort_order: 1,
      active: true
    },
    {
      id: 'faq-2',
      question: 'Posso enviar uma foto de referência do Pinterest ou Instagram?',
      answer: 'Com certeza! Adoramos recriar ideias criativas! Você pode nos enviar imagens de inspiração pelo WhatsApp indicando cores, estilo (vintage, minimalista, floral, temático) e elementos desejados. Adaptamos a referência respeitando o estilo artesanal e afetivo da Doceria da Manu.',
      sort_order: 2,
      active: true
    },
    {
      id: 'faq-3',
      question: 'Quais são as formas de pagamento aceitas?',
      answer: 'Aceitamos Pix (com confirmação instantânea), transferência bancária e cartões de crédito (com possibilidade de parcelamento). O pedido é confirmado mediante sinal de 50% no fechamento e o restante na entrega ou retirada.',
      sort_order: 3,
      active: true
    },
    {
      id: 'faq-4',
      question: 'Como devo transportar e conservar o bolo até a hora da festa?',
      answer: 'O bolo deve ser transportado sempre no chão do carro (preferencialmente no lado do passageiro com ar-condicionado ligado), nunca no colo ou no banco inclinado. Mantenha em ambiente refrigerado e retire da geladeira cerca de 30 a 40 minutos antes de cantar os parabéns para que a massa e o recheio atinjam a cremosidade e textura ideais.',
      sort_order: 4,
      active: true
    }
  ],

  orders: [
    {
      id: 'order-sample-1',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      customer_name: 'Camila Mendes',
      product_name: 'Bolo Vintage Heart Cake',
      variation: 'Pequeno (15 a 18 fatias)',
      quantity: '1',
      flavors: ['Ninho com Morangos Frescos'],
      packaging: 'Caixa Cartonada Luxo com Laço de Cetim',
      addons: ['Aplicação de Folha de Ouro 24k Comestível'],
      date: '2026-10-18',
      delivery_type: 'retirada',
      location: 'Atelier Paço do Lumiar',
      notes: 'Tema vintage rosa claro com lacinhos vermelhos e frase Feliz Aniversário',
      estimated_total: 170,
      formatted_message: '*Pedido simulado*: Bolo Vintage Heart Cake (15 fatias) - Sabor Ninho com Morango'
    }
  ],

  updated_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  published_by: 'Emanuelly Santos'
};
