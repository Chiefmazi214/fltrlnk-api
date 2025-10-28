import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LifestyleInfoService } from '../src/user/lifestyle-info.service';
import { LifestyleCategory } from '../src/user/models/lifestyle-info.model';

// Category mapping from NicheData.json to LifestyleCategory enum
const categoryMapping = {
  'Sports': LifestyleCategory.SPORTS,
  'Activity': LifestyleCategory.HOBBIES,
  'Outdoors': LifestyleCategory.OUTDOORS,
  'Entertainment': LifestyleCategory.ENTERTAINMENT,
  'Music': LifestyleCategory.MUSIC,
  'Art': LifestyleCategory.ART,
  'STEM': LifestyleCategory.STEM,
  'Business': LifestyleCategory.CAREER,
  'Food': LifestyleCategory.FOOD,
  'Outing': LifestyleCategory.OUTING,
  'Leisure': LifestyleCategory.LEISURE,
  'Night Life': LifestyleCategory.NIGHT_LIFE,
  'Lifestyle': LifestyleCategory.LIFESTYLE
};

// Icon mapping for different categories
const iconMapping = {
  [LifestyleCategory.SPORTS]: ['🏀', '⚽', '🎾', '🏈', '⚾', '🏐', '🏓', '🏸', '🏊', '🏂', '🎿', '🏄', '🥊', '🤼', '🏉', '🏏', '🥎', '🏑', '🏒', '🏓', '🏹', '🧗', '🚴', '🏃', '🤸', '🏋️', '🧘', '🥋', '🤺', '🥏', '🎯', '🏆', '💪', '🏃‍♀️', '🏃‍♂️'],
  [LifestyleCategory.HOBBIES]: ['🎨', '📚', '🎮', '🎵', '🎬', '📷', '🎭', '🎪', '🎯', '🧩', '🎲', '🃏', '🎪', '🎨', '✏️', '🖼️', '🎭', '🎪', '🎯', '🧩', '🎲', '🃏', '🎪', '🎨', '✏️', '🖼️', '🎭', '🎪', '🎯', '🧩', '🎲', '🃏', '🎪'],
  [LifestyleCategory.MUSIC]: ['🎵', '🎶', '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎧', '📻', '💿', '🎼', '🎹', '🎸', '🎺', '🎻', '🥁', '🎤', '🎧', '📻', '💿', '🎼', '🎹', '🎸', '🎺', '🎻', '🥁', '🎤', '🎧', '📻', '💿', '🎼'],
  [LifestyleCategory.MOVIES]: ['🎬', '🎭', '🎪', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨'],
  [LifestyleCategory.GAMES]: ['🎮', '🕹️', '🎲', '🃏', '🎯', '🧩', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥'],
  [LifestyleCategory.LIFESTYLE]: ['🌟', '💫', '✨', '💎', '👑', '🏆', '💪', '🧘', '🏃', '🎯', '🎨', '📚', '🎵', '🎬', '🍔', '☕', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🍾', '🥃', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🍾', '🥃'],
  [LifestyleCategory.CAREER]: ['💼', '👔', '💻', '🎨', '📊', '📈', '📉', '💰', '💳', '🏦', '📱', '💻', '🖥️', '📱', '💻', '🖥️', '📱', '💻', '🖥️', '📱', '💻', '🖥️', '📱', '💻', '🖥️', '📱', '💻', '🖥️', '📱', '💻', '🖥️', '📱'],
  [LifestyleCategory.OUTDOORS]: ['🏔️', '⛰️', '🌲', '🌳', '🌿', '🏕️', '⛺', '🎒', '🥾', '🏃', '🚴', '🚣', '🏊', '🏄', '🏂', '🎿', '🧗', '🏹', '🎣', '🔭', '🌌', '🌅', '🌄', '🌊', '🏖️', '🏝️', '🏜️', '🏞️', '🌋', '🏔️', '🗻', '🏔️'],
  [LifestyleCategory.ENTERTAINMENT]: ['🎬', '🎭', '🎪', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨', '📺', '🎥', '🎞️', '🎟️', '🎪', '🎭', '🎨'],
  [LifestyleCategory.ART]: ['🎨', '🖼️', '🖌️', '✏️', '📝', '🎭', '🎪', '🎨', '🖼️', '🖌️', '✏️', '📝', '🎭', '🎪', '🎨', '🖼️', '🖌️', '✏️', '📝', '🎭', '🎪', '🎨', '🖼️', '🖌️', '✏️', '📝', '🎭', '🎪', '🎨', '🖼️', '🖌️', '✏️', '📝'],
  [LifestyleCategory.STEM]: ['🔬', '🧪', '⚗️', '🧬', '🧠', '💻', '🤖', '🔋', '⚡', '🌐', '📡', '🛰️', '🚀', '🌍', '🔭', '📊', '📈', '📉', '💾', '🔒', '🔐', '🔑', '💡', '🔧', '⚙️', '🔩', '🔨', '🛠️', '📱', '💻', '🖥️', '⌨️'],
  [LifestyleCategory.FOOD]: ['🍔', '🍕', '🍜', '🍣', '🍱', '🥗', '🥪', '🌮', '🌯', '🍖', '🍗', '🥩', '🥓', '🍳', '🥚', '🥛', '🧀', '🥖', '🥐', '🍞', '🥨', '🥯', '🥞', '🧇', '🥓', '🍳', '🥚', '🥛', '🧀', '🥖', '🥐', '🍞', '🥨'],
  [LifestyleCategory.OUTING]: ['☕', '🍺', '🍷', '🍸', '🍹', '🎭', '🎪', '🎨', '🖼️', '🎭', '🎪', '🎨', '🖼️', '🎭', '🎪', '🎨', '🖼️', '🎭', '🎪', '🎨', '🖼️', '🎭', '🎪', '🎨', '🖼️', '🎭', '🎪', '🎨', '🖼️', '🎭', '🎪', '🎨', '🖼️'],
  [LifestyleCategory.LEISURE]: ['📚', '📖', '📝', '✍️', '🧘', '🛀', '🛁', '🛏️', '🛋️', '🪑', '🛎️', '🕯️', '🕰️', '⏰', '⏱️', '⏲️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟'],
  [LifestyleCategory.NIGHT_LIFE]: ['🌙', '⭐', '🌟', '✨', '💫', '🌃', '🌆', '🌇', '🌉', '🏙️', '🌃', '🌆', '🌇', '🌉', '🏙️', '🌃', '🌆', '🌇', '🌉', '🏙️', '🌃', '🌆', '🌇', '🌉', '🏙️', '🌃', '🌆', '🌇', '🌉', '🏙️', '🌃', '🌆', '🌇']
};

// NicheData from the JSON file
const nicheData = {
  "categories": [
    {
      "name": "Sports",
      "interests": [
        "Basketball", "Football", "Soccer", "Tennis", "Golf", "Baseball", "Swimming", "Volleyball", "Surfing", "Snowboarding", "Skiing", "Skateboarding", "Boxing", "MMA", "Wrestling", "Lacrosse", "Rugby", "Cricket", "Softball", "Badminton", "Ping Pong", "Archery", "Rock Climbing", "Cycling", "Track & Field", "Gymnastics", "Cheerleading", "Ice Hockey", "Field Hockey", "Pickleball", "Fencing", "Ultimate Frisbee", "Esports", "Weightlifting", "Pilates", "CrossFit", "Hiking", "Yoga", "Karate", "Taekwondo", "Parkour", "Judo", "Handball", "Dodgeball", "Rowing", "Triathlons", "Marathons", "Powerlifting", "Cheer Stunting", "Speed Skating", "Sailing", "Fishing", "Polo", "Scuba Diving", "Peloton", "NBA2K", "Callaway", "Nike", "ESPN", "Michael Jordan", "Serena Williams", "Cristiano Ronaldo"
      ]
    },
    {
      "name": "Activity",
      "interests": [
        "Gym Workouts", "Dance Classes", "Cooking Classes", "Pottery Workshops", "DIY Crafting", "Escape Rooms", "Laser Tag", "Bowling", "Arcade Games", "Go-Karting", "Virtual Reality Gaming", "Painting & Sipping", "Karaoke Nights", "Axe Throwing", "Mini Golf", "Indoor Rock Climbing", "Yoga Retreats", "Paintball", "Board Game Nights", "Puzzle Solving", "Thrifting", "Gardening", "Car Modding", "Cosplay", "Photography Walks", "Wine Tasting", "Bar Crawls", "Horseback Riding", "Ice Skating", "Rollerblading", "DIY Woodworking", "Candle Making", "Lego Building", "Knitting", "Calligraphy", "Jewelry Making", "Baking Bread", "Video Editing", "Drone Flying", "Dog Training", "Aquascaping", "Puzzle Cubing", "Improv Classes", "Food Festivals", "Anime Conventions", "Maker Labs", "3D Printing", "Ziplining", "Karaoke Booths", "Indoor Skydiving", "Virtual Reality Arcades", "LEGO", "Oculus Quest", "TopGolf", "Dave & Buster's", "ClassPass", "Bob Ross", "Martha Stewart", "Tony Hawk"
      ]
    },
    {
      "name": "Outdoors",
      "interests": [
        "Hiking", "Camping", "Backpacking", "Mountain Biking", "Kayaking", "Canoeing", "Paddleboarding", "Stargazing", "Birdwatching", "Hunting", "Fishing", "Rock Climbing", "Trail Running", "Orienteering", "Glamping", "Gardening", "Outdoor Yoga", "Skiing", "Snowboarding", "Surfing", "Windsurfing", "Paragliding", "Kite Surfing", "Horseback Riding", "Dog Walking", "Road Trips", "National Parks", "Beach Volleyball", "Snorkeling", "Scuba Diving", "Sailing", "Motorcycling", "Outdoor Photography", "Foraging", "Bushcraft/Survival Skills", "ATV Riding", "Dirt Biking", "Ziplining", "Caving/Spelunking", "Hunting & Archery", "Bonfire Nights", "Sunset Chasing", "Slacklining", "Tree Planting", "Nature Journaling", "Hot Springs", "Farmers' Markets", "Snowshoeing", "Polar Plunges", "Outdoor Concerts", "Patagonia", "The North Face", "REI", "YETI Cooler", "Hydro Flask", "GoPro Hero", "Bear Grylls", "Steve Irwin", "John Muir"
      ]
    },
    {
      "name": "Entertainment",
      "interests": [
        "Movies", "TV Series", "Stand-Up Comedy", "Theater", "Improv Comedy", "Broadway Shows", "Magic Shows", "Musicals", "Anime", "Marvel Movies", "DC Comics", "Netflix Binging", "Hulu Originals", "YouTube Creators", "Podcasts", "Video Essays", "TikTok Trends", "Memes", "Roasts", "Game Shows", "Award Shows", "Red Carpet Events", "Celeb Gossip", "Theme Parks", "Escape Rooms", "Cosplay", "Karaoke Nights", "Concerts", "Open Mic Nights", "DJ Performances", "Music Festivals", "Street Performers", "Esports", "Watch Parties", "Film Festivals", "Reality TV", "Rom-Coms", "Thrillers", "Documentaries", "Horror Movies", "Sci-Fi Series", "Crime Dramas", "Sitcoms", "Animated Movies", "Retro Cartoons", "Drive-In Theaters", "AMC Theatres", "Netflix", "Hulu", "PlayStation 5", "Nintendo Switch", "HBO Max", "Zendaya", "Kevin Hart", "Beyoncé"
      ]
    },
    {
      "name": "Music",
      "interests": [
        "Pop", "Hip-Hop", "R&B", "Jazz", "Blues", "Rock", "Punk Rock", "Heavy Metal", "Indie", "Lo-fi Beats", "Classical", "Opera", "Country", "Reggae", "Afrobeat", "K-Pop", "EDM", "House Music", "Folk", "Soul", "Funk", "Gospel", "Grunge", "Trap", "Drill", "Latin Music", "Salsa", "Bachata", "Flamenco", "Acoustic Covers", "Vinyl Collecting", "DJ Mixing", "Songwriting", "Music Production", "Concert Photography", "Music Video Making", "Music Festivals", "Battle of the Bands", "Spotify Playlists", "Apple Music", "SoundCloud", "TikTok Music Trends", "GarageBand", "Fender Guitar", "Beats Headphones", "Rolling Stone", "Spotify", "Live Nation", "Drake", "Billie Eilish", "Bad Bunny"
      ]
    },
    {
      "name": "Art",
      "interests": [
        "Painting", "Drawing", "Sketching", "Graffiti", "Calligraphy", "Pottery", "Sculpting", "Origami", "Photography", "Street Art", "Graphic Design", "Fashion Design", "Textile Art", "Interior Design", "Architecture", "Animation", "Comic Book Art", "Manga Drawing", "Cartooning", "Digital Art", "3D Modeling", "Jewelry Making", "Embroidery", "Resin Art", "Mosaics", "Murals", "Stained Glass Art", "Face Painting", "Henna Art", "Mixed Media Art", "Art Installations", "Performance Art", "Set Design", "Cinematography", "Typography", "Creative Writing", "Film Editing", "Concept Art", "Tattoo Art", "Makeup Artistry", "Costume Design", "Photography Editing", "Clay Modeling", "Art History", "Modern Art", "Abstract Art", "Surrealism", "Renaissance Art", "Andy Warhol", "Jean-Michel Basquiat", "Frida Kahlo", "MoMA", "Sotheby's", "Adobe Creative Cloud", "Procreate", "Wacom Tablet"
      ]
    },
    {
      "name": "STEM",
      "interests": [
        "Coding", "Robotics", "Artificial Intelligence", "Machine Learning", "Data Science", "Mathematics", "Quantum Physics", "Space Exploration", "Astronomy", "Biology", "Chemistry", "Physics", "Environmental Science", "Sustainability", "Engineering", "Mechanical Design", "Electrical Engineering", "Biotechnology", "Genetics", "Neuroscience", "Psychology", "Statistics", "Web Development", "App Development", "Cloud Computing", "Blockchain", "Cybersecurity", "Ethical Hacking", "Virtual Reality", "Augmented Reality", "Scientific Research", "Marine Biology", "Forensic Science", "Medicine", "Pharmacology", "Anatomy", "Nanotechnology", "Renewable Energy", "UX/UI Design", "Software Engineering", "Climate Change Solutions", "STEM Education", "SpaceX", "NASA", "Tesla", "Arduino", "Raspberry Pi", "MATLAB", "Elon Musk", "Marie Curie", "Neil deGrasse Tyson"
      ]
    },
    {
      "name": "Business",
      "interests": [
        "Startups", "Entrepreneurship", "Venture Capital", "Angel Investing", "Small Business", "Franchising", "Business Strategy", "E-commerce", "Dropshipping", "Real Estate Investing", "Stock Market", "Cryptocurrency", "Branding", "Marketing", "Social Media Marketing", "Content Marketing", "Email Marketing", "Sales", "Networking", "Public Speaking", "Business Coaching", "Financial Planning", "Tax Strategy", "Business Law", "Consulting", "Business Analytics", "SaaS Businesses", "Product Development", "Customer Service", "Business Operations", "Team Building", "Leadership", "Negotiation Skills", "Time Management", "Lean Startups", "MVP Development", "Crowdfunding", "Side Hustles", "Passive Income", "Digital Nomad Lifestyle", "Business Travel", "Harvard Business Review", "Y Combinator", "Shopify", "QuickBooks", "Slack", "LinkedIn", "Warren Buffett", "Jeff Bezos", "Oprah Winfrey"
      ]
    },
    {
      "name": "Food",
      "interests": [
        "Cooking", "Baking", "Grilling", "Vegan Food", "Vegetarian Recipes", "Keto Diet", "Paleo Recipes", "Gluten-Free Baking", "Soul Food", "Italian Cuisine", "Mexican Food", "Sushi Making", "French Cuisine", "Thai Food", "Indian Spices", "Mediterranean Diet", "Farm-to-Table", "BBQ", "Street Food", "Food Photography", "Meal Prep", "Gourmet Cooking", "Desserts", "Pastry Art", "Cheese Tasting", "Charcuterie Boards", "Coffee Enthusiast", "Tea Lover", "Wine Tasting", "Craft Beer", "Cocktail Mixing", "Smoothie Bowls", "Food Trucks", "Farmers Markets", "Michelin-Star Restaurants", "Food Festivals", "Cooking Shows", "Air Fryer Recipes", "Instant Pot Meals", "Comfort Food", "Food Blogging", "Blue Apron", "DoorDash", "Whole Foods", "Le Creuset", "KitchenAid Mixer", "Nespresso", "Gordon Ramsay", "Anthony Bourdain", "Chrissy Teigen"
      ]
    },
    {
      "name": "Outing",
      "interests": [
        "Coffee Shops", "Bookstores", "Museums", "Art Galleries", "Nightclubs", "Bars", "Wine Bars", "Breweries", "Rooftop Lounges", "Theaters", "Concert Venues", "Food Markets", "Karaoke Bars", "Comedy Clubs", "Jazz Bars", "Farmer's Markets", "Open-Air Cinemas", "Street Fairs", "Amusement Parks", "Water Parks", "Arcades", "Bowling Alleys", "Ice Skating Rinks", "Roller Skating", "Community Centers", "Festivals", "Flea Markets", "Vintage Shops", "Fashion Boutiques", "City Tours", "Boat Rides", "Sightseeing", "Historical Monuments", "Parks", "Gardens", "Zoos", "Aquariums", "Escape Rooms", "TopGolf", "Starbucks Reserve", "AMC Theatres", "Urban Outfitters", "PlayStation VR", "Uber", "Leonardo DiCaprio", "Taylor Swift", "Quentin Tarantino"
      ]
    },
    {
      "name": "Leisure",
      "interests": [
        "Reading", "Journaling", "Meditation", "Yoga", "Bubble Baths", "Skincare Routines", "Home Decor", "Aromatherapy", "Gardening", "Watching Movies", "Listening to Podcasts", "Birdwatching", "Collecting Vinyl", "Playing Piano", "Solving Puzzles", "Coloring Books", "Board Games", "Knitting", "Crocheting", "Sewing", "Playing Chess", "Stargazing", "Tea Ceremonies", "Napping", "Essential Oils", "Watching Documentaries", "Listening to Audiobooks", "Afternoon Tea", "Spa Days", "Massage Therapy", "Hammocking", "Cozy Cafes", "Candlemaking", "Baking Cookies", "Wine & Cheese Nights", "Vision Boards", "Netflix", "Calm App", "Audible", "Kindle Paperwhite", "Nintendo Switch Lite", "Apple AirPods Max", "Jane Austen", "Bob Ross", "Eckhart Tolle"
      ]
    },
    {
      "name": "Night Life",
      "interests": [
        "Nightclubs", "Lounges", "Speakeasies", "Dive Bars", "Hookah Bars", "Karaoke Bars", "Rooftop Bars", "Beach Bars", "Jazz Bars", "Wine Bars", "Whiskey Bars", "Cigar Bars", "Sports Bars", "Happy Hour", "Clubbing", "VIP Tables", "Bottle Service", "Dance Floors", "Silent Disco", "Pub Crawls", "Bar Hopping", "Drag Shows", "Live DJs", "DJ Sets", "Pool Parties", "Casino Nights", "After Hours Clubs", "EDM Festivals", "House Music Nights", "Latin Dance Nights", "Salsa Clubs", "Reggaeton Nights", "Open Mic Nights", "Comedy Clubs", "Strip Clubs", "Concerts", "Hip-Hop Nights", "Dance Battles", "Glow Parties", "Themed Parties", "Boat Parties", "Karaoke Competitions", "Raves", "Burlesque Shows", "Piano Bars", "Arcade Bars", "Pool Halls", "18+ Nights", "Champagne", "Mojitos", "Margaritas", "Cosmopolitans", "Old Fashioned", "Whiskey", "Tequila Shots", "Vodka", "Rum Punch", "Craft Cocktails", "Energy Drinks", "Red Bull & Vodka", "Hookah Flavors", "Frozen Daiquiris", "Sangria", "Calvin Harris", "Tiësto", "Steve Aoki", "David Guetta", "Drake", "Bad Bunny", "Travis Scott", "Rihanna", "Diplo", "Cardi B", "Tao Group", "Hakkasan", "LIV Miami", "Marquee Nightclub", "XS Las Vegas", "Pacha Ibiza", "E11EVEN Miami", "Hyde Lounge", "Drai's Nightclub", "Omnia Nightclub", "Moët & Chandon", "Hennessy", "Patron Tequila", "Grey Goose Vodka", "Don Julio 1942", "Red Bull", "JBL PartyBox", "Glow Sticks", "Strobe Lights", "VIP Wristbands"
      ]
    },
    {
      "name": "Lifestyle",
      "interests": [
        "Jet Setter", "World Traveler", "Digital Nomad", "City Explorer", "Beach Lover", "Adventurer", "Mountain Climber", "Road Tripper", "Minimalist", "Maximalist", "Eco-Friendly", "Fitness Addict", "Wellness Guru", "Health Enthusiast", "Fashion Icon", "Sneakerhead", "Streetwear Enthusiast", "Luxury Lover", "High Roller", "Entrepreneur", "Mogul", "Artist", "Creative Thinker", "Homebody", "Social Butterfly", "Workaholic", "Trendsetter", "Vintage Lover", "Bookworm", "Music Lover", "Party Starter", "Romantic", "Foodie", "Plant Parent", "Dog Lover", "Cat Person", "Spiritual Soul", "Night Owl", "Early Riser", "Athlete", "Model", "Designer", "Photographer", "Videographer", "Influencer", "Content Creator", "Blogger", "Writer", "Investor", "CEO", "Coach", "Mentor", "Chef", "Barista", "Dancer", "Singer", "DJ", "Skater", "Surfer", "Cyclist", "Collector", "DIY Enthusiast", "Activist", "Philanthropist", "Kim Kardashian", "Virgil Abloh", "Elon Musk", "Rihanna", "Steve Jobs", "Oprah Winfrey", "Cristiano Ronaldo", "Kylie Jenner", "Pharrell Williams", "Gigi Hadid", "Louis Vuitton", "Supreme", "Tesla", "Lululemon", "Apple", "Gucci", "Balenciaga", "Equinox", "Soho House", "Goop", "iPhone", "AirPods Max", "Peloton Bike", "Rolex Watch", "Chanel No. 5 Perfume", "Hydro Flask Bottle", "MacBook Pro", "Rimowa Luggage", "Yeezy Sneakers", "Kindle Paperwhite"
      ]
    }
  ]
};

function getRandomIcon(category: LifestyleCategory): string {
  const icons = iconMapping[category];
  return icons[Math.floor(Math.random() * icons.length)];
}

async function seedLifestyleInfo() {
  console.log('🚀 Starting lifestyle info seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const lifestyleInfoService = app.get(LifestyleInfoService);
  
  let totalInserted = 0;
  let totalSkipped = 0;
  
  try {
    for (const category of nicheData.categories) {
      const mappedCategory = categoryMapping[category.name];
      
      if (!mappedCategory) {
        console.log(`⚠️  Skipping category "${category.name}" - no mapping found`);
        continue;
      }
      
      console.log(`📝 Processing category: ${category.name} -> ${mappedCategory}`);
      
      for (const interest of category.interests) {
        try {
          // Check if already exists
          const existing = await lifestyleInfoService.getLifestyleInfoByCategory(mappedCategory);
          const exists = existing.some(item => item.name.toLowerCase() === interest.toLowerCase());
          
          if (exists) {
            console.log(`⏭️  Skipping "${interest}" - already exists`);
            totalSkipped++;
            continue;
          }
          
          // Create new lifestyle info
          const lifestyleInfo = {
            name: interest,
            icon: getRandomIcon(mappedCategory),
            category: mappedCategory,
            isActive: true
          };
          
          await lifestyleInfoService.createLifestyleInfo(lifestyleInfo);
          console.log(`✅ Created: ${interest} (${mappedCategory})`);
          totalInserted++;
          
        } catch (error) {
          console.error(`❌ Error creating "${interest}":`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Total inserted: ${totalInserted}`);
    console.log(`   ⏭️  Total skipped: ${totalSkipped}`);
    console.log(`   📈 Total processed: ${totalInserted + totalSkipped}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

// Run the seeding script
seedLifestyleInfo()
  .then(() => {
    console.log('✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 