export interface ScheduleItem {
  time: string;
  place: string;
  transport: string;
  activity: string;
  memo?: string;
}

export interface DaySchedule {
  day: string;
  date: string;
  subtitle: string;
  items: ScheduleItem[];
}

export interface AirportInfo {
  code: string;
  name: string;
  terminal: string;
}

export interface CityInfo {
  name: string;
  emoji: string;
  period: string;
  hotel: string;
  flight: string;
  airports: AirportInfo[];
  days: DaySchedule[];
}

export const cities: CityInfo[] = [
  {
    name: "뉴욕",
    emoji: "🗽",
    period: "6/1~6/5",
    hotel: "밀레니엄 힐튼 뉴욕 유엔 원플라자",
    flight: "에어프레미아 YP0131 | 6/1 21:30 ICN → 22:30 EWR",
    airports: [
      { code: "EWR", name: "뉴어크 리버티 국제공항", terminal: "Terminal B" },
      { code: "JFK", name: "존 F. 케네디 국제공항", terminal: "Terminal 4 (델타)" },
    ],
    days: [
      {
        day: "1일차",
        date: "6월 1일 (월)",
        subtitle: "도착",
        items: [
          { time: "22:00~23:00", place: "뉴어크(EWR)", transport: "✈️", activity: "22:30 뉴어크(EWR) 도착", memo: "✈️ 입국심사 30~60분 예상\n• ESTA 승인서 화면 또는 출력본 준비\n• 여행 목적: Tourism / 신혼여행\n• 호텔 주소 적힌 종이/메모 미리\n• 짐 찾고 입국심사 통과 후 우버 호출 (Terminal B 픽업)\n• 미리 우버 잡지 말기 (대기료 발생)" },
          { time: "23:00~00:00", place: "밀레니엄 힐튼", transport: "🚖", activity: "우버 → 호텔 체크인 (~30분)", memo: "🚖 EWR → 맨해튼 우버 ~$70-90 + 팁 ($10~15)\n• Lincoln Tunnel 통과해서 맨해튼 진입\n• 밤이라 30~40분 소요 (낮엔 1시간+)\n• 시차 적응 위해 도착 즉시 잠 추천\n• 호텔 24시간 프론트, 늦은 체크인 문제없음" },
        ],
      },
      {
        day: "2일차",
        date: "6월 2일 (화)",
        subtitle: "",
        items: [
          { time: "06:00~07:00", place: "호텔", transport: "", activity: "06:30 기상 / 샤워" },
          { time: "07:00~08:00", place: "호텔", transport: "", activity: "메이크업 / 옷 준비" },
          { time: "08:00~09:00", place: "Ralph's Coffee", transport: "☕", activity: "Ralph's Coffee (메트 근처)" },
          { time: "09:00~10:00", place: "→ Metropolitan", transport: "🚇", activity: "4/5/6 → 86 St, 메트로폴리탄 이동" },
          { time: "10:00~11:00", place: "Metropolitan Museum", transport: "🚶", activity: "09:30 도착 → 10:00 입장", memo: "🎨 메트로폴리탄 미술관\n• 외국인 입장료 $30/인 (NY 거주자만 기부제)\n• 큰 가방/캐리어 X, 작은 백팩 OK (코트 체크 무료)\n• 사진 OK (플래시·셀카봉 X)\n• 음식·음료 반입 X (카페 있음)\n• 도슨트 미팅 장소·시간 사전 확인" },
          { time: "11:00~12:00", place: "Metropolitan Museum", transport: "", activity: "메트 도슨트 투어 (시안 작가, 10:10~12:40)", memo: "🎨 시안 작가 도슨트 (마이리얼트립)\n• 09:45 도착 → 줄 서기 (10시 오픈)\n• 10:10 시작 / 2시간 30분\n• 만남: 메트 입구 코트보관소 근처\n• ⚠️ 미술관 내부 와이파이 X → 입장 전 만남 안내 메시지 캡처\n• 이어폰 3.5mm 본인 것 권장 (없으면 송수신기 무료 대여)\n• 음식·큰 가방·캐리어 반입 X (입장 거부 가능)\n• 메트 재입장 티켓 포함 → 도슨트 후 자유 관람 가능\n• 투어 하루 전(6/1) 마이리얼트립 메시지창 안내 확인\n• 작품 1개 마음에 담아오기 🌟" },
          { time: "12:00~13:00", place: "Metropolitan Museum", transport: "", activity: "도슨트 마무리" },
          { time: "13:00~14:00", place: "Orsay", transport: "🍽️", activity: "Orsay (프렌치 비스트로, 실내 1시 예약)", memo: "🍽️ Orsay (메트 도보 5분)\n• 1041 Lexington Ave & 75th St\n• 드레스코드 캐주얼~비즈니스 캐주얼\n• 팁 18~20% (계산서에 자동 추가 여부 확인)\n• 추천: 어니언 수프, 스테이크 프리트, 무솔(홍합)" },
          { time: "14:00~15:00", place: "메트 자유관람", transport: "🎨", activity: "메트 자유관람" },
          { time: "15:00~16:00", place: "→ DUMBO", transport: "🚖", activity: "센트럴파크 산책 (선택)" },
          { time: "16:00~17:00", place: "DUMBO, Brooklyn", transport: "🚇", activity: "호텔 → DUMBO 이동 (지하철 F선 York St역)", memo: "🚇 지하철 추천 — F선 York St역 하차 도보 5분" },
          { time: "17:00~18:00", place: "DUMBO, Brooklyn", transport: "📸", activity: "웨딩스냅 촬영 (리베뉴욕)", memo: "📸 리베뉴욕 스냅 안내\n• 잔금: 현장에서 작가님께 달러로 전달\n• 날씨/현지 상황으로 날짜·시간 변동 가능\n• 스냅 앞뒤 여유 시간 필수\n• 무드레퍼런스 5~10장 + 전신사진 이미지 파일로 전달\n• 의상 정해지면 미리 전달\n• FAQ: blog.naver.com/liebe_____/223626004631" },
          { time: "18:00~19:00", place: "Juliana's", transport: "🚶", activity: "🍕 Juliana's 피자", memo: "🍕 Juliana's vs Grimaldi's\n• 같은 자리, 자매점 (창업자가 갈라짐)\n• Juliana's가 살짝 더 짧은 줄 — 줄 짧은 쪽 선택\n• 현금/카드 모두 OK\n• 마르게리타 + No.1 (블랙트러플) 추천\n• Whole pie만 판매 (조각 X)" },
          { time: "19:00~20:00", place: "Randolph Beer DUMBO", transport: "🚶", activity: "🍺 Randolph Beer", memo: "🍺 Randolph Beer DUMBO\n• 82 Prospect St\n• 21+ 신분증 (여권) 필수\n• 수제맥주 종류 많음 (flight 가능)" },
          { time: "20:00~21:00", place: "호텔", transport: "🚖", activity: "호텔 복귀", memo: "🚖 DUMBO → 맨해튼 우버 ~$25-35, 30~40분\n• 지하철도 가능 (F선, 35분), 단 야간엔 우버 권장" },
        ],
      },
      {
        day: "3일차",
        date: "6월 3일 (수)",
        subtitle: "",
        items: [
          { time: "06:00~07:00", place: "호텔", transport: "", activity: "06:30 기상 / 채비" },
          { time: "07:00~08:00", place: "호텔", transport: "", activity: "카페 준비" },
          { time: "08:00~09:00", place: "Little Collins", transport: "☕", activity: "원월드 이동" },
          { time: "09:00~10:00", place: "원월드 트레이드", transport: "🚇", activity: "09:00 타미스 워킹투어 시작 (8시간, 17시 종료)", memo: "👟 맨하탄 원데이 워킹투어 (전망대·크루즈 포함)\n• 미팅: 09:00 / 199 Fulton St, NY 10006 (원월드 트레이드 앞)\n• 종료: 17:00 / Washington Square S, NY 10012\n• 코스: 원월드 전망대 → 9/11 메모리얼 → 트리니티 교회 → 월스트리트/황소동상 → 컨티넨탈 호텔 → 자유의 여신상 크루즈 → 첼시마켓(점심) → 하이라인 → 리틀아일랜드 → 미트패킹 → 블리커/맥두걸 → 워싱턴 스퀘어\n• 8시간 워킹 → 운동화 필수, 양말 두 켤레\n• 선크림 + 모자 + 선글라스 + 물병\n• 첼시마켓 점심 추천: 🌮 Los Tacos No.1 (원조점)\n• 팁: $10~15/인 (한국 가이드 관습)" },
          { time: "10:00~11:00", place: "원월드 전망대", transport: "🚶", activity: "원월드 전망대 / 9/11 메모리얼" },
          { time: "11:00~12:00", place: "월스트리트", transport: "🚶", activity: "트리니티 교회 → 월스트리트 → 황소동상 / 크루즈 탑승" },
          { time: "12:00~13:00", place: "자유의 여신상", transport: "⛴️", activity: "자유의 여신상 크루즈", memo: "⛴️ 자유의 여신상 크루즈\n• 페리 보안검색 (공항 수준) 30분 전 도착\n• 가방 검사, 음료수 통과 X\n• 윗층 야외 갑판이 사진 명소 (사람 많음 → 일찍 가서 자리 잡기)\n• 바람 강함 → 가벼운 겉옷\n• 모자는 날릴 수 있음 (끈 있는 거 권장)" },
          { time: "13:00~14:00", place: "첼시마켓", transport: "🚶", activity: "첼시마켓 점심" },
          { time: "14:00~15:00", place: "하이라인 파크", transport: "🚶", activity: "하이라인 파크 산책" },
          { time: "15:00~16:00", place: "리틀아일랜드", transport: "🚶", activity: "리틀아일랜드 / 미트패킹" },
          { time: "16:00~17:00", place: "워싱턴 스퀘어", transport: "🚶", activity: "미트패킹 → 블리커 → 워싱턴 스퀘어 (투어 종료)" },
          { time: "17:00~18:00", place: "그리니치", transport: "🚶", activity: "자유시간 / 조스피자 이동" },
          { time: "18:00~19:00", place: "조스피자", transport: "🚶", activity: "🍕 조스피자", memo: "🍕 Joe's Pizza (Bleecker St 원조점)\n• 1조각 $4-5, 카드 OK\n• Plain Cheese / Pepperoni 정통\n• 서서 먹거나 길거리 (좌석 거의 없음)\n• 1985년부터 운영, 뉴욕 길거리 피자 클래식" },
          { time: "19:00~20:00", place: "그리니치 빌리지", transport: "🚶", activity: "그리니치 산책" },
          { time: "20:00~21:00", place: "호텔", transport: "🚇", activity: "호텔 복귀" },
        ],
      },
      {
        day: "4일차",
        date: "6월 4일 (목)",
        subtitle: "",
        items: [
          { time: "07:00~08:00", place: "호텔", transport: "", activity: "기상 / 채비 + 간단 조식", memo: "☕ 호텔 근처 카페에서 간단 조식\n• 밀레니엄 힐튼 조식 미포함 ($30+/인)\n• 근처 Pret a Manger / Joe Coffee / Blue Bottle 등 추천\n• 또는 호텔에서 베이글·요거트 (전날 사놓기)" },
          { time: "08:00~09:00", place: "→ Times Square", transport: "🚇", activity: "타임스스퀘어 이동" },
          { time: "09:00~10:00", place: "Times Square", transport: "🚇", activity: "타임스스퀘어" },
          { time: "10:00~11:00", place: "브라이언트파크", transport: "🚶", activity: "브라이언트파크" },
          { time: "11:00~12:00", place: "Grand Central", transport: "🚶", activity: "그랜드 센트럴", memo: "🏛️ Grand Central 명소\n• 메인 콘코스 — 천장의 별자리 천체도\n• Whispering Gallery — 다이닝 콘코스 입구 코너에서 대각선으로 속삭이면 들림\n• Oyster Bar (1913년부터) — 굴 좋아하면 추천\n• 시계탑 인포메이션 부스 위 시계 = 만남의 장소 클래식" },
          { time: "12:00~13:00", place: "타임스스퀘어", transport: "", activity: "🍕 Los Tacos No.1", memo: "🌮 Los Tacos No.1\n• 첼시마켓 매장이 원조, 타임스퀘어 지점도 OK\n• 추천: Adobada (돼지) + Pollo Asado (닭)\n• 'Everything' 하면 양파/고수/살사 다 넣어줌\n• 카드 OK, 현금 OK, 팁 박스 있음" },
          { time: "13:00~14:00", place: "메이시스", transport: "🚶", activity: "메이시스 (백화점)" },
          { time: "14:00~15:00", place: "5번가", transport: "🛍️", activity: "5번가 (명품 쇼핑거리)", memo: "🛍️ 5번가 (Fifth Avenue)\n• Apple Store (5번가 큐브) 사진 명소\n• Tiffany & Co. 본점 (영화 '티파니에서 아침을')\n• 명품 가격: 한국 면세 + 매장 디스카운트 거의 없음 (우드버리가 훨씬 저렴)\n• 따로 사고 싶은 거 없으면 윈도쇼핑만" },
          { time: "15:00~16:00", place: "록펠러 센터", transport: "🚶", activity: "록펠러 센터 / 세인트패트릭" },
          { time: "16:00~17:00", place: "극장 근처", transport: "🍽️", activity: "Carmine's (이탈리안)", memo: "🍝 Carmine's — 패밀리 스타일!\n• 1접시 = 2~4인분 (양 어마어마)\n• 2인이면 메인 1접시 + 샐러드 1개로 충분\n• 추천: Chicken Marsala, Penne alla Vodka, Lemon Chicken\n• 와인은 글래스로 1잔씩 (2병 시키면 너무 많음)\n• 팁 18~20%, 카드 OK" },
          { time: "17:00~18:00", place: "극장 근처", transport: "🍽️", activity: "Carmine's 계속" },
          { time: "18:00~19:00", place: "브로드웨이", transport: "🚶", activity: "극장 입장 준비", memo: "🎭 브로드웨이 입장 팁\n• 공연 30분 전 도착 (가방·외투 검사)\n• 큰 가방·캐리어 X (없음 클로크룸 없는 극장)\n• 드레스코드 자유 (캐주얼 OK)\n• 사진/영상 촬영 절대 금지 (입장 전·후만 OK)\n• 음료수 반입 X (극장 내에서 구매 가능)" },
          { time: "19:00~20:00", place: "브로드웨이", transport: "🎭", activity: "해리포터 브로드웨이 공연", memo: "🎭 해리포터와 저주받은 아이\n• 1편 공연 약 3시간 30분 (인터미션 포함)\n• 인터미션 약 20분 — 화장실/음료 시간\n• 좌석에서 일어나기 X (인터미션만)\n• #KeepTheSecrets — 스토리 SNS 공유 금지" },
          { time: "20:00~21:00", place: "타임스스퀘어", transport: "🌃", activity: "뮤지컬 계속" },
          { time: "21:00~22:00", place: "타임스스퀘어", transport: "🌃", activity: "뮤지컬 마무리 / 타임스스퀘어 야경" },
        ],
      },
      {
        day: "5일차",
        date: "6월 5일 (금)",
        subtitle: "",
        items: [
          { time: "08:00~09:00", place: "호텔", transport: "", activity: "조식 / Port Authority 이동" },
          { time: "09:00~10:00", place: "Port Authority", transport: "🚌", activity: "Port Authority 4층 대기", memo: "🚌 Port Authority 셔틀\n• 8번가 41st St 입구, 4층 게이트 (8B 근처)\n• 8:45까지 도착 권장\n• 예약 바우처 (모바일/출력) + 여권 지참\n• 화장실은 셔틀 타기 전에" },
          { time: "10:00~11:00", place: "셔틀버스", transport: "🚌", activity: "우드버리 도착 / VIP 쿠폰북", memo: "🛍️ 우드버리 도착 시\n• Welcome Center에서 VIP 쿠폰북 받기 (여권 보여주기)\n• 매장 지도도 같이 받기 (큰 도움)\n• 쇼핑 짐 많아질 가능성 → 빈 에코백 준비\n• 점심은 푸드코트 또는 ShakeShack" },
          { time: "11:00~12:00", place: "우드버리", transport: "🛍️", activity: "Coach / Tory Burch / Polo" },
          { time: "12:00~13:00", place: "우드버리", transport: "🍽️", activity: "점심 (푸드코트)" },
          { time: "13:00~14:00", place: "우드버리", transport: "🛍️", activity: "Kate Spade / Michael Kors / Tumi" },
          { time: "14:00~15:00", place: "우드버리", transport: "🛍️", activity: "Nike / Adidas / Levi's → 우드버리 출발" },
          { time: "15:00~16:00", place: "셔틀버스", transport: "🚌", activity: "Port Authority 복귀" },
          { time: "16:00~17:00", place: "호텔", transport: "🏨", activity: "호텔 복귀 + 휴식" },
          { time: "17:00~18:00", place: "Keens Steakhouse", transport: "🚶", activity: "Keens Steakhouse 도착", memo: "🥩 Keens Steakhouse\n• 72 W 36th St (Herald Square 근처)\n• 1885년부터 운영, 천장에 가득한 흡연 파이프\n• 드레스코드: 비즈니스 캐주얼 (셔츠/원피스 권장, 청바지 OK)\n• 시그니처: Mutton Chop (양고기) — 호불호 갈림\n• 무난한 선택: Prime Steak / Filet Mignon\n• 팁 20% 자동 포함 종종 있음 — 영수증 확인" },
          { time: "18:00~19:00", place: "Keens Steakhouse", transport: "🥩", activity: "Keens 저녁" },
          { time: "19:00~20:00", place: "→ SUMMIT", transport: "🚶", activity: "SUMMIT 도보 이동" },
          { time: "20:00~21:00", place: "서밋 원 밴더빌트", transport: "🏙️", activity: "SUMMIT 입장 / 일몰", memo: "🏙️ SUMMIT One Vanderbilt\n• 91층, 거울로 가득 찬 'Air' 공간 = 인생샷 명소\n• 굽 높은 신발 X (거울 바닥, 미끄럼/스커트 주의)\n• 풍선 'Levitation' = 추가 요금 ($16~)\n• 6월은 일몰 ~20:25 — 19:30~20:00 입장 추천\n• 마지막 입장 21:00, 22:00 폐장" },
          { time: "21:00~22:00", place: "서밋 원 밴더빌트", transport: "🌃", activity: "야경 관람 → 호텔 복귀" },
        ],
      },
      {
        day: "6일차",
        date: "6월 6일 (토)",
        subtitle: "→ 마이애미",
        items: [
          { time: "06:00~07:00", place: "호텔", transport: "🧳", activity: "기상 / 체크아웃 준비", memo: "🧳 짐 정리 팁\n• 전날 밤 캐리어 미리 싸두기\n• 우드버리 쇼핑 짐 = 위탁수하물에 분산 (기내 무게 23kg 한도)\n• 보조배터리·필름카메라·노트북 = 무조건 기내\n• Hotel Destination Fee ($66/박) 자동 청구 — 영수증 확인" },
          { time: "07:00~08:00", place: "호텔", transport: "🚖", activity: "호텔 출발 (우버 → JFK)", memo: "🚖 호텔 → JFK 우버\n• ~$80-100 + 팁 (정체 심하면 더)\n• 1시간~1시간 20분 소요\n• Queens Midtown Tunnel 또는 BQE 경로\n• 출발 2시간 30분 전 도착 권장" },
          { time: "08:00~09:00", place: "JFK T4", transport: "🚖", activity: "JFK 도착 / 체크인 / 수하물 위탁", memo: "✈️ JFK T4 (Delta) 체크인\n• 국내선이라 입국심사 없음 — 보안검사만\n• 키오스크 또는 Delta 앱 셀프 체크인\n• 수하물 1인당 1개 무료 (Main Cabin 기준, 23kg)\n• 보안검사 30~45분 예상 (T4는 보통 길지 않음)" },
          { time: "09:00~10:00", place: "JFK T4", transport: "", activity: "보안검사" },
          { time: "10:00~11:00", place: "JFK T4", transport: "", activity: "공항 대기 / 조식" },
          { time: "11:00~12:00", place: "JFK T4", transport: "✈️", activity: "11:05 ✈️ JFK 출발 (델타 DL1514)" },
          { time: "14:00~15:00", place: "MIA 공항", transport: "✈️", activity: "14:19 🛬 MIA 도착" },
        ],
      },
    ],
  },
  {
    name: "마이애미",
    emoji: "🏖️",
    period: "6/6~6/8",
    hotel: "로우스 마이애미 비치 호텔",
    flight: "델타 DL1514 | 6/6 11:05 JFK → 14:19 MIA",
    airports: [
      { code: "MIA", name: "마이애미 국제공항", terminal: "" },
      { code: "FLL", name: "포트로더데일 국제공항", terminal: "Terminal 3 (제트블루)" },
    ],
    days: [
      {
        day: "1일차",
        date: "6월 6일 (토)",
        subtitle: "도착",
        items: [
          { time: "14:00~15:00", place: "MIA 공항", transport: "✈️", activity: "14:19 MIA 도착", memo: "✈️ MIA 도착\n• 국내선이라 보안 통과만, 짐 찾고 바로 우버\n• MIA → 마이애미 비치 (Loews) ~$35-45, 30분\n• 짐 많으면 큰 차량 (UberXL) 호출\n• MIA 도착장 우버 픽업: 'Ride App Pickup' 표지판 따라 2층" },
          { time: "16:00~17:00", place: "로우스 마이애미", transport: "🚕", activity: "호텔 체크인", memo: "🏨 Loews Miami Beach\n• 1601 Collins Ave, Miami Beach\n• 체크인 4PM (얼리 체크인은 가능 시만)\n• Resort Fee $50/박 + 세금 — 영수증 확인\n• 풀·비치 타올·체어 무료 (Resort Fee 포함)\n• 조식 별도 예약했음 ($252) — 시간/장소 확인" },
          { time: "17:00~18:00", place: "Wynwood Walls", transport: "🚕", activity: "윈우드 월스 (벽화 거리)", memo: "🎨 Wynwood Walls\n• 입장료 $15-25/인 (Wynwood Walls 정원 내부)\n• 외부 거리 벽화는 무료 (사진 충분)\n• 저녁에 가면 어두워서 사진 X — 17~18시 추천\n• Wynwood Brewing 등 양조장 多 (선택)" },
          { time: "18:00~19:00", place: "Lincoln Road", transport: "🚶", activity: "링컨로드 산책", memo: "🛍️ Lincoln Road Mall\n• 보행자 전용 쇼핑/식당 거리 (10블록)\n• Apple, H&M, Sephora 등 + 야외 카페\n• 야간엔 라이브 음악 + 거리 공연\n• 5th~17th Street 까지 길이 김 — 마음에 드는 구간만" },
          { time: "19:00~20:00", place: "Trader Joe's", transport: "🚶", activity: "트레이더조", memo: "🛒 Trader Joe's (Alton Rd 점)\n• 호텔에서 도보 15분 또는 우버 5분\n• 사놓기 추천: 생수 (대형팩), 요거트, 그래놀라, 과일, 와인\n• 마이애미 호텔은 미니바 비쌈 → 미리 사두면 절약" },
          { time: "20:00~21:00", place: "Havana1957", transport: "🚶", activity: "🍽️ Havana1957 (Lincoln Rd · 아일랜드석)", memo: "🍽️ Havana1957 — 20시 예약 ✓\n• 좌석: Island (Lincoln Road 가운데 보행자 섬)\n• ⚠️ 20% 서비스 차지 자동 포함 (계산서에 미리 들어감)\n   = 추가 팁 안 줘도 됨. 정말 만족하면 +2~5% 정도만\n   = 영수증의 'Service Charge' / 'Gratuity' 줄 확인\n   = 'Tip' 줄이 별도로 또 있으면 비워두기 (이중 팁 주의)\n• 쿠바 정통 + 라이브 라틴 밴드\n• 추천: Ropa Vieja (소고기 스튜), Cuban Sandwich, Mojito\n• 디저트: Tres Leches" },
        ],
      },
      {
        day: "2일차",
        date: "6월 7일 (일)",
        subtitle: "",
        items: [
          { time: "07:00~08:00", place: "호텔", transport: "", activity: "기상 / 샤워" },
          { time: "08:00~09:00", place: "호텔", transport: "", activity: "메이크업 / 옷 준비" },
          { time: "09:00~10:00", place: "→ Little Havana", transport: "🚕", activity: "우버 출발 → Versailles" },
          { time: "10:00~11:00", place: "Versailles", transport: "🥪", activity: "Versailles 쿠바 샌드위치", memo: "🥪 Versailles Restaurant\n• 3555 SW 8th St (Little Havana 중심)\n• '쿠바 외 가장 큰 쿠바 식당' 1971년~\n• 추천: Cubano Sandwich, Café Cubano (커피)\n• 윈도우 카페에서 빠른 takeout 가능 (서서 먹기)\n• 메뉴 영어/스페인어 — 사진 보고 주문 OK" },
          { time: "11:00~12:00", place: "Calle Ocho", transport: "🚶", activity: "칼레 오초 산책", memo: "🚶 Calle Ocho (8th Street)\n• Maximo Gomez Park (도미노 공원) — 할아버지들 도미노 게임 구경\n• Walk of Fame (쿠바 별들) — 셀레브리티 이름\n• 시가샵 — 진열·롤링 구경 (구매 X 한국 반입 시 제한)\n• Cuba Tobacco Cigar Co. 추천" },
          { time: "12:00~13:00", place: "→ Versace Mansion", transport: "🚕", activity: "베르사체 맨션 이동" },
          { time: "13:00~14:00", place: "Versace Mansion", transport: "🍽️", activity: "Villa Casa Casuarina 런치", memo: "🍽️ Villa Casa Casuarina (베르사체 맨션)\n• 1116 Ocean Dr\n• 풀사이드 자리 미리 요청 (예약 시 메모)\n• 드레스코드: 스마트 캐주얼 (수영복 X, 운동복 X)\n• 인당 평균 $80~150 (메인 + 음료)\n• 사진 명소: 입구 계단, 메달리온 풀\n• 식사 후 무료 투어 시간 확인 (제한적)" },
          { time: "14:00~15:00", place: "오션드라이브", transport: "🚶", activity: "오션드라이브 산책", memo: "🏖️ Ocean Drive\n• 길이 1.5km (5th~15th St)\n• 아르데코 호텔: Colony, Beacon, Park Central 등 색감 사진\n• 5번가 'Welcome to Miami Beach' 표지판 사진 명소\n• 호객꾼 메뉴 보여줘도 부담 X (그냥 넘어가기)" },
          { time: "15:00~16:00", place: "아르데코 지구", transport: "🏖️", activity: "아르데코 지구 산책", memo: "🏛️ Art Deco District\n• 1930년대 아르데코 건축 800채\n• 무료 워킹 셀프 투어 (스마트폰 가이드 앱)\n• 사진 시간대: 골든아워 (17~18시) — 색감 최고\n• Lincoln Road Mall과 합쳐서 동선 만들면 효율" },
          { time: "16:00~17:00", place: "호텔 풀", transport: "🏊", activity: "수영장 풀파티", memo: "🏊 Loews Pool / Beach\n• 일요일 풀파티 = DJ + 칵테일\n• 비치체어 자리 일찍 (오후 들어가면 자리 없음)\n• 호텔 비치 = 전용, 타올 무료\n• 선크림 무조건 + 모자 + 선글라스" },
          { time: "17:00~18:00", place: "호텔", transport: "🏨", activity: "풀 / 호텔 휴식" },
          { time: "18:00~19:00", place: "링컨로드", transport: "🚶", activity: "저녁 준비 / 링컨로드" },
          { time: "19:00~20:00", place: "링컨로드", transport: "🍝", activity: "링컨로드 저녁" },
          { time: "21:00~22:00", place: "Sweet Liberty", transport: "🍸", activity: "🍸 Sweet Liberty", memo: "🍸 Sweet Liberty Drinks & Supply\n• 237 20th St (Lincoln Rd 근처)\n• 21+ 신분증 (여권 필수)\n• 명물: $3 굴 해피아워 (16~19시) — 늦으면 NO\n• 추천 칵테일: French 75, Mai Tai\n• 캐주얼 OK (반바지/셔츠)" },
          { time: "23:00~00:00", place: "클럽", transport: "🚕", activity: "🪩 클럽", memo: "🪩 마이애미 클럽 옵션\n• LIV @ Fontainebleau — 가장 유명, 입장료 $50+ + 테이블 비쌈\n• E11even — 24시간, 음악 다양\n• Story / Basement — EDM\n• ⚠️ 21+ 신분증 (여권), 드레스코드 (남: 셔츠/긴바지, 운동화 X / 여: 자유롭지만 캐주얼 X)\n• 입장 줄 길음 → Guestlist 등록 또는 도착 일찍\n• 음료 1잔 $20~30, 팁 별도\n• 가방 작게 (큰 가방 X)" },
        ],
      },
      {
        day: "3일차",
        date: "6월 8일 (월)",
        subtitle: "",
        items: [
          { time: "08:00~09:00", place: "호텔", transport: "🛌", activity: "늦잠 / 룸서비스" },
          { time: "09:00~10:00", place: "호텔 비치", transport: "🏖️", activity: "호텔 전용 비치", memo: "🏖️ Loews 전용 비치\n• Resort Fee에 비치 액세스 포함\n• 비치체어 + 파라솔 무료\n• 비치 음식·음료 배달 가능 (룸 차지)\n• 6월 마이애미 해수 ~28°C, 따뜻함\n• 해파리 시즌 — 안내판 확인" },
          { time: "10:00~11:00", place: "호텔 비치", transport: "🏊", activity: "풀 또는 비치" },
          { time: "11:00~12:00", place: "호텔", transport: "🚿", activity: "샤워 / 체크아웃 준비" },
          { time: "12:00~13:00", place: "Española Way", transport: "🚶", activity: "Española Way 산책" },
          { time: "13:00~14:00", place: "Española Way", transport: "🍽️", activity: "Española Way 점심" },
          { time: "14:00~15:00", place: "→ 베이사이드", transport: "🚕", activity: "베이사이드 마켓플레이스" },
          { time: "15:00~16:00", place: "베이사이드", transport: "⛵", activity: "베이사이드 산책" },
          { time: "16:00~17:00", place: "→ 호텔", transport: "🚕", activity: "호텔 복귀" },
          { time: "17:00~18:00", place: "호텔", transport: "🏨", activity: "휴식 / 저녁 준비" },
          { time: "18:00~19:00", place: "→ Joe's Stone Crab", transport: "🚕", activity: "조스 스톤크랩 이동" },
          { time: "19:00~20:00", place: "Joe's Stone Crab", transport: "🦀", activity: "조스 스톤크랩 저녁", memo: "🦀 Joe's Stone Crab (1913년~)\n• 11 Washington Ave\n• ⚠️ 5/25 13:00 KST 예약 오픈했음 — 사전예약 탭 상태 확인\n• 예약 못했으면 17시 오픈런 (5시 도착 ~ 7시 자리)\n• 시그니처: Stone Crab Claws (소·중·대·점보)\n• 1인당 $80~150, Key Lime Pie 디저트 강추\n• 드레스코드: 비즈니스 캐주얼, 반바지 X\n• 신용카드 OK, 팁 18~20%" },
          { time: "20:00~21:00", place: "호텔", transport: "", activity: "호텔 복귀 / 휴식" },
          { time: "21:00~22:00", place: "호텔", transport: "", activity: "짐 정리 / LA 행 준비" },
        ],
      },
      {
        day: "4일차",
        date: "6월 9일 (화)",
        subtitle: "→ LA",
        items: [
          { time: "05:00~06:00", place: "호텔", transport: "🧳", activity: "기상 / 체크아웃", memo: "🧳 새벽 체크아웃\n• 전날 밤 짐 미리 싸기\n• 미니바·룸서비스 영수증 확인\n• 익스프레스 체크아웃 (TV 또는 앱)\n• Resort Fee 포함 최종 청구 영수증 받기" },
          { time: "06:00~07:00", place: "→ FLL 공항", transport: "🚖", activity: "우버 → FLL", memo: "🚖 마이애미 비치 → FLL ~$50-70, 45분~1시간\n• MIA보다 FLL 출발편이 저렴해서 선택한 코스\n• 새벽이라 도로 비교적 한산\n• 출발 2시간 전 도착 권장" },
          { time: "07:00~08:00", place: "FLL 공항", transport: "", activity: "FLL 도착 / 체크인", memo: "✈️ FLL T3 (JetBlue)\n• 셀프 체크인 키오스크 또는 JetBlue 앱\n• 수하물 1개 무료 (JetBlue 'Blue Basic' 제외 — 요금 확인)\n• 보안 통과 후 푸드코트에서 간단 조식 가능" },
          { time: "09:00~10:00", place: "FLL 공항", transport: "✈️", activity: "09:20 FLL 출발 (제트블루 B62801)" },
        ],
      },
    ],
  },
  {
    name: "LA",
    emoji: "🎬",
    period: "6/9~6/13",
    hotel: "Glendale 에어비앤비",
    flight: "제트블루 B62801 | 6/9 09:20 FLL → 12:04 LAX\n귀국: 에어프레미아 YP0102 | 6/13 10:50 LAX → 6/14 15:45 ICN",
    airports: [
      { code: "LAX", name: "로스앤젤레스 국제공항", terminal: "Terminal 1 (제트블루 도착) / TBIT (에어프레미아 출발)" },
    ],
    days: [
      {
        day: "1일차",
        date: "6월 9일 (화)",
        subtitle: "도착",
        items: [
          { time: "09:00~10:00", place: "FLL", transport: "✈️", activity: "09:20 FLL 출발" },
          { time: "12:00~13:00", place: "LAX T1", transport: "🛬", activity: "12:04 LAX 도착", memo: "🛬 LAX T1 도착\n• JetBlue는 T1 또는 T5 — 게이트 안내 확인\n• 시차: FL → LA -3시간 (시계 자동 변경)\n• 렌터카 셔틀 정류장: 도착장 외부 'Rental Car Shuttles' 표지판" },
          { time: "13:00~14:00", place: "LAX", transport: "🚗", activity: "렌터카 픽업", memo: "🚗 LA 렌터카 픽업\n• Hertz/Avis 카운터 위치 사전 확인\n• 필요 서류: 국제운전면허증 + 한국 면허증 + 여권 + 신용카드\n• 풀커버 보험 가입 여부 재확인 (편도 반납 시 추가비)\n• 차량 외관 사진 다 찍어두기 (스크래치 분쟁 방지)\n• 기름은 'Full to Full' 옵션 (직접 채워 반납)이 가장 저렴" },
          { time: "14:00~15:00", place: "→ In-N-Out", transport: "🚗", activity: "In-N-Out 이동" },
          { time: "15:00~16:00", place: "In-N-Out", transport: "🍔", activity: "In-N-Out 점심", memo: "🍔 In-N-Out Burger\n• LAX 근처 매장: 9149 S Sepulveda Blvd (공항 비행기 사진 명소)\n• 시크릿 메뉴: 'Animal Style' (양파+소스 추가), '4x4' (패티 4장)\n• Double-Double + Animal Fries + Shake 기본\n• 카드 OK, 팁 X (캘리포니아 패스트푸드 노팁)" },
          { time: "16:00~17:00", place: "Trader Joe's", transport: "🛒", activity: "Trader Joe's 장보기 (조식·간식 식재료)" },
          { time: "17:00~18:00", place: "Airbnb (Glendale)", transport: "🏠", activity: "에어비앤비 체크인 + 휴식", memo: "🏠 Airbnb 체크인 체크리스트\n• 호스트 메시지 / 셀프 체크인 코드 미리 확인\n• 입실 후 사진 다 찍어두기 (분쟁 방지)\n• 와이파이 비번 확인 (즉시 메모)\n• 에어컨/난방 작동 확인\n• 호스트 연락처·비상연락처 저장\n• 쓰레기 배출 규칙 확인" },
          { time: "18:00~19:00", place: "→ Griffith", transport: "🚗", activity: "그리피스 천문대 출발" },
          { time: "19:00~20:00", place: "Griffith Observatory", transport: "🌅", activity: "그리피스 천문대 sunset", memo: "🌅 Griffith Observatory\n• 입장 무료, 주차 무료 (아래쪽), 위쪽은 유료 ($4/시간)\n• 6월 일몰 ~20:00 — 18:30~19:00 도착 추천\n• 헐리우드 사인 + LA 다운타운 동시에 보임\n• 옥상이 사진 명소\n• 화~금 12-22시 / 주말 10-22시 (월요일만 휴관)\n• 6/9 화요일 → 정상 영업 ✓" },
          { time: "20:00~21:00", place: "Griffith Observatory", transport: "🌃", activity: "LA 야경" },
          { time: "21:00~22:00", place: "Hollywood Blvd", transport: "🚗", activity: "할리우드 (Walk of Fame)", memo: "🌟 Hollywood Walk of Fame\n• 차이니즈 시어터 (TCL) 앞에 손/발 자국\n• 야간이라 사람·코스튬 캐릭터 많음 (사진 요청 시 팁 요구 — 무시 OK)\n• 노숙자 多 — 가방·지갑 안쪽\n• 주차: 차이니즈 시어터 인근 유료 주차장 ($10~20)" },
          { time: "22:00~23:00", place: "→ Airbnb", transport: "🚗", activity: "숙소 복귀" },
          { time: "23:00~00:00", place: "Airbnb", transport: "🍷", activity: "와인 + 간식 / 휴식" },
        ],
      },
      {
        day: "2일차",
        date: "6월 10일 (수)",
        subtitle: "",
        items: [
          { time: "07:00~08:00", place: "Airbnb", transport: "☕", activity: "기상 / 채비 + 셀프 아침 (Trader Joe's에서 산 거)" },
          { time: "08:00~09:00", place: "→ Universal", transport: "🚗", activity: "유니버설 이동" },
          { time: "09:00~10:00", place: "Universal Studios", transport: "🎢", activity: "유니버설 입장", memo: "🎢 Universal Studios Hollywood\n• 입장권 + Express Pass 예매 완료 ($362,400)\n• 오픈 시간 도착 권장 — 인기 어트랙션 줄 짧음\n• Express Pass = 1회 이용 우선권 (각 어트랙션 1회씩)\n• 추천 순서: 해리포터 → Studio Tour → Jurassic World → Mario Land → King Kong\n• 락커: 큰 가방 보관 (어트랙션 입장 시 필수)\n• 음식·음료 반입 X (물병만 가능)" },
          { time: "10:00~16:00", place: "Universal Studios", transport: "🎢", activity: "유니버설 스튜디오 (점심 포함)" },
          { time: "17:00~18:00", place: "Walmart Garden Center", transport: "🌿", activity: "월마트 가든센터", memo: "🌿 Walmart 추천 구매\n• 한국에서 가져오기 어려운 거 — 단백질 바, 그래놀라\n• 의약품 — 멜라토닌(수면), 비타민\n• 기념품 (티셔츠, 후드)\n• Great Value (PB 브랜드) 저렴" },
          { time: "18:00~19:00", place: "Costco (Burbank)", transport: "🛒", activity: "코스트코 + 푸드코트 저녁", memo: "🛒 Costco Burbank\n• 한국 카드 OK 멤버십 카드 필요\n• 회원 아니면 입장 거부 → 한국 코스트코 카드 지참\n• 푸드코트: 핫도그 $1.50, 피자 $9.99 (가성비)\n• Kirkland 와인·바닐라 추천\n• 캐쉬백 카드 = Visa 만" },
          { time: "19:00~20:00", place: "Total Wine", transport: "🍷", activity: "Total Wine & More" },
          { time: "20:00~21:00", place: "→ Airbnb", transport: "🚗", activity: "숙소 복귀" },
        ],
      },
      {
        day: "3일차",
        date: "6월 11일 (목)",
        subtitle: "",
        items: [
          { time: "07:00~08:00", place: "Airbnb", transport: "☕", activity: "기상 / 채비 + 셀프 아침" },
          { time: "08:00~09:00", place: "→ Warner Bros", transport: "🚗", activity: "워너 스튜디오 이동" },
          { time: "09:00~13:00", place: "Warner Bros. Studio", transport: "🎬", activity: "워너브라더스 Studio Tour Plus", memo: "🎬 Warner Bros Studio Tour Plus\n• 3400 Warner Blvd, Burbank\n• 예약 완료 ($483,200)\n• Tour Plus = 3시간 (일반 투어보다 김)\n• 카메라 OK (촬영 가능 구역만)\n• 큰 가방 X (락커 사용)\n• 운동화 권장 (걷기·서기 많음)\n• 신분증 (여권) 지참" },
          { time: "13:00~14:00", place: "워너 근처", transport: "🍔", activity: "점심 (워너 근처)" },
          { time: "14:00~15:00", place: "Citadel Outlets", transport: "🚗", activity: "시타델 아울렛 이동 + 쇼핑 시작", memo: "🛍️ 100 Citadel Dr, Commerce, CA 90040\n• 운영 10:00~21:00\n• 무료 주차\n• 코치/카터스/콜한/언더아머/리바이스 등 디자이너 아울렛" },
          { time: "15:00~16:00", place: "Citadel Outlets", transport: "🛍️", activity: "시타델 아울렛 쇼핑" },
          { time: "16:00~17:00", place: "Citadel Outlets", transport: "🛍️", activity: "시타델 아울렛 쇼핑 마무리" },
          { time: "17:00~18:00", place: "Grand Central Market", transport: "🚶", activity: "그랜드 센트럴 마켓", memo: "🍽️ Grand Central Market (다운타운 LA)\n• 1917년~ 푸드홀\n• 추천: Eggslut (브런치 샌드위치), Wexler's Deli, Sari Sari (필리핀)\n• Tacos Tumbras a Tomas — 큰 사이즈 타코\n• 카드/현금 둘 다 OK, 좌석 공유" },
          { time: "18:00~19:00", place: "Last Bookstore", transport: "🚶", activity: "래스트 북스토어", memo: "📚 The Last Bookstore\n• 453 S Spring St (다운타운)\n• 책 터널 + 책 아치 = 사진 명소\n• 2층 'Labyrinth' 미로 (무료 입장)\n• 중고책 $1 균일 코너\n• 영업 종료 21시 — 18시 가도 충분" },
          { time: "19:00~20:00", place: "Total Wine", transport: "🚗", activity: "와인앤모어" },
          { time: "20:00~21:00", place: "→ Airbnb", transport: "🚗", activity: "숙소 복귀" },
        ],
      },
      {
        day: "4일차",
        date: "6월 12일 (금)",
        subtitle: "",
        items: [
          { time: "06:00~07:00", place: "Airbnb", transport: "☕", activity: "기상 / 셀프 아침" },
          { time: "09:00~10:00", place: "Trader Joe's", transport: "🛒", activity: "트레이더조 / 와인앤모어" },
          { time: "10:00~15:00", place: "Getty Center", transport: "🎨", activity: "게티 미술관 (점심 포함)", memo: "🎨 Getty Center\n• 입장 무료, 주차 예약 완료 ($37,750)\n• 트램 (Funicular) 타고 미술관 진입 (무료)\n• 정원 + 건축 + 컬렉션 = 미술관 안 좋아해도 OK\n• 점심: Cafe (캐주얼) 또는 Restaurant (예약제)\n• 사진 명소: Central Garden, 옥상 테라스\n• 화요일 휴관 ⚠️ → 6/12 금요일 OK ✓" },
          { time: "16:00~17:00", place: "Malibu", transport: "🚗", activity: "말리부 해안 드라이브", memo: "🚗 PCH (Pacific Coast Highway)\n• Getty → Malibu 30분 (101번 → PCH)\n• 명물 정차: Point Dume, El Matador Beach\n• Malibu Pier — 사진 명소\n• Nobu Malibu (예약 필수)\n• 해 지기 전에 사진 — 골든아워" },
          { time: "17:00~18:00", place: "Santa Monica", transport: "🚗", activity: "산타모니카", memo: "🎡 Santa Monica Pier\n• 무료 입장, 놀이기구는 유료\n• Route 66 종착지 표지판 (사진 명소)\n• Pacific Park (소형 놀이공원)\n• 3rd Street Promenade (보행자 쇼핑가) — 시간 되면\n• 주차 비쌈 ($15-25/시간)" },
          { time: "18:00~19:00", place: "Venice Beach", transport: "🚶", activity: "베니스 운하 / 베니스 비치", memo: "🏖️ Venice Beach\n• Muscle Beach + Skate Park + Boardwalk\n• Venice Canals = 운하 + 다리 산책 (조용한 동네)\n• Snoop Dogg / Abbot Kinney Blvd (힙스터)\n• 일몰 명소 — 6월 일몰 ~20:00\n• 노숙자 多, 야간 안전 주의" },
          { time: "19:00~20:00", place: "Venice Beach", transport: "🌅", activity: "베니스 비치 일몰" },
          { time: "20:00~21:00", place: "→ Airbnb", transport: "🚗", activity: "숙소 복귀" },
        ],
      },
      {
        day: "5일차",
        date: "6월 13일 (토)",
        subtitle: "출국",
        items: [
          { time: "06:00~07:00", place: "Airbnb", transport: "🧳", activity: "기상 / 짐 최종 정리", memo: "🧳 출국 짐 정리\n• 미국 면세한도: 1인 $800 (초과 시 자진신고)\n• 와인/술 1L 1병만 (초과시 과세)\n• 한국 가져가면 안 되는 것: 육포·소시지·과일\n• 액체 100ml 이하만 기내, 위탁수하물에 분산\n• 충전기 / 보조배터리 다시 확인\n• 호스트에게 체크아웃 메시지" },
          { time: "07:00~08:00", place: "Airbnb", transport: "🚗", activity: "에어비앤비 체크아웃", memo: "🏠 Airbnb 체크아웃\n• 쓰레기 분리수거 (호스트 안내 확인)\n• 사용 그릇 설거지\n• 문 잠그기 (스마트락 자동 X)\n• 차량 키 분실 X (Airbnb엔 둘 수 없음)\n• 호스트에게 'Checked out' 메시지" },
          { time: "08:00~09:00", place: "LAX", transport: "🚗", activity: "LAX 렌터카 반납", memo: "🚗 렌터카 반납\n• 출발 2시간 전 도착 권장 (반납 + 셔틀)\n• Full to Full: 공항 직전 주유소에서 가득 채우기\n• 차량 외관 사진 다시 (분쟁 시 증거)\n• 영수증 메일/출력 — 보험·기름값 정산 확인\n• 'Rental Car Return' 표지판 → 회사별 구역\n• 반납 후 셔틀로 터미널 (TBIT for 에어프레미아)" },
          { time: "09:00~10:00", place: "LAX", transport: "", activity: "체크인 / 보안검색", memo: "✈️ LAX TBIT (Tom Bradley International)\n• 에어프레미아 카운터 위치 확인 (보통 D~F)\n• 국제선 출발 = 2시간 30분 전 도착 권장\n• 보안검색 30~60분\n• 면세점 + 라운지 (PP카드 또는 신용카드 무료)\n• 마지막 쇼핑 — Snoopy 등 캐릭터 굿즈" },
          { time: "10:00~11:00", place: "LAX", transport: "✈️", activity: "10:50 LAX → ICN 출국", memo: "✈️ 귀국 비행 (LAX → ICN)\n• 약 13시간 비행\n• 6/13 10:50 LAX 출발 → 6/14 15:45 ICN 도착\n• 시차: -16시간 (LA → 서울)\n• 기내식 2회 + 간식\n• 도착 후 입국심사 — 한국인은 빠름" },
        ],
      },
    ],
  },
];

