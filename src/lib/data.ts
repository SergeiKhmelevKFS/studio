
import type { CardRecord, TransactionRecord } from './types';

export const initialData: CardRecord[] = [
  {
    id: '1',
    staffId: '123456',
    companyName: 'Tech Innovators Inc.',
    primaryCardholderName: 'Alice Johnson',
    primaryCardNumberBarcode: '635666123456',
    magStripe: 'MS12345',
    add1: '123 Innovation Drive',
    add2: 'Suite 100',
    add3: 'Tech Park',
    add4: 'Silicon Valley',
    add5: 'USA',
    postcode: '94043',
    validFrom: new Date('2023-01-01'),
    expires: new Date('2025-12-31'),
    letterFlag: true,
    overseas: false,
    primaryCardIssueDate: new Date('2023-01-01'),
    fullCardNoInCirculation: '635666123456',
    primaryCardType: 'Corporate Plus',
    nextPrimaryCardToBeCharged: true,
    cardholderName2: '',
    cardNumber2: '',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: true,
  },
  {
    id: '2',
    staffId: '678901',
    companyName: 'Global Solutions Ltd.',
    primaryCardholderName: 'Bob Williams',
    primaryCardNumberBarcode: '635666678901',
    magStripe: 'MS67890',
    add1: '456 Global Avenue',
    add2: 'Floor 20',
    add3: '',
    add4: 'London',
    add5: 'UK',
    postcode: 'E14 5HQ',
    validFrom: new Date('2022-06-15'),
    expires: new Date('2024-06-14'),
    letterFlag: false,
    overseas: true,
    primaryCardIssueDate: new Date('2022-06-15'),
    fullCardNoInCirculation: '635666678901',
    primaryCardType: 'Business Travel',
    nextPrimaryCardToBeCharged: false,
    cardholderName2: 'Charlie Brown',
    cardNumber2: '635666678901-2',
    primaryReplacementCardIssueDate: new Date('2023-08-20'),
    primaryPartCardNumberBarcode: 'P-9876',
    active: false,
    reason: 'Card expired',
  },
  {
    id: '3',
    staffId: '234567',
    companyName: 'Creative Designs',
    primaryCardholderName: 'Diana Prince',
    primaryCardNumberBarcode: '635666234567',
    magStripe: 'MS23456',
    add1: '789 Artistry Alley',
    add2: '',
    add3: '',
    add4: 'Paris',
    add5: 'France',
    postcode: '75001',
    validFrom: new Date('2024-02-01'),
    expires: new Date('2026-01-31'),
    letterFlag: true,
    overseas: true,
    primaryCardIssueDate: new Date('2024-02-01'),
    fullCardNoInCirculation: '635666234567',
    primaryCardType: 'Creative Suite',
    nextPrimaryCardToBeCharged: false,
    cardholderName2: '',
    cardNumber2: '',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: false,
    reason: 'Left company',
  },
  {
    id: '4',
    staffId: '345678',
    companyName: 'Secure Logistics',
    primaryCardholderName: 'Ethan Hunt',
    primaryCardNumberBarcode: '635666345678',
    magStripe: 'MS34567',
    add1: '1 Secure Plaza',
    add2: '',
    add3: '',
    add4: 'New York',
    add5: 'USA',
    postcode: '10001',
    validFrom: new Date('2023-05-10'),
    expires: new Date('2025-05-09'),
    letterFlag: false,
    overseas: false,
    primaryCardIssueDate: new Date('2023-05-10'),
    fullCardNoInCirculation: '635666345678',
    primaryCardType: 'Standard',
    nextPrimaryCardToBeCharged: true,
    cardholderName2: 'Jane Hunt',
    cardNumber2: '635666345678-2',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: true,
  },
  {
    id: '5',
    staffId: '456789',
    companyName: 'Health First',
    primaryCardholderName: 'Fiona Glenanne',
    primaryCardNumberBarcode: '635666456789',
    magStripe: 'MS45678',
    add1: '2 Wellness Way',
    add2: 'Building B',
    add3: '',
    add4: 'Miami',
    add5: 'USA',
    postcode: '33101',
    validFrom: new Date('2022-11-20'),
    expires: new Date('2023-11-19'),
    letterFlag: true,
    overseas: false,
    primaryCardIssueDate: new Date('2022-11-20'),
    fullCardNoInCirculation: '635666456789',
    primaryCardType: 'Health Perks',
    nextPrimaryCardToBeCharged: false,
    cardholderName2: '',
    cardNumber2: '',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: false,
    reason: 'Expired',
  },
  {
    id: '6',
    staffId: '567890',
    companyName: 'Green Energy Co',
    primaryCardholderName: 'George Green',
    primaryCardNumberBarcode: '635666567890',
    magStripe: 'MS56789',
    add1: '3 Sustainability Street',
    add2: '',
    add3: '',
    add4: 'Berlin',
    add5: 'Germany',
    postcode: '10115',
    validFrom: new Date('2024-03-15'),
    expires: new Date('2026-03-14'),
    letterFlag: true,
    overseas: true,
    primaryCardIssueDate: new Date('2024-03-15'),
    fullCardNoInCirculation: '635666567890',
    primaryCardType: 'Eco Plus',
    nextPrimaryCardToBeCharged: true,
    cardholderName2: '',
    cardNumber2: '',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: true,
  },
  {
    id: '7',
    staffId: '678901',
    companyName: 'Pioneer Ventures',
    primaryCardholderName: 'Hannah Montana',
    primaryCardNumberBarcode: '635666678901',
    magStripe: 'MS67890',
    add1: '4 Frontier Road',
    add2: '',
    add3: '',
    add4: 'Austin',
    add5: 'USA',
    postcode: '73301',
    validFrom: new Date('2023-08-01'),
    expires: new Date('2025-07-31'),
    letterFlag: false,
    overseas: false,
    primaryCardIssueDate: new Date('2023-08-01'),
    fullCardNoInCirculation: '635666678901',
    primaryCardType: 'Venture',
    nextPrimaryCardToBeCharged: false,
    cardholderName2: '',
    cardNumber2: '',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: true,
  },
  {
    id: '8',
    staffId: '789012',
    companyName: 'Oceanic Airlines',
    primaryCardholderName: 'Ian Somerhalder',
    primaryCardNumberBarcode: '635666789012',
    magStripe: 'MS78901',
    add1: '5 Skyway',
    add2: 'Terminal 3',
    add3: '',
    add4: 'Sydney',
    add5: 'Australia',
    postcode: '2000',
    validFrom: new Date('2022-10-05'),
    expires: new Date('2024-10-04'),
    letterFlag: true,
    overseas: true,
    primaryCardIssueDate: new Date('2022-10-05'),
    fullCardNoInCirculation: '635666789012',
    primaryCardType: 'Frequent Flyer',
    nextPrimaryCardToBeCharged: true,
    cardholderName2: 'Nina Dobrev',
    cardNumber2: '635666789012-2',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: false,
    reason: 'Lost Card',
  },
  {
    id: '9',
    staffId: '890123',
    companyName: 'Stark Industries',
    primaryCardholderName: 'Jack Ryan',
    primaryCardNumberBarcode: '635666890123',
    magStripe: 'MS89012',
    add1: '6 Intelligence Ave',
    add2: '',
    add3: '',
    add4: 'Langley',
    add5: 'USA',
    postcode: '22101',
    validFrom: new Date('2024-01-20'),
    expires: new Date('2026-01-19'),
    letterFlag: false,
    overseas: false,
    primaryCardIssueDate: new Date('2024-01-20'),
    fullCardNoInCirculation: '635666890123',
    primaryCardType: 'Top Secret',
    nextPrimaryCardToBeCharged: false,
    cardholderName2: '',
    cardNumber2: '',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: true,
  },
  {
    id: '10',
    staffId: '901234',
    companyName: 'Cyberdyne Systems',
    primaryCardholderName: 'Karen Page',
    primaryCardNumberBarcode: '635666901234',
    magStripe: 'MS90123',
    add1: '7 Skynet Street',
    add2: '',
    add3: '',
    add4: 'Sunnyvale',
    add5: 'USA',
    postcode: '94086',
    validFrom: new Date('2023-04-01'),
    expires: new Date('2025-03-31'),
    letterFlag: true,
    overseas: false,
    primaryCardIssueDate: new Date('2023-04-01'),
    fullCardNoInCirculation: '635666901234',
    primaryCardType: 'T-1000',
    nextPrimaryCardToBeCharged: true,
    cardholderName2: '',
    cardNumber2: '',
    primaryReplacementCardIssueDate: new Date('2024-01-01'),
    primaryPartCardNumberBarcode: '',
    active: true,
  },
  {
    id: '11',
    staffId: '112233',
    companyName: 'Wayne Enterprises',
    primaryCardholderName: 'Liam Neeson',
    primaryCardNumberBarcode: '635666112233',
    magStripe: 'MS11223',
    add1: '8 Batcave Blv',
    add2: '',
    add3: '',
    add4: 'Gotham',
    add5: 'USA',
    postcode: '10001',
    validFrom: new Date('2022-09-01'),
    expires: new Date('2024-08-31'),
    letterFlag: false,
    overseas: false,
    primaryCardIssueDate: new Date('2022-09-01'),
    fullCardNoInCirculation: '635666112233',
    primaryCardType: 'Vigilante',
    nextPrimaryCardToBeCharged: false,
    cardholderName2: 'Christian Bale',
    cardNumber2: '635666112233-2',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: false,
    reason: 'Account Closed',
  },
  {
    id: '12',
    staffId: '223344',
    companyName: 'Umbrella Corporation',
    primaryCardholderName: 'Milla Jovovich',
    primaryCardNumberBarcode: '635666223344',
    magStripe: 'MS22334',
    add1: '9 Raccoon City',
    add2: 'The Hive',
    add3: '',
    add4: 'Raccoon City',
    add5: 'USA',
    postcode: '54321',
    validFrom: new Date('2024-04-04'),
    expires: new Date('2026-04-03'),
    letterFlag: true,
    overseas: false,
    primaryCardIssueDate: new Date('2024-04-04'),
    fullCardNoInCirculation: '635666223344',
    primaryCardType: 'Bio-weapon',
    nextPrimaryCardToBeCharged: true,
    cardholderName2: '',
    cardNumber2: '',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: true,
  },
  {
    id: '13',
    staffId: '334455',
    companyName: 'Aperture Science',
    primaryCardholderName: 'Nolan North',
    primaryCardNumberBarcode: '635666334455',
    magStripe: 'MS33445',
    add1: '10 Portal Lane',
    add2: '',
    add3: '',
    add4: 'Gladstone',
    add5: 'USA',
    postcode: '49837',
    validFrom: new Date('2023-07-18'),
    expires: new Date('2025-07-17'),
    letterFlag: false,
    overseas: false,
    primaryCardIssueDate: new Date('2023-07-18'),
    fullCardNoInCirculation: '635666334455',
    primaryCardType: 'Test Subject',
    nextPrimaryCardToBeCharged: false,
    cardholderName2: 'Ellen McLain',
    cardNumber2: '635666334455-2',
    primaryReplacementCardIssueDate: undefined,
    primaryPartCardNumberBarcode: '',
    active: true,
  },
  // Misuse test case: Payer Mismatch
  {
    id: 'misuse-payer',
    staffId: '999001',
    companyName: 'Test Corp',
    primaryCardholderName: 'John Smith',
    primaryCardNumberBarcode: '635666999001',
    active: true,
    add1: '1 Test St', postcode: '12345',
    validFrom: new Date(), expires: new Date(2026, 1, 1), primaryCardIssueDate: new Date(),
  },
  // Misuse test case: High Frequency
  {
    id: 'misuse-frequency',
    staffId: '999002',
    companyName: 'Test Corp',
    primaryCardholderName: 'Jane Doe',
    primaryCardNumberBarcode: '635666999002',
    active: true,
    add1: '2 Test St', postcode: '12345',
    validFrom: new Date(), expires: new Date(2026, 1, 1), primaryCardIssueDate: new Date(),
  },
  // Misuse test case: Geographic Velocity
  {
    id: 'misuse-geo',
    staffId: '999003',
    companyName: 'Test Corp',
    primaryCardholderName: 'Peter Jones',
    primaryCardNumberBarcode: '635666999003',
    active: true,
    add1: '3 Test St', postcode: '12345',
    validFrom: new Date(), expires: new Date(2026, 1, 1), primaryCardIssueDate: new Date(),
  },
  ...Array.from({ length: 200 }, (_, i) => {
    const id = (14 + i).toString();
    const staffId = (100000 + i).toString();
    const name = `User ${i}`;
    const company = `Company ${String.fromCharCode(65 + (i % 26))}`;
    const country = i % 3 === 0 ? 'UK' : i % 3 === 1 ? 'USA' : 'Canada';
    const city = country === 'UK' ? 'London' : country === 'USA' ? 'New York' : 'Toronto';
    const active = (i % 10) > 2; // Deterministic "random"
    const expired = new Date() > new Date(2025, i % 12, (i % 28) + 1);
    
    return {
      id,
      staffId,
      companyName: company,
      primaryCardholderName: name,
      primaryCardNumberBarcode: `635666${staffId}`,
      magStripe: `MS${staffId}`,
      add1: `${i+1} Main St`,
      add2: '',
      add3: '',
      add4: city,
      add5: country,
      postcode: `${10000 + i}`,
      validFrom: new Date(2023, i % 12, (i % 28) + 1),
      expires: new Date(2025, i % 12, (i % 28) + 1),
      letterFlag: (i % 2) === 0,
      overseas: country !== 'UK',
      primaryCardIssueDate: new Date(2023, i % 12, (i % 28) + 1),
      fullCardNoInCirculation: `635666${staffId}`,
      primaryCardType: 'Standard',
      nextPrimaryCardToBeCharged: (i % 2) === 0,
      cardholderName2: '',
      cardNumber2: '',
      primaryReplacementCardIssueDate: undefined,
      primaryPartCardNumberBarcode: '',
      active: active && !expired,
      reason: !active ? (expired ? 'Expired' : 'Deactivated') : undefined,
    };
  }),
];

