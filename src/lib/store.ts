import { create } from 'zustand';

export interface PayoutDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

export interface Saathi {
  id: string;
  wid: number;
  name: string;
  email: string;
  phone: string;
  profession: string;
  companyRole: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  linkedin: string;
  status: 'pending' | 'approved' | 'rejected';
  partnerCode: string | null;
  joinedDate: string;
  profilePicture?: string | null;
  payoutDetails: PayoutDetails;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  emergencyEmail?: string;
}

export interface Customer {
  id: string;
  companyName: string;
  product: string;
  users: number;
  mrr: number;
  status: 'pending' | 'approved' | 'rejected';
  joinedDate: string;
  commissionRate: number;
  saathiId: string;
}

export interface Commission {
  id: string;
  companyName: string;
  product: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  date: string;
  paymentDate: string | null;
  referenceNumber: string | null;
  saathiId: string;
  adminNote?: string | null;
  attachments?: string[];
  paymentMode?: string | null;
  paymentThrough?: string | null;
}

export interface Resource {
  id: string;
  name: string;
  type: 'logo' | 'kit' | 'pdf' | 'doc';
  category: string;
  size: string;
  downloadUrl: string;
}

export interface TicketReply {
  id: string;
  sender: 'saathi' | 'admin';
  message: string;
  date: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  date: string;
  saathiId: string;
  replies: TicketReply[];
}

interface PortalState {
  // Authentication & Demo State
  role: 'guest' | 'saathi-pending' | 'saathi' | 'admin';
  currentSaathiId: string;
  
  // Data Lists
  saathis: Saathi[];
  customers: Customer[];
  commissions: Commission[];
  resources: Resource[];
  tickets: SupportTicket[];

  // Actions
  setRole: (role: 'guest' | 'saathi-pending' | 'saathi' | 'admin') => void;
  setCurrentSaathiId: (id: string) => void;
  
  // Saathi & Profile Actions
  updateProfile: (saathiId: string, updates: Partial<Omit<Saathi, 'id' | 'payoutDetails'>>) => void;
  updatePayoutDetails: (saathiId: string, details: PayoutDetails) => void;
  raiseTicket: (saathiId: string, subject: string, category: string, message: string) => void;
  replyToTicket: (ticketId: string, message: string, sender: 'saathi' | 'admin') => void;
  createCustomer: (customer: Omit<Customer, 'id'>) => void;
  
  // Admin Actions
  createSaathi: (saathi: Omit<Saathi, 'id' | 'joinedDate'>) => void;
  upsertSaathi: (saathi: Saathi) => void;
  approveSaathi: (saathiId: string, partnerCode: string) => void;
  rejectSaathi: (saathiId: string) => void;
  markCommissionPaid: (commissionId: string, referenceNumber: string) => void;
  uploadResource: (resource: Omit<Resource, 'id'>) => void;
  resolveTicket: (ticketId: string) => void;
}

const initialSaathis: Saathi[] = [
  {
    id: 'saathi-1',
    wid: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@ca-advisors.in',
    phone: '+91 98765 43210',
    profession: 'Chartered Accountant (CA)',
    companyRole: 'Owner',
    pincode: '110001',
    address: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    linkedin: 'linkedin.com/in/rajesh-kumar-ca',
    status: 'approved',
    partnerCode: 'SAATHI001',
    joinedDate: '2026-01-15',
    payoutDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '50100234567890',
      ifsc: 'HDFC0000123',
      upiId: 'rajeshkumar@okhdfcbank'
    }
  },
  {
    id: 'saathi-2',
    wid: 1,
    name: 'Amit Patel',
    email: 'amit.patel@consulting.org',
    phone: '+91 91234 56789',
    profession: 'Business Advisor / Consultant',
    companyRole: 'Director',
    pincode: '380009',
    address: 'Navrangpura',
    city: 'Ahmedabad',
    state: 'Gujarat',
    linkedin: 'linkedin.com/in/amit-patel-advisor',
    status: 'pending',
    partnerCode: null,
    joinedDate: '2026-07-10',
    payoutDetails: {
      bankName: 'State Bank of India',
      accountNumber: '32109876543',
      ifsc: 'SBIN0001234',
      upiId: 'amitpatel@oksbi'
    }
  },
  {
    id: 'saathi-3',
    wid: 1,
    name: 'Neha Sharma',
    email: 'neha.hr@talentpartners.co',
    phone: '+91 88888 77777',
    profession: 'HR Consultant / Recruiter',
    companyRole: 'Manager',
    pincode: '560001',
    address: 'MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    linkedin: 'linkedin.com/in/neha-sharma-hr',
    status: 'approved',
    partnerCode: 'SAATHI002',
    joinedDate: '2026-03-22',
    payoutDetails: {
      bankName: 'ICICI Bank',
      accountNumber: '000401234567',
      ifsc: 'ICIC0000004',
      upiId: 'nehasharma@okicici'
    }
  }
];

