export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'mr' | 'te' | 'ml' | 'bn' | 'pa';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  fontFamily: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', fontFamily: 'Inter' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', fontFamily: 'Noto Sans Devanagari' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', fontFamily: 'Noto Sans Kannada' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', fontFamily: 'Noto Sans Tamil' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', fontFamily: 'Noto Sans Devanagari' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', fontFamily: 'Noto Sans Telugu' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', fontFamily: 'Noto Sans Malayalam' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', fontFamily: 'Noto Sans Bengali' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', fontFamily: 'Noto Sans Gurmukhi' },
];

export interface Translations {
  // Brand names (with transliteration)
  praapt: string;
  praaptTransliteration: string;
  communityKitchen: string;
  communityKitchenTransliteration: string;
  aadhaar: string;
  aadhaarTransliteration: string;
  
  // Welcome page
  welcome: string;
  enterAadhaarToBegin: string;
  start: string;
  selectLanguage: string;
  
  // Aadhaar entry page
  enterLast4Digits: string;
  delete: string;
  clear: string;
  needHelp: string;
  continue: string;
  registeredBeneficiaries: string;
  
  // Face scan page
  lookAtCamera: string;
  stayStill: string;
  cancel: string;
  
  // Verification pages
  verifying: string;
  identityVerified: string;
  namaste: string;
  
  // Food selection
  chooseYourMeal: string;
  mealsAvailableToday: string;
  riceDal: string;
  riceDalDesc: string;
  chapatiSabzi: string;
  chapatiSabziDesc: string;
  khichdi: string;
  khichdiDesc: string;
  pulao: string;
  pulaoDesc: string;
  
  // Success page
  mealConfirmed: string;
  tokenNumber: string;
  waitForToken: string;
  collectFromCounter: string;
  done: string;
  
  // Error pages
  noRecordFound: string;
  checkDigitsAndTryAgain: string;
  tryAgain: string;
  getHelp: string;
  
  faceNotMatched: string;
  lookDirectlyAndTryAgain: string;
  attemptOf: string;
  reenterDigits: string;
  
  // Help pages
  askVendorForHelp: string;
  theyCanAssist: string;
  vendorAssist: string;
  vendorPIN: string;
  pinNotRecognized: string;
  confirm: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    praapt: 'Praapt',
    praaptTransliteration: '',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: '',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: '',
    
    welcome: 'Welcome',
    enterAadhaarToBegin: 'Enter last 4 digits of Aadhaar to begin',
    start: 'Start',
    selectLanguage: 'Select language',
    
    enterLast4Digits: 'Enter last 4 digits of Aadhaar',
    delete: '← Delete',
    clear: 'Clear',
    needHelp: 'Need help?',
    continue: 'Continue',
    registeredBeneficiaries: 'Registered beneficiaries: enter your last 4 Aadhaar digits',
    
    lookAtCamera: 'Look at the camera',
    stayStill: 'Stay still and look directly at the camera',
    cancel: 'Cancel',
    
    verifying: 'Verifying...',
    identityVerified: 'Identity verified',
    namaste: 'Namaste',
    
    chooseYourMeal: 'Choose your meal',
    mealsAvailableToday: 'meals available today',
    riceDal: 'Rice & Dal',
    riceDalDesc: 'Steamed rice with lentil curry',
    chapatiSabzi: 'Chapati & Sabzi',
    chapatiSabziDesc: 'Wheat flatbread with vegetables',
    khichdi: 'Khichdi',
    khichdiDesc: 'Rice and lentil porridge',
    pulao: 'Pulao',
    pulaoDesc: 'Spiced rice with vegetables',
    
    mealConfirmed: 'Meal confirmed',
    tokenNumber: 'Token Number',
    waitForToken: 'Wait for your token to be called',
    collectFromCounter: 'Collect from the counter',
    done: 'Done',
    
    noRecordFound: 'No record found',
    checkDigitsAndTryAgain: 'Check the digits and try again, or ask for help',
    tryAgain: 'Try again',
    getHelp: 'Get help',
    
    faceNotMatched: 'Face not matched',
    lookDirectlyAndTryAgain: 'Look directly at camera and try again',
    attemptOf: 'Attempt',
    reenterDigits: 'Re-enter digits',
    
