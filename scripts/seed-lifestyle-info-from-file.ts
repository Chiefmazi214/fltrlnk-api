import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LifestyleInfoService } from '../src/user/lifestyle-info.service';
import { LifestyleCategory } from '../src/user/models/lifestyle-info.model';
import * as fs from 'fs';
import * as path from 'path';

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

function getRandomIcon(category: LifestyleCategory): string {
  const icons = iconMapping[category];
  return icons[Math.floor(Math.random() * icons.length)];
}

function loadNicheData(): any {
  try {
    // Try to find the NicheData.json file in different possible locations
    const possiblePaths = [
      path.join(__dirname, '../NicheData.json'),
      path.join(__dirname, '../../NicheData.json'),
      path.join(process.cwd(), 'NicheData.json'),
      path.join(process.cwd(), 'data/NicheData.json'),
      path.join(process.cwd(), 'src/data/NicheData.json')
    ];

    let nicheData = null;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        console.log(`📁 Found NicheData.json at: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        nicheData = JSON.parse(fileContent);
        break;
      }
    }

    if (!nicheData) {
      throw new Error('NicheData.json file not found. Please ensure the file exists in one of the expected locations.');
    }

    return nicheData;
  } catch (error) {
    console.error('❌ Error loading NicheData.json:', error.message);
    throw error;
  }
}

async function seedLifestyleInfo() {
  console.log('🚀 Starting lifestyle info seeding from file...');
  
  // Load the niche data from file
  const nicheData = loadNicheData();
  
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
      
      console.log(`📝 Processing category: ${category.name} -> ${mappedCategory} (${category.interests.length} interests)`);
      
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