import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BIET Bot database...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@biet.ac.in' },
    update: {},
    create: {
      name: 'BIET Admin',
      email: 'admin@biet.ac.in',
      passwordHash,
      role: 'admin',
    },
  });

  const categories = [
    { name: 'Admission', description: 'Admission process and eligibility', icon: '🎓', sortOrder: 1 },
    { name: 'Documents', description: 'Required documents for admission', icon: '📄', sortOrder: 2 },
    { name: 'Fees', description: 'Fee structure and payment', icon: '💰', sortOrder: 3 },
    { name: 'Hostel', description: 'Hostel and accommodation', icon: '🏠', sortOrder: 4 },
    { name: 'Campus', description: 'Campus facilities and location', icon: '🏫', sortOrder: 5 },
    { name: 'Contact', description: 'Contact information', icon: '📞', sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
  }

  const admission = await prisma.category.findUnique({ where: { name: 'Admission' } });
  const documents = await prisma.category.findUnique({ where: { name: 'Documents' } });
  const fees = await prisma.category.findUnique({ where: { name: 'Fees' } });
  const hostel = await prisma.category.findUnique({ where: { name: 'Hostel' } });
  const campus = await prisma.category.findUnique({ where: { name: 'Campus' } });

  const faqs = [
    {
      categoryId: admission.id,
      question: 'How do I get admission to B.Tech at BIET?',
      answer:
        'Admission to B.Tech at Bharat Institute of Engineering & Technology (BIET) is through **TS EAPCET** (Telangana State Engineering, Agriculture & Medical Common Entrance Test). After qualifying, participate in **Telangana state counseling** and select BIET as your preferred college during option entry. Visit https://biet.ac.in/admission-procedure.php for details.',
      keywords: 'btech admission eapcet eamcet counseling process apply',
      priority: 10,
    },
    {
      categoryId: admission.id,
      question: 'What is the eligibility for B.Tech admission?',
      answer:
        'You must have passed **Intermediate (10+2)** with **Mathematics, Physics, and Chemistry** from Telangana Board or equivalent. Admission is based on merit in TS EAPCET through state counseling.',
      keywords: 'eligibility qualification 10+2 intermediate mpc criteria',
      priority: 9,
    },
    {
      categoryId: admission.id,
      question: 'How does lateral entry (ECET) work at BIET?',
      answer:
        'Diploma holders can join **2nd year B.Tech** through **TS ECET** (Engineering Common Entrance Test). Up to **20% of intake** is reserved for lateral entry under Telangana government rules. Apply through ECET and participate in counseling.',
      keywords: 'lateral entry ecet diploma second year',
      priority: 8,
    },
    {
      categoryId: admission.id,
      question: 'How do I apply for MBA at BIET?',
      answer:
        'MBA admission is through **TS ICET** (Integrated Common Entrance Test). Qualify in ICET, participate in Telangana counseling, and select BIET during option filling.',
      keywords: 'mba admission icet management',
      priority: 7,
    },
    {
      categoryId: documents.id,
      question: 'What documents are required for admission?',
      answer:
        'Generally required documents:\n• TS EAPCET rank card & hall ticket\n• Intermediate marks memo & pass certificate\n• SSC/10th certificate\n• Aadhaar card\n• Transfer certificate (TC)\n• Caste certificate (if applicable)\n• Income certificate (if applicable)\n• Passport size photographs\n• Allotment letter from counseling\n\nBring **originals + photocopies** on reporting day.',
      keywords: 'documents required certificates tc aadhaar marks memo reporting',
      priority: 10,
    },
    {
      categoryId: fees.id,
      question: 'What is the B.Tech fee at BIET?',
      answer:
        'Fee structure varies by category (convener quota vs management/NRI). For the latest fee details, visit https://biet.ac.in or contact the admission office. You can also pay fees online at the college website under **Pay Fees Online**.',
      keywords: 'fee fees tuition cost payment structure amount',
      priority: 9,
    },
    {
      categoryId: fees.id,
      question: 'How can I pay fees online?',
      answer:
        'BIET offers online fee payment through the official website. Go to https://biet.ac.in and click **Pay Fees Online** in the header, or visit the e-pay section directly.',
      keywords: 'pay fees online payment epay',
      priority: 8,
    },
    {
      categoryId: hostel.id,
      question: 'Does BIET provide hostel facility?',
      answer:
        'Yes, BIET provides hostel accommodation for students. Hostel availability, fees, and rules are shared during admission. Contact the admission office or visit campus for current hostel details and availability.',
      keywords: 'hostel accommodation stay boarding room',
      priority: 8,
    },
    {
      categoryId: campus.id,
      question: 'Where is BIET located?',
      answer:
        'Bharat Institute of Engineering & Technology is located at **Ibrahimpatnam, Hyderabad, Telangana**. It is affiliated to **JNTU Hyderabad** and was established in 2001.',
      keywords: 'location address where campus hyderabad ibrahimpatnam',
      priority: 7,
    },
    {
      categoryId: campus.id,
      question: 'What courses does BIET offer?',
      answer:
        'BIET offers:\n• **B.Tech** — multiple specializations (flagship program)\n• **M.Tech** — via GATE/TS PGECET\n• **MBA** — via TS ICET\n\nVisit https://biet.ac.in/programs-offered.php for the full list of branches and programs.',
      keywords: 'courses programs branches btech mtech mba specializations',
      priority: 8,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.faq.create({ data: faq });
    }
  }

  await prisma.contact.deleteMany();
  await prisma.contact.createMany({
    data: [
      {
        department: 'Admission Office',
        phone: '08414-252313',
        email: 'info@biet.ac.in',
        officeHours: 'Mon–Sat, 9:00 AM – 5:00 PM',
        location: 'BIET Campus, Ibrahimpatnam, Hyderabad',
      },
      {
        department: 'General Enquiries',
        phone: '08414-252313',
        email: 'info@biet.ac.in',
        officeHours: 'Mon–Sat, 9:00 AM – 5:00 PM',
        location: 'Main Office, BIET',
      },
    ],
  });

  await prisma.importantDate.deleteMany();
  await prisma.importantDate.createMany({
    data: [
      {
        title: 'TS EAPCET Registration',
        date: new Date('2026-04-15'),
        description: 'Register for TS EAPCET on the official TSCHE portal',
        category: 'admission',
      },
      {
        title: 'TS EAPCET Exam',
        date: new Date('2026-05-10'),
        description: 'Engineering entrance examination',
        category: 'admission',
      },
      {
        title: 'Counseling - Phase 1',
        date: new Date('2026-07-01'),
        description: 'Telangana state counseling begins',
        category: 'counseling',
      },
      {
        title: 'Reporting to College',
        date: new Date('2026-08-01'),
        description: 'Report to BIET with all required documents',
        category: 'reporting',
      },
    ],
  });

  await prisma.quickReply.deleteMany();
  await prisma.quickReply.createMany({
    data: [
      { label: 'Admission Process', message: 'How do I get admission to B.Tech at BIET?', sortOrder: 1 },
      { label: 'Documents Required', message: 'What documents are required for admission?', sortOrder: 2 },
      { label: 'Fee Structure', message: 'What is the B.Tech fee at BIET?', sortOrder: 3 },
      { label: 'Hostel Info', message: 'Does BIET provide hostel facility?', sortOrder: 4 },
      { label: 'Contact Office', message: 'What is the contact number for admission office?', sortOrder: 5 },
    ],
  });

  console.log('Seed completed!');
  console.log('Admin login: admin@biet.ac.in / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
