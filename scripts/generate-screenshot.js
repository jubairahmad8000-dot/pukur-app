import sharp from 'sharp';
import path from 'path';

async function makeScreenshot() {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="540" height="960" viewBox="0 0 540 960">
    <rect width="540" height="960" fill="#f8fafc" />
    <!-- Header -->
    <rect width="540" height="110" fill="#047857" />
    <circle cx="50" cy="55" r="24" fill="#065f46" />
    <text x="88" y="52" fill="#ffffff" font-size="22" font-family="sans-serif" font-weight="bold">পুকুর হিসাব</text>
    <text x="88" y="74" fill="#a7f3d0" font-size="13" font-family="sans-serif">মাছ চাষ ব্যবস্থাপনা</text>
    
    <!-- Tab navigation -->
    <rect x="20" y="130" width="500" height="48" rx="10" fill="#ffffff" stroke="#e2e8f0" />
    <rect x="24" y="134" width="115" height="40" rx="8" fill="#047857" />
    <text x="81" y="159" fill="#ffffff" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">পুকুরসমূহ</text>
    <text x="195" y="159" fill="#64748b" font-size="14" font-family="sans-serif" text-anchor="middle">খাবার হিসাব</text>
    <text x="310" y="159" fill="#64748b" font-size="14" font-family="sans-serif" text-anchor="middle">খরচের হিসাব</text>
    <text x="430" y="159" fill="#64748b" font-size="14" font-family="sans-serif" text-anchor="middle">মাছ বিক্রি</text>

    <!-- Stats Grid -->
    <rect x="20" y="195" width="240" height="95" rx="12" fill="#ffffff" stroke="#e2e8f0" />
    <text x="35" y="225" fill="#64748b" font-size="12" font-family="sans-serif">মোট খরচ</text>
    <text x="35" y="258" fill="#e11d48" font-size="22" font-family="sans-serif" font-weight="bold">৳ ১২,৪৫০</text>

    <rect x="280" y="195" width="240" height="95" rx="12" fill="#ffffff" stroke="#e2e8f0" />
    <text x="295" y="225" fill="#64748b" font-size="12" font-family="sans-serif">মোট বিক্রি</text>
    <text x="295" y="258" fill="#059669" font-size="22" font-family="sans-serif" font-weight="bold">৳ ৩৫,৮০০</text>

    <!-- Pond Card 1 -->
    <rect x="20" y="305" width="500" height="150" rx="14" fill="#ffffff" stroke="#cbd5e1" />
    <text x="40" y="340" fill="#0f172a" font-size="18" font-family="sans-serif" font-weight="bold">উত্তর পাড়ের পুকুর</text>
    <rect x="420" y="322" width="80" height="24" rx="12" fill="#d1fae5" />
    <text x="460" y="338" fill="#065f46" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">সক্রিয়</text>
    <text x="40" y="375" fill="#475569" font-size="13" font-family="sans-serif">আয়তন: ৪৫ শতাংশ | মাছের জাত: রুই, কাতল</text>
    <text x="40" y="405" fill="#059669" font-size="14" font-family="sans-serif" font-weight="bold">নিট লাভ: +৳ ২৩,৩৫০</text>

    <!-- Bottom Float Nav -->
    <rect x="180" y="870" width="180" height="50" rx="25" fill="#047857" />
    <text x="270" y="901" fill="#ffffff" font-size="15" font-family="sans-serif" font-weight="bold" text-anchor="middle">+ নতুন এন্ট্রি</text>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.resolve('public', 'screenshot.png'));

  console.log('Screenshot generated!');
}

makeScreenshot();