const julyRecords: CardRecord[] = [];
const startDateJuly = new Date('2024-07-01');
let currentId = 214;
for (let i = 0; i < 31; i++) {
    const loopDate = new Date(startDateJuly);
    loopDate.setDate(startDateJuly.getDate() + i);

    for (let j = 0; j < 3; j++) {
        const staffId = (300000 + currentId).toString();
        const name = `User July ${i+1}-${j+1}`;
        const company = `Company ${String.fromCharCode(65 + (currentId % 26))}`;
        const country = currentId % 3 === 0 ? 'UK' : currentId % 3 === 1 ? 'USA' : 'Canada';
        const city = country === 'UK' ? 'London' : country === 'USA' ? 'New York' : 'Toronto';
        const active = (currentId % 10) > 2; // Deterministic
        const expired = new Date() > new Date(2025, loopDate.getMonth(), loopDate.getDate());

        julyRecords.push({
            id: currentId.toString(),
            staffId,
            companyName: company,
            primaryCardholderName: name,
            primaryCardNumberBarcode: `635666${staffId}`,
            magStripe: `MS${staffId}`,
            add1: `${currentId} Main St`,
            add2: '',
            add3: '',
            add4: city,
            add5: country,
            postcode: `${20000 + currentId}`,
            validFrom: loopDate,
            expires: new Date(2025, loopDate.getMonth(), loopDate.getDate()),
            letterFlag: (currentId % 2) === 0,
            overseas: country !== 'UK',
            primaryCardIssueDate: loopDate,
            fullCardNoInCirculation: `635666${staffId}`,
            primaryCardType: 'Standard',
            nextPrimaryCardToBeCharged: (currentId % 2) === 0,
            cardholderName2: '',
            cardNumber2: '',
            primaryReplacementCardIssueDate: undefined,
            primaryPartCardNumberBarcode: '',
            active: active && !expired,
            reason: !active ? (expired ? 'Expired' : 'Deactivated') : undefined,
        });
        currentId++;
    }
}
initialData.push(...julyRecords);

