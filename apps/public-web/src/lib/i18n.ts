// Internationalization configuration for public web form
export type Language = 'en' | 'am';

export interface Translations {
    [key: string]: {
        en: string;
        am: string;
    };
}

// Translation dictionary
export const translations: Translations = {
    // Main titles
    'title.main': {
        en: 'Ministry of Agriculture',
        am: 'የሀገር ግብርና ሚኒስቴር'
    },
    'title.subtitle': {
        en: 'Official Appointment Management System',
        am: 'ይፋዊ ምርጫ አስተዳደር ስርዓት'
    },
    'title.requestAppointment': {
        en: 'Request an Appointment',
        am: 'ምርጫ ያመልክቱ'
    },
    'title.fillDetails': {
        en: 'Fill in your details to schedule a meeting with our experts.',
        am: 'ከባለሙያዎቻችን ጋር ለመገናኘት ዝርዝሮትን ይሙሉ።'
    },
    'title.stayConnected': {
        en: 'Stay Connected',
        am: 'ተገናኝተው ይቆዩ'
    },
    'title.quickInstructions': {
        en: 'Quick Instructions:',
        am: 'ፈጣን መመሪያዎች:'
    },

    // Buttons and actions
    'button.goToForm': {
        en: 'Go to Appointment Form',
        am: 'ወደ ምርጫ ቅጽ ይሂዱ'
    },
    'button.backToQR': {
        en: 'Back to QR Code',
        am: 'ወደ QR ኮድ ተመለስ'
    },
    'button.submitRequest': {
        en: 'Submit Appointment Request',
        am: 'ምርጫ ጥያቄ ያስገቡ'
    },
    'button.submitting': {
        en: 'Submitting Request...',
        am: 'ጥያቄ እየቀረበ ነው...'
    },
    'button.clearFilters': {
        en: 'Clear all filters',
        am: 'ሁሉንም ማጣሪያዎች አጽዳ'
    },

    // Form labels
    'label.fullName': {
        en: 'Full Name *',
        am: 'ሙሉ ስም *'
    },
    'label.organization': {
        en: 'Organization',
        am: 'ድርጅት'
    },
    'label.email': {
        en: 'Email Address *',
        am: 'ኢሜይል አድራሻ *'
    },
    'label.suggestedTime': {
        en: 'Suggested Time *',
        am: 'የታሰበ ሰዓት *'
    },
    'label.mobile': {
        en: 'Mobile Number *',
        am: 'ሞባይል ቁጥር *'
    },
    'label.altMobile': {
        en: 'Alt Mobile',
        am: 'ተለዋጭ ሞባይል'
    },
    'label.country': {
        en: 'Country *',
        am: 'ሀገር *'
    },
    'label.city': {
        en: 'City *',
        am: 'ከተማ *'
    },
    'label.issueDescription': {
        en: 'Issue Description *',
        am: 'የጉዳይ መግለጫ *'
    },

    // Form placeholders
    'placeholder.name': {
        en: 'John Doe',
        am: 'የሰው ስም'
    },
    'placeholder.organization': {
        en: 'Company Ltd',
        am: 'ኩባንያ ሲሚት'
    },
    'placeholder.email': {
        en: 'john@example.com',
        am: 'ሰው@ምሳሌ.ኮም'
    },
    'placeholder.mobile': {
        en: '+1 234 567 8900',
        am: '+251 91 234 5678'
    },
    'placeholder.altMobile': {
        en: '+1 234 567 8901',
        am: '+251 92 345 6789'
    },
    'placeholder.country': {
        en: 'USA',
        am: 'ኢትዮጵያ'
    },
    'placeholder.city': {
        en: 'New York',
        am: 'አዲስ አበባ'
    },
    'placeholder.issueDescription': {
        en: 'Please describe the issue or reason for the appointment in detail...',
        am: 'እባክዎ የጉዳዩን ወይም የምርጫውን ምክንያት በዝርዝር ይግለጹ...'
    },
    'placeholder.explainWhy': {
        en: 'Explain why the appointment is being moved...',
        am: 'ምርጫው ለምን እንደሚንቀሳቀስ ያብራሩ...'
    },

    // Status messages
    'status.scanToAccess': {
        en: 'Scan to access on mobile',
        am: 'በሞባይል ለመድረስ ይቃኙ'
    },
    'status.orScan': {
        en: 'Or scan the QR code to continue on your mobile device.',
        am: 'ወይም QR ኮዱን በሞባይልዎ ላይ ለመቀጠል ይቃኙ።'
    },
    'status.completeFields': {
        en: 'Complete all required fields (*)',
        am: 'ሁሉንም አስፈላጊ መስኮች (*) ይሙሉ'
    },
    'status.submitAndWait': {
        en: 'Submit and wait for confirmation',
        am: 'ያስገቡ እና ለማረጋገጫ ይጠብቁ'
    },
    'status.keepPage': {
        en: 'Keep this page or QR for reference',
        am: 'ለማጣቀሻ ይህን ገጽ ወይም QR ይቆጠቡ'
    },
    'status.submissionSuccessful': {
        en: 'Submission Successful!',
        am: 'ማስገቢያ ተሳክቷል!'
    },
    'status.referenceId': {
        en: 'Reference ID:',
        am: 'የማጣቀሻ መታወቂያ:'
    },
    'status.captchaNotLoaded': {
        en: 'CAPTCHA not loaded. Please refresh the page.',
        am: 'CAPTCHA አልተጫነም። እባክዎ ገጹን ያድሱ።'
    },
    'status.submissionFailed': {
        en: 'Submission failed',
        am: 'ማስገቢያ አልተሳካም'
    },
    'status.unexpectedError': {
        en: 'An unexpected error occurred',
        am: 'ያልተጠበቀ ስህተት ተከስቷል'
    },

    // Legal and security
    'legal.protectedBy': {
        en: 'Protected by reCAPTCHA. Google',
        am: 'በ reCAPTCHA የተጠበቀ። ጉግል'
    },
    'legal.privacy': {
        en: 'Privacy',
        am: 'ግላዊነት'
    },
    'legal.terms': {
        en: 'Terms',
        am: 'ሁኔታዎች'
    },
    'legal.apply': {
        en: 'apply.',
        am: 'ተፈጻሚ ይሆናል።'
    },

    // Language selector
    'language.english': {
        en: 'English',
        am: 'እንግሊዝኛ'
    },
    'language.amharic': {
        en: 'Amharic',
        am: 'አማርኛ'
    },
    'language.select': {
        en: 'Select Language',
        am: 'ቋንቋ ይምረጡ'
    }
};

// Language context utilities
export const getTranslation = (key: string, language: Language): string => {
    return translations[key]?.[language] || key;
};

export const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('language');
        if (saved === 'en' || saved === 'am') {
            return saved;
        }
    }
    return 'en';
};