// Emergency Types
export const emergencyTypes: Array<{
  id: string;
  icon: string;
  label: string;
  labelHindi: string;
  color: 'critical' | 'high' | 'medium';
}> = [
  { id: 'heart', icon: '🫀', label: 'Heart/Chest Pain', labelHindi: 'हृदय/सीने में दर्द', color: 'critical' },
  { id: 'accident', icon: '🤕', label: 'Accident/Injury', labelHindi: 'दुर्घटना/चोट', color: 'critical' },
  { id: 'breathing', icon: '🤒', label: 'Breathing Problem', labelHindi: 'सांस की समस्या', color: 'high' },
  { id: 'stroke', icon: '🧠', label: 'Stroke/Paralysis', labelHindi: 'स्ट्रोक/लकवा', color: 'critical' },
  { id: 'pregnancy', icon: '🤰', label: 'Pregnancy', labelHindi: 'गर्भावस्था', color: 'high' },
  { id: 'burns', icon: '🔥', label: 'Burns', labelHindi: 'जलना', color: 'high' },
  { id: 'bleeding', icon: '🩸', label: 'Severe Bleeding', labelHindi: 'गंभीर रक्तस्राव', color: 'critical' },
  { id: 'unconscious', icon: '😵', label: 'Unconscious', labelHindi: 'बेहोश', color: 'critical' },
  { id: 'other', icon: '⚡', label: 'Other', labelHindi: 'अन्य', color: 'medium' },
];

// Sample Emergencies
export const mockEmergencies = [
  {
    id: 'EMG-2024-001',
    patientName: 'Rajesh Kumar',
    age: 45,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98765 43210',
    type: 'heart',
    status: 'en_route',
    severity: 'critical',
    location: {
      address: '42, MG Road, Andheri West, Mumbai 400053',
      lat: 19.1196,
      lng: 72.8472,
    },
    symptoms: ['Chest pain', 'Shortness of breath', 'Sweating'],
    medicalHistory: ['Diabetes', 'Hypertension'],
    allergies: ['Penicillin'],
    isConscious: true,
    canSpeak: true,
    createdAt: new Date(Date.now() - 15 * 60000),
    ambulanceId: 'AMB-001',
    hospitalId: 'HOSP-001',
    eta: 5,
    distance: 2.3,
  },
  {
    id: 'EMG-2024-002',
    patientName: 'Priya Sharma',
    age: 32,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 87654 32109',
    type: 'accident',
    status: 'dispatched',
    severity: 'high',
    location: {
      address: '15, Linking Road, Bandra, Mumbai 400050',
      lat: 19.0596,
      lng: 72.8295,
    },
    symptoms: ['Head injury', 'Bleeding', 'Disorientation'],
    medicalHistory: [],
    allergies: [],
    isConscious: true,
    canSpeak: false,
    createdAt: new Date(Date.now() - 8 * 60000),
    ambulanceId: 'AMB-003',
    hospitalId: 'HOSP-002',
    eta: 8,
    distance: 3.5,
  },
  {
    id: 'EMG-2024-003',
    patientName: 'Amit Patel',
    age: 58,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 76543 21098',
    type: 'stroke',
    status: 'arrived',
    severity: 'critical',
    location: {
      address: '78, Juhu Beach Road, Juhu, Mumbai 400049',
      lat: 19.0987,
      lng: 72.8266,
    },
    symptoms: ['Face drooping', 'Arm weakness', 'Speech difficulty'],
    medicalHistory: ['High cholesterol', 'Previous stroke'],
    allergies: ['Aspirin'],
    isConscious: false,
    canSpeak: false,
    createdAt: new Date(Date.now() - 22 * 60000),
    ambulanceId: 'AMB-005',
    hospitalId: 'HOSP-001',
    eta: 0,
    distance: 0,
  },
  {
    id: 'EMG-2024-004',
    patientName: 'Sunita Devi',
    age: 28,
    gender: 'Female',
    bloodGroup: 'AB+',
    phone: '+91 65432 10987',
    type: 'pregnancy',
    status: 'en_route',
    severity: 'high',
    location: {
      address: '23, Powai Lake Road, Powai, Mumbai 400076',
      lat: 19.1176,
      lng: 72.9060,
    },
    symptoms: ['Labor pains', 'Water broke', 'Contractions'],
    medicalHistory: ['First pregnancy'],
    allergies: [],
    isConscious: true,
    canSpeak: true,
    createdAt: new Date(Date.now() - 12 * 60000),
    ambulanceId: 'AMB-007',
    hospitalId: 'HOSP-003',
    eta: 6,
    distance: 2.8,
  },
  {
    id: 'EMG-2024-005',
    patientName: 'Vikram Singh',
    age: 67,
    gender: 'Male',
    bloodGroup: 'B-',
    phone: '+91 54321 09876',
    type: 'breathing',
    status: 'pending',
    severity: 'high',
    location: {
      address: '56, Colaba Causeway, Colaba, Mumbai 400005',
      lat: 18.9067,
      lng: 72.8147,
    },
    symptoms: ['Difficulty breathing', 'Wheezing', 'Chest tightness'],
    medicalHistory: ['Asthma', 'COPD'],
    allergies: ['Dust', 'Pollen'],
    isConscious: true,
    canSpeak: true,
    createdAt: new Date(Date.now() - 3 * 60000),
    ambulanceId: null,
    hospitalId: null,
    eta: null,
    distance: 5.2,
  },
];