// ─── 준비물 (Checklist) ────────────────────────────────────────

export interface ChecklistCategory {
  icon: string;
  title: string;
  items: { name: string; bride: boolean; groom: boolean; note: string }[];
}

export const checklist: ChecklistCategory[] = [
  {
    icon: "🛂", title: "필수 서류",
    items: [
      { name: "여권 (유효기간 6개월 이상)", bride: true, groom: true, note: "출국 전 반드시 확인" },
      { name: "ESTA 승인서 출력본", bride: false, groom: false, note: "유효기간 2년" },
      { name: "전자항공권 (e-Ticket)", bride: false, groom: false, note: "스크린샷 + 출력본" },
      { name: "호텔 바우처 (전 일정)", bride: false, groom: false, note: "출력본 + 모바일" },
      { name: "국제운전면허증", bride: false, groom: false, note: "LA 렌터카 시 필수" },
      { name: "여행자보험 증서", bride: false, groom: false, note: "" },
      { name: "여권 사본 (분실 대비)", bride: false, groom: false, note: "별도 보관" },
      { name: "증명사진 2매", bride: false, groom: false, note: "여권 분실 시" },
    ]
  },
  {
    icon: "💳", title: "현금/카드",
    items: [
      { name: "여권 지갑", bride: false, groom: false, note: "" },
      { name: "해외결제 신용카드 2장", bride: false, groom: false, note: "VISA/Master 분산" },
      { name: "체크카드 (트래블카드)", bride: false, groom: false, note: "트래블월렛/하나 등" },
      { name: "USD 현금", bride: false, groom: false, note: "팁/소액용 $1, $5 위주" },
      { name: "원화 (공항용)", bride: false, groom: false, note: "" },
    ]
  },
  {
    icon: "📱", title: "전자기기",
    items: [
      { name: "휴대폰", bride: false, groom: false, note: "" },
      { name: "휴대폰 충전기 + 케이블", bride: false, groom: false, note: "" },
      { name: "보조배터리 (기내 반입만)", bride: false, groom: false, note: "위탁수하물 금지" },
      { name: "멀티 어댑터 (110V/A타입)", bride: false, groom: false, note: "미국은 A타입 플러그" },
      { name: "변압기", bride: false, groom: false, note: "고출력 기기용" },
      { name: "이어폰", bride: false, groom: false, note: "" },
      { name: "필름카메라 + 필름", bride: false, groom: false, note: "X-ray 검색대 주의" },
      { name: "인스탁스 + 필름", bride: false, groom: false, note: "" },
      { name: "셀카봉/짐벌", bride: false, groom: false, note: "" },
    ]
  },
  {
    icon: "👗", title: "의류 - 보현",
    items: [
      { name: "상의 6벌", bride: false, groom: false, note: "13박이라 +2벌 추천" },
      { name: "하의/원피스 5벌", bride: false, groom: false, note: "" },
      { name: "속옷 7벌", bride: false, groom: false, note: "" },
      { name: "양말/스타킹 7켤레", bride: false, groom: false, note: "" },
      { name: "겉옷 1벌 (가디건/자켓)", bride: false, groom: false, note: "기내/냉방용" },
      { name: "수영복", bride: false, groom: false, note: "마이애미 비치" },
      { name: "래시가드/비치웨어", bride: false, groom: false, note: "" },
      { name: "잠옷 2벌", bride: false, groom: false, note: "" },
      { name: "편한 신발 (운동화)", bride: false, groom: false, note: "많이 걸음" },
      { name: "샌들/슬리퍼", bride: false, groom: false, note: "" },
      { name: "드레시한 옷 1세트", bride: false, groom: false, note: "고급 레스토랑/공연" },
      { name: "선글라스", bride: false, groom: false, note: "" },
      { name: "양산/모자", bride: false, groom: false, note: "햇빛 강함" },
    ]
  },
  {
    icon: "👕", title: "의류 - 채연",
    items: [
      { name: "상의 6벌", bride: false, groom: false, note: "" },
      { name: "하의 5벌", bride: false, groom: false, note: "" },
      { name: "속옷 7벌", bride: false, groom: false, note: "" },
      { name: "양말 7켤레", bride: false, groom: false, note: "" },
      { name: "겉옷 1벌 (가디건/자켓)", bride: false, groom: false, note: "" },
      { name: "수영복", bride: false, groom: false, note: "마이애미 비치" },
      { name: "래시가드", bride: false, groom: false, note: "" },
      { name: "잠옷 2벌", bride: false, groom: false, note: "" },
      { name: "편한 신발 (운동화)", bride: false, groom: false, note: "" },
      { name: "슬리퍼/샌들", bride: false, groom: false, note: "" },
      { name: "드레시한 옷 1세트", bride: false, groom: false, note: "고급 레스토랑/공연" },
      { name: "선글라스", bride: false, groom: false, note: "" },
      { name: "모자", bride: false, groom: false, note: "" },
      { name: "크로스백", bride: false, groom: false, note: "" },
    ]
  },
  {
    icon: "🧴", title: "세면도구/화장품 (공용)",
    items: [
      { name: "칫솔 2개", bride: false, groom: false, note: "" },
      { name: "치약", bride: false, groom: false, note: "" },
      { name: "샴푸/린스 (소분)", bride: false, groom: false, note: "100ml 이하" },
      { name: "바디워시 (소분)", bride: false, groom: false, note: "" },
      { name: "샤워타올", bride: false, groom: false, note: "" },
      { name: "수건 1~2장", bride: false, groom: false, note: "호텔에 있지만 비치용" },
      { name: "면도기 (전기/일회용)", bride: false, groom: false, note: "" },
      { name: "헤어드라이기", bride: false, groom: false, note: "호텔에 있긴 함" },
      { name: "헤어 고데기", bride: false, groom: false, note: "변압기 필요" },
      { name: "빗", bride: false, groom: false, note: "" },
    ]
  },
  {
    icon: "💊", title: "상비약",
    items: [
      { name: "감기약/해열제", bride: false, groom: false, note: "" },
      { name: "소화제", bride: false, groom: false, note: "" },
      { name: "지사제", bride: false, groom: false, note: "" },
      { name: "진통제 (타이레놀)", bride: false, groom: false, note: "" },
      { name: "멀미약", bride: false, groom: false, note: "" },
      { name: "밴드/거즈", bride: false, groom: false, note: "데일밴드" },
      { name: "연고 (마데카솔/후시딘)", bride: false, groom: false, note: "" },
      { name: "숙취해소제", bride: false, groom: false, note: "" },
      { name: "개인 처방약", bride: false, groom: false, note: "영문 처방전 동봉" },
    ]
  },
  {
    icon: "🌞", title: "여름/비치용품",
    items: [
      { name: "선크림 (바디용 대용량)", bride: false, groom: false, note: "" },
      { name: "애프터선/알로에젤", bride: false, groom: false, note: "" },
      { name: "쿨링스프레이", bride: false, groom: false, note: "" },
      { name: "손풍기", bride: false, groom: false, note: "" },
      { name: "모기퇴치제/스티커", bride: false, groom: false, note: "" },
      { name: "방수팩", bride: false, groom: false, note: "비치/수영장" },
    ]
  },
  {
    icon: "🎒", title: "기타",
    items: [
      { name: "캐리어 (위탁)", bride: false, groom: false, note: "" },
      { name: "기내용 캐리어/백팩", bride: false, groom: false, note: "" },
      { name: "보조가방 (관광용)", bride: false, groom: false, note: "" },
      { name: "에코백/장보기 가방", bride: false, groom: false, note: "" },
      { name: "지퍼백 (소분/방수)", bride: false, groom: false, note: "여러 사이즈" },
      { name: "빨래망/세탁세제 시트", bride: false, groom: false, note: "장기 여행" },
      { name: "우산/우비", bride: false, groom: false, note: "" },
      { name: "목베개/안대/귀마개", bride: false, groom: false, note: "기내용" },
      { name: "압축팩", bride: false, groom: false, note: "옷 부피 줄임" },
      { name: "토끼인형", bride: false, groom: false, note: "🐰" },
    ]
  },
];

