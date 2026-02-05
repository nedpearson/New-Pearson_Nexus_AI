import { AppData } from "./model";

export const SAMPLE_DATA: AppData = {
  categories: [
    { key: "inbox",   label: "Inbox",      color: "cyan" },
    { key: "bills",   label: "Bills",      color: "amber" },
    { key: "expenses",label: "Expenses",   color: "amber" },
    { key: "legal",   label: "Legal",      color: "rose" },
    { key: "divorce", label: "Divorce",    color: "rose" },
    { key: "custody", label: "Custody",    color: "rose" },
    { key: "home",    label: "Home & Life",color: "blue" },
    { key: "work",    label: "Work",       color: "purple" }
  ],
  learning: [
    { token: "insurance", categoryKey: "bills", weight: 1.2 },
    { token: "attorney",  categoryKey: "legal", weight: 1.4 },
    { token: "court",     categoryKey: "legal", weight: 1.3 },
    { token: "school",    categoryKey: "custody", weight: 1.2 }
  ],
  library: [
    {
      id: "lib_1",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      kind: "note",
      title: "Electric bill reminder",
      text: "Pay before the 15th. Login link saved.",
      suggested: [
        { category: "bills", score: 0.86 },
        { category: "inbox", score: 0.42 },
        { category: "home",  score: 0.33 }
      ],
      approvedCategory: "bills"
    },
    {
      id: "lib_2",
      createdAt: Date.now() - 1000 * 60 * 60 * 22,
      kind: "voice",
      title: "Quick voice note",
      text: "Called the attorney office; asked for updated custody schedule options.",
      suggested: [
        { category: "legal",   score: 0.81 },
        { category: "custody", score: 0.66 },
        { category: "inbox",   score: 0.40 }
      ],
      approvedCategory: "legal"
    }
  ],
  bills: [
    { id: "b1", name: "Electric",      amount: 164.22, dueDay: 15, website: "https://example.com/pay", autopay: false, status: "due" },
    { id: "b2", name: "Internet",      amount: 79.99,  dueDay: 7,  website: "https://example.com/pay", autopay: true,  status: "ok" },
    { id: "b3", name: "Car Insurance", amount: 142.10, dueDay: 28, website: "https://example.com/pay", autopay: false, status: "ok" }
  ],
  expenses: [
    { id: "e1", vendor: "Grocery", amount: 92.14, date: new Date(Date.now()-86400000*2).toISOString().slice(0,10), category: "Home & Life", website: "https://example.com/receipt" },
    { id: "e2", vendor: "Pharmacy",amount: 18.77, date: new Date(Date.now()-86400000*5).toISOString().slice(0,10), category: "Home & Life" },
    { id: "e3", vendor: "Gas",     amount: 41.09, date: new Date(Date.now()-86400000*1).toISOString().slice(0,10), category: "Home & Life" }
  ],
  legal: {
    threads: [
      {
        id: "t1",
        type: "divorce",
        title: "Divorce planning",
        notes: [{ id: "n1", createdAt: Date.now()-1000*60*60*30, text: "Collect bank statements, tax returns, and shared account history." }],
        tasks: [
          { id: "k1", title: "Upload last 6 months statements", done: false },
          { id: "k2", title: "List shared assets & debts", done: true }
        ]
      },
      {
        id: "t2",
        type: "custody",
        title: "Custody schedule ideas",
        notes: [{ id: "n2", createdAt: Date.now()-1000*60*60*10, text: "Draft proposed weekday/weekend split and holiday rotation." }],
        tasks: [{ id: "k3", title: "Write ideal weekly schedule", done: false }]
      }
    ]
  }
};