const initialCustomers: Customer[] = [
  {
    id: 'c-1',
    companyName: 'Kishore Exports',
    product: 'ANSH Expense',
    users: 25,
    mrr: 15000,
    status: 'approved',
    joinedDate: '2026-02-10',
    commissionRate: 15,
    saathiId: 'saathi-1'
  },
  {
    id: 'c-2',
    companyName: 'Vardhman Textiles',
    product: 'ANSH HR',
    users: 60,
    mrr: 22000,
    status: 'approved',
    joinedDate: '2026-02-28',
    commissionRate: 15,
    saathiId: 'saathi-1'
  },
  {
    id: 'c-3',
    companyName: 'Digital Horizon Solutions',
    product: 'ANSH Tasks',
    users: 12,
    mrr: 6000,
    status: 'approved',
    joinedDate: '2026-03-15',
    commissionRate: 15,
    saathiId: 'saathi-1'
  },
  {
    id: 'c-4',
    companyName: 'Dharma Logistics',
    product: 'ANSH Visitor',
    users: 45,
    mrr: 12000,
    status: 'pending',
    joinedDate: '2026-07-01',
    commissionRate: 15,
    saathiId: 'saathi-1'
  },
  {
    id: 'c-5',
    companyName: 'Pooja Sweets & Bakery',
    product: 'ANSH Forms',
    users: 8,
    mrr: 4500,
    status: 'rejected',
    joinedDate: '2026-01-20',
    commissionRate: 15,
    saathiId: 'saathi-1'
  },
  {
    id: 'c-6',
    companyName: 'Saraswati Academy',
    product: 'ANSH Links',
    users: 30,
    mrr: 10500,
    status: 'approved',
    joinedDate: '2026-04-05',
    commissionRate: 20,
    saathiId: 'saathi-3'
  }
];