// ─── 사전예약 (Reservations) ───────────────────────────────────

export interface Reservation {
  city: string;
  cityEmoji: string;
  category: string;
  item: string;
  time: string;
  bookingSite: string;
  bookingUrl: string;
  cost: string;
  status: "완료" | "미완료" | "주의";
  memo: string;
}

export const reservations: Reservation[] = [
  { city: "뉴욕", cityEmoji: "🗽", category: "투어", item: "맨하탄 원데이 워킹투어 (전망대, 크루즈 포함)", time: "6/3 09:00", bookingSite: "타미스", bookingUrl: "https://tamice.com", cost: "₩271,800", status: "완료", memo: "" },
  { city: "뉴욕", cityEmoji: "🗽", category: "미술관", item: "메트로폴리탄 미술관 도슨트 투어", time: "6/2", bookingSite: "마이리얼트립", bookingUrl: "https://www.myrealtrip.com", cost: "₩75,500", status: "완료", memo: "" },
  { city: "뉴욕", cityEmoji: "🗽", category: "전망대", item: "SUMMIT One Vanderbilt 피크", time: "6/5 20:00", bookingSite: "타미스", bookingUrl: "https://tamice.com", cost: "₩157,040", status: "완료", memo: "" },
  { city: "뉴욕", cityEmoji: "🗽", category: "공연", item: "해리포터 브로드웨이 공연", time: "6/4 19:00", bookingSite: "TodayTix", bookingUrl: "https://www.todaytix.com", cost: "₩271,800", status: "미완료", memo: "" },
  { city: "뉴욕", cityEmoji: "🗽", category: "다이닝", item: "Keens Steakhouse", time: "6/5 17:30", bookingSite: "Resy", bookingUrl: "https://resy.com", cost: "₩453,000", status: "완료", memo: "뉴욕 고전 스테이크하우스 (1885~)" },
  { city: "뉴욕", cityEmoji: "🗽", category: "다이닝", item: "Orsay 점심 (프렌치 비스트로)", time: "6/2 13:00", bookingSite: "Resy", bookingUrl: "https://resy.com", cost: "₩181,200", status: "완료", memo: "메트 도슨트 종료 후 도보 이동" },
  { city: "뉴욕", cityEmoji: "🗽", category: "스냅촬영", item: "DUMBO 웨딩스냅 촬영", time: "6/2 17:00", bookingSite: "리베뉴욕", bookingUrl: "https://m.blog.naver.com/liebe_____/223626004631", cost: "₩604,000", status: "완료", memo: "잔금 달러 현장 전달 / DUMBO Brooklyn 만남" },
  { city: "뉴욕", cityEmoji: "🗽", category: "쇼핑", item: "우드버리 아울렛 왕복 셔틀버스", time: "6/5", bookingSite: "타미스", bookingUrl: "https://tamice.com", cost: "₩108,720", status: "완료", memo: "Port Authority 4층 출발" },
  { city: "뉴욕", cityEmoji: "🗽", category: "다이닝", item: "Carmine's 저녁 (이탈리안)", time: "6/4 16:30", bookingSite: "OpenTable", bookingUrl: "https://www.opentable.com", cost: "₩120,800", status: "완료", memo: "해리포터 공연 전 저녁" },
  { city: "마이애미", cityEmoji: "🏖️", category: "다이닝", item: "Gianni's (베르사체 맨션 런치)", time: "6/7 12:30", bookingSite: "OpenTable", bookingUrl: "https://www.opentable.com", cost: "₩302,000", status: "완료", memo: "풀사이드 자리 요청" },
  { city: "마이애미", cityEmoji: "🏖️", category: "맛집", item: "Joe's Stone Crab", time: "6/8 19:00", bookingSite: "joesstonecrab.com", bookingUrl: "https://www.joesstonecrab.com", cost: "₩151,000", status: "완료", memo: "" },
  { city: "마이애미", cityEmoji: "🏖️", category: "다이닝", item: "Havana 1957 (링컨로드)", time: "6/6 20:00", bookingSite: "OpenTable", bookingUrl: "https://www.opentable.com", cost: "₩120,000", status: "완료", memo: "아일랜드석 · 20% 자동 서비스 차지 (추가 팁 X)" },
  { city: "LA", cityEmoji: "🌴", category: "테마파크", item: "유니버설 스튜디오 + Express Pass", time: "", bookingSite: "유니버설", bookingUrl: "https://www.universalstudioshollywood.com", cost: "₩362,400", status: "미완료", memo: "" },
  { city: "LA", cityEmoji: "🌴", category: "스튜디오", item: "Warner Bros Studio Tour Plus", time: "6/11 09:00", bookingSite: "워너브라더스", bookingUrl: "https://www.wbstudiotour.com", cost: "₩483,200", status: "완료", memo: "" },
  { city: "LA", cityEmoji: "🌴", category: "렌터카", item: "LA 렌터카 (풀커버 보험)", time: "", bookingSite: "Hertz / Avis", bookingUrl: "https://www.hertz.com", cost: "₩604,000", status: "미완료", memo: "" },
  { city: "LA", cityEmoji: "🌴", category: "미술관", item: "게티 센터 주차 예약", time: "6/12 09:00", bookingSite: "getty.edu", bookingUrl: "https://www.getty.edu", cost: "₩37,750", status: "미완료", memo: "입장 무료, 주차 예약 필수" },
  { city: "공통", cityEmoji: "📄", category: "보험", item: "여행자보험 가입", time: "", bookingSite: "현대해상", bookingUrl: "https://www.hi.co.kr", cost: "₩50,300", status: "완료", memo: "" },
  { city: "공통", cityEmoji: "📄", category: "통신", item: "eSIM (Airalo / Holafly)", time: "", bookingSite: "Airalo", bookingUrl: "https://www.airalo.com", cost: "₩52,850", status: "미완료", memo: "" },
  { city: "공통", cityEmoji: "📄", category: "서류", item: "ESTA 승인", time: "", bookingSite: "ESTA", bookingUrl: "https://esta.cbp.dhs.gov", cost: "₩31,710", status: "완료", memo: "" },
  { city: "공통", cityEmoji: "📄", category: "서류", item: "국제운전면허증 발급", time: "", bookingSite: "경찰서/면허시험장", bookingUrl: "", cost: "₩12,080", status: "미완료", memo: "" },
];