const july2025Records: CardRecord[] = [];
const startDateJuly2025 = new Date('2025-07-01');
for (let i = 0; i < 10; i++) {
    const loopDate = new Date(startDateJuly2025);
    loopDate.setDate(startDateJuly2025.getDate() + i);
    const staffId = (400000 + i).toString();
    const name = `Future User ${i+1}`;
    const company = `Company Future ${String.fromCharCode(65 + (i % 26))}`;
    const country = i % 2 === 0 ? 'UK' : 'USA';
    const city = country === 'UK' ? 'Manchester' : 'Chicago';
    july2025Records.push({
        id: (currentId + i).toString(),
        staffId,
        companyName: company,
        primaryCardholderName: name,
        primaryCardNumberBarcode: `635666${staffId}`,
        magStripe: `MS${staffId}`,
        add1: `${400 + i} Future Ave`,
        add2: '',
        add3: '',
        add4: city,
        add5: country,
        postcode: `${30000 + i}`,
        validFrom: loopDate,
        expires: new Date(2027, loopDate.getMonth(), loopDate.getDate()),
        letterFlag: (i % 2) === 0,
        overseas: country !== 'UK',
        primaryCardIssueDate: loopDate,
        fullCardNoInCirculation: `635666${staffId}`,
        primaryCardType: 'Standard',
        nextPrimaryCardToBeCharged: (i % 2) === 0,
        cardholderName2: '',
        cardNumber2: '',
        primaryReplacementCardIssueDate: undefined,
        primaryPartCardNumberBarcode: '',
        active: true,
    });
}
initialData.push(...july2025Records);

