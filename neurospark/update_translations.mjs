import fs from 'fs';

const newTranslations = {
  English: {},
  Hindi: {
    "You repeated my words! 🌟": "आपने मेरे शब्द दोहराए! 🌟",
    "Thanks for sharing! 🌟": "साझा करने के लिए धन्यवाद! 🌟"
  },
  Punjabi: {
    "You repeated my words! 🌟": "ਤੁਸੀਂ ਮੇਰੇ ਸ਼ਬਦ ਦੁਹਰਾਏ! 🌟",
    "Thanks for sharing! 🌟": "ਸਾਂਝਾ ਕਰਨ ਲਈ ਧੰਨਵਾਦ! 🌟"
  },
  Kannada: {
    "You repeated my words! 🌟": "ನೀವು ನನ್ನ ಮಾತುಗಳನ್ನು ಪುನರಾವರ್ತಿಸಿದ್ದೀರಿ! 🌟",
    "Thanks for sharing! 🌟": "ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! 🌟"
  },
  Tamil: {
    "You repeated my words! 🌟": "நீங்கள் என் வார்த்தைகளைத் திரும்பக் கூறினீர்கள்! 🌟",
    "Thanks for sharing! 🌟": "பகிர்ந்தமைக்கு நன்றி! 🌟"
  },
  Telugu: {
    "You repeated my words! 🌟": "మీరు నా మాటలను పునరావృతం చేశారు! 🌟",
    "Thanks for sharing! 🌟": "పంచుకున్నందుకు ధన్యవాదాలు! 🌟"
  },
  Marathi: {
    "You repeated my words! 🌟": "तुम्ही माझे शब्द पुन्हा उच्चारले! 🌟",
    "Thanks for sharing! 🌟": "सामायिक केल्याबद्दल धन्यवाद! 🌟"
  },
  Bengali: {
    "You repeated my words! 🌟": "তুমি আমার কথাগুলো পুনরাবৃত্তি করেছ! 🌟",
    "Thanks for sharing! 🌟": "ভাগ করে নেওয়ার জন্য ধন্যবাদ! 🌟"
  },
  Gujarati: {
    "You repeated my words! 🌟": "તમે મારા શબ્દોનું પુનરાવર્તન કર્યું! 🌟",
    "Thanks for sharing! 🌟": "શેર કરવા બદલ આભાર! 🌟"
  },
  Malayalam: {
    "You repeated my words! 🌟": "നിങ്ങൾ എന്റെ വാക്കുകൾ ആവർത്തിച്ചു! 🌟",
    "Thanks for sharing! 🌟": "പങ്കുവെച്ചതിന് നന്ദി! 🌟"
  },
  Odia: {
    "You repeated my words! 🌟": "ତୁମେ ମୋ କଥା ପୁନରାବୃତ୍ତି କଲ! 🌟",
    "Thanks for sharing! 🌟": "ଭାଗ କରିଥିବାରୁ ଧନ୍ୟବାଦ! 🌟"
  },
  Assamese: {
    "You repeated my words! 🌟": "তুমি মোৰ কথা পুনৰাবৃত্তি কৰিলা! 🌟",
    "Thanks for sharing! 🌟": "শ্বেয়াৰ কৰাৰ বাবে ধন্যবাদ! 🌟"
  }
}

import { translations as existing } from './src/utils/translations.js';

for (const [lang, dict] of Object.entries(newTranslations)) {
  if (!existing[lang]) existing[lang] = {};
  for (const [k, v] of Object.entries(dict)) {
    existing[lang][k] = v;
  }
}

const escapeString = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

let jsContent = "export const translations = {\n";
for (const [lang, dic] of Object.entries(existing)) {
  jsContent += `  ${lang}: {\n`;
  for (const [k, v] of Object.entries(dic)) {
    jsContent += `    '${escapeString(k)}': '${escapeString(v)}',\n`;
  }
  jsContent += "  },\n";
}
jsContent += "}\n\n";
jsContent += "export function tGlobal(key, lang) {\n";
jsContent += "  if (!lang || lang === 'English') return key\n";
jsContent += "  const dict = translations[lang]\n";
jsContent += "  if (!dict) return key\n";
jsContent += "  return dict[key] || key\n";
jsContent += "}\n";

fs.writeFileSync('./src/utils/translations.js', jsContent, 'utf-8');
console.log("Success!");