    askVendorForHelp: 'Ask the vendor for help',
    theyCanAssist: 'They can assist you with the next step',
    vendorAssist: 'Vendor assist',
    vendorPIN: 'Vendor PIN',
    pinNotRecognized: 'PIN not recognized. Try again.',
    confirm: 'Confirm',
  },
  
  hi: {
    praapt: 'Praapt',
    praaptTransliteration: 'प्राप्त',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: 'अन्नपूर्णा सामुदायिक रसोई',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: 'आधार',
    
    welcome: 'स्वागत है',
    enterAadhaarToBegin: 'शुरू करने के लिए आधार के अंतिम 4 अंक दर्ज करें',
    start: 'शुरू करें',
    selectLanguage: 'भाषा चुनें',
    
    enterLast4Digits: 'आधार के अंतिम 4 अंक दर्ज करें',
    delete: '← मिटाएं',
    clear: 'साफ करें',
    needHelp: 'मदद चाहिए?',
    continue: 'जारी रखें',
    registeredBeneficiaries: 'पंजीकृत लाभार्थी: अपने आधार के अंतिम 4 अंक दर्ज करें',
    
    lookAtCamera: 'कैमरे की ओर देखें',
    stayStill: 'स्थिर रहें और सीधे कैमरे की ओर देखें',
    cancel: 'रद्द करें',
    
    verifying: 'सत्यापन हो रहा है...',
    identityVerified: 'पहचान सत्यापित',
    namaste: 'नमस्ते',
    
    chooseYourMeal: 'अपना भोजन चुनें',
    mealsAvailableToday: 'भोजन आज उपलब्ध हैं',
    riceDal: 'चावल और दाल',
    riceDalDesc: 'उबले चावल के साथ दाल की करी',
    chapatiSabzi: 'चपाती और सब्जी',
    chapatiSabziDesc: 'गेहूं की रोटी के साथ सब्जियाँ',
    khichdi: 'खिचड़ी',
    khichdiDesc: 'चावल और दाल की खिचड़ी',
    pulao: 'पुलाव',
    pulaoDesc: 'मसालेदार चावल के साथ सब्जियाँ',
    
    mealConfirmed: 'भोजन की पुष्टि हुई',
    tokenNumber: 'टोकन नंबर',
    waitForToken: 'अपने टोकन की पुकार का इंतजार करें',
    collectFromCounter: 'काउंटर से लें',
    done: 'पूर्ण',
    
    noRecordFound: 'कोई रिकॉर्ड नहीं मिला',
    checkDigitsAndTryAgain: 'अंक जांचें और पुनः प्रयास करें, या सहायता मांगें',
    tryAgain: 'पुनः प्रयास करें',
    getHelp: 'सहायता लें',
    
    faceNotMatched: 'चेहरा मेल नहीं खाया',
    lookDirectlyAndTryAgain: 'सीधे कैमरे की ओर देखें और पुनः प्रयास करें',
    attemptOf: 'प्रयास',
    reenterDigits: 'अंक फिर से दर्ज करें',
    
    askVendorForHelp: 'विक्रेता से सहायता मांगें',
    theyCanAssist: 'वे अगले चरण में आपकी सहायता कर सकते हैं',
    vendorAssist: 'विक्रेता सहायता',
    vendorPIN: 'विक्रेता पिन',
    pinNotRecognized: 'पिन पहचाना नहीं गया। पुनः प्रयास करें।',
    confirm: 'पुष्टि करें',
  },
  
  kn: {
    praapt: 'Praapt',
    praaptTransliteration: 'ಪ್ರಾಪ್ತ',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: 'ಅನ್ನಪೂರ್ಣ ಸಮುದಾಯ ಅಡುಗೆಮನೆ',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: 'ಆಧಾರ',
    
    welcome: 'ಸ್ವಾಗತ',
    enterAadhaarToBegin: 'ಪ್ರಾರಂಭಿಸಲು ಆಧಾರದ ಕೊನೆಯ 4 ಅಂಕೆಗಳನ್ನು ನಮೂದಿಸಿ',
    start: 'ಪ್ರಾರಂಭಿಸಿ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    
    enterLast4Digits: 'ಆಧಾರದ ಕೊನೆಯ 4 ಅಂಕೆಗಳನ್ನು ನಮೂದಿಸಿ',
    delete: '← ಅಳಿಸಿ',
    clear: 'ತೆರವುಗೊಳಿಸಿ',
    needHelp: 'ಸಹಾಯ ಬೇಕೇ?',
    continue: 'ಮುಂದುವರಿಸಿ',
    registeredBeneficiaries: 'ನೋಂದಾಯಿತ ಫಲಾನುಭವಿಗಳು: ನಿಮ್ಮ ಆಧಾರದ ಕೊನೆಯ 4 ಅಂಕೆಗಳನ್ನು ನಮೂದಿಸಿ',
    
    lookAtCamera: 'ಕ್ಯಾಮೆರಾವನ್ನು ನೋಡಿ',
    stayStill: 'ಸ್ಥಿರವಾಗಿರಿ ಮತ್ತು ನೇರವಾಗಿ ಕ್ಯಾಮೆರಾವನ್ನು ನೋಡಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    
    verifying: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    identityVerified: 'ಗುರುತು ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    namaste: 'ನಮಸ್ತೆ',
    
    chooseYourMeal: 'ನಿಮ್ಮ ಊಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    mealsAvailableToday: 'ಊಟಗಳು ಇಂದು ಲಭ್ಯವಿದೆ',
    riceDal: 'ಅನ್ನ ಮತ್ತು ದಾಲ್',
    riceDalDesc: 'ಹಬ್ಬಿಸಿದ ಅನ್ನ ಮತ್ತು ದಾಲ್ ಕರಿ',
    chapatiSabzi: 'ಚಪಾತಿ ಮತ್ತು ಸಬ್ಜಿ',
    chapatiSabziDesc: 'ಗೋಧಿ ರೊಟ್ಟಿ ಮತ್ತು ತರಕಾರಿಗಳು',
    khichdi: 'ಖಿಚಡಿ',
    khichdiDesc: 'ಅನ್ನ ಮತ್ತು ದಾಲ್ ಗಂಜಿ',
    pulao: 'ಪುಲಾವ್',
    pulaoDesc: 'ಮಸಾಲೆ ಅನ್ನ ಮತ್ತು ತರಕಾರಿಗಳು',
    
    mealConfirmed: 'ಊಟ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    tokenNumber: 'ಟೋಕನ್ ಸಂಖ್ಯೆ',
    waitForToken: 'ನಿಮ್ಮ ಟೋಕನ್ ಕರೆಗಾಗಿ ನಿರೀಕ್ಷಿಸಿ',
    collectFromCounter: 'ಕೌಂಟರ್‌ನಿಂದ ಸಂಗ್ರಹಿಸಿ',
    done: 'ಮುಗಿದಿದೆ',
    
    noRecordFound: 'ಯಾವುದೇ ದಾಖಲೆ ಸಿಗಲಿಲ್ಲ',
    checkDigitsAndTryAgain: 'ಅಂಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ, ಅಥವಾ ಸಹಾಯ ಕೇಳಿ',
    tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    getHelp: 'ಸಹಾಯ ಪಡೆಯಿರಿ',
    
    faceNotMatched: 'ಮುಖ ಹೊಂದಿಕೆಯಾಗಲಿಲ್ಲ',
    lookDirectlyAndTryAgain: 'ನೇರವಾಗಿ ಕ್ಯಾಮೆರಾವನ್ನು ನೋಡಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    attemptOf: 'ಪ್ರಯತ್ನ',
    reenterDigits: 'ಅಂಕೆಗಳನ್ನು ಮರು-ನಮೂದಿಸಿ',
    
    askVendorForHelp: 'ಮಾರಾಟಗಾರನಿಂದ ಸಹಾಯ ಕೇಳಿ',
    theyCanAssist: 'ಅವರು ಮುಂದಿನ ಹಂತದಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು',
    vendorAssist: 'ಮಾರಾಟಗಾರ ಸಹಾಯ',
    vendorPIN: 'ಮಾರಾಟಗಾರ ಪಿನ್',
    pinNotRecognized: 'ಪಿನ್ ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    confirm: 'ದೃಢೀಕರಿಸಿ',
  },
  
  ta: {
    praapt: 'Praapt',
    praaptTransliteration: 'பிராப்த்',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: 'அன்னபூர்ணா சமுதாய சமையலறை',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: 'ஆதார்',
    
    welcome: 'வரவேற்பு',
    enterAadhaarToBegin: 'தொடங்க ஆதாரின் கடைசி 4 இலக்கங்களை உள்ளிடவும்',
    start: 'தொடங்கு',
    selectLanguage: 'மொழி தேர்வு',
    
    enterLast4Digits: 'ஆதாரின் கடைசி 4 இலக்கங்களை உள்ளிடவும்',
    delete: '← நீக்கு',
    clear: 'அழி',
    needHelp: 'உதவி தேவையா?',
    continue: 'தொடரவும்',
    registeredBeneficiaries: 'பதிவு செய்யப்பட்ட பயனாளிகள்: உங்கள் ஆதாரின் கடைசி 4 இலக்கங்களை உள்ளிடவும்',
    
    lookAtCamera: 'கேமராவைப் பாருங்கள்',
    stayStill: 'அசையாமல் நேராக கேமராவைப் பாருங்கள்',
    cancel: 'ரத்துசெய்',
    
    verifying: 'சரிபார்க்கப்படுகிறது...',
    identityVerified: 'அடையாளம் சரிபார்க்கப்பட்டது',
    namaste: 'வணக்கம்',
    
    chooseYourMeal: 'உங்கள் உணவைத் தேர்ந்தெடுங்கள்',
    mealsAvailableToday: 'உணவுகள் இன்று கிடைக்கின்றன',
    riceDal: 'சாதம் மற்றும் பருப்பு',
    riceDalDesc: 'வேகவைத்த சாதம் மற்றும் பருப்பு கறி',
    chapatiSabzi: 'சப்பாத்தி மற்றும் சப்ஜி',
    chapatiSabziDesc: 'கோதுமை ரொட்டி மற்றும் காய்கறிகள்',
    khichdi: 'கிச்சடி',
    khichdiDesc: 'சாதம் மற்றும் பருப்பு கஞ்சி',
    pulao: 'புலாவ்',
    pulaoDesc: 'மசாலா சாதம் மற்றும் காய்கறிகள்',
    
    mealConfirmed: 'உணவு உறுதிப்படுத்தப்பட்டது',
    tokenNumber: 'டோக்கன் எண்',
    waitForToken: 'உங்கள் டோக்கன் அழைக்கப்படும் வரை காத்திருங்கள்',
    collectFromCounter: 'கவுண்டரில் வாங்கவும்',
    done: 'முடிந்தது',
    
    noRecordFound: 'பதிவு காணப்படவில்லை',
    checkDigitsAndTryAgain: 'இலக்கங்களைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும், அல்லது உதவி கேளுங்கள்',
    tryAgain: 'மீண்டும் முயற்சிக்கவும்',
    getHelp: 'உதவி பெறுங்கள்',
    
    faceNotMatched: 'முகம் பொருந்தவில்லை',
    lookDirectlyAndTryAgain: 'நேராக கேமராவைப் பார்த்து மீண்டும் முயற்சிக்கவும்',
    attemptOf: 'முயற்சி',
    reenterDigits: 'இலக்கங்களை மீண்டும் உள்ளிடவும்',
    
    askVendorForHelp: 'விற்பனையாளரிடம் உதவி கேளுங்கள்',
    theyCanAssist: 'அவர்கள் அடுத்த படியில் உங்களுக்கு உதவலாம்',
    vendorAssist: 'விற்பனையாளர் உதவி',
    vendorPIN: 'விற்பனையாளர் பின்',
    pinNotRecognized: 'பின் அங்கீகரிக்கப்படவில்லை. மீண்டும் முயற்சிக்கவும்.',
    confirm: 'உறுதிப்படுத்து',
  },
  
  mr: {
    praapt: 'Praapt',
    praaptTransliteration: 'प्राप्त',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: 'अन्नपूर्णा सामुदायिक स्वयंपाकघर',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: 'आधार',
    
    welcome: 'स्वागत आहे',
    enterAadhaarToBegin: 'सुरू करण्यासाठी आधारचे शेवटचे 4 अंक प्रविष्ट करा',
    start: 'सुरू करा',
    selectLanguage: 'भाषा निवडा',
    
    enterLast4Digits: 'आधारचे शेवटचे 4 अंक प्रविष्ट करा',
    delete: '← हटवा',
    clear: 'साफ करा',
    needHelp: 'मदत हवी आहे का?',
    continue: 'पुढे चला',
    registeredBeneficiaries: 'नोंदणीकृत लाभार्थी: तुमचे आधारचे शेवटचे 4 अंक प्रविष्ट करा',
    
    lookAtCamera: 'कॅमेऱ्याकडे पहा',
    stayStill: 'स्थिर रहा आणि थेट कॅमेऱ्याकडे पहा',
    cancel: 'रद्द करा',
    
    verifying: 'पडताळणी होत आहे...',
    identityVerified: 'ओळख पडताळली',
    namaste: 'नमस्कार',
    
    chooseYourMeal: 'तुमचे जेवण निवडा',
    mealsAvailableToday: 'जेवण आज उपलब्ध आहेत',
    riceDal: 'तांदूळ आणि डाळ',
    riceDalDesc: 'वाफवलेला तांदूळ आणि डाळीची भाजी',
    chapatiSabzi: 'चपाती आणि भाजी',
    chapatiSabziDesc: 'गव्हाची भाकरी आणि भाज्या',
    khichdi: 'खिचडी',
    khichdiDesc: 'तांदूळ आणि डाळीची खिचडी',
    pulao: 'पुलाव',
    pulaoDesc: 'मसालेदार तांदूळ आणि भाज्या',
    
    mealConfirmed: 'जेवणाची पुष्टी झाली',
    tokenNumber: 'टोकन क्रमांक',
    waitForToken: 'तुमच्या टोकनच्या हाकेची प्रतीक्षा करा',
    collectFromCounter: 'काउंटरवरून घ्या',
    done: 'पूर्ण',
    
    noRecordFound: 'रेकॉर्ड सापडला नाही',
    checkDigitsAndTryAgain: 'अंक तपासा आणि पुन्हा प्रयत्न करा, किंवा मदत मागा',
    tryAgain: 'पुन्हा प्रयत्न करा',
    getHelp: 'मदत घ्या',
    
    faceNotMatched: 'चेहरा जुळला नाही',
    lookDirectlyAndTryAgain: 'थेट कॅमेऱ्याकडे पहा आणि पुन्हा प्रयत्न करा',
    attemptOf: 'प्रयत्न',
    reenterDigits: 'अंक पुन्हा प्रविष्ट करा',
    
    askVendorForHelp: 'विक्रेत्याकडून मदत मागा',
    theyCanAssist: 'ते पुढील चरणात तुम्हाला मदत करू शकतात',
    vendorAssist: 'विक्रेता सहाय्य',
    vendorPIN: 'विक्रेता पिन',
    pinNotRecognized: 'पिन ओळखला गेला नाही. पुन्हा प्रयत्न करा.',
    confirm: 'पुष्टी करा',
  },
  
  te: {
    praapt: 'Praapt',
    praaptTransliteration: 'ప్రాప్త',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: 'అన్నపూర్ణ కమ్యూనిటీ వంటగది',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: 'ఆధార్',
    
    welcome: 'స్వాగతం',
    enterAadhaarToBegin: 'ప్రారంభించడానికి ఆధార్ చివరి 4 అంకెలను నమోదు చేయండి',
    start: 'ప్రారంభించండి',
    selectLanguage: 'భాష ఎంచుకోండి',
    
    enterLast4Digits: 'ఆధార్ చివరి 4 అంకెలను నమోదు చేయండి',
    delete: '← తొలగించు',
    clear: 'క్లియర్ చేయండి',
    needHelp: 'సహాయం కావాలా?',
    continue: 'కొనసాగించు',
    registeredBeneficiaries: 'నమోదిత లబ్ధిదారులు: మీ ఆధార్ చివరి 4 అంకెలను నమోదు చేయండి',
    
    lookAtCamera: 'కెమెరా వైపు చూడండి',
    stayStill: 'నిశ్చలంగా ఉండి నేరుగా కెమెరా వైపు చూడండి',
    cancel: 'రద్దు చేయండి',
    
    verifying: 'ధృవీకరిస్తోంది...',
    identityVerified: 'గుర్తింపు ధృవీకరించబడింది',
    namaste: 'నమస్కారం',
    
    chooseYourMeal: 'మీ భోజనాన్ని ఎంచుకోండి',
    mealsAvailableToday: 'భోజనాలు నేడు అందుబాటులో ఉన్నాయి',
    riceDal: 'అన్నం మరియు పప్పు',
    riceDalDesc: 'ఆవిరి అన్నం మరియు పప్పు కూర',
    chapatiSabzi: 'చపాతీ మరియు కూరగాయలు',
    chapatiSabziDesc: 'గోధుమ రొట్టె మరియు కూరగాయలు',
    khichdi: 'ఖిచ్డీ',
    khichdiDesc: 'అన్నం మరియు పప్పు గంజి',
    pulao: 'పులావ్',
    pulaoDesc: 'మసాలా అన్నం మరియు కూరగాయలు',
    
    mealConfirmed: 'భోజనం నిర్ధారించబడింది',
    tokenNumber: 'టోకెన్ సంఖ్య',
    waitForToken: 'మీ టోకెన్ పిలవబడే వరకు వేచి ఉండండి',
    collectFromCounter: 'కౌంటర్ నుండి సేకరించండి',
    done: 'పూర్తయింది',
    
    noRecordFound: 'రికార్డు కనుగొనబడలేదు',
    checkDigitsAndTryAgain: 'అంకెలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి, లేదా సహాయం అడగండి',
    tryAgain: 'మళ్లీ ప్రయత్నించండి',
    getHelp: 'సహాయం పొందండి',
    
    faceNotMatched: 'ముఖం సరిపోలలేదు',
    lookDirectlyAndTryAgain: 'నేరుగా కెమెరా వైపు చూసి మళ్లీ ప్రయత్నించండి',
    attemptOf: 'ప్రయత్నం',
    reenterDigits: 'అంకెలను మళ్లీ నమోదు చేయండి',
    
    askVendorForHelp: 'విక్రేత నుండి సహాయం అడగండి',
    theyCanAssist: 'వారు తదుపరి దశలో మీకు సహాయం చేయగలరు',
    vendorAssist: 'విక్రేత సహాయం',
    vendorPIN: 'విక్రేత పిన్',
    pinNotRecognized: 'పిన్ గుర్తించబడలేదు. మళ్లీ ప్రయత్నించండి.',
    confirm: 'నిర్ధారించండి',
  },
  
  ml: {
    praapt: 'Praapt',
    praaptTransliteration: 'പ്രാപ്ത',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: 'അന്നപൂർണ കമ്മ്യൂണിറ്റി അടുക്കള',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: 'ആധാർ',
    
    welcome: 'സ്വാഗതം',
    enterAadhaarToBegin: 'ആരംഭിക്കാൻ ആധാറിന്റെ അവസാന 4 അക്കങ്ങൾ നൽകുക',
    start: 'ആരംഭിക്കുക',
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    
    enterLast4Digits: 'ആധാറിന്റെ അവസാന 4 അക്കങ്ങൾ നൽകുക',
    delete: '← മായ്ക്കുക',
    clear: 'ശുദ്ധമാക്കുക',
    needHelp: 'സഹായം വേണോ?',
    continue: 'തുടരുക',
    registeredBeneficiaries: 'രജിസ്റ്റർ ചെയ്ത ഗുണഭോക്താക്കൾ: നിങ്ങളുടെ ആധാറിന്റെ അവസാന 4 അക്കങ്ങൾ നൽകുക',
    
    lookAtCamera: 'ക്യാമറയിലേക്ക് നോക്കുക',
    stayStill: 'നിശ്ചലമായി നിന്ന് നേരെ ക്യാമറയിലേക്ക് നോക്കുക',
    cancel: 'റദ്ദാക്കുക',
    
    verifying: 'പരിശോധിക്കുന്നു...',
    identityVerified: 'ഐഡന്റിറ്റി പരിശോധിച്ചു',
    namaste: 'നമസ്കാരം',
    
    chooseYourMeal: 'നിങ്ങളുടെ ഭക്ഷണം തിരഞ്ഞെടുക്കുക',
    mealsAvailableToday: 'ഭക്ഷണങ്ങൾ ഇന്ന് ലഭ്യമാണ്',
    riceDal: 'ചോറും പരിപ്പും',
    riceDalDesc: 'ആവിയിൽ വേവിച്ച ചോറും പരിപ്പ് കറിയും',
    chapatiSabzi: 'ചപ്പാത്തിയും സബ്സിയും',
    chapatiSabziDesc: 'ഗോതമ്പ് റൊട്ടിയും പച്ചക്കറികളും',
    khichdi: 'ഖിച്ചഡി',
    khichdiDesc: 'ചോറും പരിപ്പും കഞ്ഞി',
    pulao: 'പുലാവ്',
    pulaoDesc: 'മസാല ചോറും പച്ചക്കറികളും',
    
    mealConfirmed: 'ഭക്ഷണം സ്ഥിരീകരിച്ചു',
    tokenNumber: 'ടോക്കൺ നമ്പർ',
    waitForToken: 'നിങ്ങളുടെ ടോക്കൺ വിളിക്കുന്നത് വരെ കാത്തിരിക്കുക',
    collectFromCounter: 'കൗണ്ടറിൽ നിന്ന് ശേഖരിക്കുക',
    done: 'പൂർത്തിയായി',
    
    noRecordFound: 'രേഖകളൊന്നും കണ്ടെത്തിയില്ല',
    checkDigitsAndTryAgain: 'അക്കങ്ങൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക, അല്ലെങ്കിൽ സഹായം ചോദിക്കുക',
    tryAgain: 'വീണ്ടും ശ്രമിക്കുക',
    getHelp: 'സഹായം നേടുക',
    
    faceNotMatched: 'മുഖം പൊരുത്തപ്പെട്ടില്ല',
    lookDirectlyAndTryAgain: 'നേരെ ക്യാമറയിലേക്ക് നോക്കി വീണ്ടും ശ്രമിക്കുക',
    attemptOf: 'ശ്രമം',
    reenterDigits: 'അക്കങ്ങൾ വീണ്ടും നൽകുക',
    
    askVendorForHelp: 'വിൽപ്പനക്കാരനോട് സഹായം ചോദിക്കുക',
    theyCanAssist: 'അവർക്ക് അടുത്ത ഘട്ടത്തിൽ നിങ്ങളെ സഹായിക്കാനാകും',
    vendorAssist: 'വിൽപ്പനക്കാരൻ സഹായം',
    vendorPIN: 'വിൽപ്പനക്കാരൻ പിൻ',
    pinNotRecognized: 'പിൻ തിരിച്ചറിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.',
    confirm: 'സ്ഥിരീകരിക്കുക',
  },
  
  bn: {
    praapt: 'Praapt',
    praaptTransliteration: 'প্রাপ্ত',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: 'অন্নপূর্ণা কমিউনিটি রান্নাঘর',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: 'আধার',
    
    welcome: 'স্বাগতম',
    enterAadhaarToBegin: 'শুরু করতে আধারের শেষ ৪টি সংখ্যা লিখুন',
    start: 'শুরু করুন',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    
    enterLast4Digits: 'আধারের শেষ ৪টি সংখ্যা লিখুন',
    delete: '← মুছুন',
    clear: 'পরিষ্কার করুন',
    needHelp: 'সাহায্য প্রয়োজন?',
    continue: 'চালিয়ে যান',
    registeredBeneficiaries: 'নিবন্ধিত সুবিধাভোগী: আপনার আধারের শেষ ৪টি সংখ্যা লিখুন',
    
    lookAtCamera: 'ক্যামেরার দিকে তাকান',
    stayStill: 'স্থির থাকুন এবং সরাসরি ক্যামেরার দিকে তাকান',
    cancel: 'বাতিল করুন',
    
    verifying: 'যাচাই করা হচ্ছে...',
    identityVerified: 'পরিচয় যাচাই করা হয়েছে',
    namaste: 'নমস্কার',
    
    chooseYourMeal: 'আপনার খাবার বেছে নিন',
    mealsAvailableToday: 'খাবার আজ উপলব্ধ',
    riceDal: 'ভাত এবং ডাল',
    riceDalDesc: 'ভাপানো ভাত এবং ডাল তরকারি',
    chapatiSabzi: 'চাপাতি এবং সবজি',
    chapatiSabziDesc: 'গমের রুটি এবং সবজি',
    khichdi: 'খিচুড়ি',
    khichdiDesc: 'ভাত এবং ডাল খিচুড়ি',
    pulao: 'পোলাও',
    pulaoDesc: 'মসলাযুক্ত ভাত এবং সবজি',
    
    mealConfirmed: 'খাবার নিশ্চিত করা হয়েছে',
    tokenNumber: 'টোকেন নম্বর',
    waitForToken: 'আপনার টোকেন ডাকার জন্য অপেক্ষা করুন',
    collectFromCounter: 'কাউন্টার থেকে সংগ্রহ করুন',
    done: 'সম্পন্ন',
    
    noRecordFound: 'কোনো রেকর্ড পাওয়া যায়নি',
    checkDigitsAndTryAgain: 'সংখ্যাগুলি পরীক্ষা করুন এবং আবার চেষ্টা করুন, অথবা সাহায্য চান',
    tryAgain: 'আবার চেষ্টা করুন',
    getHelp: 'সাহায্য নিন',
    
    faceNotMatched: 'মুখ মিলছে না',
    lookDirectlyAndTryAgain: 'সরাসরি ক্যামেরার দিকে তাকান এবং আবার চেষ্টা করুন',
    attemptOf: 'প্রচেষ্টা',
    reenterDigits: 'সংখ্যাগুলি পুনরায় লিখুন',
    
    askVendorForHelp: 'বিক্রেতার কাছে সাহায্য চান',
    theyCanAssist: 'তারা পরবর্তী ধাপে আপনাকে সাহায্য করতে পারবে',
    vendorAssist: 'বিক্রেতা সহায়তা',
    vendorPIN: 'বিক্রেতা পিন',
    pinNotRecognized: 'পিন চেনা যায়নি। আবার চেষ্টা করুন।',
    confirm: 'নিশ্চিত করুন',
  },
  
  pa: {
    praapt: 'Praapt',
    praaptTransliteration: 'ਪ੍ਰਾਪਤ',
    communityKitchen: 'Annapurna Community Kitchen',
    communityKitchenTransliteration: 'ਅੰਨਪੂਰਨਾ ਕਮਿਊਨਿਟੀ ਰਸੋਈ',
    aadhaar: 'Aadhaar',
    aadhaarTransliteration: 'ਆਧਾਰ',
    
    welcome: 'ਸੁਆਗਤ ਹੈ',
    enterAadhaarToBegin: 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਆਧਾਰ ਦੇ ਆਖਰੀ 4 ਅੰਕ ਦਰਜ ਕਰੋ',
    start: 'ਸ਼ੁਰੂ ਕਰੋ',
    selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    
    enterLast4Digits: 'ਆਧਾਰ ਦੇ ਆਖਰੀ 4 ਅੰਕ ਦਰਜ ਕਰੋ',
    delete: '← ਮਿਟਾਓ',
    clear: 'ਸਾਫ਼ ਕਰੋ',
    needHelp: 'ਮਦਦ ਚਾਹੀਦੀ ਹੈ?',
    continue: 'ਜਾਰੀ ਰੱਖੋ',
    registeredBeneficiaries: 'ਰਜਿਸਟਰਡ ਲਾਭਪਾਤਰੀ: ਆਪਣੇ ਆਧਾਰ ਦੇ ਆਖਰੀ 4 ਅੰਕ ਦਰਜ ਕਰੋ',
    
    lookAtCamera: 'ਕੈਮਰੇ ਵੱਲ ਦੇਖੋ',
    stayStill: 'ਸਥਿਰ ਰਹੋ ਅਤੇ ਸਿੱਧਾ ਕੈਮਰੇ ਵੱਲ ਦੇਖੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    
    verifying: 'ਤਸਦੀਕ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
    identityVerified: 'ਪਛਾਣ ਤਸਦੀਕ ਹੋਈ',
    namaste: 'ਨਮਸਤੇ',
    
    chooseYourMeal: 'ਆਪਣਾ ਖਾਣਾ ਚੁਣੋ',
    mealsAvailableToday: 'ਖਾਣਾ ਅੱਜ ਉਪਲਬਧ ਹੈ',
    riceDal: 'ਚੌਲ ਅਤੇ ਦਾਲ',
    riceDalDesc: 'ਭੁੰਨੇ ਹੋਏ ਚੌਲ ਅਤੇ ਦਾਲ ਕਰੀ',
    chapatiSabzi: 'ਚਪਾਤੀ ਅਤੇ ਸਬਜ਼ੀ',
    chapatiSabziDesc: 'ਕਣਕ ਦੀ ਰੋਟੀ ਅਤੇ ਸਬਜ਼ੀਆਂ',
    khichdi: 'ਖਿਚੜੀ',
    khichdiDesc: 'ਚੌਲ ਅਤੇ ਦਾਲ ਖਿਚੜੀ',
    pulao: 'ਪੁਲਾਓ',
    pulaoDesc: 'ਮਸਾਲੇਦਾਰ ਚੌਲ ਅਤੇ ਸਬਜ਼ੀਆਂ',
    
    mealConfirmed: 'ਖਾਣਾ ਪੁਸ਼ਟੀ ਹੋਇਆ',
    tokenNumber: 'ਟੋਕਨ ਨੰਬਰ',
    waitForToken: 'ਆਪਣੇ ਟੋਕਨ ਦੀ ਕਾਲ ਦੀ ਉਡੀਕ ਕਰੋ',
    collectFromCounter: 'ਕਾਊਂਟਰ ਤੋਂ ਲਓ',
    done: 'ਪੂਰਾ ਹੋਇਆ',
    
    noRecordFound: 'ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ',
    checkDigitsAndTryAgain: 'ਅੰਕ ਜਾਂਚੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ, ਜਾਂ ਮਦਦ ਮੰਗੋ',
    tryAgain: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    getHelp: 'ਮਦਦ ਲਓ',
    
    faceNotMatched: 'ਚਿਹਰਾ ਮੇਲ ਨਹੀਂ ਖਾਂਦਾ',
    lookDirectlyAndTryAgain: 'ਸਿੱਧਾ ਕੈਮਰੇ ਵੱਲ ਦੇਖੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    attemptOf: 'ਕੋਸ਼ਿਸ਼',
    reenterDigits: 'ਅੰਕ ਦੁਬਾਰਾ ਦਰਜ ਕਰੋ',
    
    askVendorForHelp: 'ਵਿਕਰੇਤਾ ਤੋਂ ਮਦਦ ਮੰਗੋ',
    theyCanAssist: 'ਉਹ ਅਗਲੇ ਕਦਮ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦੇ ਹਨ',
    vendorAssist: 'ਵਿਕਰੇਤਾ ਸਹਾਇਤਾ',
    vendorPIN: 'ਵਿਕਰੇਤਾ ਪਿੰਨ',
    pinNotRecognized: 'ਪਿੰਨ ਪਛਾਣਿਆ ਨਹੀਂ ਗਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    confirm: 'ਪੁਸ਼ਟੀ ਕਰੋ',
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export function getFontFamily(lang: Language): string {
  const config = LANGUAGES.find(l => l.code === lang);
  return config?.fontFamily || 'Inter';
}