const initialCommissions: Commission[] = [
  // Paid Commissions
  {
    id: 'comm-1',
    companyName: 'Kishore Exports',
    product: 'ANSH ERP',
    amount: 2250, // 15% of 15000
    status: 'paid',
    date: '2026-03-01',
    paymentDate: '2026-03-05',
    referenceNumber: 'TXN9876543210',
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-2',
    companyName: 'Kishore Exports',
    product: 'ANSH ERP',
    amount: 2250,
    status: 'paid',
    date: '2026-04-01',
    paymentDate: '2026-04-05',
    referenceNumber: 'TXN9876543211',
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-3',
    companyName: 'Vardhman Textiles',
    product: 'ANSH HR',
    amount: 3300, // 15% of 22000
    status: 'paid',
    date: '2026-04-01',
    paymentDate: '2026-04-05',
    referenceNumber: 'TXN9876543212',
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-4',
    companyName: 'Kishore Exports',
    product: 'ANSH ERP',
    amount: 2250,
    status: 'paid',
    date: '2026-05-01',
    paymentDate: '2026-05-07',
    referenceNumber: 'TXN9876543213',
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-5',
    companyName: 'Vardhman Textiles',
    product: 'ANSH HR',
    amount: 3300,
    status: 'paid',
    date: '2026-05-01',
    paymentDate: '2026-05-07',
    referenceNumber: 'TXN9876543214',
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-6',
    companyName: 'Digital Horizon Solutions',
    product: 'ANSH Task',
    amount: 900, // 15% of 6000
    status: 'paid',
    date: '2026-04-01',
    paymentDate: '2026-04-05',
    referenceNumber: 'TXN9876543215',
    saathiId: 'saathi-1'
  },
  
  // Approved (Pending Disbursal) Commissions
  {
    id: 'comm-7',
    companyName: 'Kishore Exports',
    product: 'ANSH ERP',
    amount: 2250,
    status: 'approved',
    date: '2026-06-01',
    paymentDate: null,
    referenceNumber: null,
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-8',
    companyName: 'Vardhman Textiles',
    product: 'ANSH HR',
    amount: 3300,
    status: 'approved',
    date: '2026-06-01',
    paymentDate: null,
    referenceNumber: null,
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-9',
    companyName: 'Digital Horizon Solutions',
    product: 'ANSH Task',
    amount: 900,
    status: 'approved',
    date: '2026-06-01',
    paymentDate: null,
    referenceNumber: null,
    saathiId: 'saathi-1'
  },
  
  // Pending Review Commissions
  {
    id: 'comm-10',
    companyName: 'Kishore Exports',
    product: 'ANSH ERP',
    amount: 2250,
    status: 'pending',
    date: '2026-07-01',
    paymentDate: null,
    referenceNumber: null,
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-11',
    companyName: 'Vardhman Textiles',
    product: 'ANSH HR',
    amount: 3300,
    status: 'pending',
    date: '2026-07-01',
    paymentDate: null,
    referenceNumber: null,
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-12',
    companyName: 'Digital Horizon Solutions',
    product: 'ANSH Task',
    amount: 900,
    status: 'pending',
    date: '2026-07-01',
    paymentDate: null,
    referenceNumber: null,
    saathiId: 'saathi-1'
  },
  {
    id: 'comm-13',
    companyName: 'Saraswati Academy',
    product: 'ANSH HR',
    amount: 2100, // 20% of 10500
    status: 'paid',
    date: '2026-05-01',
    paymentDate: '2026-05-07',
    referenceNumber: 'TXN9876543299',
    saathiId: 'saathi-3'
  }
];

const initialResources: Resource[] = [
  {
    id: 'res-1',
    name: 'ANSH Logo Package (High Res PNG, SVG & Dark Theme SVG)',
    type: 'logo',
    category: 'Brand Assets',
    size: '4.2 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-2',
    name: 'ANSH Saathi Partner Brand Identity Kit & Typography Guide',
    type: 'kit',
    category: 'Brand Assets',
    size: '12.8 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-3',
    name: 'ANSH Complete Product Brochure (All Modules & Feature Matrix)',
    type: 'pdf',
    category: 'Brochures & Pricing',
    size: '6.5 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-4',
    name: 'ANSH Business Pricing Sheet (Global Tiered Model)',
    type: 'pdf',
    category: 'Brochures & Pricing',
    size: '1.4 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-5',
    name: 'ANSH Saathi Sales Pitch Deck (Powerpoint & PDF Formats)',
    type: 'doc',
    category: 'Sales Materials',
    size: '18.2 MB',
    downloadUrl: '#'
  },
  {
    id: 'res-6',
    name: 'Marketing Banners & Social Media Templates for LinkedIn & WhatsApp',
    type: 'kit',
    category: 'Sales Materials',
    size: '22.0 MB',
    downloadUrl: '#'
  }
];

const initialTickets: SupportTicket[] = [
  {
    id: 'tick-1',
    subject: 'Delayed Commission Payment for May',
    category: 'Commissions & Payouts',
    message: 'My May commissions show as approved but have not yet been credited to my bank account. Can you please check?',
    status: 'resolved',
    date: '2026-06-08',
    saathiId: 'saathi-1',
    replies: [
      {
        id: 'rep-1',
        sender: 'admin',
        message: 'Hello Rajesh, there was a minor banking delay during the June holiday. We have processed the disbursal today. Reference: TXN9876543213. Please verify.',
        date: '2026-06-09'
      },
      {
        id: 'rep-2',
        sender: 'saathi',
        message: 'Thank you! Received it.',
        date: '2026-06-09'
      }
    ]
  },
  {
    id: 'tick-2',
    subject: 'Requesting marketing material in Hindi',
    category: 'Marketing Resources',
    message: 'Many of my clients in Uttar Pradesh prefer reading physical brochures in Hindi. Do we have official Hindi translations for ANSH HR and ANSH ERP brochures?',
    status: 'open',
    date: '2026-07-11',
    saathiId: 'saathi-1',
    replies: []
  }
];