// ─── 입국·서류 (Immigration) ───────────────────────────────────

export interface QnA {
  question: string;
  answer: string;
}

export interface TableRow {
  label: string;
  value: string;
}

export interface ImmigrationSection {
  icon: string;
  title: string;
  type: "qa" | "table" | "contacts";
  items: QnA[] | TableRow[];
}

export const immigration: ImmigrationSection[] = [
  {
    icon: "✏️", title: "입국심사 예상 질문", type: "qa",
    items: [
      { question: "What's the purpose of your visit?", answer: "Tourism. Honeymoon trip with my spouse." },
      { question: "How long are you staying?", answer: "13 nights, 14 days. Returning to Korea on June 13." },
      { question: "Where will you stay?", answer: "New York: Millennium Hilton UN Plaza / Miami: Loews Miami Beach / LA: Glendale Airbnb" },
      { question: "Are you traveling alone?", answer: "No, I'm with my husband/wife." },
      { question: "Do you have a return ticket?", answer: "Yes, here it is. (e-Ticket 보여주기)" },
      { question: "How much money do you have?", answer: "About $XXX in cash and credit cards." },
    ] as QnA[]
  },
  {
    icon: "🏨", title: "호텔 주소 (입국심사용)", type: "table",
    items: [
      { label: "뉴욕", value: "Millennium Hilton New York One UN Plaza, 1 United Nations Plaza, New York, NY 10017" },
      { label: "마이애미", value: "Loews Miami Beach Hotel, 1601 Collins Ave, Miami Beach, FL 33139" },
      { label: "LA", value: "Glendale, Los Angeles, CA (에어비앤비)" },
    ] as TableRow[]
  },
  {
    icon: "💰", title: "면세 / 세관신고 (귀국시)", type: "table",
    items: [
      { label: "1인당 면세한도", value: "$800 (초과 시 자진 신고)" },
      { label: "술", value: "1병 (1L 이하, $400 이하)" },
      { label: "담배", value: "200개비 (1보루)" },
      { label: "향수", value: "60ml 이하" },
      { label: "현금반출", value: "$10,000 초과 시 신고 필수" },
    ] as TableRow[]
  },
  {
    icon: "⚠️", title: "긴급연락처", type: "contacts",
    items: [
      { label: "주미국 한국대사관", value: "1-202-939-5600" },
      { label: "주뉴욕 총영사관", value: "+1-646-674-6000" },
      { label: "주LA 총영사관", value: "1-213-385-9300" },
      { label: "영사콜센터 (24시간)", value: "82-2-3210-0404" },
      { label: "미국 응급전화", value: "911" },
    ] as TableRow[]
  },
  {
    icon: "💳", title: "팁 가이드", type: "table",
    items: [
      { label: "레스토랑 식사", value: "세전 금액의 18~22%" },
      { label: "카페/패스트푸드", value: "$1~2" },
      { label: "우버/택시", value: "15~20%" },
      { label: "호텔 벨맨", value: "가방 1개당 $1~2" },
      { label: "호텔 청소", value: "하루 $2~5 (머릿맡에)" },
      { label: "발레 주차", value: "각 $2~5" },
      { label: "투어 가이드", value: "투어 비용의 10~15%" },
    ] as TableRow[]
  },
];

