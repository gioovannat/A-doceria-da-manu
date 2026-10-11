export const CONTACT_INFO = {
  // Número oficial informado pelo cliente (+55 98 9117-1456 / com nono dígito 98 99117-1456)
  phoneDisplay: '+55 98 9117-1456',
  phoneFullDisplay: '(98) 99117-1456',
  whatsappNumber: '5598991171456',
  instagram: 'https://www.instagram.com/adoceriadamanu/',
  instagramHandle: '@adoceriadamanu',
  address: 'Av. Moacir Feitosa, 5 - Terra livre, São José de Ribamar - MA, 65122-783',
  city: 'São José de Ribamar - MA',
  hoursWeekday: 'Segunda – feira a Sábado: 09h às 19h',
  hoursWeekend: 'Domingos e Feriados: 09h às 14h',
  advanceNotice: 'Encomendas sob medida com antecedência mínima de 48h.',
  whatsappUrl: (message?: string) => {
    const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/5598991171456${textParam}`;
  }
};