const july2025DailyRecords: CardRecord[] = [];
const startDateJuly2025Daily = new Date('2025-07-01');
let currentIdForJuly2025 = 500; 

for (let i = 0; i < 5; i++) { // From July 1 to 5
    const loopDate = new Date(startDateJuly2025Daily);
    loopDate.setDate(startDateJuly2025Daily.getDate() + i);
    const numberOfRows = (i % 5) + 1; // 1 to 5 deterministic rows

    for (let j = 0; j < numberOfRows; j++) {
        const staffId = (500000 + currentIdForJuly2025).toString();
        const name = `July 2025 User ${i+1}-${j+1}`;
        const company = `Company Random ${String.fromCharCode(65 + (currentIdForJuly2025 % 26))}`;
        const country = currentIdForJuly2025 % 2 === 0 ? 'UK' : 'USA';
        const city = country === 'UK' ? 'Bristol' : 'Boston';
        
        july2025DailyRecords.push({
            id: currentIdForJuly2025.toString(),
            staffId,
            companyName: company,
            primaryCardholderName: name,
            primaryCardNumberBarcode: `635666${staffId}`,
            magStripe: `MS${staffId}`,
            add1: `${500 + currentIdForJuly2025} Random St`,
            add2: '',
            add3: '',
            add4: city,
            add5: country,
            postcode: `${40000 + currentIdForJuly2025}`,
            validFrom: loopDate,
            expires: new Date(2027, loopDate.getMonth(), loopDate.getDate()),
            letterFlag: (currentIdForJuly2025 % 2) === 0,
            overseas: country !== 'UK',
            primaryCardIssueDate: new Date(loopDate),
            fullCardNoInCirculation: `635666${staffId}`,
            primaryCardType: 'Standard',
            nextPrimaryCardToBeCharged: (currentIdForJuly2025 % 2) === 0,
            cardholderName2: '',
            cardNumber2: '',
            primaryReplacementCardIssueDate: undefined,
            primaryPartCardNumberBarcode: '',
            active: true,
        });
        currentIdForJuly2025++;
    }
}
initialData.push(...july2025DailyRecords);