// Ambulances
export const mockAmbulances = [
  {
    id: 'AMB-001',
    vehicleNumber: 'MH-01-AB-1234',
    driver: 'Vijay Sharma',
    driverPhone: '+91 98765 11111',
    paramedic: 'Rahul Verma',
    status: 'busy',
    location: { lat: 19.1150, lng: 72.8450 },
    currentEmergency: 'EMG-2024-001',
  },
  {
    id: 'AMB-002',
    vehicleNumber: 'MH-01-CD-5678',
    driver: 'Suresh Yadav',
    driverPhone: '+91 98765 22222',
    paramedic: 'Anil Kumar',
    status: 'available',
    location: { lat: 19.0760, lng: 72.8777 },
    currentEmergency: null,
  },
  {
    id: 'AMB-003',
    vehicleNumber: 'MH-01-EF-9012',
    driver: 'Ramesh Gupta',
    driverPhone: '+91 98765 33333',
    paramedic: 'Sanjay Singh',
    status: 'busy',
    location: { lat: 19.0550, lng: 72.8300 },
    currentEmergency: 'EMG-2024-002',
  },
  {
    id: 'AMB-004',
    vehicleNumber: 'MH-01-GH-3456',
    driver: 'Mukesh Tiwari',
    driverPhone: '+91 98765 44444',
    paramedic: 'Deepak Joshi',
    status: 'available',
    location: { lat: 19.0896, lng: 72.8656 },
    currentEmergency: null,
  },
  {
    id: 'AMB-005',
    vehicleNumber: 'MH-01-IJ-7890',
    driver: 'Prakash Mishra',
    driverPhone: '+91 98765 55555',
    paramedic: 'Vikash Pandey',
    status: 'busy',
    location: { lat: 19.0987, lng: 72.8266 },
    currentEmergency: 'EMG-2024-003',
  },
  {
    id: 'AMB-006',
    vehicleNumber: 'MH-01-KL-1357',
    driver: 'Ajay Chauhan',
    driverPhone: '+91 98765 66666',
    paramedic: 'Manish Dubey',
    status: 'off_duty',
    location: { lat: 19.0330, lng: 72.8550 },
    currentEmergency: null,
  },
  {
    id: 'AMB-007',
    vehicleNumber: 'MH-01-MN-2468',
    driver: 'Ravi Saxena',
    driverPhone: '+91 98765 77777',
    paramedic: 'Sunil Rao',
    status: 'busy',
    location: { lat: 19.1100, lng: 72.9000 },
    currentEmergency: 'EMG-2024-004',
  },
];

