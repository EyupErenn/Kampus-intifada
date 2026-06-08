-- ============================================================
-- Campus İntifada – Initial Schema
-- ============================================================


-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_tr   TEXT NOT NULL,
  title_en   TEXT NOT NULL,
  title_ar   TEXT NOT NULL,
  content_tr TEXT,
  content_en TEXT,
  content_ar TEXT,
  image_url  TEXT,
  event_date DATE,
  category   TEXT CHECK (category IN ('duyuru', 'ozet', 'acil', 'etkinlik')),
  is_pinned  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tents (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug      TEXT UNIQUE NOT NULL,
  name_tr   TEXT,
  name_en   TEXT,
  name_ar   TEXT,
  desc_tr   TEXT,
  desc_en   TEXT,
  desc_ar   TEXT,
  icon      TEXT,
  color     TEXT,
  order_num INT
);

CREATE TABLE resources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tent_id      UUID REFERENCES tents(id) ON DELETE CASCADE,
  type         TEXT CHECK (type IN ('video', 'makale', 'kitap', 'infografik')),
  url          TEXT,
  title        TEXT,
  description  TEXT,
  submitted_by TEXT,
  is_approved  BOOLEAN DEFAULT false,
  votes        INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tent_id    UUID REFERENCES tents(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 3 AND 500),
  author     TEXT NOT NULL,
  likes      INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments      ENABLE ROW LEVEL SECURITY;

-- ---- announcements ----------------------------------------

CREATE POLICY "announcements_select"
  ON announcements FOR SELECT
  USING (true);

CREATE POLICY "announcements_insert"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "announcements_update"
  ON announcements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "announcements_delete"
  ON announcements FOR DELETE
  TO authenticated
  USING (true);

-- ---- tents ------------------------------------------------

CREATE POLICY "tents_select"
  ON tents FOR SELECT
  USING (true);

CREATE POLICY "tents_insert"
  ON tents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "tents_update"
  ON tents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tents_delete"
  ON tents FOR DELETE
  TO authenticated
  USING (true);

-- ---- resources --------------------------------------------

CREATE POLICY "resources_select"
  ON resources FOR SELECT
  USING (true);

-- anon may submit resources, but is_approved must stay false
CREATE POLICY "resources_insert_anon"
  ON resources FOR INSERT
  TO anon
  WITH CHECK (is_approved = false);

-- anon may only update votes column (increment_votes() function handles the +1 logic)
CREATE POLICY "resources_vote_anon"
  ON resources FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (is_approved = false OR is_approved = true);

-- ---- comments ---------------------------------------------

CREATE POLICY "comments_select"
  ON comments FOR SELECT
  USING (true);

-- anon may post comments (table CHECK enforces length 3–500)
CREATE POLICY "comments_insert_anon"
  ON comments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "comments_update"
  ON comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "comments_delete"
  ON comments FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================
-- SEED: TENTS
-- ============================================================

INSERT INTO tents (slug, name_tr, name_en, name_ar, desc_tr, desc_en, desc_ar, icon, color, order_num) VALUES

(
  'sumud',
  'Sumud Çadırı',
  'Sumud Tent',
  'خيمة الصمود',
  'Direniş hafızası ve dayanışma duvarı. Fotoğraflar, el yazılı mektuplar ve sesli tanıklıklar aracılığıyla kolektif belleği yaşatır; ziyaretçiler anı kağıdına mesajlarını bırakabilir.',
  'Resistance memory and solidarity wall. Keeps collective memory alive through photographs, handwritten letters and audio testimonies; visitors can leave messages on memory paper.',
  'ذاكرة المقاومة وجدار التضامن. يحيي الذاكرة الجماعية من خلال الصور والرسائل المكتوبة بخط اليد والشهادات الصوتية؛ يمكن للزوار ترك رسائلهم على ورق الذاكرة.',
  'anchor', '#3b82f6', 1
),

(
  'boykot',
  'Boykot Çadırı',
  'Boycott Tent',
  'خيمة المقاطعة',
  'Farkındalık, alternatifler ve bilinç. BDS hareketini tanıtır; hangi markaların neden boykot edildiğini, yerli ve küresel alternatiflerini gösterir. Katılımcılar taahhüt kartı imzalayabilir.',
  'Awareness, alternatives and consciousness. Introduces the BDS movement; shows which brands are boycotted and why, along with local and global alternatives. Participants can sign a pledge card.',
  'التوعية والبدائل والوعي. يعرّف بحركة المقاطعة BDS ويشرح سبب مقاطعة العلامات التجارية مع عرض البدائل المحلية والعالمية. يمكن للمشاركين التوقيع على بطاقة التعهد.',
  'shield-off', '#f59e0b', 2
),