export const initialTransactions: TransactionRecord[] = [
  {
    id: 'txn1',
    cardRecordId: '1',
    cardNumber: '635666123456',
    transaction_datetime: new Date('2024-07-20T10:30:00'),
    transaction_store: 'B&Q London',
    transaction_amount: 150.75,
    transaction_discount: 15.08,
    payer_name: 'Alice Johnson',
    payer_card_number: '**** **** **** 1111',
  },
  {
    id: 'txn2',
    cardRecordId: '4',
    cardNumber: '635666345678',
    transaction_datetime: new Date('2024-07-21T14:00:00'),
    transaction_store: 'B&Q New York',
    transaction_amount: 75.50,
    transaction_discount: 7.55,
    payer_name: 'Ethan Hunt',
    payer_card_number: '**** **** **** 2222',
  },
  {
    id: 'txn3',
    cardRecordId: '6',
    cardNumber: '635666567890',
    transaction_datetime: new Date('2024-07-21T18:45:00'),
    transaction_store: 'B&Q Berlin',
    transaction_amount: 210.00,
    transaction_discount: 21.00,
    payer_name: 'George Green',
    payer_card_number: '**** **** **** 3333',
  },
  {
    id: 'txn4',
    cardRecordId: '1',
    cardNumber: '635666123456',
    transaction_datetime: new Date('2024-07-22T09:15:00'),
    transaction_store: 'B&Q Manchester',
    transaction_amount: 89.99,
    transaction_discount: 9.00,
    payer_name: 'Alice Johnson',
    payer_card_number: '**** **** **** 1111',
  },
];