// ─── 총예산 (Budget) ───────────────────────────────────────────

export interface BudgetItem {
  category: string;
  item: string;
  usd: string;
  krw: string;
  memo: string;
}

export const budget: { exchangeRate: string; total: { usd: string; krw: string }; items: BudgetItem[] } = {
  exchangeRate: "1,480",
  total: { usd: "$14,570.50", krw: "₩21,564,339" },
  items: [
    { category: "✈️ 항공", item: "ICN↔EWR/LAX 왕복 (에어프레미아, 2인)", usd: "$1,211.76", krw: "₩1,793,400", memo: "✅ 결제완료" },
    { category: "✈️ 항공", item: "JFK→MIA 델타 (2인)", usd: "$214.88", krw: "₩318,022", memo: "✅ 결제완료" },
    { category: "✈️ 항공", item: "FLL→LAX 제트블루 (2인)", usd: "$380.41", krw: "₩563,000", memo: "✅ 결제완료" },
    { category: "🏨 호텔", item: "뉴욕 밀레니엄 힐튼 (5박)", usd: "$1,851.40", krw: "₩2,740,070", memo: "✅ 결제완료" },
    { category: "🏨 호텔", item: "마이애미 로우스 (3박)", usd: "$1,393.71", krw: "₩2,062,698", memo: "✅ 결제완료" },
    { category: "🏨 호텔", item: "LA 에어비앤비 (4박)", usd: "$947.72", krw: "₩1,402,628", memo: "✅ 결제완료" },
    { category: "🚗 교통", item: "LA 렌터카 (4일, 보험포함)", usd: "$400.00", krw: "₩592,000", memo: "" },
    { category: "🚗 교통", item: "우버/택시 (NY+MIA+공항)", usd: "$350.00", krw: "₩518,000", memo: "" },
    { category: "🚗 교통", item: "NY 지하철 OMNY (2인 5일)", usd: "$80.00", krw: "₩118,400", memo: "" },
    { category: "⛽ 주유·주차", item: "LA 주유·주차", usd: "$200.00", krw: "₩296,000", memo: "" },
    { category: "🏨 현지결제", item: "뉴욕 Destination Fee", usd: "$199.14", krw: "₩294,730", memo: "" },
    { category: "🏨 현지결제", item: "마이애미 Resort Fee", usd: "$150.48", krw: "₩222,710", memo: "" },
    { category: "🏨 현지결제", item: "마이애미 조식", usd: "$252.00", krw: "₩372,960", memo: "" },
    { category: "🍽️ 식비", item: "조식+점심+저녁 x 14일 x 2인 (팁 포함)", usd: "$4,704.00", krw: "₩6,961,920", memo: "" },
    { category: "🍽️ 식비", item: "파인다이닝 2회 (NY+LA)", usd: "$600.00", krw: "₩888,000", memo: "" },
    { category: "🛍️ 쇼핑", item: "5번가 쇼핑 예산", usd: "$1,000.00", krw: "₩1,480,000", memo: "" },
    { category: "📱 통신/보험", item: "eSIM 2인 + 여행자보험", usd: "$135.00", krw: "₩199,800", memo: "" },
    { category: "💵 예비·기타", item: "팁 추가, 잡비", usd: "$500.00", krw: "₩740,000", memo: "" },
  ]
};

