export const validateMessage = (text: string, allowContacts: boolean = false): { isValid: boolean; errorMessage?: string } => {
  if (!text) return { isValid: true };
  
  // 1. Controllo Parole Offensive (Sempre attivo)
  const offensiveWords = [
    'cazzo', 'stronzo', 'stronza', 'merda', 'puttana', 'troia', 
    'fanculo', 'coglione', 'coglioni', 'bastardo', 'bastarda', 
    'vaffanculo', 'zoccola', 'mignotta'
  ];
  
  const lowerText = text.toLowerCase();
  for (const word of offensiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return {
        isValid: false,
        errorMessage: "Il tuo messaggio contiene un linguaggio non appropriato. Per favore, mantieni un tono professionale."
      };
    }
  }

  // Se allowContacts è false, blocchiamo email e telefoni
  if (!allowContacts) {
    // 2. Controllo Email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailRegex.test(text)) {
      return {
        isValid: false,
        errorMessage: "Non è consentito inserire indirizzi email nei messaggi prima dell'assegnazione. Per favore, mantieni le comunicazioni all'interno della piattaforma."
      };
    }

    // 3. Controllo Numeri di Telefono
    // Rimuove spazi, punti, trattini e slash per scovare i furbetti
    const normalizedText = text.replace(/[\s\-\.\/]/g, '');
    const phonePattern = /(?:(?:\+|00)[1-9]\d{0,2})?\d{9,11}/;
    
    if (phonePattern.test(normalizedText)) {
      return {
        isValid: false,
        errorMessage: "Non è consentito inserire numeri di telefono nei messaggi prima dell'assegnazione. Tutte le trattative devono svolgersi all'interno di CercArtigiano."
      };
    }
  }

  return { isValid: true };
};