const randomNames = [
    'Olivia Smith', 'Liam Johnson', 'Emma Williams', 'Noah Brown', 'Ava Jones',
    'Oliver Garcia', 'Isabella Miller', 'Elijah Davis', 'Sophia Rodriguez',
    'James Martinez', 'Charlotte Hernandez', 'William Lopez', 'Amelia Gonzalez',
    'Benjamin Wilson', 'Mia Anderson', 'Lucas Thomas', 'Harper Taylor',
    'Henry Moore', 'Evelyn Jackson', 'Alexander White', 'Abigail Harris',
    'Michael Martin', 'Emily Thompson', 'Daniel Garcia', 'Ella Martinez',
    'Jacob Robinson', 'Madison Clark', 'Logan Rodriguez', 'Avery Lewis',
    'Jackson Lee', 'Scarlett Walker', 'Sebastian Hall', 'Grace Allen',
    'Jack Young', 'Chloe King', 'Aiden Wright', 'Lily Scott', 'Owen Green',
    'Zoe Adams', 'Samuel Baker', 'Hannah Nelson', 'Matthew Carter', 'Nora Mitchell',
    'Joseph Perez', 'Riley Roberts', 'David Turner', 'Eleanor Phillips', 'Carter Campbell'
];

const stores = [
    'B&Q London', 'B&Q Manchester', 'B&Q Birmingham', 'B&Q Glasgow',
    'B&Q New York', 'B&Q Los Angeles', 'B&Q Chicago', 'B&Q Houston',
    'B&Q Berlin', 'B&Q Munich', 'B&Q Hamburg', 'B&Q Frankfurt',
    'B&Q Paris', 'B&Q Marseille', 'B&Q Lyon', 'B&Q Toulouse'
];

for (let i = 0; i < 100; i++) {
    const cardRecord = initialData[i % initialData.length];
    const transactionAmount = parseFloat(((i * 5) % 500 + 20).toFixed(2));
    const payerName = i < 50
        ? cardRecord.primaryCardholderName
        : randomNames[i % randomNames.length];

    initialTransactions.push({
        id: `txn_gen_${i + 5}`,
        cardRecordId: cardRecord.id!,
        cardNumber: cardRecord.primaryCardNumberBarcode,
        transaction_datetime: new Date(Date.now() - (i % 30) * 24 * 60 * 60 * 1000),
        transaction_store: stores[i % stores.length],
        transaction_amount: transactionAmount,
        transaction_discount: parseFloat((transactionAmount * 0.1).toFixed(2)),
        payer_name: payerName,
        payer_card_number: `**** **** **** ${1000 + (i%9000)}`,
    });
}

const user10Card = initialData.find(record => record.id === '10');

if (user10Card) {
    for (let i = 0; i < 10; i++) {
        const transactionAmount = parseFloat(((i * 7) % 200 + 10).toFixed(2));
        initialTransactions.push({
            id: `txn_user10_${i + 1}`,
            cardRecordId: user10Card.id!,
            cardNumber: user10Card.primaryCardNumberBarcode,
            transaction_datetime: new Date(Date.now() - (i % 60) * 24 * 60 * 60 * 1000), // within last 60 days
            transaction_store: stores[i % stores.length],
            transaction_amount: transactionAmount,
            transaction_discount: parseFloat((transactionAmount * 0.1).toFixed(2)),
            payer_name: user10Card.primaryCardholderName,
            payer_card_number: `**** **** **** ${2000 + (i % 1000)}`,
        });
    }
}

const user100102Card = initialData.find(record => record.staffId === '100102');