// Hospitals
export const mockHospitals = [
  {
    id: 'HOSP-001',
    name: 'City General Hospital',
    address: 'Andheri East, Mumbai 400069',
    location: { lat: 19.1136, lng: 72.8697 },
    phone: '+91 22 2222 1111',
    beds: {
      er: { total: 15, available: 3 },
      icu: { total: 8, available: 1 },
      general: { total: 50, available: 12 },
    },
    equipment: {
      ventilators: { total: 5, available: 2 },
      defibrillators: { total: 4, available: 4 },
    },
    bloodBank: {
      'A+': 5, 'A-': 2, 'B+': 3, 'B-': 1,
      'O+': 8, 'O-': 3, 'AB+': 2, 'AB-': 1,
    },
    specialists: [
      { name: 'Dr. Sharma', specialty: 'Cardiologist', available: true },
      { name: 'Dr. Patel', specialty: 'Neurologist', available: true },
      { name: 'Dr. Gupta', specialty: 'Trauma Surgeon', available: false },
    ],
    staffOnDuty: 12,
  },
  {
    id: 'HOSP-002',
    name: 'Lilavati Hospital',
    address: 'Bandra West, Mumbai 400050',
    location: { lat: 19.0508, lng: 72.8286 },
    phone: '+91 22 2222 2222',
    beds: {
      er: { total: 20, available: 5 },
      icu: { total: 12, available: 3 },
      general: { total: 80, available: 25 },
    },
    equipment: {
      ventilators: { total: 8, available: 4 },
      defibrillators: { total: 6, available: 5 },
    },
    bloodBank: {
      'A+': 10, 'A-': 4, 'B+': 6, 'B-': 2,
      'O+': 15, 'O-': 5, 'AB+': 3, 'AB-': 2,
    },
    specialists: [
      { name: 'Dr. Mehta', specialty: 'Cardiologist', available: true },
      { name: 'Dr. Jain', specialty: 'Orthopedic', available: true },
    ],
    staffOnDuty: 18,
  },
  {
    id: 'HOSP-003',
    name: 'Hiranandani Hospital',
    address: 'Powai, Mumbai 400076',
    location: { lat: 19.1197, lng: 72.9051 },
    phone: '+91 22 2222 3333',
    beds: {
      er: { total: 12, available: 4 },
      icu: { total: 6, available: 2 },
      general: { total: 40, available: 15 },
    },
    equipment: {
      ventilators: { total: 4, available: 2 },
      defibrillators: { total: 3, available: 3 },
    },
    bloodBank: {
      'A+': 4, 'A-': 1, 'B+': 5, 'B-': 1,
      'O+': 6, 'O-': 2, 'AB+': 2, 'AB-': 1,
    },
    specialists: [
      { name: 'Dr. Rao', specialty: 'Gynecologist', available: true },
      { name: 'Dr. Iyer', specialty: 'Pediatrician', available: true },
    ],
    staffOnDuty: 10,
  },
];