export const usePortalStore = create<PortalState>((set) => ({
  // Default states
  role: 'guest', 
  currentSaathiId: 'saathi-1',
  saathis: initialSaathis,
  customers: initialCustomers,
  commissions: initialCommissions,
  resources: initialResources,
  tickets: initialTickets,

  // Setters
  setRole: (role) => set({ role }),
  setCurrentSaathiId: (id) => set({ currentSaathiId: id }),

  // Saathi Action Implementations
  updateProfile: (saathiId, updates) => set((state) => ({
    saathis: state.saathis.map((s) => s.id === saathiId ? { ...s, ...updates } : s)
  })),

  updatePayoutDetails: (saathiId, details) => set((state) => ({
    saathis: state.saathis.map((s) => s.id === saathiId ? { ...s, payoutDetails: details } : s)
  })),

  raiseTicket: (saathiId, subject, category, message) => set((state) => {
    const newTicket: SupportTicket = {
      id: `tick-${Date.now()}`,
      subject,
      category,
      message,
      status: 'open',
      date: new Date().toISOString().split('T')[0],
      saathiId,
      replies: []
    };
    return { tickets: [newTicket, ...state.tickets] };
  }),

  createCustomer: (customerData) => set((state) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `c-${Date.now()}`
    };
    return { customers: [newCustomer, ...state.customers] };
  }),

  replyToTicket: (ticketId, message, sender) => set((state) => ({
    tickets: state.tickets.map((t) => {
      if (t.id === ticketId) {
        const newReply: TicketReply = {
          id: `rep-${Date.now()}`,
          sender,
          message,
          date: new Date().toISOString().split('T')[0]
        };
        return {
          ...t,
          status: sender === 'admin' ? 'in-progress' : t.status,
          replies: [...t.replies, newReply]
        };
      }
      return t;
    })
  })),

  // Admin Action Implementations
  createSaathi: (saathiData) => set((state) => {
    const newSaathi: Saathi = {
      ...saathiData,
      id: `saathi-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    return { saathis: [...state.saathis, newSaathi] };
  }),

  upsertSaathi: (saathi) => set((state) => {
    const exists = state.saathis.some((s) => s.id === saathi.id);
    if (exists) {
      return {
        saathis: state.saathis.map((s) => s.id === saathi.id ? saathi : s)
      };
    }
    return {
      saathis: [...state.saathis, saathi]
    };
  }),

  approveSaathi: (saathiId, partnerCode) => set((state) => ({
    saathis: state.saathis.map((s) => 
      s.id === saathiId 
        ? { ...s, status: 'approved' as const, partnerCode } 
        : s
    )
  })),

  rejectSaathi: (saathiId) => set((state) => ({
    saathis: state.saathis.map((s) => 
      s.id === saathiId 
        ? { ...s, status: 'rejected' as const, partnerCode: null } 
        : s
    )
  })),

  markCommissionPaid: (commissionId, referenceNumber) => set((state) => ({
    commissions: state.commissions.map((c) => 
      c.id === commissionId 
        ? { 
            ...c, 
            status: 'paid' as const, 
            referenceNumber, 
            paymentDate: new Date().toISOString().split('T')[0] 
          } 
        : c
    )
  })),

  uploadResource: (resourceData) => set((state) => {
    const newResource: Resource = {
      ...resourceData,
      id: `res-${Date.now()}`
    };
    return { resources: [newResource, ...state.resources] };
  }),

  resolveTicket: (ticketId) => set((state) => ({
    tickets: state.tickets.map((t) => t.id === ticketId ? { ...t, status: 'resolved' as const } : t)
  }))
}));
