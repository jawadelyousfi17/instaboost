import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_USERS = [
  "creative_jane",
  "tech.mike99",
  "foodie_anna",
  "travel.alex",
  "fitness_sara",
  "art_by_nina",
  "music.dan",
  "photo_studio",
  "design.lab",
  "coffee_lover",
  "wanderer.ben",
  "minimal_mood",
  "city.lights",
  "the.daily_grace",
  "sunset_chasers",
];

const FAKE_POST_URLS = [
  "https://instagram.com/p/Cx1aB2cD3eF/",
  "https://instagram.com/p/Dx4gH5iJ6kL/",
  "https://instagram.com/p/Ex7mN8oP9qR/",
  "https://instagram.com/p/Fx0sT1uV2wX/",
  "https://instagram.com/p/Gh3yZ4aB5cD/",
  "https://instagram.com/p/Hi6eF7gH8iJ/",
];

const TYPES = ["FOLLOW", "LIKE", "VIEW"] as const;

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function main() {
  console.log("🌱 Seeding…");

  let profileCount = 0;
  let orderCount = 0;

  for (const username of SEED_USERS) {
    const userId = `seed_${username}`;

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        instagramUsername: username,
        coins: rand(40, 600),
      },
      update: {
        coins: rand(40, 600),
      },
    });
    profileCount++;

    // 1-3 orders per profile
    const ordersForUser = rand(1, 3);
    for (let i = 0; i < ordersForUser; i++) {
      const type = pick(TYPES);
      const target = type === "FOLLOW" ? username : pick(FAKE_POST_URLS);
      const quantityRequested = pick([10, 25, 50, 75, 100, 150]);
      const quantityDelivered = rand(0, Math.max(0, quantityRequested - 5));

      // Don't double-create identical orders (target+type+profile)
      const existing = await prisma.order.findFirst({
        where: { profileId: profile.id, type, target },
      });
      if (existing) continue;

      await prisma.order.create({
        data: {
          profileId: profile.id,
          type,
          target,
          quantityRequested,
          quantityDelivered,
          costPerAction: 10,
          rewardPerAction: 5,
          status: "ACTIVE",
        },
      });
      orderCount++;
    }
  }

  console.log(`✅ ${profileCount} profiles, ${orderCount} new orders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
