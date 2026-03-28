// Internationalization configuration for admin dashboard
export type Language = 'en' | 'am';

export interface Translations {
    [key: string]: {
        en: string;
        am: string;
    };
}

// Translation dictionary
export const translations: Translations = {
    // Navigation
    'nav.all': {
        en: 'All Requests',
        am: 'ሁሉም ጥያቄዎች'
    },
    'nav.today': {
        en: 'Today',
        am: 'ዛሬ'
    },
    'nav.tomorrow': {
        en: 'Tomorrow',
        am: 'ነገ'
    },
    'nav.upcoming': {
        en: 'Upcoming',
        am: 'የሚመጡ'
    },
    'nav.history': {
        en: 'History',
        am: 'ታሪክ'
    },
    'nav.upcomingSub': {
        en: 'Upcoming',
        am: 'የሚመጡ'
    },
    'nav.late': {
        en: 'Late',
        am: 'ዘግይቷል'
    },

    // Titles and headers
    'title.main': {
        en: 'Ministry Appointments',
        am: 'ሚኒስቴር ምርጫዎች'
    },
    'title.subtitle': {
        en: 'Monitoring and managing official requests',
        am: 'ይፋዊ ጥያቄዎችን መከታተል እና ማስተዳደር'
    },
    'title.totalRequests': {
        en: 'Total Requests',
        am: 'አጠቃላይ ጥያቄዎች'
    },

    // Search and filters
    'search.placeholder': {
        en: 'Search by name, email, or mobile...',
        am: 'በስም፣ በኢሜይል ወይም በሞባይል ፈልግ...'
    },
    'filter.allStatuses': {
        en: 'All Statuses',
        am: 'ሁሉም ሁኔታዎች'
    },
    'filter.requested': {
        en: 'Requested',
        am: 'ተጠይቋል'
    },
    'filter.confirmed': {
        en: 'Confirmed',
        am: 'አረጋግጧል'
    },
    'filter.rescheduled': {
        en: 'Rescheduled',
        am: 'ተለውጧል'
    },
    'filter.completed': {
        en: 'Completed',
        am: 'ተጠናቅቋል'
    },
    'page.of': {
        en: 'Page',
        am: 'ገጽ'
    },

    // Appointment details
    'appointment.inquiryContext': {
        en: 'Inquiry Context',
        am: 'የጥያቄ አውድ'
    },
    'appointment.finalizedSchedule': {
        en: 'Finalized Schedule',
        am: 'የመጨረሻ መርሃ ግብር'
    },
    'appointment.requestedSchedule': {
        en: 'Requested Schedule',
        am: 'የተጠየቀ መርሃ ግብር'
    },
    'appointment.approveRequest': {
        en: 'Approve Request',
        am: 'ጥያቄን ያረጋግጡ'
    },
    'appointment.modifySchedule': {
        en: 'Modify Schedule',
        am: 'መርሃ ግብር ይቀይሩ'
    },
    'appointment.rescheduleNote': {
        en: 'Reschedule Note:',
        am: 'የመርሃ ግብር ማስተካከያ ማስታወሻ:'
    },

    // Modals
    'modal.modifySchedule': {
        en: 'Modify Schedule',
        am: 'መርሃ ግብር ይቀይሩ'
    },
    'modal.resettingFor': {
        en: 'Resetting appointment for',
        am: 'ምርጫ ለ'
    },
    'modal.newDateTime': {
        en: 'New Date & Time',
        am: 'አዲስ ቀን እና ሰዓት'
    },
    'modal.rescheduleReason': {
        en: 'Reschedule Reason / Notes (Optional)',
        am: 'የመርሃ ግብር ማስተካከያ ምክንያት / ማስታወሻዎች (አማራጭ)'
    },
    'modal.explainWhy': {
        en: 'Explain why the appointment is being moved...',
        am: 'ምርጫው ለምን እንደሚንቀሳቀስ ያብራሩ...'
    },
    'modal.sendEmail': {
        en: 'Send email notification to appointee',
        am: 'ለተመደበው ሰው ኢሜይል ማሳወቂያ ይላኩ'
    },
    'modal.impactedInquiry': {
        en: 'Impacted Inquiry',
        am: 'የተጎዱ ጥያቄዎች'
    },
    'modal.cancel': {
        en: 'Cancel',
        am: 'ሰርዝ'
    },
    'modal.updateNotify': {
        en: 'Update & Notify',
        am: 'አዘምን እና አሳውቅ'
    },

    // Status messages
    'status.synchronizing': {
        en: 'Synchronizing Data...',
        am: 'ውሂብ እየተስተካከለ ነው...'
    },
    'status.noResults': {
        en: 'No results found matching your filters.',
        am: 'ከማጣሪያዎችዎ ጋር የሚስማሙ ውጤቶች አልተገኙም።'
    },
    'status.clearFilters': {
        en: 'Clear all filters',
        am: 'ሁሉንም ማጣሪያዎች አጽዳ'
    },
    'status.showing': {
        en: 'Showing',
        am: 'እየታየ'
    },
    'status.of': {
        en: 'of',
        am: 'ከ'
    },
    'status.entries': {
        en: 'entries',
        am: 'መዝገቦች'
    },
    'status.previous': {
        en: 'Previous',
        am: 'ቀዳሚ'
    },
    'status.next': {
        en: 'Next',
        am: 'ቀጣይ'
    },

    // Theme toggle
    'theme.toggle': {
        en: 'Toggle Theme',
        am: 'ገጽታ ቀይር'
    },
    'theme.refresh': {
        en: 'Refresh Data',
        am: 'ውሂብ አድስ'
    },

    // Appointment status labels
    'appointment.confirmedTime': {
        en: 'Confirmed Time',
        am: 'የተረጋገጠ ሰዓት'
    },
    'appointment.suggestedTime': {
        en: 'Suggested Time',
        am: 'የታሰበ ሰዓት'
    },

    // Error/empty states
    'error.noResults': {
        en: 'No results found matching your filters.',
        am: 'ከማጣሪያዎችዎ ጋር የሚስማሙ ውጤቶች አልተገኙም።'
    },
    'error.clearFilters': {
        en: 'Clear all filters',
        am: 'ሁሉንም ማጣሪያዎች አጽዳ'
    },

    // Pagination
    'pagination.showing': {
        en: 'Showing',
        am: 'እየታየ'
    },
    'pagination.of': {
        en: 'of',
        am: 'ከ'
    },
    'pagination.entries': {
        en: 'entries',
        am: 'መዝገቦች'
    },
    'pagination.previous': {
        en: 'Previous',
        am: 'ቀዳሚ'
    },
    'pagination.next': {
        en: 'Next',
        am: 'ቀጣይ'
    },

    // Timer
    'timer.now': {
        en: 'Now',
        am: 'አሁን'
    },
    'timer.in': {
        en: 'in',
        am: 'በ'
    },
    'timer.ago': {
        en: 'ago',
        am: 'በፊት'
    },

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