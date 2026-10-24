import type { BudgetCategory } from '../types';

// ============================================================
// Demo templates — deterministic fallbacks used when AI key
// is not configured. Always clearly labeled as demo content.
// ============================================================

interface DemoTemplate {
  summary: string;
  themeRecommendations: string[];
  schedule: { time: string; title: string; description: string; duration: number }[];
  tasks: {
    title: string;
    description: string;
    daysBeforeEvent: number;
    category: string;
    priority: string;
  }[];
  menuIdeas: string[];
  decorationIdeas: string[];
  entertainmentSuggestions: string[];
  budgetPercentages: { category: BudgetCategory; label: string; percentage: number; notes: string }[];
  tradeOffs: string[];
}

export const demoTemplates: Record<string, DemoTemplate> = {
  wedding: {
    summary:
      'A beautiful wedding celebration for {guests} guests at {location}. The {theme} theme brings romantic elegance with thoughtful personal touches, ensuring an unforgettable day for you and your loved ones. [Demo Mode]',
    themeRecommendations: [
      'Gold & Ivory Elegance — timeless romance with warm metallics and lush greenery',
      'Garden Bohemian — relaxed outdoor vibe with wildflowers and fairy lights',
      'Modern Minimalist — sleek whites with geometric accents and candle centerpieces',
      'Rustic Charm — wooden details, mason jars, and countryside warmth',
    ],
    schedule: [
      { time: '13:30', title: 'Guest arrival & welcome drinks', description: 'Guests greeted at entrance with champagne or mocktails', duration: 30 },
      { time: '14:00', title: 'Ceremony begins', description: 'Outdoor or indoor ceremony with music', duration: 45 },
      { time: '14:45', title: 'Cocktail hour', description: 'Canapés and cocktails; wedding party photos', duration: 75 },
      { time: '16:00', title: 'Reception doors open', description: 'Guests take their seats', duration: 15 },
      { time: '16:15', title: 'Grand entrance & first dance', description: 'Couple entrance followed by first dance', duration: 30 },
      { time: '16:45', title: 'Dinner service', description: '3-course sit-down dinner', duration: 90 },
      { time: '18:15', title: 'Speeches & toasts', description: 'Heartfelt speeches from family and bridal party', duration: 30 },
      { time: '18:45', title: 'Cake cutting', description: 'Traditional cake cutting ceremony', duration: 15 },
      { time: '19:00', title: 'Dancing & entertainment', description: 'Live band or DJ and dancing', duration: 180 },
      { time: '22:00', title: 'Grand send-off', description: 'Sparkler send-off for the couple', duration: 20 },
    ],
    tasks: [
      { title: 'Book venue', description: 'Visit and confirm venue with deposit', daysBeforeEvent: 180, category: 'Venue', priority: 'high' },
      { title: 'Hire photographer/videographer', description: 'Review portfolios and sign contract', daysBeforeEvent: 150, category: 'Photography', priority: 'high' },
      { title: 'Book caterer', description: 'Schedule tasting and plan menu', daysBeforeEvent: 120, category: 'Catering', priority: 'high' },
      { title: 'Send invitations', description: 'Design, print and mail invitations', daysBeforeEvent: 90, category: 'Stationery', priority: 'high' },
      { title: 'Book entertainment', description: 'Confirm band or DJ, arrange music playlist', daysBeforeEvent: 90, category: 'Entertainment', priority: 'medium' },
      { title: 'Arrange floral décor', description: 'Meet florist for bouquets and centerpieces', daysBeforeEvent: 60, category: 'Flowers', priority: 'medium' },
      { title: 'Finalise guest RSVP and dietary needs', description: 'Confirm headcount and dietary restrictions', daysBeforeEvent: 21, category: 'Guest Management', priority: 'high' },
      { title: 'Confirm all vendors', description: 'Send final schedule to every vendor', daysBeforeEvent: 14, category: 'Coordination', priority: 'high' },
      { title: 'Final venue walkthrough', description: 'Check setup logistics with venue coordinator', daysBeforeEvent: 7, category: 'Venue', priority: 'high' },
      { title: 'Prepare wedding day emergency kit', description: 'Stain remover, safety pins, pain relief, snacks', daysBeforeEvent: 3, category: 'Preparation', priority: 'medium' },
    ],
    menuIdeas: [
      'Starter: Burrata with heirloom tomatoes and basil oil',
      'Starter: Roasted butternut squash soup (vegan)',
      'Main: Herb-crusted chicken breast with dauphinoise potatoes',
      'Main: Pan-seared salmon with lemon butter sauce',
      'Main: Wild mushroom and truffle risotto (vegetarian)',
      'Dessert: 3-tier wedding cake in chosen flavour',
      'Dessert: Miniature dessert station with macarons, profiteroles, and fruit tarts',
    ],
    decorationIdeas: [
      'Cascading floral arch in ceremony backdrop with roses and eucalyptus',
      'Candlelit centerpieces with greenery garlands on guest tables',
      'Fairy light canopy across the reception ceiling',
      'Personalised seating chart with laser-engraved name cards',
      'Gold chiavari chairs with ivory satin cushion covers',
    ],
    entertainmentSuggestions: [
      'String quartet during ceremony and cocktail hour',
      'Live 5-piece band for reception dinner and dancing',
      'Photo booth with vintage props',
      'Sparkler send-off as the evening finale',
    ],
    budgetPercentages: [
      { category: 'venue', label: 'Venue', percentage: 30, notes: 'Demo estimate — verify locally' },
      { category: 'catering', label: 'Catering & bar', percentage: 35, notes: 'Approx. per-head cost' },
      { category: 'photography', label: 'Photography & video', percentage: 10, notes: '8-hour coverage' },
      { category: 'decoration', label: 'Décor & florals', percentage: 8, notes: 'Centrepieces + arch' },
      { category: 'entertainment', label: 'Entertainment', percentage: 6, notes: 'Band or DJ' },
      { category: 'attire', label: 'Attire', percentage: 5, notes: 'Dress, suit, accessories' },
      { category: 'stationery', label: 'Stationery', percentage: 1, notes: 'Invites and menus' },
      { category: 'transportation', label: 'Transport', percentage: 2, notes: 'Wedding car hire' },
      { category: 'other', label: 'Miscellaneous', percentage: 3, notes: 'Gifts, favours, etc.' },
    ],
    tradeOffs: [
      'Replace live band with a DJ to save approximately 40% on entertainment',
      'Opt for a Sunday wedding — typically 20–30% cheaper than Saturday',
      'Use potted plants as centrepieces that double as guest favours',
      'Digital invitations eliminate stationery costs entirely',
    ],
  },

  birthday: {
    summary:
      'A spectacular birthday celebration for {guests} guests in honour of a very special occasion at {location}. The {theme} theme sets the perfect mood for an unforgettable party. [Demo Mode]',
    themeRecommendations: [
      'Tropical Paradise — vibrant colours, tiki decor, and exotic cocktails',
      'Great Gatsby — roaring 20s glamour with gold, black, and feathers',
      'Garden Party — elegant outdoor affair with floral arrangements',
      'Neon Glow — UV-reactive decorations and electric colour palette',
    ],
    schedule: [
      { time: '18:00', title: 'Guests arrive', description: 'Welcome drinks and mingling', duration: 30 },
      { time: '18:30', title: 'Party games and activities', description: 'Icebreaker games and themed activities', duration: 60 },
      { time: '19:30', title: 'Dinner / buffet', description: 'Sit-down dinner or buffet service', duration: 60 },
      { time: '20:30', title: 'Birthday toast and cake cutting', description: 'Speeches, cake, and candle-blowing moment', duration: 30 },
      { time: '21:00', title: 'Dancing and entertainment', description: 'DJ set, dancing, and photo booth', duration: 120 },
      { time: '23:00', title: 'Party wrap-up', description: 'Final thanks and farewell gifts for guests', duration: 30 },
    ],
    tasks: [
      { title: 'Book venue', description: 'Secure party venue or private space', daysBeforeEvent: 60, category: 'Venue', priority: 'high' },
      { title: 'Send invitations', description: 'Digital or physical invitations', daysBeforeEvent: 30, category: 'Stationery', priority: 'high' },
      { title: 'Order birthday cake', description: 'Choose design, flavour, and decoration', daysBeforeEvent: 21, category: 'Catering', priority: 'high' },
      { title: 'Arrange catering or food order', description: 'Confirm caterer or restaurant', daysBeforeEvent: 21, category: 'Catering', priority: 'high' },
      { title: 'Plan activities and entertainment', description: 'Book DJ, games, or photo booth', daysBeforeEvent: 14, category: 'Entertainment', priority: 'medium' },
      { title: 'Purchase decorations', description: 'Balloons, banners, table décor', daysBeforeEvent: 7, category: 'Decoration', priority: 'medium' },
      { title: 'Confirm guest count and dietary needs', description: 'Final RSVP and dietary requirements', daysBeforeEvent: 7, category: 'Guest Management', priority: 'high' },
      { title: 'Set up venue decorations', description: 'Arrive early for full setup', daysBeforeEvent: 0, category: 'Decoration', priority: 'high' },
    ],
    menuIdeas: [
      'Appetiser station with bruschetta, cheese board, and dips',
      'Main: Choice of BBQ, taco bar, or buffet',
      'Themed birthday cake as centrepiece dessert',
      'Dessert table with cupcakes, cookies, and candy bar',
      'Signature cocktails and mocktails matching the theme',
    ],
    decorationIdeas: [
      'Custom photo backdrop with the guest of honour\'s photos',
      'Themed balloon arch in matching colours',
      'Glitter table runners and themed centrepieces',
      'LED fairy lights throughout the venue',
      'Personalised banner with the name and age',
    ],
    entertainmentSuggestions: [
      'DJ with personalised playlist',
      'Photo booth with themed props',
      'Trivia or quiz game about the birthday person',
      'Karaoke segment',
    ],
    budgetPercentages: [
      { category: 'venue', label: 'Venue', percentage: 25, notes: 'Demo estimate' },
      { category: 'catering', label: 'Catering & cake', percentage: 35, notes: 'Food and beverage' },
      { category: 'decoration', label: 'Decorations', percentage: 15, notes: 'Themed décor' },
      { category: 'entertainment', label: 'Entertainment', percentage: 15, notes: 'DJ or activities' },
      { category: 'photography', label: 'Photography', percentage: 5, notes: 'Optional photographer' },
      { category: 'other', label: 'Favours & gifts', percentage: 5, notes: 'Guest favours' },
    ],
    tradeOffs: [
      'Host at home to eliminate venue costs — save up to 25%',
      'Make it a potluck-style gathering for close friends',
      'Skip professional photographer and assign a friend with a good camera',
    ],
  },

  college: {
    summary:
      'An energetic college event for {guests} students at {location}, celebrating campus life and creating lasting memories. The {theme} theme sets a vibrant, youthful tone. [Demo Mode]',
    themeRecommendations: [
      'Carnival & Fairground — rides, games, and cotton candy fun',
      'Music Festival — outdoor stage, food trucks, and live performances',
      'Hollywood Glam — red carpet arrivals and movie-star moments',
      'Around the World — international food and cultural booths',
    ],
    schedule: [
      { time: '17:00', title: 'Event setup and vendor arrival', description: 'Volunteers and vendors set up stalls and stages', duration: 60 },
      { time: '18:00', title: 'Doors open to students', description: 'Welcome and registration', duration: 30 },
      { time: '18:30', title: 'Opening ceremony', description: 'Welcome address and official opening', duration: 20 },
      { time: '18:50', title: 'Activities and entertainment begin', description: 'Games, booths, and performances', duration: 120 },
      { time: '20:50', title: 'Food and refreshments', description: 'Food trucks and stalls open', duration: 60 },
      { time: '21:50', title: 'Main performance / DJ set', description: 'Headline entertainment', duration: 60 },
      { time: '22:50', title: 'Prize giving and closing', description: 'Awards, raffle, and thank-you address', duration: 30 },
    ],
    tasks: [
      { title: 'Get event approval from college administration', description: 'Submit event proposal and get sign-off', daysBeforeEvent: 60, category: 'Administration', priority: 'high' },
      { title: 'Book venue or outdoor space', description: 'Reserve campus quad or hall', daysBeforeEvent: 45, category: 'Venue', priority: 'high' },
      { title: 'Recruit volunteers', description: 'Sign up and brief event volunteers', daysBeforeEvent: 30, category: 'Coordination', priority: 'high' },
      { title: 'Promote event on campus', description: 'Flyers, social media, and announcements', daysBeforeEvent: 21, category: 'Marketing', priority: 'medium' },
      { title: 'Confirm food vendors', description: 'Book food trucks or on-campus catering', daysBeforeEvent: 21, category: 'Catering', priority: 'high' },
      { title: 'Arrange PA system and AV equipment', description: 'Sound system and projector hire', daysBeforeEvent: 14, category: 'Technology', priority: 'high' },
      { title: 'Finalise entertainment lineup', description: 'Confirm performers, DJ, or activity vendors', daysBeforeEvent: 14, category: 'Entertainment', priority: 'high' },
      { title: 'Print tickets or set up online registration', description: 'Manage admission and head count', daysBeforeEvent: 7, category: 'Administration', priority: 'medium' },
    ],
    menuIdeas: [
      'Food truck variety: burgers, tacos, pizza, and wraps',
      'Beverages station with soft drinks and non-alcoholic cocktails',
      'Sweet treats: churros, ice cream, and candy floss',
      'Vegan and allergen-free options clearly labelled',
    ],
    decorationIdeas: [
      'Giant inflatable letters spelling the event name or college initials',
      'Photo wall with college logos and event hashtag',
      'Themed booths and game stalls',
      'Coloured spotlights and LED strip lighting',
    ],
    entertainmentSuggestions: [
      'Student band or performer showcase',
      'DJ with crowd-pleasing playlist',
      'Carnival games and competitions with prizes',
      'Social media photo challenge with event hashtag',
    ],
    budgetPercentages: [
      { category: 'venue', label: 'Venue & permits', percentage: 15, notes: 'Campus or external venue' },
      { category: 'catering', label: 'Food & beverages', percentage: 35, notes: 'Food trucks and stalls' },
      { category: 'entertainment', label: 'Entertainment', percentage: 25, notes: 'Performers and activities' },
      { category: 'decoration', label: 'Decorations', percentage: 10, notes: 'Themed décor' },
      { category: 'technology', label: 'AV & technology', percentage: 10, notes: 'Sound, lighting, screens' },
      { category: 'other', label: 'Marketing & admin', percentage: 5, notes: 'Flyers and printing' },
    ],
    tradeOffs: [
      'Use campus spaces for free to eliminate venue costs',
      'Recruit student volunteers instead of paid staff',
      'Partner with local businesses for food sponsorships',
    ],
  },

  community: {
    summary:
      'A vibrant community celebration for {guests} attendees at {location}, bringing neighbours together in the spirit of {theme}. [Demo Mode]',
    themeRecommendations: [
      'Summer Street Fair — outdoor market, live music, and family activities',
      'Cultural Festival — celebrate local heritage with food and performances',
      'Garden Party — relaxed gathering in a park or community garden',
      'Charity Gala — formal fundraiser with auction and dinner',
    ],
    schedule: [
      { time: '10:00', title: 'Venue setup', description: 'Stalls, tables, and decorations set up', duration: 120 },
      { time: '12:00', title: 'Community event opens', description: 'Welcome community members', duration: 30 },
      { time: '12:30', title: 'Activities and stalls', description: 'Food, crafts, and community activities', duration: 180 },
      { time: '15:30', title: 'Community programme and performances', description: 'Scheduled acts and speakers', duration: 60 },
      { time: '16:30', title: 'Prize draw and community awards', description: 'Recognition of community contributors', duration: 30 },
      { time: '17:00', title: 'Event close and clean-up', description: 'Thank-you and farewells', duration: 60 },
    ],
    tasks: [
      { title: 'Obtain event permits', description: 'Council approval for outdoor events', daysBeforeEvent: 60, category: 'Administration', priority: 'high' },
      { title: 'Book venue or park area', description: 'Secure the event space', daysBeforeEvent: 45, category: 'Venue', priority: 'high' },
      { title: 'Recruit community volunteers', description: 'Organise volunteer rota', daysBeforeEvent: 30, category: 'Coordination', priority: 'high' },
      { title: 'Arrange community stalls and vendors', description: 'Invite local businesses and artisans', daysBeforeEvent: 30, category: 'Vendors', priority: 'medium' },
      { title: 'Promote event in the community', description: 'Flyers, local press, and social media', daysBeforeEvent: 21, category: 'Marketing', priority: 'medium' },
      { title: 'Arrange entertainment and speakers', description: 'Confirm local acts and community leaders', daysBeforeEvent: 21, category: 'Entertainment', priority: 'medium' },
      { title: 'Arrange insurance and first aid', description: 'Public liability and first aid cover', daysBeforeEvent: 14, category: 'Safety', priority: 'high' },
      { title: 'Set up waste management plan', description: 'Recycling stations and volunteer clean-up crew', daysBeforeEvent: 7, category: 'Administration', priority: 'medium' },
    ],
    menuIdeas: [
      'Community BBQ with vegetarian options',
      'Local food stalls with diverse cuisines',
      'Homemade bake-off contributions from community members',
      'Non-alcoholic punch and soft drinks station',
    ],
    decorationIdeas: [
      'Bunting and banners in community colours',
      'Community noticeboard and photo wall',
      'Flower displays from local gardening club',
      'Children\'s art showcase from local schools',
    ],
    entertainmentSuggestions: [
      'Local band or musician performance',
      'Children\'s activities corner',
      'Community sports competitions',
      'Raffle and prize draw for charity',
    ],
    budgetPercentages: [
      { category: 'venue', label: 'Venue & permits', percentage: 20, notes: 'Park hire and permits' },
      { category: 'catering', label: 'Food & refreshments', percentage: 30, notes: 'Catering and stalls' },
      { category: 'entertainment', label: 'Entertainment', percentage: 20, notes: 'Performers and activities' },
      { category: 'decoration', label: 'Decorations', percentage: 10, notes: 'Bunting and signage' },
      { category: 'technology', label: 'Equipment', percentage: 10, notes: 'PA system and tables' },
      { category: 'other', label: 'Marketing & admin', percentage: 10, notes: 'Permits and publicity' },
    ],
    tradeOffs: [
      'Apply for community grants to offset venue and equipment costs',
      'Encourage community stall holders to bring their own equipment',
      'Use social media for free event promotion instead of paid advertising',
    ],
  },

  corporate: {
    summary:
      'A professional corporate event for {guests} attendees at {location} with a {theme} focus. Designed to foster networking, celebrate achievements, and strengthen team culture. [Demo Mode]',
    themeRecommendations: [
      'Awards Gala — black tie celebration of company achievements',
      'Innovation Summit — TED-talk style with product launches',
      'Team Building Retreat — outdoor activities and workshops',
      'Client Appreciation Evening — cocktail reception and networking',
    ],
    schedule: [
      { time: '17:30', title: 'Registration and welcome reception', description: 'Networking with canapés and drinks', duration: 60 },
      { time: '18:30', title: 'Welcome address', description: 'Opening remarks from senior leadership', duration: 20 },
      { time: '18:50', title: 'Keynote or programme', description: 'Main presentation, panel, or awards', duration: 60 },
      { time: '19:50', title: 'Dinner service', description: '3-course dinner with wine service', duration: 90 },
      { time: '21:20', title: 'Entertainment and networking', description: 'Band, DJ, or social programme', duration: 90 },
      { time: '23:00', title: 'Event close', description: 'Farewell and transport arrangements', duration: 30 },
    ],
    tasks: [
      { title: 'Confirm event objectives and stakeholders', description: 'Align on goals and approval chain', daysBeforeEvent: 90, category: 'Administration', priority: 'high' },
      { title: 'Book venue', description: 'Corporate venue with AV and catering facilities', daysBeforeEvent: 60, category: 'Venue', priority: 'high' },
      { title: 'Send save-the-date to attendees', description: 'Corporate invitations with agenda', daysBeforeEvent: 45, category: 'Communications', priority: 'high' },
      { title: 'Confirm speakers and agenda', description: 'Finalise programme and run of show', daysBeforeEvent: 30, category: 'Programme', priority: 'high' },
      { title: 'Arrange AV and technology requirements', description: 'Presentation screens, microphones, lighting', daysBeforeEvent: 21, category: 'Technology', priority: 'high' },
      { title: 'Finalise catering menu', description: 'Dietary requirements and service style', daysBeforeEvent: 14, category: 'Catering', priority: 'high' },
      { title: 'Prepare event materials', description: 'Name badges, programmes, branded items', daysBeforeEvent: 7, category: 'Administration', priority: 'medium' },
    ],
    menuIdeas: [
      'Canape selection during reception',
      'Starter: Pan-seared scallops or seasonal salad',
      'Main: Beef tenderloin or pan-roasted sea bass with vegetarian alternative',
      'Dessert: Chocolate fondant or lemon tart',
      'Wine pairing throughout dinner',
    ],
    decorationIdeas: [
      'Corporate branding on backdrop and table centrepieces',
      'Elegant floral arrangements in company colours',
      'Professional AV setup with branded presentation screens',
      'Personalised name place cards and table numbers',
    ],
    entertainmentSuggestions: [
      'Jazz quartet or piano entertainment during dinner',
      'Award ceremony segment with branded trophies',
      'Interactive quiz or team challenge',
      'Photo opportunity with branded backdrop',
    ],
    budgetPercentages: [
      { category: 'venue', label: 'Venue', percentage: 25, notes: 'Corporate venue hire' },
      { category: 'catering', label: 'Catering & bar', percentage: 35, notes: 'Per-head estimate' },
      { category: 'technology', label: 'AV & technology', percentage: 15, notes: 'Sound, lighting, screens' },
      { category: 'decoration', label: 'Décor & florals', percentage: 10, notes: 'Corporate branding' },
      { category: 'entertainment', label: 'Entertainment', percentage: 10, notes: 'Band or activities' },
      { category: 'other', label: 'Admin & materials', percentage: 5, notes: 'Branded items, printing' },
    ],
    tradeOffs: [
      'Virtual or hybrid format can dramatically reduce venue and catering costs',
      'Internal speakers eliminate external keynote fees',
      'Partner with a venue that provides AV bundled in the hire fee',
    ],
  },

  anniversary: {
    summary:
      'A heartfelt anniversary celebration for {guests} guests at {location}, honouring a beautiful milestone. The {theme} setting creates an intimate and romantic atmosphere. [Demo Mode]',
    themeRecommendations: [
      'Golden Elegance — gold and ivory for landmark anniversaries',
      'Romantic Garden Party — floral abundance and intimate seating',
      'Vintage Hollywood — glamour and nostalgia with black and gold',
      'Intimate Dinner Party — small group, exceptional food and wine',
    ],
    schedule: [
      { time: '18:00', title: 'Guests arrive', description: 'Welcome drinks and photo display of memories', duration: 30 },
      { time: '18:30', title: 'Dinner service begins', description: 'Champagne toast and starter', duration: 30 },
      { time: '19:00', title: 'Main course and toasts', description: 'Heartfelt speeches from family and friends', duration: 60 },
      { time: '20:00', title: 'Memory slideshow', description: 'Photo and video tribute to the couple', duration: 20 },
      { time: '20:20', title: 'Anniversary cake cutting', description: 'Traditional cake moment', duration: 15 },
      { time: '20:35', title: 'Dancing and celebration', description: 'Dancing and socialising', duration: 90 },
      { time: '22:00', title: 'Farewell', description: 'Thank-you and farewell to guests', duration: 30 },
    ],
    tasks: [
      { title: 'Choose venue and book', description: 'Private dining room or intimate venue', daysBeforeEvent: 60, category: 'Venue', priority: 'high' },
      { title: 'Send invitations', description: 'Personal invitations to close family and friends', daysBeforeEvent: 45, category: 'Stationery', priority: 'high' },
      { title: 'Create memory slideshow', description: 'Gather photos and create video tribute', daysBeforeEvent: 30, category: 'Entertainment', priority: 'medium' },
      { title: 'Book florist for arrangements', description: 'Flowers and table centrepieces', daysBeforeEvent: 21, category: 'Flowers', priority: 'medium' },
      { title: 'Plan dinner menu', description: 'Favourite dishes and wine pairing', daysBeforeEvent: 14, category: 'Catering', priority: 'high' },
      { title: 'Order anniversary cake', description: 'Personalised design with milestone message', daysBeforeEvent: 14, category: 'Catering', priority: 'medium' },
      { title: 'Arrange special surprise', description: 'Renewal of vows, gift, or serenade', daysBeforeEvent: 7, category: 'Entertainment', priority: 'medium' },
    ],
    menuIdeas: [
      'Champagne and canapés on arrival',
      'Starter: Couple\'s favourite appetiser',
      'Main: Premium cuts or seafood with paired wines',
      'Dessert: Anniversary cake with personal decorations',
      'Late-night cheese board and digestifs',
    ],
    decorationIdeas: [
      'Memory photo display with timeline of the relationship',
      'Floral centrepieces in the couple\'s favourite flowers',
      'Personalised milestone banner or sign',
      'Candle-lit table settings for intimate atmosphere',
      'Guest book for messages and well-wishes',
    ],
    entertainmentSuggestions: [
      'Live musician playing songs from the couple\'s shared history',
      'Memory video montage as dinner entertainment',
      'Renewal of vows ceremony',
      'Guest message book and photo Polaroid station',
    ],
    budgetPercentages: [
      { category: 'venue', label: 'Venue', percentage: 20, notes: 'Intimate private dining' },
      { category: 'catering', label: 'Catering & drinks', percentage: 40, notes: 'Premium food and wine' },
      { category: 'decoration', label: 'Décor & florals', percentage: 15, notes: 'Romantic floral arrangements' },
      { category: 'entertainment', label: 'Entertainment', percentage: 10, notes: 'Musician or slideshow' },
      { category: 'photography', label: 'Photography', percentage: 10, notes: 'Event photographer' },
      { category: 'other', label: 'Cake & extras', percentage: 5, notes: 'Anniversary cake' },
    ],
    tradeOffs: [
      'Host an intimate dinner at home with a private chef — unique and often more affordable',
      'Ask family and friends to contribute their own photos for a free digital slideshow',
      'A weeknight booking often gets better rates for private dining rooms',
    ],
  },
};
