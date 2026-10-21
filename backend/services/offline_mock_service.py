"""
Offline / Demo Mock Service for Voice of Kannada (ಕನ್ನಡದ ಧ್ವನಿ).
Provides deterministic, zero-latency, culturally accurate dialogue responses
and scenario state tracking for reliable live demonstrations without internet.
"""
from typing import List, Optional, Tuple
from ..models.schemas import ChatResponse, SuggestedReply, ChatMessage


class OfflineMockService:
    def __init__(self):
        # Scenario knowledge bases with progressive turns
        self._scenario_flows = {
            "auto_ride": [
                {
                    "trigger_keywords": ["ಇಂದಿರಾನಗರ", "indiranagar", "ಎಲ್ಲಿಗೆ", "ಹೋಗ್ಬೇಕು", "hogbeku", "bartheera"],
                    "kannada": "ಆಯಿತು, ಇಂದಿರಾನಗರಕ್ಕೆ ಬರ್ತೀನಿ. ಹತ್ತಿ ಸ್ವಾಮಿ.",
                    "transliteration": "Aayithu, Indiranagarakke bartheeni. Hatthi swami.",
                    "english": "Alright, I will come to Indiranagar. Please get in, sir.",
                    "tip": "Tip: Always ask 'Meter haaki anna' right as you sit down.",
                    "suggested_replies": [
                        {"kannada": "ಮೀಟರ್ ಹಾಕಿ ಅಣ್ಣ", "transliteration": "Meter haaki anna", "english": "Please turn on the meter, brother"},
                        {"kannada": "ಎಷ್ಟು ಚಾರ್ಜ್ ಆಗುತ್ತೆ?", "transliteration": "Eshtu charge aagutthe?", "english": "How much will it charge?"}
                    ]
                },
                {
                    "trigger_keywords": ["ಮೀಟರ್", "meter", "ಹಾಕಿ", "ಚಾರ್ಜ್", "charge", "haaki"],
                    "kannada": "ಸರಿ ಸಾರ್, ಮೀಟರ್ ಹಾಕ್ತೀನಿ. ಟ್ರಾಫಿಕ್ ಸ್ವಲ್ಪ ಜಾಸ್ತಿ ಇದೆ, ಪರವಾಗಿಲ್ಲವಾ?",
                    "transliteration": "Sari saar, meter haaktheeni. Traffic svalpa jaasti ide, paravaagillavaa?",
                    "english": "Okay sir, I will run meter. Traffic is a bit heavy, is that alright?",
                    "tip": "Tip: 'Paravaagilla' is the easiest way to say 'It is fine / No problem'.",
                    "suggested_replies": [
                        {"kannada": "ಪರವಾಗಿಲ್ಲ, ಸೀದಾ ಹೋಗಿ", "transliteration": "Paravaagilla, seeda hogi", "english": "No problem, go straight ahead"},
                        {"kannada": "ಸ್ವಲ್ಪ ಬೇಗ ಹೋಗಿ ಅಣ್ಣ", "transliteration": "Svalpa bega hogi anna", "english": "Please go a bit quickly brother"}
                    ]
                },
                {
                    "trigger_keywords": ["ಪರವಾಗಿಲ್ಲ", "ಸೀದಾ", "ಬೇಗ", "seeda", "bega", "paravaagilla"],
                    "kannada": "ಇಂದಿರಾನಗರ 100 ಫೀಟ್ ರೋಡ್ ಬಂತು ಸ್ವಾಮಿ. ಇಲ್ಲಿ ನಿಲ್ಲಿಸಲಾ?",
                    "transliteration": "Indiranagar 100 feet road banthu swami. Illi nillisalaa?",
                    "english": "Indiranagar 100 feet road has arrived, sir. Shall I stop here?",
                    "tip": "Tip: 'Nillisi' means 'stop'. Use 'Illi nillisi' (Stop here).",
                    "suggested_replies": [
                        {"kannada": "ಹೌದು, ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ. ಎಷ್ಟು ಆಯ್ತು?", "transliteration": "Haudu, illi nillisi. Eshtu aaythu?", "english": "Yes, stop here. How much did it cost?"},
                        {"kannada": "ಸ್ವಲ್ಪ ಮುಂದೆ ನಿಲ್ಲಿಸಿ", "transliteration": "Svalpa munde nillisi", "english": "Stop a little further"}
                    ]
                },
                {
                    "trigger_keywords": ["ಎಷ್ಟು", "ಆಯ್ತು", "eshtu", "aaythu", "ನಿಲ್ಲಿಸಿ", "nillisi"],
                    "kannada": "ಮೀಟರ್ ಮೇಲೆ ೮೫ ರೂಪಾಯಿ ಆಗಿದೆ ಸ್ವಾಮಿ. (85 ರೂಪಾಯಿ)",
                    "transliteration": "Meter mele embatthaidu roopaayi aagide swami. (85 roopaayi)",
                    "english": "It came to 85 rupees on the meter, sir.",
                    "tip": "Tip: Ask 'Google Pay ideya?' for digital payment.",
                    "suggested_replies": [
                        {"kannada": "ಗೂಗಲ್ ಪೇ ಇದೆಯಾ? ಸ್ಕ್ಯಾನ್ ಮಾಡ್ತೀನಿ", "transliteration": "Google Pay ideya? Scan maadtini", "english": "Do you have Google Pay? I will scan"},
                        {"kannada": "ಇಲ್ಲಿ ನೂರು ರೂಪಾಯಿ ಇಟ್ಟುಕೊಳ್ಳಿ", "transliteration": "Illi nooru roopaayi ittukolli", "english": "Take hundred rupees here"}
                    ]
                },
                {
                    "trigger_keywords": ["ಗೂಗಲ್", "google", "pay", "ಪೇ", "ನೂರು", "nooru", "ಧನ್ಯವಾದ", "ಸ್ಕ್ಯಾನ್"],
                    "kannada": "ಹೌದು ಸ್ವಾಮಿ, ಕ್ಯೂಆರ್ ಕೋಡ್ ಇಲ್ಲಿದೆ. ಹಣ ಬಂತು! ತುಂಬಾ ಧನ್ಯವಾದಗಳು, ಶುಭ ದಿನ!",
                    "transliteration": "Haudu swami, QR code illide. Hana banthu! Tumba dhanyavaadagalu, shubha dina!",
                    "english": "Yes sir, QR code is here. Money received! Thank you very much, have a great day!",
                    "tip": "Congratulations! You completed the auto ride role-play like a true Bengaluru local!",
                    "scenario_completed": True,
                    "suggested_replies": [
                        {"kannada": "ಧನ್ಯವಾದಗಳು ಅಣ್ಣ, ಮತ್ತೆ ಸಿಗೋಣ!", "transliteration": "Dhanyavaadagalu anna, matte sigona!", "english": "Thank you brother, see you again!"}
                    ]
                }
            ],
            "restaurant_dosa": [
                {
                    "trigger_keywords": ["ದೋಸೆ", "dose", "dosa", "ಮಸಾಲೆ", "masala", "ತಿಂಡಿ"],
                    "kannada": "ಉತ್ತಮ ಆಯ್ಕೆ! ಗರಿಗರಿಯಾದ ಮಸಾಲೆ ದೋಸೆ ಮಾಡಿಸ್ತೀನಿ. ಕುಡಿಯಲು ಏನು ತರಲಿ?",
                    "transliteration": "Utthama aayke! Garigariyaada masala dose maadisthini. Kudiyalu enu tharali?",
                    "english": "Excellent choice! I'll get crispy masala dosa made. What shall I bring to drink?",
                    "tip": "'Garigari' means crispy in Kannada.",
                    "suggested_replies": [
                        {"kannada": "ಒಂದು ಬಿಸಿ ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ", "transliteration": "Ondu bisi filter coffee kodi", "english": "Give one hot filter coffee"},
                        {"kannada": "ಕುಡಿಯಲು ಬಿಸಿ ನೀರು ತನ್ನಿ", "transliteration": "Kudiyalu bisi neeru thanni", "english": "Bring hot water for drinking"}
                    ]
                },
                {
                    "trigger_keywords": ["ಕಾಫಿ", "coffee", "ನೀರು", "neeru", "ಕಡಿಮೆ", "ಖಾರ", "ಬಿಸಿ"],
                    "kannada": "ಆಯಿತು ಸರ್. ದೋಸೆ ಜೊತೆ ಕಾಯಿ ಚಟ್ನಿ ಮತ್ತು ಸಾಂಬಾರ್ ಬಿಸಿ ಬಿಸಿಯಾಗಿದೆ. ಸಕ್ಕರೆ ಎಷ್ಟು ಬೇಕು ಕಾಫಿಗೆ?",
                    "transliteration": "Aayithu sir. Dose jothe kaayi chutney matthu sambar bisi bisiyagide. Sakkare eshtu beku coffeege?",
                    "english": "Alright sir. Fresh coconut chutney and piping hot sambar are ready. How much sugar for the coffee?",
                    "tip": "Say 'Svalpa sakkare' for a little sugar, or 'Sakkare beda' for sugar-free.",
                    "suggested_replies": [
                        {"kannada": "ಸ್ವಲ್ಪ ಸಕ್ಕರೆ ಹಾಕಿ", "transliteration": "Svalpa sakkare haaki", "english": "Put a little sugar"},
                        {"kannada": "ಸಕ್ಕರೆ ಬೇಡ", "transliteration": "Sakkare beda", "english": "No sugar needed"}
                    ]
                },
                {
                    "trigger_keywords": ["ಸಕ್ಕರೆ", "sakkare", "ಬೇಡ", "ಸ್ವಲ್ಪ", "ಹಾಕಿ", "ಬಿಲ್", "bill"],
                    "kannada": "ಇಗೋ ನಿಮ್ಮ ಗರಿಗರಿ ಮಸಾಲೆ ದೋಸೆ ಮತ್ತು ಘಮಘಮಿಸುವ ಫಿಲ್ಟರ್ ಕಾಫಿ! ಬಿಲ್ ಒಟ್ಟು ೮೦ ರೂಪಾಯಿ ಸರ್.",
                    "transliteration": "Igo nimma garigari masala dose matthu ghamaghamisuva filter coffee! Bill ottu embatthu roopaayi sir.",
                    "english": "Here is your crispy masala dosa and aromatic filter coffee! Bill total is 80 rupees, sir.",
                    "tip": "'Ghamaghamisuva' means aromatic / fragrant in Kannada.",
                    "scenario_completed": True,
                    "suggested_replies": [
                        {"kannada": "ತಿಂಡಿ ತುಂಬಾ ರುಚಿಯಾಗಿತ್ತು, ಧನ್ಯವಾದಗಳು!", "transliteration": "Thindi tumba ruchiyaagittu, dhanyavaadagalu!", "english": "Breakfast was very tasty, thank you!"}
                    ]
                }
            ],
            "market_vegetables": [
                {
                    "trigger_keywords": ["ಟೊಮ್ಯಾಟೊ", "tomato", "ಎಷ್ಟು", "eshtu", "ಕೆಜಿ", "kg"],
                    "kannada": "ನಾಟಿ ಟೊಮ್ಯಾಟೊ ಕೆಜಿಗೆ ೪೦ ರೂಪಾಯಿ ಸರ್. ತುಂಬಾ ತಾಜಾವಾಗಿದೆ!",
                    "transliteration": "Naati tomato kg-ge nalavatthu roopaayi sir. Tumba taajaavaagide!",
                    "english": "Local tomatoes are 40 rupees per kg, sir. Very fresh!",
                    "tip": "Politely ask 'Svalpa kammi maadi anna' to bargain respectfully.",
                    "suggested_replies": [
                        {"kannada": "ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ ಅಣ್ಣ, ೩೦ ರೂಪಾಯಿಗೆ ಕೊಡ್ತೀರಾ?", "transliteration": "Svalpa kammi maadi anna, moovatthu roopaayige kodtheera?", "english": "Reduce a bit brother, will you give for 30 rupees?"},
                        {"kannada": "ಎರಡು ಕೆಜಿ ತೂಕ ಹಾಕಿ", "transliteration": "Eradu kg tooka haaki", "english": "Weigh out two kilos"}
                    ]
                },
                {
                    "trigger_keywords": ["ಕಮ್ಮಿ", "kammi", "ರೂಪಾಯಿ", "ಎರಡು", "ತೂಕ", "tooka"],
                    "kannada": "ಸರಿ ಸರ್, ನೀವು ರೆಗ್ಯುಲರ್ ಕಸ್ಟಮರ್ ಅಂತ ೩೫ ರೂಪಾಯಿಗೆ ಕೊಡ್ತೀನಿ. ಎರಡು ಕೆಜಿ ಹಾಕ್ತೀನಿ.",
                    "transliteration": "Sari sir, neevu regular customer antha moovatthaidu roopaayige kodtheeni. Eradu kg haaktheeni.",
                    "english": "Alright sir, since you're a regular I will give for 35 rupees. I am putting two kilos.",
                    "tip": "Tip: Always ask for complimentary greens: 'Svalpa kothambari soppu haaki'.",
                    "suggested_replies": [
                        {"kannada": "ಸ್ವಲ್ಪ ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು ಹಾಕಿ ಅಣ್ಣ", "transliteration": "Svalpa kothambari soppu haaki anna", "english": "Please add some coriander leaves, brother"},
                        {"kannada": "ಒಂದು ಬ್ಯಾಗ್ ಇದೆಯಾ?", "transliteration": "Ondu bag ideya?", "english": "Do you have a carry bag?"}
                    ]
                },
                {
                    "trigger_keywords": ["ಕೊತ್ತಂಬರಿ", "ಸೊಪ್ಪು", "kothambari", "soppu", "ಬ್ಯಾಗ್", "bag"],
                    "kannada": "ಖಂಡಿತ! ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು ಮತ್ತು ಕರಿಬೇವು ಉಚಿತವಾಗಿ ಹಾಕಿದ್ದೇನೆ. ಒಟ್ಟು ೭೦ ರೂಪಾಯಿ ಸರ್.",
                    "transliteration": "Khanditha! Kothambari soppu matthu karibevu uchithavaagi haakiddene. Ottu eppatthu roopaayi sir.",
                    "english": "Certainly! I have added coriander and curry leaves free. Total 70 rupees, sir.",
                    "tip": "'Karibevu' is curry leaves, a kitchen essential in Karnataka.",
                    "scenario_completed": True,
                    "suggested_replies": [
                        {"kannada": "ಯುಪಿಐ ಕ್ಯೂಆರ್ ಕೋಡ್ ತೋರಿಸಿ, ಹಣ ಕಳಿಸ್ತೀನಿ", "transliteration": "UPI QR code thorisi, hana kalisthini", "english": "Show UPI QR code, I will send money"}
                    ]
                }
            ],
            "metro_directions": [
                {
                    "trigger_keywords": ["ಮೆಟ್ರೋ", "metro", "ಎಲ್ಲಿದೆ", "ellide", "ಹತ್ತಿರದ", "hattirada"],
                    "kannada": "ಇಲ್ಲಿಂದ ಮುಂದೆ 200 ಮೀಟರ್ ಹೋಗಿ, ಸಿಗ್ನಲ್ ಹತ್ತಿರ ಬಲಕ್ಕೆ ತಿರುಗಿ. ಅಲ್ಲೇ ಮೆಟ್ರೋ ಸ್ಟೇಷನ್ ಕಾಣಿಸುತ್ತೆ.",
                    "transliteration": "Illinda munde eranooru meter hogi, signal hattira balakke thirugi. Alle metro station kaanisutthe.",
                    "english": "From here go forward 200 meters, turn right near the signal. You will see the metro station right there.",
                    "tip": "'Munde' = forward, 'Balakke' = to the right, 'Edakke' = to the left.",
                    "suggested_replies": [
                        {"kannada": "ನಡೆದುಕೊಂಡು ಹೋಗಬಹುದಾ?", "transliteration": "Nadedukondu hogabahuda?", "english": "Can I go by walking?"},
                        {"kannada": "ಮೆಟ್ರೋ ಟಿಕೆಟ್ ಕೌಂಟರ್ ಯಾವ ಬದಿಯಲ್ಲಿದೆ?", "transliteration": "Metro ticket counter yaava badiyallide?", "english": "Which side is the ticket counter?"}
                    ]
                },
                {
                    "trigger_keywords": ["ನಡೆದು", "walk", "ದೂರ", "doora", "hogabahuda"],
                    "kannada": "ಹೌದು, ಕೇವಲ ೫ ನಿಮಿಷ ನಡಿಗೆ ಅಷ್ಟೇ. ತುಂಬಾ ಹತ್ತಿರ ಇದೆ, ಆಟೋ ಬೇಡ.",
                    "transliteration": "Haudu, kevala aidu nimisha nadige ashtte. Tumba hattira ide, auto beda.",
                    "english": "Yes, just 5 minutes walk. It is very close, no need for an auto.",
                    "tip": "'Nimmage sahaya aaythe?' means 'Was it helpful?'.",
                    "scenario_completed": True,
                    "suggested_replies": [
                        {"kannada": "ತುಂಬಾ ಧನ್ಯವಾದಗಳು ಸರ್!", "transliteration": "Tumba dhanyavaadagalu sir!", "english": "Thank you very much, sir!"}
                    ]
                }
            ],
            "pharmacy_medicines": [
                {
                    "trigger_keywords": ["ತಲೆನೋವು", "ಜ್ವರ", "talenovu", "jvara", "cold", "ನೆಗಡಿ", "ಮಾತ್ರೆ", "headache"],
                    "kannada": "ಹೌದಾ, ಪ್ಯಾರಾಸಿಟಮಾಲ್ ಮಾತ್ರೆ ಕೊಡುತ್ತೇನೆ. ಜ್ವರ ಎಷ್ಟು ದಿನದಿಂದ ಇದೆ?",
                    "transliteration": "Haudaa, paracetamol maathre kodutthene. Jvara eshtu dinadinda ide?",
                    "english": "I see, I'll give paracetamol tablets. For how many days have you had the fever?",
                    "tip": "'Maathre' means tablet or pill in Kannada.",
                    "suggested_replies": [
                        {"kannada": "ನಿನ್ನೆಯಿಂದ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ", "transliteration": "Ninneyinda jvara matthu talenovu ide", "english": "I've had fever and headache since yesterday"},
                        {"kannada": "ಊಟದ ನಂತರ ತಗೋಬೇಕಾ?", "transliteration": "Ootada nanthara thagobeka?", "english": "Should I take it after meals?"}
                    ]
                },
                {
                    "trigger_keywords": ["ಊಟದ", "ootada", "ನಂತರ", "dose", "ಹೇಗೆ", "ತಗೋಬೇಕು"],
                    "kannada": "ಖಂಡಿತ ಊಟದ ನಂತರವೇ ತೆಗೆದುಕೊಳ್ಳಬೇಕು. ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ, ಬೆಳಿಗ್ಗೆ ಮತ್ತು ರಾತ್ರಿ.",
                    "transliteration": "Khanditha ootada nantharave thegedukollabeku. Dinakke eradu baari, beligge matthu raathri.",
                    "english": "Definitely take it only after meals. Twice a day, morning and night.",
                    "tip": "'Beligge' = morning, 'Madhyanha' = afternoon, 'Raathri' = night.",
                    "scenario_completed": True,
                    "suggested_replies": [
                        {"kannada": "ಅರ್ಥವಾಯಿತು, ಬಿಲ್ ಎಷ್ಟು?", "transliteration": "Arthavaaythu, bill eshtu?", "english": "Understood, what is the bill?"}
                    ]
                }
            ],
            "self_intro": [
                {
                    "trigger_keywords": ["ಹೆಸರು", "hesaru", "ಬೆಂಗಳೂರು", "bengaluru", "engineer", "ಇಂಜಿನಿಯರ್", "ನನ್ನ"],
                    "kannada": "ತುಂಬಾ ಸಂತೋಷ! ನೀವು ಎಷ್ಟು ಚೆನ್ನಾಗಿ ಕನ್ನಡ ಮಾತನಾಡುತ್ತಿದ್ದೀರಿ! ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಿ?",
                    "transliteration": "Tumba santhosha! Neevu eshtu chennaagi kannada maathnaadutthiddeeri! Ellinda bandiddeeri?",
                    "english": "So happy to hear! You are speaking Kannada so nicely! Where are you from?",
                    "tip": "Tip: Locals in Karnataka appreciate even small efforts to speak Kannada!",
                    "suggested_replies": [
                        {"kannada": "ನಾನು ಹೊಸದಾಗಿ ಇಲ್ಲಿಗೆ ಬಂದಿದ್ದೇನೆ, ಕನ್ನಡ ಕಲಿಯುತ್ತಿದ್ದೇನೆ", "transliteration": "Naanu hosadaagi illige bandiddene, kannada kaliyuttiddene", "english": "I recently came here, I am learning Kannada"},
                        {"kannada": "ನಾನು ದೆಹಲಿಯಿಂದ ಬಂದಿದ್ದೇನೆ", "transliteration": "Naanu Delhiyinda bandiddene", "english": "I came from Delhi"}
                    ]
                },
                {
                    "trigger_keywords": ["ಕಲಿಯುತ್ತಿದ್ದೇನೆ", "kaliyuttiddene", "ದೆಹಲಿ", "ಹೊಸದಾಗಿ", "delhi"],
                    "kannada": "ಬೆಂಗಳೂರಿಗೆ ಪ್ರೀತಿಯ ಸ್ವಾಗತ! ನೀವು ಹೀಗೇ ಪ್ರತಿದಿನ ಸ್ವಲ್ಪ ಕನ್ನಡ ಮಾತನಾಡಿದರೆ ಸುಲಭವಾಗಿ ಕಲಿಯಬಹುದು.",
                    "transliteration": "Bengaloorige preethiya svaagatha! Neevu heege prathidina svalpa kannada maathnaadidare sulabhavaagi kaliyabahudu.",
                    "english": "Warm welcome to Bengaluru! If you speak a little Kannada like this every day, you will learn easily.",
                    "tip": "'Svaagatha' means welcome.",
                    "scenario_completed": True,
                    "suggested_replies": [
                        {"kannada": "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಪ್ರೋತ್ಸಾಹಕ್ಕೆ ತುಂಬಾ ಧನ್ಯವಾದಗಳು", "transliteration": "Dhanyavaadagalu! Nimma prothsaahakke tumba dhanyavaadagalu", "english": "Thank you! Thank you very much for your encouragement"}
                    ]
                }
            ]
        }

        # Free conversation tutor fallbacks
        self._free_tutor_responses = [
            {
                "trigger_keywords": ["ನಮಸ್ಕಾರ", "namaskara", "ಹಲೋ", "hello", "hi", "ಹೇಗಿದ್ದೀರ", "hegiddeera"],
                "kannada": "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕನ್ನಡ ಶಿಕ್ಷಕ (Kannada Tutor). ಇಂದು ನೀವು ಏನು ಕಲಿಯಲು ಇಷ್ಟಪಡುತ್ತೀರಿ?",
                "transliteration": "Namaskara! Naanu nimma kannada shikshaka. Indu neevu enu kaliyalu ishtapaduttheeri?",
                "english": "Hello! I am your Kannada tutor. What would you like to learn today?",
                "tip": "Tip: You can practice ordering food, taking an auto, or everyday greetings with me!",
                "suggested_replies": [
                    {"kannada": "ನನಗೆ ಊಟದ ಬಗ್ಗೆ ಮಾತನಾಡಲು ಹೇಳಿಕೊಡಿ", "transliteration": "Nanage ootada bagge maathnaadalu helikodi", "english": "Teach me to talk about food"},
                    {"kannada": "ನನ್ನ ಕನ್ನಡ ಉಚ್ಚಾರಣೆ ಪರೀಕ್ಷಿಸಿ", "transliteration": "Nanna kannada ucchaarane pareekshisi", "english": "Test my Kannada pronunciation"}
                ]
            },
            {
                "trigger_keywords": ["ಕಾಫಿ", "ತಿಂಡಿ", "ಊಟ", "coffee", "oota", "thindi", "food"],
                "kannada": "ತುಂಬಾ ಒಳ್ಳೆಯ ವಿಷಯ! ಕರ್ನಾಟಕದಲ್ಲಿ 'ಊಟ ಆಯ್ತಾ?' ಎಂದು ಕೇಳುವುದು ಪ್ರೀತಿಯ ಲಕ್ಷಣ. ನಿಮಗೆ ಯಾವ ತಿಂಡಿ ಇಷ್ಟ?",
                "transliteration": "Tumba olleya vishaya! Karnatakadalli 'Oota aaytha?' endu keluvudu preethiya lakshana. Nimmage yaava thindi ishta?",
                "english": "Very nice topic! In Karnataka, asking 'Did you have food?' is an expression of care. What breakfast do you like?",
                "tip": "To say you like something: 'Nanage [item] tumba ishta'.",
                "suggested_replies": [
                    {"kannada": "ನನಗೆ ಮಸಾಲೆ ದೋಸೆ ತುಂಬಾ ಇಷ್ಟ", "transliteration": "Nanage masala dose tumba ishta", "english": "I like masala dosa very much"},
                    {"kannada": "ನನಗೆ ಫಿಲ್ಟರ್ ಕಾಫಿ ಬೇಕು", "transliteration": "Nanage filter coffee beku", "english": "I want filter coffee"}
                ]
            },
            {
                "trigger_keywords": ["ಕನ್ನಡ", "kannada", "ಕಲಿ", "learn", "kali"],
                "kannada": "ಖಂಡಿತ! ಕನ್ನಡ ತುಂಬಾ ಸುಂದರ ಮತ್ತು ಸುಮಧುರ ಭಾಷೆ. ಪ್ರತಿದಿನ ೫ ಹೊಸ ಪದಗಳನ್ನು ಕಲಿತು ಮಾತನಾಡೋಣ.",
                "transliteration": "Khanditha! Kannada tumba sundara matthu sumadhura bhaashe. Prathidina aidu hosa padagalannu kalithu maathnaadona.",
                "english": "Certainly! Kannada is a very beautiful and melodious language. Let's learn and speak 5 new words every day.",
                "tip": "'Sumadhura' means sweet and melodious.",
                "suggested_replies": [
                    {"kannada": "ಇವತ್ತಿನ ೫ ಹೊಸ ಪದಗಳು ಯಾವುವು?", "transliteration": "Ivatthina aidu hosa padagalu yaavuvu?", "english": "What are today's 5 new words?"},
                    {"kannada": "ನಾನು ಹೇಗೆ ಸುಲಭವಾಗಿ ಕಲಿಯಬಹುದು?", "transliteration": "Naanu hege sulabhavaagi kaliyabahudu?", "english": "How can I learn easily?"}
                ]
            }
        ]

    def get_response(
        self,
        text: str,
        scenario_id: Optional[str] = "free_tutor",
        level: str = "beginner",
        history: Optional[List[ChatMessage]] = None
    ) -> ChatResponse:
        """
        Determines the most contextual offline response using keyword matching and turn counters.
        """
        turn_count = len(history) if history else 0
        text_lower = text.lower().strip()

        # Check scenario-specific flow
        if scenario_id and scenario_id in self._scenario_flows:
            flow_steps = self._scenario_flows[scenario_id]

            # 1. Match by keyword first
            for step in flow_steps:
                if any(kw in text_lower for kw in step["trigger_keywords"]):
                    return ChatResponse(
                        kannada_script=step["kannada"],
                        transliteration=step["transliteration"],
                        english=step["english"],
                        tip=step.get("tip"),
                        correction=None,
                        suggested_replies=[SuggestedReply(**r) for r in step.get("suggested_replies", [])],
                        scenario_completed=step.get("scenario_completed", False),
                        turn_count=turn_count + 1
                    )

            # 2. Match by progressive turn count if no keyword hit
            step_idx = min(turn_count // 2, len(flow_steps) - 1)
            step = flow_steps[step_idx]
            return ChatResponse(
                kannada_script=step["kannada"],
                transliteration=step["transliteration"],
                english=step["english"],
                tip=step.get("tip"),
                correction=None,
                suggested_replies=[SuggestedReply(**r) for r in step.get("suggested_replies", [])],
                scenario_completed=step.get("scenario_completed", False),
                turn_count=turn_count + 1
            )

        # Free conversation flow
        for resp in self._free_tutor_responses:
            if any(kw in text_lower for kw in resp["trigger_keywords"]):
                return ChatResponse(
                    kannada_script=resp["kannada"],
                    transliteration=resp["transliteration"],
                    english=resp["english"],
                    tip=resp.get("tip"),
                    correction=None,
                    suggested_replies=[SuggestedReply(**r) for r in resp.get("suggested_replies", [])],
                    scenario_completed=False,
                    turn_count=turn_count + 1
                )

        # Default encouraging tutor response
        return ChatResponse(
            kannada_script="ತುಂಬಾ ಚೆನ್ನಾಗಿ ಹೇಳಿದ್ದೀರಿ! ನಿಮ್ಮ ಪ್ರಯತ್ನ ತುಂಬಾ ಶ್ಲಾಘನೀಯ.",
            transliteration="Tumba chennaagi heliddeeri! Nimma prayathna tumba shlaaghaneeya.",
            english="You said that very nicely! Your effort is truly commendable.",
            correction=None,
            tip="Tutor tip: Notice how adding 're' or 'ri' at the end makes sentences warm and polite.",
            suggested_replies=[
                SuggestedReply(
                    kannada="ಧನ್ಯವಾದಗಳು ಗುರುಗಳೇ",
                    transliteration="Dhanyavaadagalu gurugale",
                    english="Thank you teacher"
                ),
                SuggestedReply(
                    kannada="ಇನ್ನೊಂದು ವಾಕ್ಯ ಹೇಳಿಕೊಡಿ",
                    transliteration="Innondu vaakya helikodi",
                    english="Teach me another sentence"
                )
            ],
            scenario_completed=False,
            turn_count=turn_count + 1
        )


offline_mock_service = OfflineMockService()