// Safety Instructions based on emergency type
export const safetyInstructions: Record<string, { dos: string[]; donts: string[] }> = {
  heart: {
    dos: [
      'Keep patient calm and seated',
      'Loosen tight clothing',
      'Give aspirin if not allergic',
      'Monitor breathing',
    ],
    donts: [
      'Do not let patient walk',
      'No heavy meals',
      'Avoid stress or exertion',
    ],
  },
  accident: {
    dos: [
      'Keep patient still',
      'Apply pressure to wounds',
      'Keep airway clear',
      'Cover with blanket for warmth',
    ],
    donts: [
      'Do not move patient unnecessarily',
      'Do not remove embedded objects',
      'No food or water',
    ],
  },
  stroke: {
    dos: [
      'Note time symptoms started',
      'Keep head slightly elevated',
      'Turn on side if vomiting',
      'Stay calm and reassure patient',
    ],
    donts: [
      'Do not give food or water',
      'Do not give any medication',
      'Do not let patient sleep',
    ],
  },
  breathing: {
    dos: [
      'Help patient sit upright',
      'Loosen tight clothing',
      'Use inhaler if available',
      'Keep environment calm',
    ],
    donts: [
      'Do not panic patient',
      'Avoid triggers (smoke, dust)',
      'Do not force lying down',
    ],
  },
  pregnancy: {
    dos: [
      'Help mother lie on left side',
      'Time contractions',
      'Keep calm and comfortable',
      'Have clean towels ready',
    ],
    donts: [
      'Do not push before advised',
      'No hot baths',
      'Do not ignore warning signs',
    ],
  },
  burns: {
    dos: [
      'Cool burn with clean water',
      'Cover with clean cloth',
      'Keep patient warm',
      'Elevate burned area if possible',
    ],
    donts: [
      'Do not apply ice directly',
      'Do not burst blisters',
      'No creams or butter',
    ],
  },
  bleeding: {
    dos: [
      'Apply direct pressure',
      'Elevate injured area',
      'Use clean cloth or bandage',
      'Keep patient calm',
    ],
    donts: [
      'Do not remove soaked bandages',
      'Do not apply tourniquet unless trained',
      'Avoid aspirin',
    ],
  },
  unconscious: {
    dos: [
      'Check breathing and pulse',
      'Place in recovery position',
      'Clear airway',
      'Keep warm',
    ],
    donts: [
      'Do not give anything by mouth',
      'Do not leave alone',
      'Do not slap or shake',
    ],
  },
  other: {
    dos: [
      'Stay calm',
      'Note all symptoms',
      'Keep patient comfortable',
      'Be ready to provide information',
    ],
    donts: [
      'Do not give medication',
      'Do not move unnecessarily',
      'Do not panic',
    ],
  },
};

// Activity Log for Admin
export const mockActivityLog: Array<{
  id: number;
  type: 'emergency' | 'dispatch' | 'arrival' | 'hospital';
  message: string;
  time: Date;
  severity: 'critical' | 'high' | 'info' | 'success' | 'warning';
}> = [
  { id: 1, type: 'emergency', message: 'New critical emergency EMG-2024-001 received', time: new Date(Date.now() - 15 * 60000), severity: 'critical' },
  { id: 2, type: 'dispatch', message: 'AMB-001 dispatched to EMG-2024-001', time: new Date(Date.now() - 14 * 60000), severity: 'info' },
  { id: 3, type: 'emergency', message: 'New high priority emergency EMG-2024-002', time: new Date(Date.now() - 8 * 60000), severity: 'high' },
  { id: 4, type: 'arrival', message: 'AMB-005 arrived at patient location', time: new Date(Date.now() - 5 * 60000), severity: 'success' },
  { id: 5, type: 'hospital', message: 'HOSP-001 ICU at 87% capacity', time: new Date(Date.now() - 3 * 60000), severity: 'warning' },
  { id: 6, type: 'emergency', message: 'New emergency EMG-2024-005 pending dispatch', time: new Date(Date.now() - 3 * 60000), severity: 'high' },
];

// Analytics Data
export const analyticsData = {
  responseTimeTrend: [
    { day: 'Mon', time: 8.2 },
    { day: 'Tue', time: 7.8 },
    { day: 'Wed', time: 9.1 },
    { day: 'Thu', time: 8.5 },
    { day: 'Fri', time: 7.5 },
    { day: 'Sat', time: 8.8 },
    { day: 'Sun', time: 9.0 },
  ],
  emergencyTypes: [
    { type: 'Heart', count: 25, color: '#DC2626' },
    { type: 'Accident', count: 35, color: '#F59E0B' },
    { type: 'Breathing', count: 15, color: '#3B82F6' },
    { type: 'Stroke', count: 10, color: '#8B5CF6' },
    { type: 'Other', count: 15, color: '#6B7280' },
  ],
  peakHours: [
    { hour: '6AM', count: 5 },
    { hour: '9AM', count: 18 },
    { hour: '12PM', count: 12 },
    { hour: '3PM', count: 15 },
    { hour: '6PM', count: 22 },
    { hour: '9PM', count: 14 },
    { hour: '12AM', count: 8 },
  ],
};