if (user100102Card) {
    for (let i = 0; i < 10; i++) {
        const transactionAmount = parseFloat(((i * 11) % 300 + 15).toFixed(2));
        initialTransactions.push({
            id: `txn_user100102_${i + 1}`,
            cardRecordId: user100102Card.id!,
            cardNumber: user100102Card.primaryCardNumberBarcode,
            transaction_datetime: new Date(Date.now() - (i % 45) * 24 * 60 * 60 * 1000), // within last 45 days
            transaction_store: stores[i % stores.length],
            transaction_amount: transactionAmount,
            transaction_discount: parseFloat((transactionAmount * 0.1).toFixed(2)),
            payer_name: user100102Card.primaryCardholderName,
            payer_card_number: `**** **** **** ${3000 + (i % 1000)}`,
        });
    }
}

const user100103Card = initialData.find(record => record.staffId === '100103');

if (user100103Card) {
    for (let i = 0; i < 10; i++) {
        const transactionAmount = parseFloat(((i * 13) % 400 + 25).toFixed(2));
        const payerName = i < 5
            ? user100103Card.primaryCardholderName
            : randomNames[i % randomNames.length];

        initialTransactions.push({
            id: `txn_user100103_${i + 1}`,
            cardRecordId: user100103Card.id!,
            cardNumber: user100103Card.primaryCardNumberBarcode,
            transaction_datetime: new Date(Date.now() - (i % 50) * 24 * 60 * 60 * 1000), // within last 50 days
            transaction_store: stores[i % stores.length],
            transaction_amount: transactionAmount,
            transaction_discount: parseFloat((transactionAmount * 0.1).toFixed(2)),
            payer_name: payerName,
            payer_card_number: `**** **** **** ${4000 + (i % 1000)}`,
        });
    }
}

// Data for Payer Mismatch Rule
const payerMismatchCard = initialData.find(c => c.id === 'misuse-payer')!;
for(let i = 0; i < 5; i++) {
    initialTransactions.push({
        id: `txn_payer_mismatch_${i}`,
        cardRecordId: payerMismatchCard.id!,
        cardNumber: payerMismatchCard.primaryCardNumberBarcode,
        transaction_datetime: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        transaction_store: 'B&Q London',
        transaction_amount: 50,
        transaction_discount: 5,
        payer_name: randomNames[i], // Different name
        payer_card_number: '**** **** **** 1111'
    });
}
initialTransactions.push({
    id: `txn_payer_match_1`,
    cardRecordId: payerMismatchCard.id!,
    cardNumber: payerMismatchCard.primaryCardNumberBarcode,
    transaction_datetime: new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)),
    transaction_store: 'B&Q London',
    transaction_amount: 50,
    transaction_discount: 5,
    payer_name: payerMismatchCard.primaryCardholderName, // Matching name
    payer_card_number: '**** **** **** 1111'
});


// Data for High Frequency Rule
const highFrequencyCard = initialData.find(c => c.id === 'misuse-frequency')!;
const now = new Date();
for(let i = 0; i < 4; i++) {
    initialTransactions.push({
        id: `txn_freq_${i}`,
        cardRecordId: highFrequencyCard.id!,
        cardNumber: highFrequencyCard.primaryCardNumberBarcode,
        transaction_datetime: new Date(now.getTime() - (i * 60 * 60 * 1000)), // 4 transactions in 4 hours
        transaction_store: `B&Q Manchester`,
        transaction_amount: 20,
        transaction_discount: 2,
        payer_name: highFrequencyCard.primaryCardholderName,
        payer_card_number: '**** **** **** 2222'
    });
}

// Data for Geographic Velocity Rule
const geoCard = initialData.find(c => c.id === 'misuse-geo')!;
const geoTime = new Date();
initialTransactions.push({
    id: `txn_geo_1`,
    cardRecordId: geoCard.id!,
    cardNumber: geoCard.primaryCardNumberBarcode,
    transaction_datetime: geoTime,
    transaction_store: 'B&Q London', // Location 1
    transaction_amount: 75,
    transaction_discount: 7.5,
    payer_name: geoCard.primaryCardholderName,
    payer_card_number: '**** **** **** 3333'
});
initialTransactions.push({
    id: `txn_geo_2`,
    cardRecordId: geoCard.id!,
    cardNumber: geoCard.primaryCardNumberBarcode,
    transaction_datetime: new Date(geoTime.getTime() + (60 * 60 * 1000)), // 1 hour later
    transaction_store: 'B&Q New York', // Impossible to travel to
    transaction_amount: 80,
    transaction_discount: 8,
    payer_name: geoCard.primaryCardholderName,
    payer_card_number: '**** **** **** 3333'
});

    