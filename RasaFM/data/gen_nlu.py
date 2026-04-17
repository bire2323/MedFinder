import random
import re
import os

raw_drugs_file = "c:/active/MedFinder/rasa_ready_drugs.txt"

# Noise to filter
noise = {
    'acid reducer', 'air', 'alcohol', 'alfalfa', 'axe', 'calm mood', 'dollar general', 'dove',
    'equate nicotine', 'leader ibuprofen', 'magsoothium cbd body', 'medline', 'purelax',
    'quick action', 'rescue sleep', 'roasted', 'saint', 'silvaplex throat', 'stay awake',
    'unishield triple antibiotic', 'vicks childrens vaporub', 'whitening', 'x-ray', 'anti itch',
    'anticavity rinse', 'antacid', 'antacid tablets', 'burn ease', 'pediculicide', 'petroleum jelly',
    'leader', 'equate'
}

# Read and clean
with open(raw_drugs_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

drugs_set = set()
for line in lines:
    line = line.strip().lower()
    if not line: continue
    
    # split 'and' for combinations
    parts = re.split(r'\s+and\s+', line)
    for p in parts:
        p = p.strip()
        # remove prefixes/suffixes
        p = p.replace(' hydrobromide', '').replace(' hydrochloride', '').replace(' besylate', '')\
            .replace(' maleate', '').replace(' calcium', '').replace(' sodium', '').replace(' sulfate', '')\
            .replace(' hcl', '').replace(' anhydrous', '').replace(' citrate', '').replace(' acetate', '')\
            .strip()
        
        # clean unwanted chars
        p = re.sub(r'[^a-z0-9\s-]', '', p).strip()
        
        if len(p) > 2 and p not in noise and ' ' not in p: # keep single words
             drugs_set.add(p)
        elif len(p) > 2 and p not in noise:
             # Keep up to 2 words max
             if len(p.split()) <= 2:
                 drugs_set.add(p)

additional_drugs = {
    'paracetamol', 'amoxicillin', 'ibuprofen', 'azithromycin', 'ciprofloxacin', 'omeprazole',
    'metformin', 'losartan', 'amlodipine', 'atorvastatin', 'levothyroxine', 'lisinopril',
    'albuterol', 'gabapentin', 'sertraline', 'fluoxetine', 'citalopram', 'pantoprazole', 'tramadol',
    'clonazepam', 'lorazepam', 'alprazolam', 'cyclobenzaprine', 'trazodone', 'duloxetine',
    'venlafaxine', 'escitalopram', 'ranitidine', 'famotidine', 'cetirizine', 'loratadine',
    'fexofenadine', 'diphenhydramine', 'diclofenac', 'naproxen', 'meloxicam', 'celecoxib',
    'hydrochlorothiazide', 'furosemide', 'spironolactone', 'carvedilol', 'metoprolol', 'atenolol',
    'propranolol', 'clopidogrel', 'warfarin', 'apixaban', 'rivaroxaban', 'rosuvastatin', 'simvastatin',
    'pravastatin', 'ezetimibe', 'fenofibrate', 'glipizide', 'glimepiride', 'sitagliptin',
    'empagliflozin', 'dapagliflozin', 'insulin glargine', 'insulin lispro', 'insulin aspart',
    'levofloxacin', 'doxycycline', 'cephalexin', 'clindamycin', 'sulfamethoxazole', 'trimethoprim',
    'nitrofurantoin', 'metronidazole', 'fluconazole', 'valacyclovir', 'acyclovir', 'montelukast',
    'fluticasone', 'budesonide', 'tiotropium', 'ondansetron', 'promethazine', 'metoclopramide',
    'lansoprazole', 'esomeprazole', 'dicyclomine', 'tamsulosin', 'finasteride', 'sildenafil',
    'tadalafil', 'allopurinol', 'colchicine', 'methotrexate', 'hydroxychloroquine', 'prednisone',
    'methylprednisolone', 'dexamethasone', 'hydrocortisone', 'chlorpheniramine', 'pseudoephedrine',
    'guaifenesin', 'dextromethorphan', 'benzonatate', 'cephalosporin', 'penicillin', 'erythromycin',
    'tetracycline', 'aspirin', 'acetaminophen', 'panadol', 'tylenol', 'advil', 'motrin', 'brufen',
    'zithromax', 'cipro', 'prilosec', 'glucophage', 'cozaar', 'norvasc', 'lipitor', 'synthroid',
    'prinivil', 'zestril', 'ventolin', 'proventil', 'neurontin', 'zoloft', 'prozac', 'celexa',
    'protonix', 'ultram', 'klonopin', 'ativan', 'xanax', 'flexeril', 'desyrel', 'cymbalta', 'effexor',
    'lexapro', 'zantac', 'pepcid', 'zyrtec', 'claritin', 'allegra', 'benadryl', 'voltaren', 'aleve',
    'mobic', 'celebrex', 'microzide', 'lasix', 'aldactone', 'coreg', 'lopressor', 'tenormin', 'inderal',
    'plavix', 'coumadin', 'eliquis', 'xarelto', 'crestor', 'zocor', 'pravachol', 'zetia', 'tricor',
    'glucotrol', 'amaryl', 'januvia', 'jardiance', 'farxiga', 'lantus', 'humalog', 'novolog',
    'levaquin', 'vibramycin', 'keflex', 'cleocin', 'bactrim', 'septra', 'macrobid', 'flagyl', 'diflucan',
    'valtrex', 'zovirax', 'singulair', 'flonase', 'pulmicort', 'spiriva', 'zofran', 'phenergan', 'reglan',
    'prevacid', 'nexium', 'bentyl', 'flomax', 'proscar', 'viagra', 'cialis', 'zyloprim', 'colcrys',
    'trexall', 'plaquenil', 'deltasone', 'medrol', 'decadron', 'cortef', 'chlor trimeton', 'sudafed',
    'mucinex', 'delsym', 'tessalon'
}

drugs_set.update(additional_drugs)

amharic_transliterations = {
    'paracetamol': 'ፓራሰታሞል',
    'ibuprofen': 'ኢቡፕሮፌን',
    'amoxicillin': 'አሞክሲሲሊን',
    'azithromycin': 'አዚትሮማይሲን',
    'ciprofloxacin': 'ሲፕሮፍሎክሳሲን',
    'diclofenac': 'ዳይክሎፌናክ',
    'omeprazole': 'ኦሜፕራዞል',
    'aspirin': 'አስፕሪን',
    'metformin': 'ሜትፎርሚን',
    'insulin': 'ኢንሱሊን',
    'panadol': 'ፓናዶል',
    'tylenol': 'ታይለኖል',
    'advil': 'አድቪል',
    'tramadol': 'ትራማዶል',
    'losartan': 'ሎሳርታን',
    'amlodipine': 'አምሎዲፒን',
    'atorvastatin': 'አቶርቫስታቲን',
    'levothyroxine': 'ሌቮታይሮክሲን',
    'lisinopril': 'ሊሲኖፕሪል',
    'albuterol': 'አልቡቴሮል',
    'gabapentin': 'ጋባፔንቲን',
    'sertraline': 'ሰርትራሊን',
    'fluoxetine': 'ፍሉኦክሴቲን',
    'citalopram': 'ሲታሎፕራም',
    'pantoprazole': 'ፓንቶፕራዞል',
    'clonazepam': 'ክሎናዜፓም',
    'lorazepam': 'ሎራዜፓም',
    'alprazolam': 'አልፕራዞላም',
    'cyclobenzaprine': 'ሳይክሎቤንዛፕሪን',
    'trazodone': 'ትራዞዶን',
    'duloxetine': 'ዱሎክሴቲን',
    'venlafaxine': 'ቬንላፋክሲን',
    'escitalopram': 'ኤስሲታሎፕራም',
    'ranitidine': 'ራኒቲዲን',
    'famotidine': 'ፋሞቲዲን',
    'cetirizine': 'ሴቲሪዚን',
    'loratadine': 'ሎራታዲን',
    'fexofenadine': 'ፌክሶፌናዲን',
    'diphenhydramine': 'ዳይፌንሀይድራሚን',
    'naproxen': 'ናፕሮክሲን',
    'meloxicam': 'ሜሎክሲካም',
    'celecoxib': 'ሴሌኮክሲብ',
    'hydrochlorothiazide': 'ሀይድሮክሎሮቲያዛይድ',
    'furosemide': 'ፉሮሴማይድ',
    'spironolactone': 'ስፒሮኖላክቶን',
    'carvedilol': 'ካርቬዲሎል',
    'metoprolol': 'ሜቶፕሮሎል',
    'atenolol': 'አቴኖሎል',
    'propranolol': 'ፕሮፕራኖሎል',
    'clopidogrel': 'ክሎፒዶግሬል',
    'warfarin': 'ዋርፋሪን',
    'apixaban': 'አፒክሳባን',
    'rivaroxaban': 'ሪቫሮክሳባን',
    'rosuvastatin': 'ሮሱቫስታቲን',
    'simvastatin': 'ሲምቫስታቲን',
    'pravastatin': 'ፕራቫስታቲን',
    'ezetimibe': 'ኢዜቲሚብ',
    'fenofibrate': 'ፌኖፊብሬት',
    'glipizide': 'ግሊፒዛይድ',
    'glimepiride': 'ግሊሜፒራይድ',
    'sitagliptin': 'ሲታግሊፕቲን',
    'empagliflozin': 'ኤምፓግሊፍሎዚን',
    'dapagliflozin': 'ዳፓግሊፍሎዚን',
    'levofloxacin': 'ሌቮፍሎክሳሲን',
    'doxycycline': 'ዶክሲሳይክሊን',
    'cephalexin': 'ሴፋሌክሲን',
    'clindamycin': 'ክሊንዳማይሲን',
    'sulfamethoxazole': 'ሰልፋሜቶክሳዞል',
    'trimethoprim': 'ትራይሜቶፕሪም',
    'nitrofurantoin': 'ኒትሮፉራንቶይን',
    'metronidazole': 'ሜትሮኒዳዞል',
    'fluconazole': 'ፍሉኮናዞል',
    'valacyclovir': 'ቫላሳይክሎቪር',
    'acyclovir': 'አሳይክሎቪር',
    'montelukast': 'ሞንቴሉካስት',
    'fluticasone': 'ፍሉቲካሶን',
    'budesonide': 'ቡዴሶኒድ',
    'tiotropium': 'ቲዮትሮፒየም',
    'ondansetron': 'ኦንዳንሴትሮን',
    'promethazine': 'ፕሮሜታዚን',
    'metoclopramide': 'ሜቶክሎፕራማይድ',
    'lansoprazole': 'ላንሶፕራዞል',
    'esomeprazole': 'ኢሶሜፕራዞል',
    'dicyclomine': 'ዳይሳይክሎሚን',
    'tamsulosin': 'ታምሱሎሲን',
    'finasteride': 'ፊናስቴራይድ',
    'sildenafil': 'ሲልዴናፊል',
    'tadalafil': 'ታዳላፊል',
    'allopurinol': 'አሎፑሪኖል',
    'colchicine': 'ኮልቺሲን',
    'methotrexate': 'ሜቶትሬክሳቴ',
    'hydroxychloroquine': 'ሃይድሮክሲክሎሮኩዊን',
    'prednisone': 'ፕሬድኒሶን',
    'methylprednisolone': 'ሜቲልፕሬድኒሶሎን',
    'dexamethasone': 'ዴክሳሜታሶን',
    'hydrocortisone': 'ሃይድሮኮርቲሶን',
    'chlorpheniramine': 'ክሎሮፌኒራሚን',
    'pseudoephedrine': 'ሱዶኢፌድሪን',
    'guaifenesin': 'ጓይፌኔሲን',
    'dextromethorphan': 'ዴክስትሮሜቶርፋን',
    'benzonatate': 'ቤንዞናታቴ',
    'cephalosporin': 'ሴፋሎስፖሪን',
    'penicillin': 'ፔኒሲሊን',
    'erythromycin': 'ኤሪትሮማይሲን',
    'tetracycline': 'ቴትራሳይክሊን',
    'acetaminophen': 'አሴታሚኖፌን'
}

synonyms = {
    'paracetamol': ['acetaminophen', 'panadol', 'tylenol', 'ፓራሰታሞል', 'አሴታሚኖፌን', 'ፓናዶል', 'ታይለኖል'],
    'ibuprofen': ['advil', 'motrin', 'brufen', 'ኢቡፕሮፌን', 'አድቪል'],
    'amoxicillin': ['amoxil', 'አሞክሲሲሊን'],
    'azithromycin': ['zithromax', 'አዚትሮማይሲን'],
    'ciprofloxacin': ['cipro', 'ሲፕሮፍሎክሳሲን'],
    'omeprazole': ['prilosec', 'ኦሜፕራዞል'],
    'metformin': ['glucophage', 'ሜትፎርሚን'],
    'losartan': ['cozaar', 'ሎሳርታን'],
    'amlodipine': ['norvasc', 'አምሎዲፒን'],
    'atorvastatin': ['lipitor', 'አቶርቫስታቲን'],
    'levothyroxine': ['synthroid', 'ሌቮታይሮክሲን'],
    'lisinopril': ['prinivil', 'zestril', 'ሊሲኖፕሪል'],
    'albuterol': ['ventolin', 'proventil', 'አልቡቴሮል'],
    'gabapentin': ['neurontin', 'ጋባፔንቲን'],
    'sertraline': ['zoloft', 'ሰርትራሊን'],
    'fluoxetine': ['prozac', 'ፍሉኦክሴቲን'],
    'citalopram': ['celexa', 'ሲታሎፕራም'],
    'pantoprazole': ['protonix', 'ፓንቶፕራዞል'],
    'tramadol': ['ultram', 'ትራማዶል'],
    'clonazepam': ['klonopin', 'ክሎናዜፓም'],
    'lorazepam': ['ativan', 'ሎራዜፓም'],
    'alprazolam': ['xanax', 'አልፕራዞላም'],
    'cyclobenzaprine': ['flexeril', 'ሳይክሎቤንዛፕሪን'],
    'trazodone': ['desyrel', 'ትራዞዶን'],
    'duloxetine': ['cymbalta', 'ዱሎክሴቲን'],
    'venlafaxine': ['effexor', 'ቬንላፋክሲን'],
    'escitalopram': ['lexapro', 'ኤስሲታሎፕራም'],
    'ranitidine': ['zantac', 'ራኒቲዲን'],
    'famotidine': ['pepcid', 'ፋሞቲዲን'],
    'cetirizine': ['zyrtec', 'ሴቲሪዚን'],
    'loratadine': ['claritin', 'ሎራታዲን'],
    'fexofenadine': ['allegra', 'ፌክሶፌናዲን'],
    'diphenhydramine': ['benadryl', 'ዳይፌንሀይድራሚን'],
    'diclofenac': ['voltaren', 'ዳይክሎፌናክ'],
    'naproxen': ['aleve', 'ናፕሮክሲን'],
    'meloxicam': ['mobic', 'ሜሎክሲካም'],
    'celecoxib': ['celebrex', 'ሴሌኮክሲብ'],
    'hydrochlorothiazide': ['microzide', 'ሀይድሮክሎሮቲያዛይድ'],
    'furosemide': ['lasix', 'ፉሮሴማይድ'],
    'spironolactone': ['aldactone', 'ስፒሮኖላክቶን'],
    'carvedilol': ['coreg', 'ካርቬዲሎል'],
    'metoprolol': ['lopressor', 'ሜቶፕሮሎል'],
    'atenolol': ['tenormin', 'አቴኖሎል'],
    'propranolol': ['inderal', 'ፕሮፕራኖሎል'],
    'clopidogrel': ['plavix', 'ክሎፒዶግሬል'],
    'warfarin': ['coumadin', 'ዋርፋሪን'],
    'apixaban': ['eliquis', 'አፒክሳባን'],
    'rivaroxaban': ['xarelto', 'ሪቫሮክሳባን'],
    'rosuvastatin': ['crestor', 'ሮሱቫስታቲን'],
    'simvastatin': ['zocor', 'ሲምቫስታቲን'],
    'pravastatin': ['pravachol', 'ፕራቫስታቲን'],
    'ezetimibe': ['zetia', 'ኢዜቲሚብ'],
    'fenofibrate': ['tricor', 'ፌኖፊብሬት'],
    'glipizide': ['glucotrol', 'ግሊፒዛይድ'],
    'glimepiride': ['amaryl', 'ግሊሜፒራይድ'],
    'sitagliptin': ['januvia', 'ሲታግሊፕቲን'],
    'empagliflozin': ['jardiance', 'ኤምፓግሊፍሎዚን'],
    'dapagliflozin': ['farxiga', 'ዳፓግሊፍሎዚን'],
    'levofloxacin': ['levaquin', 'ሌቮፍሎክሳሲን'],
    'doxycycline': ['vibramycin', 'ዶክሲሳይክሊን'],
    'cephalexin': ['keflex', 'ሴፋሌክሲን'],
    'clindamycin': ['cleocin', 'ክሊንዳማይሲን'],
    'nitrofurantoin': ['macrobid', 'ኒትሮፉራንቶይን'],
    'metronidazole': ['flagyl', 'ሜትሮኒዳዞል'],
    'fluconazole': ['diflucan', 'ፍሉኮናዞል'],
    'valacyclovir': ['valtrex', 'ቫላሳይክሎቪር'],
    'acyclovir': ['zovirax', 'አሳይክሎቪር'],
    'montelukast': ['singulair', 'ሞንቴሉካስት'],
    'fluticasone': ['flonase', 'ፍሉቲካሶን'],
    'budesonide': ['pulmicort', 'ቡዴሶኒድ'],
    'tiotropium': ['spiriva', 'ቲዮትሮፒየም'],
    'ondansetron': ['zofran', 'ኦንዳንሴትሮን'],
    'promethazine': ['phenergan', 'ፕሮሜታዚን'],
    'metoclopramide': ['reglan', 'ሜቶክሎፕራማይድ'],
    'lansoprazole': ['prevacid', 'ላንሶፕራዞል'],
    'esomeprazole': ['nexium', 'ኢሶሜፕራዞል'],
    'dicyclomine': ['bentyl', 'ዳይሳይክሎሚን'],
    'tamsulosin': ['flomax', 'ታምሱሎሲን'],
    'finasteride': ['proscar', 'ፊናስቴራይድ'],
    'sildenafil': ['viagra', 'ሲልዴናፊል'],
    'tadalafil': ['cialis', 'ታዳላፊል'],
    'allopurinol': ['zyloprim', 'አሎፑሪኖል'],
    'colchicine': ['colcrys', 'ኮልቺሲን'],
    'methotrexate': ['trexall', 'ሜቶትሬክሳቴ'],
    'hydroxychloroquine': ['plaquenil', 'ሃይድሮክሲክሎሮኩዊን'],
    'prednisone': ['deltasone', 'ፕሬድኒሶን'],
    'methylprednisolone': ['medrol', 'ሜቲልፕሬድኒሶሎን'],
    'dexamethasone': ['decadron', 'ዴክሳሜታሶን'],
    'hydrocortisone': ['cortef', 'ሃይድሮኮርቲሶን'],
    'chlorpheniramine': ['chlor-trimeton', 'ክሎሮፌኒራሚን'],
    'pseudoephedrine': ['sudafed', 'ሱዶኢፌድሪን'],
    'guaifenesin': ['mucinex', 'ጓይፌኔሲን'],
    'dextromethorphan': ['delsym', 'ዴክስትሮሜቶርፋን'],
    'benzonatate': ['tessalon', 'ቤንዞናታቴ']
}

# Expand drugs set
all_drugs = list(drugs_set | set(amharic_transliterations.keys()) | set(synonyms.keys()))

en_templates = [
    "I need [{drug}](drug_name)",
    "Where can I find [{drug}](drug_name)?",
    "Do you have [{drug}](drug_name) nearby?",
    "Looking for [{drug}](drug_name)",
    "I am looking for [{drug}](drug_name)",
    "Can I get [{drug}](drug_name) here?",
    "Do any pharmacies have [{drug}](drug_name) in stock?",
    "I want to buy [{drug}](drug_name)",
    "Price of [{drug}](drug_name)",
    "Is [{drug}](drug_name) available?",
    "Is there anywhere selling [{drug}](drug_name)?",
    "Find me [{drug}](drug_name)",
    "[{drug}](drug_name)",
    "Search for [{drug}](drug_name)",
    "Do you sell [{drug}](drug_name)?",
    "I'd like to purchase [{drug}](drug_name)",
    "[{drug}](drug_name) near me",
    "Who has [{drug}](drug_name)?",
    "Can you find [{drug}](drug_name) for me?",
    "Check availability for [{drug}](drug_name)",
    "I'm searching for [{drug}](drug_name)",
    "[{drug}](drug_name) price",
    "is [{drug}](drug_name) in stock?",
    "need to buy [{drug}](drug_name)"
]

am_templates = [
    "[{drug}](drug_name) አለ?",
    "[{drug}](drug_name) የት አገኛለሁ?",
    "[{drug}](drug_name) አስፈልጎኛል",
    "[{drug}](drug_name) እፈልጋለሁ",
    "የ[{drug}](drug_name) ዋጋ ስንት ነው?",
    "[{drug}](drug_name) የሚሸጥ ፋርማሲ አለ?",
    "[{drug}](drug_name) ማግኘት እችላለሁ?",
    "[{drug}](drug_name) አላችሁ?",
    "እባክዎ [{drug}](drug_name) ይፈልጉልኝ",
    "[{drug}](drug_name) እዚህ ይገኛል?",
    "[{drug}](drug_name)",
    "[{drug}](drug_name) በቅርብ ርቀት",
    "ማን ነው [{drug}](drug_name) ያለው?",
    "[{drug}](drug_name) ፍለጋ",
    "የ[{drug}](drug_name) ክምችት አለን?",
    "[{drug}](drug_name) መግዛት እፈልጋለሁ",
    "እባኮትን [{drug}](drug_name) ካለ ያሳውቁኝ",
    "[{drug}](drug_name) አለመኖሩን አረጋግጡልኝ",
    "[{drug}](drug_name) መግዛት እችላለሁ?",
    "የትኛው ፋርማሲ [{drug}](drug_name) አለው?"
]

random.seed(42)

# Generate English Examples
en_examples = []
for _ in range(300):
    d = random.choice(all_drugs)
    if d in synonyms and random.random() > 0.5:
        # 50% chance to use synonym
        d_syns = [s for s in synonyms[d] if re.match(r'^[a-zA-Z0-9\s\-]+$', s)]
        if d_syns:
            d = random.choice(d_syns)
    t = random.choice(en_templates)
    
    if random.random() < 0.1:
        en_examples.append(f"[{d}](drug_name)")
    elif random.random() < 0.05:
        if len(d) > 4:
            idx = random.randint(1, len(d)-2)
            d_typo = d[:idx] + d[idx+1:]
            en_examples.append(t.format(drug=d_typo))
        else:
            en_examples.append(t.format(drug=d))
    else:
        en_examples.append(t.format(drug=d))

# Generate Amharic Examples
amharic_drugs = []
for d in all_drugs:
    if d in amharic_transliterations:
        amharic_drugs.append(amharic_transliterations[d])
    else:
        added = False
        if d in synonyms:
            am_syns = [s for s in synonyms[d] if not re.match(r'^[a-zA-Z0-9\s\-]+$', s)]
            if am_syns:
                amharic_drugs.append(random.choice(am_syns))
                added = True
        if not added:
            amharic_drugs.append(d)

am_examples = []
for _ in range(300):
    d = random.choice(amharic_drugs)
    t = random.choice(am_templates)
    am_examples.append(t.format(drug=d))

# Build English NLU file
en_output = f"""version: "3.1"

nlu:
- intent: search_drug
  examples: |
"""
for ex in set(en_examples):
    en_output += f"    - {ex}\n"

en_output += f"""
- lookup: drug_name
  examples: |
"""
generated_en_drugs = set()
for d in all_drugs:
    generated_en_drugs.add(d)
    if d in synonyms:
        for s in synonyms[d]:
             if re.match(r'^[a-zA-Z0-9\s\-]+$', s):
                 generated_en_drugs.add(s)

for d in sorted(list(generated_en_drugs)):
    en_output += f"    - {d}\n"

for standard, syn_list in synonyms.items():
    en_syns = [s for s in syn_list if re.match(r'^[a-zA-Z0-9\s\-]+$', s)]
    if en_syns:
        en_output += f"""
- synonym: {standard}
  examples: |
"""
        for s in en_syns:
            en_output += f"    - {s}\n"

with open("c:/active/MedFinder/RasaFM/data/nlu_en.yml", "w", encoding="utf-8") as f:
    f.write(en_output)

# Build Amharic NLU file
am_output = f"""version: "3.1"

nlu:
- intent: search_drug
  examples: |
"""
for ex in set(am_examples):
    am_output += f"    - {ex}\n"

am_output += f"""
- lookup: drug_name
  examples: |
"""
generated_am_drugs = set()
for d in amharic_drugs:
    generated_am_drugs.add(d)
    
for d in sorted(list(generated_am_drugs)):
    am_output += f"    - {d}\n"

for standard, syn_list in synonyms.items():
    am_syns = [s for s in syn_list if not re.match(r'^[a-zA-Z0-9\s\-]+$', s)]
    if standard in amharic_transliterations:
        standard_am = amharic_transliterations[standard]
    else:
        standard_am = standard
        
    if am_syns:
        am_output += f"""
- synonym: {standard_am}
  examples: |
"""
        for s in am_syns:
            am_output += f"    - {s}\n"

with open("c:/active/MedFinder/RasaFM/data/nlu_am.yml", "w", encoding="utf-8") as f:
    f.write(am_output)

print("Generated NLU data successfully!")
