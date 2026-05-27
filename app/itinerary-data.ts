export interface ScheduleItem {
  time: string;
  place: string;
  transport: string;
  activity: string;
}

export interface DaySchedule {
  day: string;
  date: string;
  subtitle: string;
  items: ScheduleItem[];
}

export interface CityInfo {
  name: string;
  emoji: string;
  period: string;
  hotel: string;
  flight: string;
  days: DaySchedule[];
}

export const cities: CityInfo[] = [
  {
    name: "뉴욕",
    emoji: "🗽",
    period: "6/1~6/5",
    hotel: "밀레니엄 힐튼 뉴욕 유엔 원플라자",
    flight: "에어프레미아 YP0131 | 6/1 21:30 ICN → 22:30 EWR",
    days: [
      {
        day: "1일차",
        date: "6월 1일 (월)",
        subtitle: "도착",
        items: [
          { time: "22:00~23:00", place: "뉴어크(EWR)", transport: "✈️", activity: "22:30 뉴어크(EWR) 도착" },
          { time: "23:00~00:00", place: "밀레니엄 힐튼", transport: "🚖", activity: "우버 → 호텔 체크인 (~30분)" },
        ],
      },
      {
        day: "2일차",
        date: "6월 2일 (화)",
        subtitle: "",
        items: [
          { time: "06:00~07:00", place: "호텔", transport: "", activity: "06:30 기상 / 샤워" },
          { time: "07:00~08:00", place: "호텔", transport: "", activity: "메이크 / 옷 준비" },
          { time: "08:00~09:00", place: "Ralph's Coffee", transport: "☕", activity: "Ralph's Coffee (메트 근처)" },
          { time: "09:00~10:00", place: "→ Metropolitan", transport: "🚇", activity: "4/5/6 → 86 St, 메트로폴리탄 이동" },
          { time: "10:00~11:00", place: "Metropolitan Museum", transport: "🚶", activity: "09:30 도착 → 10:00 입장" },
          { time: "11:00~12:00", place: "Metropolitan Museum", transport: "", activity: "메트 도슨트 투어 시작" },
          { time: "12:00~13:00", place: "Metropolitan Museum", transport: "", activity: "도슨트 마무리" },
          { time: "13:00~14:00", place: "Orsay", transport: "🍽️", activity: "Orsay (프렌치 비스트로, 실내 1시 예약)" },
          { time: "14:00~15:00", place: "메트 자유관람", transport: "🎨", activity: "메트 자유관람" },
          { time: "15:00~16:00", place: "→ DUMBO", transport: "🚖", activity: "센트럴파크 산책 (선택)" },
          { time: "16:00~17:00", place: "→ DUMBO", transport: "🚖", activity: "우버 → 호텔 → DUMBO" },
          { time: "17:00~18:00", place: "DUMBO", transport: "📸", activity: "웨딩스냅 촬영" },
          { time: "18:00~19:00", place: "Juliana's", transport: "🚶", activity: "🍕 Juliana's 피자" },
          { time: "19:00~20:00", place: "Randolph Beer DUMBO", transport: "🚶", activity: "🍺 Randolph Beer" },
          { time: "20:00~21:00", place: "호텔", transport: "🚖", activity: "호텔 복귀" },
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
          { time: "09:00~10:00", place: "원월드 트레이드", transport: "🚇", activity: "09:00 타미스 워킹투어 시작" },
          { time: "10:00~11:00", place: "원월드 전망대", transport: "🚶", activity: "원월드 전망대 / 9/11 메모리얼" },
          { time: "11:00~12:00", place: "월스트리트", transport: "🚶", activity: "트리니티 교회 → 월스트리트 → 황소동상 / 크루즈 탑승" },
          { time: "12:00~13:00", place: "자유의 여신상", transport: "⛴️", activity: "자유의 여신상 크루즈" },
          { time: "13:00~14:00", place: "첼시마켓", transport: "🚶", activity: "첼시마켓 점심" },
          { time: "14:00~15:00", place: "하이라인 파크", transport: "🚶", activity: "하이라인 파크 산책" },
          { time: "15:00~16:00", place: "리틀아일랜드", transport: "🚶", activity: "리틀아일랜드 / 미트패킹" },
          { time: "16:00~17:00", place: "워싱턴 스퀘어", transport: "🚶", activity: "미트패킹 → 블리커 → 워싱턴 스퀘어 (투어 종료)" },
          { time: "17:00~18:00", place: "그리니치", transport: "🚶", activity: "자유시간 / 조스피자 이동" },
          { time: "18:00~19:00", place: "조스피자", transport: "🚶", activity: "🍕 조스피자" },
          { time: "19:00~20:00", place: "그리니치 빌리지", transport: "🚶", activity: "그리니치 산책" },
          { time: "20:00~21:00", place: "호텔", transport: "🚇", activity: "호텔 복귀" },
        ],
      },
      {
        day: "4일차",
        date: "6월 4일 (목)",
        subtitle: "",
        items: [
          { time: "07:00~08:00", place: "호텔", transport: "", activity: "기상 / 채비 + 간단 조식" },
          { time: "08:00~09:00", place: "→ Times Square", transport: "🚇", activity: "타임스스퀘어 이동" },
          { time: "09:00~10:00", place: "Times Square", transport: "🚇", activity: "타임스스퀘어" },
          { time: "10:00~11:00", place: "브라이언트파크", transport: "🚶", activity: "브라이언트파크" },
          { time: "11:00~12:00", place: "Grand Central", transport: "🚶", activity: "그랜드 센트럴" },
          { time: "12:00~13:00", place: "타임스스퀘어", transport: "", activity: "🍕 Los Tacos No.1" },
          { time: "13:00~14:00", place: "메이시스", transport: "🚶", activity: "메이시스 (백화점)" },
          { time: "14:00~15:00", place: "5번가", transport: "🛍️", activity: "5번가 (명품 쇼핑거리)" },
          { time: "15:00~16:00", place: "록펠러 센터", transport: "🚶", activity: "록펠러 센터 / 세인트패트릭" },
          { time: "16:00~17:00", place: "극장 근처", transport: "🍽️", activity: "Carmine's (이탈리안)" },
          { time: "17:00~18:00", place: "극장 근처", transport: "🍽️", activity: "Carmine's 계속" },
          { time: "18:00~19:00", place: "브로드웨이", transport: "🚶", activity: "극장 입장 준비" },
          { time: "19:00~20:00", place: "브로드웨이", transport: "🎭", activity: "해리포터 브로드웨이 공연" },
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
          { time: "09:00~10:00", place: "Port Authority", transport: "🚌", activity: "Port Authority 4층 대기" },
          { time: "10:00~11:00", place: "셔틀버스", transport: "🚌", activity: "우드버리 도착 / VIP 쿠폰북" },
          { time: "11:00~12:00", place: "우드버리", transport: "🛍️", activity: "Coach / Tory Burch / Polo" },
          { time: "12:00~13:00", place: "우드버리", transport: "🍽️", activity: "점심 (푸드코트)" },
          { time: "13:00~14:00", place: "우드버리", transport: "🛍️", activity: "Kate Spade / Michael Kors / Tumi" },
          { time: "14:00~15:00", place: "우드버리", transport: "🛍️", activity: "Nike / Adidas / Levi's → 우드버리 출발" },
          { time: "15:00~16:00", place: "셔틀버스", transport: "🚌", activity: "Port Authority 복귀" },
          { time: "16:00~17:00", place: "호텔", transport: "🏨", activity: "호텔 복귀 + 휴식" },
          { time: "17:00~18:00", place: "Keens Steakhouse", transport: "🚶", activity: "Keens Steakhouse 도착" },
          { time: "18:00~19:00", place: "Keens Steakhouse", transport: "🥩", activity: "Keens 저녁" },
          { time: "19:00~20:00", place: "→ SUMMIT", transport: "🚶", activity: "SUMMIT 도보 이동" },
          { time: "20:00~21:00", place: "서밋 원 밴더빌트", transport: "🏙️", activity: "SUMMIT 입장 / 일몰" },
          { time: "21:00~22:00", place: "서밋 원 밴더빌트", transport: "🌃", activity: "야경 관람 → 호텔 복귀" },
        ],
      },
      {
        day: "6일차",
        date: "6월 6일 (토)",
        subtitle: "→ 마이애미",
        items: [
          { time: "06:00~07:00", place: "호텔", transport: "🧳", activity: "기상 / 체크아웃 준비" },
          { time: "07:00~08:00", place: "호텔", transport: "🚖", activity: "호텔 출발 (우버 → JFK)" },
          { time: "08:00~09:00", place: "JFK T4", transport: "🚖", activity: "JFK 도착 / 체크인 / 수하물 위탁" },
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
    days: [
      {
        day: "1일차",
        date: "6월 6일 (토)",
        subtitle: "도착",
        items: [
          { time: "14:00~15:00", place: "MIA 공항", transport: "✈️", activity: "14:19 MIA 도착" },
          { time: "16:00~17:00", place: "로우스 마이애미", transport: "🚕", activity: "호텔 체크인" },
          { time: "17:00~18:00", place: "Wynwood Walls", transport: "🚕", activity: "윈우드 월스 (벽화 거리)" },
          { time: "18:00~19:00", place: "Lincoln Road", transport: "🚶", activity: "링컨로드 산책" },
          { time: "19:00~20:00", place: "Trader Joe's", transport: "🚶", activity: "트레이더조" },
          { time: "20:00~21:00", place: "Havana1957", transport: "🚶", activity: "🍕 Havana1957" },
        ],
      },
      {
        day: "2일차",
        date: "6월 7일 (일)",
        subtitle: "",
        items: [
          { time: "07:00~08:00", place: "호텔", transport: "", activity: "기상 / 샤워" },
          { time: "08:00~09:00", place: "호텔", transport: "", activity: "메이크 / 옷 준비" },
          { time: "09:00~10:00", place: "→ Little Havana", transport: "🚕", activity: "우버 출발 → Versailles" },
          { time: "10:00~11:00", place: "Versailles", transport: "🥪", activity: "Versailles 쿠바 샌드위치" },
          { time: "11:00~12:00", place: "Calle Ocho", transport: "🚶", activity: "칼레 오초 산책" },
          { time: "12:00~13:00", place: "→ Versace Mansion", transport: "🚕", activity: "베르사체 맨션 이동" },
          { time: "13:00~14:00", place: "Versace Mansion", transport: "🍽️", activity: "Villa Casa Casuarina 런치" },
          { time: "14:00~15:00", place: "오션드라이브", transport: "🚶", activity: "오션드라이브 산책" },
          { time: "15:00~16:00", place: "아르데코 지구", transport: "🏖️", activity: "아르데코 지구 산책" },
          { time: "16:00~17:00", place: "호텔 풀", transport: "🏊", activity: "수영장 풀파티" },
          { time: "17:00~18:00", place: "호텔", transport: "🏨", activity: "풀 / 호텔 휴식" },
          { time: "18:00~19:00", place: "링컨로드", transport: "🚶", activity: "저녁 준비 / 링컨로드" },
          { time: "19:00~20:00", place: "링컨로드", transport: "🍝", activity: "링컨로드 저녁" },
          { time: "21:00~22:00", place: "Sweet Liberty", transport: "🍸", activity: "🍸 Sweet Liberty" },
          { time: "23:00~00:00", place: "클럽", transport: "🚕", activity: "🩩 클럽" },
        ],
      },
      {
        day: "3일차",
        date: "6월 8일 (월)",
        subtitle: "",
        items: [
          { time: "08:00~09:00", place: "호텔", transport: "🛌", activity: "늦잠 / 룸서비스" },
          { time: "09:00~10:00", place: "호텔 비치", transport: "🏖️", activity: "호텔 전용 비치" },
          { time: "10:00~11:00", place: "호텔 비치", transport: "🏊", activity: "풀 또는 비치" },
          { time: "11:00~12:00", place: "호텔", transport: "🚿", activity: "샤워 / 체크아웃 준비" },
          { time: "12:00~13:00", place: "Española Way", transport: "🚶", activity: "Española Way 산책" },
          { time: "13:00~14:00", place: "Española Way", transport: "🍽️", activity: "Española Way 점심" },
          { time: "14:00~15:00", place: "→ 베이사이드", transport: "🚕", activity: "베이사이드 마켓플레이스" },
          { time: "15:00~16:00", place: "베이사이드", transport: "⛵", activity: "베이사이드 산책" },
          { time: "16:00~17:00", place: "→ 호텔", transport: "🚕", activity: "호텔 복귀" },
          { time: "17:00~18:00", place: "호텔", transport: "🏨", activity: "휴식 / 저녁 준비" },
          { time: "18:00~19:00", place: "→ Joe's Stone Crab", transport: "🚕", activity: "조스 스톤크랩 이동" },
          { time: "19:00~20:00", place: "Joe's Stone Crab", transport: "🦀", activity: "조스 스톤크랩 저녁" },
          { time: "20:00~21:00", place: "호텔", transport: "", activity: "호텔 복귀 / 휴식" },
          { time: "21:00~22:00", place: "호텔", transport: "", activity: "짐 정리 / LA 행 준비" },
        ],
      },
      {
        day: "4일차",
        date: "6월 9일 (화)",
        subtitle: "→ LA",
        items: [
          { time: "05:00~06:00", place: "호텔", transport: "🧳", activity: "기상 / 체크아웃" },
          { time: "06:00~07:00", place: "→ FLL 공항", transport: "🚖", activity: "우버 → FLL" },
          { time: "07:00~08:00", place: "FLL 공항", transport: "", activity: "FLL 도착 / 체크인" },
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
    days: [
      {
        day: "1일차",
        date: "6월 9일 (화)",
        subtitle: "도착",
        items: [
          { time: "09:00~10:00", place: "FLL", transport: "✈️", activity: "09:20 FLL 출발" },
          { time: "12:00~13:00", place: "LAX T1", transport: "🛬", activity: "12:04 LAX 도착" },
          { time: "13:00~14:00", place: "LAX", transport: "🚗", activity: "렌터카 픽업" },
          { time: "14:00~15:00", place: "→ In-N-Out", transport: "🚗", activity: "In-N-Out 이동" },
          { time: "15:00~16:00", place: "In-N-Out", transport: "🍔", activity: "In-N-Out 점심" },
          { time: "16:00~17:00", place: "Trader Joe's", transport: "🛒", activity: "Trader Joe's 장보기" },
          { time: "17:00~18:00", place: "호텔 (Glendale)", transport: "🏨", activity: "호텔 체크인 + 휴식" },
          { time: "18:00~19:00", place: "→ Griffith", transport: "🚗", activity: "그리피스 천문대 출발" },
          { time: "19:00~20:00", place: "Griffith Observatory", transport: "🌅", activity: "그리피스 천문대 sunset" },
          { time: "20:00~21:00", place: "Griffith Observatory", transport: "🌃", activity: "LA 야경" },
          { time: "21:00~22:00", place: "Hollywood Blvd", transport: "🚗", activity: "할리우드 (Walk of Fame)" },
          { time: "22:00~23:00", place: "→ 호텔", transport: "🚗", activity: "호텔 복귀" },
          { time: "23:00~00:00", place: "호텔", transport: "🍷", activity: "와인 + 간식 / 휴식" },
        ],
      },
      {
        day: "2일차",
        date: "6월 10일 (수)",
        subtitle: "",
        items: [
          { time: "07:00~08:00", place: "호텔", transport: "☕", activity: "기상 / 채비 + 조식" },
          { time: "08:00~09:00", place: "→ Universal", transport: "🚗", activity: "유니버설 이동" },
          { time: "09:00~10:00", place: "Universal Studios", transport: "🎢", activity: "유니버설 입장" },
          { time: "10:00~16:00", place: "Universal Studios", transport: "🎢", activity: "유니버설 스튜디오 (점심 포함)" },
          { time: "17:00~18:00", place: "Walmart Garden Center", transport: "🌿", activity: "월마트 가든센터" },
          { time: "18:00~19:00", place: "Costco (Burbank)", transport: "🛒", activity: "코스트코 + 푸드코트 저녁" },
          { time: "19:00~20:00", place: "Total Wine", transport: "🍷", activity: "Total Wine & More" },
          { time: "20:00~21:00", place: "→ 호텔", transport: "🚗", activity: "호텔 복귀" },
        ],
      },
      {
        day: "3일차",
        date: "6월 11일 (목)",
        subtitle: "",
        items: [
          { time: "07:00~08:00", place: "호텔", transport: "☕", activity: "기상 / 채비 + 조식" },
          { time: "08:00~09:00", place: "→ Warner Bros", transport: "🚗", activity: "워너 스튜디오 이동" },
          { time: "09:00~13:00", place: "Warner Bros. Studio", transport: "🎬", activity: "워너브라더스 Studio Tour Plus" },
          { time: "13:00~14:00", place: "워너 근처", transport: "🍔", activity: "점심 (워너 근처)" },
          { time: "14:00~15:00", place: "Beverly Hills", transport: "🚗", activity: "로데오드라이브 / 베벌리힐즈" },
          { time: "15:00~16:00", place: "The Broad / LACMA", transport: "🚗", activity: "The Broad / LACMA" },
          { time: "16:00~17:00", place: "Trader Joe's", transport: "🚗", activity: "트레이더조" },
          { time: "17:00~18:00", place: "Grand Central Market", transport: "🚶", activity: "그랜드 센트럴 마켓" },
          { time: "18:00~19:00", place: "Last Bookstore", transport: "🚶", activity: "래스트 북스토어" },
          { time: "19:00~20:00", place: "Total Wine", transport: "🚗", activity: "와인앤모어" },
          { time: "20:00~21:00", place: "→ 호텔", transport: "🚗", activity: "호텔 복귀" },
        ],
      },
      {
        day: "4일차",
        date: "6월 12일 (금)",
        subtitle: "",
        items: [
          { time: "06:00~07:00", place: "호텔", transport: "", activity: "기상" },
          { time: "09:00~10:00", place: "Trader Joe's", transport: "🛒", activity: "트레이더조 / 와인앤모어" },
          { time: "10:00~15:00", place: "Getty Center", transport: "🎨", activity: "게티 미술관 (점심 포함)" },
          { time: "16:00~17:00", place: "Malibu", transport: "🚗", activity: "말리부 해안 드라이브" },
          { time: "17:00~18:00", place: "Santa Monica", transport: "🚗", activity: "산타모니카" },
          { time: "18:00~19:00", place: "Venice Beach", transport: "🚶", activity: "베니스 운하 / 베니스 비치" },
          { time: "19:00~20:00", place: "Venice Beach", transport: "🌅", activity: "베니스 비치 일몰" },
          { time: "20:00~21:00", place: "→ 호텔", transport: "🚗", activity: "호텔 복귀" },
        ],
      },
      {
        day: "5일차",
        date: "6월 13일 (토)",
        subtitle: "출국",
        items: [
          { time: "06:00~07:00", place: "호텔", transport: "🧳", activity: "기상 / 짐 최종 정리" },
          { time: "07:00~08:00", place: "호텔", transport: "🚗", activity: "호텔 체크아웃" },
          { time: "08:00~09:00", place: "LAX", transport: "🚗", activity: "LAX 렌터카 반납" },
          { time: "09:00~10:00", place: "LAX", transport: "", activity: "체크인 / 보안검색" },
          { time: "10:00~11:00", place: "LAX", transport: "✈️", activity: "10:50 LAX → ICN 출국" },
        ],
      },
    ],
  },
];
