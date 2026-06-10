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

  // Se allowContacts è false, blocchiamo email, telefoni e link esterni
  if (!allowContacts) {
    // 2. Controllo Email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailRegex.test(text)) {
      return {
        isValid: false,
        errorMessage: "Non è consentito inserire indirizzi email prima dell'assegnazione del preventivo. Mantieni le comunicazioni all'interno della piattaforma per la tua sicurezza."
      };
    }

    // 3. Controllo Numeri di Telefono
    // Rimuove spazi, punti, trattini e slash per scovare i furbetti
    const normalizedText = text.replace(/[\s\-\.\/]/g, '');
    const phonePattern = /(?:(?:\+|00)[1-9]\d{0,2})?\d{9,11}/;
    
    if (phonePattern.test(normalizedText)) {
      return {
        isValid: false,
        errorMessage: "Non è consentito inserire numeri di telefono prima dell'accettazione del preventivo. Tutte le trattative preliminari devono svolgersi all'interno di CercArtigiano."
      };
    }

    // 4. Controllo Link Web / URL
    const urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    if (urlRegex.test(text)) {
      return {
        isValid: false,
        errorMessage: "Non è consentito inserire link o siti web esterni prima dell'accettazione del preventivo. Mantieni i contatti all'interno del portale."
      };
    }
  }

  return { isValid: true };
};