(
  'dar-agaci',
  'Dar Ağacı Çadırı',
  'Gallows Tent',
  'خيمة المشنقة',
  '12 bin esirin hikayesi. Filistinli tutukluların isimlerini, yüzlerini ve hikayelerini belgeler. Çocuk mahkumlar dahil binlerce insanın yaşadığı haksızlıkları görünür kılar.',
  'The story of 12 thousand prisoners. Documents the names, faces and stories of Palestinian detainees. Makes visible the injustices suffered by thousands of people, including child prisoners.',
  'قصة اثني عشر ألف أسير. يوثّق أسماء المعتقلين الفلسطينيين ووجوههم وقصصهم. يُعيد الظهور للمظالم التي عاناها آلاف الأشخاص، بمن فيهم الأطفال المعتقلون.',
  'key', '#8b5cf6', 3
),

(
  'sayilarla',
  'Sayılarla Gazze',
  'Gaza in Numbers',
  'غزة بالأرقام',
  'Rakamların dili. Gazze''deki insani krizin boyutunu BM verilerine dayanan etkileşimli infografikler ve anlık sayaçlarla gözler önüne serer. Rakamların arkasındaki insan gerçekliğini hatırlatır.',
  'The language of statistics. Exposes the scale of the humanitarian crisis in Gaza through interactive infographics and real-time counters based on UN data. A reminder of the human reality behind the numbers.',
  'لغة الإحصاءات. يكشف حجم الأزمة الإنسانية في غزة من خلال الرسوم البيانية التفاعلية وعدادات الوقت الفعلي المستندة إلى بيانات الأمم المتحدة. تذكير بالواقع الإنساني خلف الأرقام.',
  'bar-chart-2', '#ef4444', 4
),

(
  'cocuk',
  'Çocuk Çadırı',
  'Children''s Tent',
  'خيمة الأطفال',
  'Yarınların sesi. Çocuklara özel interaktif etkinlikler, resim sergileri ve Gazzeli çocukların kaleme aldığı şiirler. Küçük ellerin büyük direnişini anlatır.',
  'The voice of tomorrow. Interactive activities for children, art exhibitions and poems written by children from Gaza. It tells the story of the great resistance of little hands.',
  'صوت الغد. أنشطة تفاعلية مخصصة للأطفال ومعارض فنية وقصائد كتبها أطفال من غزة. يحكي قصة مقاومة الأيدي الصغيرة العظيمة.',
  'heart', '#ec4899', 5
),

(
  'kutuphane',
  'Kütüphane Çadırı',
  'Library Tent',
  'خيمة المكتبة',
  'Eğitim ve kaynaklar. Kitaplar, makaleler, belgeseller ve akademik çalışmalar aracılığıyla Filistin meselesini derinlemesine anlamak için düzenlenmiş açık bir arşiv.',
  'Education and resources. An open archive for a deeper understanding of the Palestinian cause through books, articles, documentaries and academic studies.',
  'التعليم والمصادر. أرشيف مفتوح لفهم أعمق للقضية الفلسطينية من خلال الكتب والمقالات والوثائقيات والدراسات الأكاديمية.',
  'book-open', '#10b981', 6
);


-- ============================================================
-- SEED: TIMELINE EVENTS
-- ============================================================

INSERT INTO announcements
  (title_tr, title_en, title_ar, content_tr, content_en, content_ar, image_url, event_date, category, is_pinned)
VALUES

(
  'Açılış Töreni',
  'Opening Ceremony',
  'حفل الافتتاح',
  'Saat 10:00 – BTU Kampüsü ana girişinde gerçekleşecek açılış törenine tüm öğrenciler, akademisyenler ve misafirler davetlidir. Öğrenci temsilcileri tarafından yapılacak konuşmalar, koro, ve sembolik çadır kurulumu ile etkinliğimiz resmî olarak başlayacak.',
  '10:00 – All students, academics and guests are invited to the opening ceremony at the main entrance of BTU Campus. The event will officially begin with speeches by student representatives, a choir and a symbolic tent setup.',
  'الساعة 10:00 – يُدعى جميع الطلاب والأكاديميين والضيوف لحضور حفل الافتتاح عند المدخل الرئيسي لحرم BTU. ستبدأ الفعالية رسمياً بكلمات ممثلي الطلاب والجوقة الموسيقية وإنشاء الخيمة الرمزية.',
  NULL,
  CURRENT_DATE, 'etkinlik', true
),