// ─── 보험보장 (Insurance) ──────────────────────────────────────

export interface InsuranceItem {
  category: string;
  name: string;
  amount: string;
  note: string;
}

export const insurance: {
  info: { planNumber: string; period: string; holder: string; premium: string };
  coverages: InsuranceItem[];
  warnings: string[];
  claimPhone: string;
} = {
  info: {
    planNumber: "F-26DA-0123973",
    period: "2026.06.01 21:00 ~ 2026.06.14 15:00",
    holder: "김채연 (총 2명)",
    premium: "50,300원",
  },
  coverages: [
    { category: "✈️ 일정", name: "출국항공기 지연보장", amount: "₩100,000", note: "2시간 이상 지연/결항" },
    { category: "✈️ 일정", name: "항공기 및 수하물 지연비용", amount: "₩300,000", note: "실손보상" },
    { category: "🏥 상해/질병", name: "상해사망·후유장해", amount: "₩3억", note: "" },
    { category: "🏥 상해/질병", name: "질병사망 및 80% 고도후유장해", amount: "₩5,000만", note: "" },
    { category: "🏥 상해/질병", name: "해외 상해 의료실비", amount: "₩5,000만", note: "" },
    { category: "🏥 상해/질병", name: "해외 질병 의료실비", amount: "₩5,000만", note: "" },
    { category: "🏥 상해/질병", name: "식중독 입원", amount: "₩300,000", note: "" },
    { category: "🏥 상해/질병", name: "상해입원일당", amount: "₩30,000", note: "1일당" },
    { category: "🆘 사고", name: "중대사고 구조송환비용", amount: "₩5,000만", note: "7일 이상" },
    { category: "🆘 사고", name: "여행 중단 추가비용", amount: "₩300,000", note: "" },
    { category: "🆘 사고", name: "여권분실 재발급비용", amount: "₩200,000", note: "" },
    { category: "💼 물품", name: "휴대품 손해 (분실 제외)", amount: "₩200만", note: "물품당 20만 한도" },
    { category: "⚖️ 배상", name: "일괄배상 (해외여행중)", amount: "₩5,000만", note: "자기부담금 1만원" },
  ],
  warnings: [
    "현금·여권·항공권·신용카드는 휴대품으로 인정 안 됨",
    "단순 분실은 보상 ✕ (도난만 보장)",
    "도난 시 현지 경찰서 Police Report 필수",
    "의료비 청구: 현지 진료장·영문 진단서·영수증 보관 필수",
    "외교부 적색/흑색 경보 지역 방문 시 보상 ✕",
  ],
  claimPhone: "1588-5656",
};
