import type { Ensemble } from '@/types';
import { img, portrait, square } from '@/lib/images';

export const ensembles: Ensemble[] = [
  {
    slug: 'ozbekiston-davlat-simfonik-orkestri',
    name: {
      uz: 'O‘zbekiston Davlat simfonik orkestri',
      ru: 'Государственный симфонический оркестр Узбекистана',
      en: 'State Symphony Orchestra of Uzbekistan',
    },
    type: 'orkestr',
    region: 'toshkent-shahri',
    city: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    conductor: 'Aziz Shohakimov',
    memberCount: 92,
    foundedYear: 1938,
    logo: square('sso-logo'),
    banner: img('sso-banner', 1600, 700),
    shortDescription: {
      uz: 'Mamlakatning yetakchi akademik simfonik jamoasi, jahon va milliy klassikasi ijrochisi.',
      ru: 'Ведущий академический симфонический коллектив страны, исполнитель мировой и национальной классики.',
      en: 'The nation’s leading academic symphony, performing world and national classics.',
    },
    history: {
      uz: '1938-yilda tashkil etilgan orkestr o‘zbek simfonik musiqasining shakllanishida hal qiluvchi rol o‘ynagan. Jamoa ko‘plab jahon sahnalarida gastrol qilib, milliy bastakorlar asarlarini targ‘ib etib kelmoqda.',
      ru: 'Оркестр, основанный в 1938 году, сыграл ключевую роль в становлении узбекской симфонической музыки. Коллектив гастролировал на многих мировых сценах, продвигая произведения национальных композиторов.',
      en: 'Founded in 1938, the orchestra was pivotal in shaping Uzbek symphonic music. The ensemble has toured major world stages, championing the works of national composers.',
    },
    members: [
      { name: 'Aziz Shohakimov', role: { uz: 'Bosh dirijyor', ru: 'Главный дирижёр', en: 'Principal conductor' } },
      { name: 'Kamola Yusupova', role: { uz: 'Konsertmeyster', ru: 'Концертмейстер', en: 'Concertmaster' } },
      { name: 'Rustam Ibragimov', role: { uz: 'Birinchi violonchel', ru: 'Первая виолончель', en: 'Principal cello' } },
      { name: 'Dilnoza Karimova', role: { uz: 'Fleyta', ru: 'Флейта', en: 'Flute' } },
    ],
    repertoire: [
      { composer: 'Muxtor Ashrafiy', work: { uz: '"Amir Temur" simfoniyasi', ru: 'Симфония «Амир Темур»', en: '“Amir Temur” Symphony' } },
      { composer: 'P. Chaykovskiy', work: { uz: '5-simfoniya', ru: 'Симфония № 5', en: 'Symphony No. 5' } },
      { composer: 'G. Mahler', work: { uz: '1-simfoniya', ru: 'Симфония № 1', en: 'Symphony No. 1' } },
      { composer: 'Xamid Rahimov', work: { uz: '"Vatan" uvertyurasi', ru: 'Увертюра «Ватан»', en: '“Vatan” Overture' } },
    ],
    gallery: [
      { src: img('sso-g1'), caption: { uz: 'Katta zaldagi konsert', ru: 'Концерт в большом зале', en: 'Concert in the grand hall' } },
      { src: img('sso-g2'), caption: { uz: 'Repetitsiya jarayoni', ru: 'Репетиция', en: 'Rehearsal' } },
      { src: img('sso-g3'), caption: { uz: 'Xalqaro gastrol', ru: 'Международные гастроли', en: 'International tour' } },
      { src: img('sso-g4'), caption: { uz: 'Yosh solistlar bilan', ru: 'С молодыми солистами', en: 'With young soloists' } },
    ],
    videos: [
      { title: { uz: 'Ashrafiy — "Amir Temur"', ru: 'Ашрафи — «Амир Темур»', en: 'Ashrafiy — “Amir Temur”' }, youtubeId: 'jNQXAC9IVRw' },
      { title: { uz: 'Chaykovskiy — 5-simfoniya', ru: 'Чайковский — Симфония № 5', en: 'Tchaikovsky — Symphony No. 5' }, youtubeId: 'kxL4mSEQmvo' },
    ],
    featured: true,
  },
  {
    slug: 'navoi-teatri-simfonik-orkestri',
    name: {
      uz: 'Navoiy teatri simfonik orkestri',
      ru: 'Симфонический оркестр театра имени Навои',
      en: 'Navoi Theatre Symphony Orchestra',
    },
    type: 'orkestr',
    region: 'toshkent-shahri',
    city: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    conductor: 'Denis Vlasenko',
    memberCount: 78,
    foundedYear: 1939,
    logo: square('navoi-logo'),
    banner: img('navoi-banner', 1600, 700),
    shortDescription: {
      uz: 'Alisher Navoiy nomidagi Davlat akademik Katta teatrining opera va balet orkestri.',
      ru: 'Оперно-балетный оркестр Государственного академического Большого театра имени Алишера Навои.',
      en: 'The opera and ballet orchestra of the Alisher Navoi State Academic Bolshoi Theatre.',
    },
    history: {
      uz: 'Teatr orkestri opera va balet spektakllarining musiqiy poydevori bo‘lib, milliy va jahon repertuarini ijro etadi.',
      ru: 'Оркестр театра является музыкальной основой оперных и балетных спектаклей, исполняя национальный и мировой репертуар.',
      en: 'The theatre orchestra is the musical foundation of opera and ballet productions, performing national and world repertoire.',
    },
    members: [
      { name: 'Denis Vlasenko', role: { uz: 'Bosh dirijyor', ru: 'Главный дирижёр', en: 'Principal conductor' } },
      { name: 'Nigora Rahmonova', role: { uz: 'Konsertmeyster', ru: 'Концертмейстер', en: 'Concertmaster' } },
      { name: 'Bobur Tojiyev', role: { uz: 'Klarnet', ru: 'Кларнет', en: 'Clarinet' } },
    ],
    repertoire: [
      { composer: 'S. Yudakov', work: { uz: '"Maysaraning ishi" operasi', ru: 'Опера «Проделки Майсары»', en: '“Maysara’s Mischief” opera' } },
      { composer: 'G. Verdi', work: { uz: '"Aida" operasi', ru: 'Опера «Аида»', en: '“Aida” opera' } },
      { composer: 'P. Chaykovskiy', work: { uz: '"Oqqush ko‘li" baleti', ru: 'Балет «Лебединое озеро»', en: '“Swan Lake” ballet' } },
    ],
    gallery: [
      { src: img('navoi-g1'), caption: { uz: 'Opera premyerasi', ru: 'Премьера оперы', en: 'Opera premiere' } },
      { src: img('navoi-g2'), caption: { uz: 'Orkestr chuquri', ru: 'Оркестровая яма', en: 'Orchestra pit' } },
      { src: img('navoi-g3'), caption: { uz: 'Balet spektakli', ru: 'Балетный спектакль', en: 'Ballet performance' } },
    ],
    videos: [
      { title: { uz: 'Verdi — "Aida"', ru: 'Верди — «Аида»', en: 'Verdi — “Aida”' }, youtubeId: 'ScMzIvxBSi4' },
    ],
    featured: true,
  },
  {
    slug: 'ozbekiston-davlat-akademik-xori',
    name: {
      uz: 'O‘zbekiston Davlat akademik xori',
      ru: 'Государственная академическая хоровая капелла Узбекистана',
      en: 'State Academic Choir of Uzbekistan',
    },
    type: 'xor',
    region: 'toshkent-shahri',
    city: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    conductor: 'Surayyo Alimova',
    memberCount: 56,
    foundedYear: 1948,
    logo: square('choir-logo'),
    banner: img('choir-banner', 1600, 700),
    shortDescription: {
      uz: 'A cappella va simfonik-xor asarlari ijrochisi bo‘lgan yetakchi akademik xor jamoasi.',
      ru: 'Ведущий академический хоровой коллектив, исполнитель a cappella и симфонико-хоровых произведений.',
      en: 'A leading academic choir performing a cappella and symphonic-choral works.',
    },
    history: {
      uz: '1948-yildan buyon faoliyat yuritayotgan xor milliy xor san’atining tayanchi hisoblanadi va jahon xor adabiyotini ijro etadi.',
      ru: 'Действующий с 1948 года хор является опорой национального хорового искусства и исполняет мировую хоровую литературу.',
      en: 'Active since 1948, the choir is a pillar of national choral art and performs the world choral repertoire.',
    },
    members: [
      { name: 'Surayyo Alimova', role: { uz: 'Bosh xormeyster', ru: 'Главный хормейстер', en: 'Principal choirmaster' } },
      { name: 'Jamshid Nazarov', role: { uz: 'Tenor solisti', ru: 'Солист-тенор', en: 'Tenor soloist' } },
      { name: 'Malika Ismoilova', role: { uz: 'Sopranо solisti', ru: 'Солистка-сопрано', en: 'Soprano soloist' } },
    ],
    repertoire: [
      { composer: 'S. Rahmaninov', work: { uz: '"Butun tun qo‘riqlash"', ru: '«Всенощное бдение»', en: '“All-Night Vigil”' } },
      { composer: 'Mustafo Bafoyev', work: { uz: '"Navoiy" xor poemasi', ru: 'Хоровая поэма «Навои»', en: '“Navoi” choral poem' } },
      { composer: 'W. A. Mozart', work: { uz: '"Requiem"', ru: '«Реквием»', en: '“Requiem”' } },
    ],
    gallery: [
      { src: img('choir-g1'), caption: { uz: 'A cappella konserti', ru: 'Концерт a cappella', en: 'A cappella concert' } },
      { src: img('choir-g2'), caption: { uz: 'Xor va orkestr', ru: 'Хор и оркестр', en: 'Choir and orchestra' } },
      { src: img('choir-g3'), caption: { uz: 'Festival ishtiroki', ru: 'Участие в фестивале', en: 'Festival appearance' } },
    ],
    videos: [
      { title: { uz: 'Bafoyev — "Navoiy"', ru: 'Бафоев — «Навои»', en: 'Bafoyev — “Navoi”' }, youtubeId: 'aqz-KE-bpKQ' },
    ],
    featured: true,
  },
  {
    slug: 'turon-milliy-cholgu-orkestri',
    name: {
      uz: '"Turon" milliy cholg‘u asboblari orkestri',
      ru: 'Оркестр национальных инструментов «Турон»',
      en: '“Turon” National Instruments Orchestra',
    },
    type: 'orkestr',
    region: 'toshkent-shahri',
    city: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    conductor: 'Feruza Abdurahimova',
    memberCount: 45,
    foundedYear: 1996,
    logo: square('turon-logo'),
    banner: img('turon-banner', 1600, 700),
    shortDescription: {
      uz: 'Milliy cholg‘u asboblarida akademik va an’anaviy musiqani ijro etuvchi noyob jamoa.',
      ru: 'Уникальный коллектив, исполняющий академическую и традиционную музыку на национальных инструментах.',
      en: 'A unique ensemble performing academic and traditional music on national instruments.',
    },
    history: {
      uz: 'Orkestr an’anaviy cholg‘ular — dutor, rubob, g‘ijjak, nay asosida akademik ijrochilik maktabini rivojlantiradi.',
      ru: 'Оркестр развивает академическую школу исполнительства на традиционных инструментах — дутаре, рубабе, гиджаке, нае.',
      en: 'The orchestra advances an academic performance school on traditional instruments — dutar, rubab, gijjak and nay.',
    },
    members: [
      { name: 'Feruza Abdurahimova', role: { uz: 'Bosh dirijyor', ru: 'Главный дирижёр', en: 'Principal conductor' } },
      { name: 'Sardor Xolmatov', role: { uz: 'Rubob', ru: 'Рубаб', en: 'Rubab' } },
      { name: 'Gulnora Tosheva', role: { uz: 'Nay', ru: 'Най', en: 'Nay' } },
    ],
    repertoire: [
      { composer: 'Xalq musiqasi', work: { uz: '"Munojot" makomi', ru: 'Маком «Мунаджат»', en: '“Munojot” maqom' } },
      { composer: 'Feruz Ashrafiy', work: { uz: '"Turon" syuitasi', ru: 'Сюита «Турон»', en: '“Turon” suite' } },
    ],
    gallery: [
      { src: img('turon-g1'), caption: { uz: 'Milliy cholg‘ular', ru: 'Национальные инструменты', en: 'National instruments' } },
      { src: img('turon-g2'), caption: { uz: 'Ochiq havo konserti', ru: 'Концерт под открытым небом', en: 'Open-air concert' } },
    ],
    videos: [
      { title: { uz: '"Turon" syuitasi', ru: 'Сюита «Турон»', en: '“Turon” suite' }, youtubeId: 'M7lc1UVf-VE' },
    ],
  },
  {
    slug: 'samarqand-kamer-orkestri',
    name: {
      uz: 'Samarqand kamer orkestri',
      ru: 'Самаркандский камерный оркестр',
      en: 'Samarkand Chamber Orchestra',
    },
    type: 'ansambl',
    region: 'samarqand',
    city: { uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' },
    conductor: 'Timur Mahmudov',
    memberCount: 24,
    foundedYear: 2004,
    logo: square('sam-logo'),
    banner: img('sam-banner', 1600, 700),
    shortDescription: {
      uz: 'Barokko va zamonaviy kamer musiqasiga ixtisoslashgan mintaqaviy jamoa.',
      ru: 'Региональный коллектив, специализирующийся на барочной и современной камерной музыке.',
      en: 'A regional ensemble specialising in Baroque and contemporary chamber music.',
    },
    history: {
      uz: 'Samarqandning tarixiy sahnalarida muntazam konsertlar bilan chiqib, mintaqada kamer musiqasini targ‘ib etadi.',
      ru: 'Регулярно выступает на исторических площадках Самарканда, продвигая камерную музыку в регионе.',
      en: 'Performs regularly at Samarkand’s historic venues, promoting chamber music in the region.',
    },
    members: [
      { name: 'Timur Mahmudov', role: { uz: 'Badiiy rahbar', ru: 'Художественный руководитель', en: 'Artistic director' } },
      { name: 'Ozoda Rasulova', role: { uz: 'Skripka', ru: 'Скрипка', en: 'Violin' } },
    ],
    repertoire: [
      { composer: 'A. Vivaldi', work: { uz: '"Fasllar"', ru: '«Времена года»', en: '“The Four Seasons”' } },
      { composer: 'W. A. Mozart', work: { uz: '"Eine kleine Nachtmusik"', ru: '«Маленькая ночная серенада»', en: '“Eine kleine Nachtmusik”' } },
    ],
    gallery: [
      { src: img('sam-g1'), caption: { uz: 'Registon sahnasida', ru: 'На сцене Регистана', en: 'On the Registan stage' } },
      { src: img('sam-g2'), caption: { uz: 'Kamer konsert', ru: 'Камерный концерт', en: 'Chamber concert' } },
    ],
    videos: [
      { title: { uz: 'Vivaldi — "Fasllar"', ru: 'Вивальди — «Времена года»', en: 'Vivaldi — “The Four Seasons”' }, youtubeId: 'GtL1huin9EE' },
    ],
  },
  {
    slug: 'buxoro-yoshlar-xori',
    name: {
      uz: 'Buxoro yoshlar xori',
      ru: 'Бухарский молодёжный хор',
      en: 'Bukhara Youth Choir',
    },
    type: 'xor',
    region: 'buxoro',
    city: { uz: 'Buxoro', ru: 'Бухара', en: 'Bukhara' },
    conductor: 'Zilola Yodgorova',
    memberCount: 38,
    foundedYear: 2012,
    logo: square('bux-logo'),
    banner: img('bux-banner', 1600, 700),
    shortDescription: {
      uz: 'Yosh xonandalarni birlashtiruvchi, milliy va zamonaviy xor asarlarini ijro etuvchi jamoa.',
      ru: 'Коллектив, объединяющий молодых певцов и исполняющий национальные и современные хоровые произведения.',
      en: 'An ensemble uniting young singers, performing national and contemporary choral works.',
    },
    history: {
      uz: 'Jamoa yosh iste’dodlarni akademik xor san’atiga jalb etish maqsadida tashkil etilgan.',
      ru: 'Коллектив создан с целью привлечения молодых талантов в академическое хоровое искусство.',
      en: 'The ensemble was founded to bring young talents into academic choral art.',
    },
    members: [
      { name: 'Zilola Yodgorova', role: { uz: 'Xormeyster', ru: 'Хормейстер', en: 'Choirmaster' } },
      { name: 'Aziza Qodirova', role: { uz: 'Solist', ru: 'Солистка', en: 'Soloist' } },
    ],
    repertoire: [
      { composer: 'Milliy xalq qo‘shiqlari', work: { uz: '"Yor-yor" turkumi', ru: 'Цикл «Ёр-ёр»', en: '“Yor-yor” cycle' } },
      { composer: 'J. Rutter', work: { uz: '"For the Beauty of the Earth"', ru: '«For the Beauty of the Earth»', en: '“For the Beauty of the Earth”' } },
    ],
    gallery: [
      { src: img('bux-g1'), caption: { uz: 'Yoshlar konserti', ru: 'Молодёжный концерт', en: 'Youth concert' } },
      { src: img('bux-g2'), caption: { uz: 'Repetitsiya', ru: 'Репетиция', en: 'Rehearsal' } },
    ],
    videos: [
      { title: { uz: '"Yor-yor" turkumi', ru: 'Цикл «Ёр-ёр»', en: '“Yor-yor” cycle' }, youtubeId: 'e-ORhEE9VVg' },
    ],
  },
];

export function getEnsembleBySlug(slug: string): Ensemble | undefined {
  return ensembles.find((e) => e.slug === slug);
}