(
  'Kampüs Meydanı Toplanma ve Basın Açıklaması',
  'Campus Square Rally & Press Statement',
  'تجمع الساحة وبيان صحفي',
  'Saat 12:30 – Kampüs meydanındaki kitlesel toplanmada öğrenci temsilcileri ve akademisyenler ortak bir basın açıklaması okuyacak. Filistin''e dayanışma mesajı ulusal ve uluslararası basına iletilecek.',
  '12:30 – At the mass gathering in the campus square, student representatives and academics will read a joint press statement. The message of solidarity with Palestine will be conveyed to national and international press.',
  'الساعة 12:30 – في التجمع الحاشد بساحة الحرم الجامعي، سيقرأ ممثلو الطلاب والأكاديميون بياناً صحفياً مشتركاً. ستُوجَّه رسالة التضامن مع فلسطين إلى الصحافة المحلية والدولية.',
  NULL,
  CURRENT_DATE, 'etkinlik', false
),

(
  'Panel: Akademik Boykot',
  'Panel: Academic Boycott',
  'ندوة: المقاطعة الأكاديمية',
  'Saat 14:00 – Farklı disiplinlerden akademisyenler ve öğrencilerin katılacağı bu panelde akademik boykotun önemi, tarihsel arka planı, pratik uygulamaları ve üniversitelerin bu süreçteki rolü tartışılacak. Soru-cevap bölümüne aktif katılım beklenmektedir.',
  '14:00 – In this panel with academics from different disciplines and students, the importance of academic boycott, its historical background, practical applications and the role of universities in this process will be discussed. Active participation in the Q&A session is expected.',
  'الساعة 14:00 – ستناقش هذه الندوة بمشاركة أكاديميين من تخصصات مختلفة وطلاب أهمية المقاطعة الأكاديمية وخلفيتها التاريخية وتطبيقاتها العملية ودور الجامعات. تُتوقع المشاركة الفعلية في جلسة الأسئلة والأجوبة.',
  NULL,
  CURRENT_DATE, 'etkinlik', false
),

(
  'Çocuk Atölyesi',
  'Children''s Workshop',
  'ورشة عمل الأطفال',
  'Saat 16:00 – Çocuk Çadırı''nda düzenlenecek bu atölyede çocuklar resim, şiir ve hikaye anlatımı yoluyla duygularını ifade edebilecek. Gönüllü pedagog ve eğitmenler eşliğinde barış ve dayanışma temalı yaratıcı etkinlikler yer alacak.',
  '16:00 – In this workshop at the Children''s Tent, children will be able to express their feelings through drawing, poetry and storytelling. Creative activities on peace and solidarity themes will be held with volunteer pedagogues and educators.',
  'الساعة 16:00 – في هذه الورشة بخيمة الأطفال، سيتمكن الأطفال من التعبير عن مشاعرهم من خلال الرسم والشعر ورواية القصص. ستُقام أنشطة إبداعية حول موضوعات السلام والتضامن بمصاحبة معلمين ومربين متطوعين.',
  NULL,
  CURRENT_DATE, 'etkinlik', false
),

(
  'Kapanış ve Ortak Dua',
  'Closing & Collective Prayer',
  'الختام والصلاة الجماعية',
  'Saat 18:00 – Etkinliğimizin kapanış oturumunda tüm katılımcılar bir araya gelerek Gazzeli kardeşlerimiz için ortak bir dua gerçekleştirecek. Akabinde ertesi gün için dayanışma çağrısı ve programa dair duyurular paylaşılacak.',
  '18:00 – In the closing session of our event, all participants will come together for a collective prayer for our brothers and sisters in Gaza. Calls to solidarity and announcements regarding the next day''s programme will then be shared.',
  'الساعة 18:00 – في الجلسة الختامية، سيجتمع جميع المشاركين لأداء صلاة جماعية من أجل إخوتنا في غزة. ثم ستُشارَك نداءات التضامن والإعلانات المتعلقة برنامج اليوم التالي.',
  NULL,
  CURRENT_DATE, 'etkinlik', false
);
