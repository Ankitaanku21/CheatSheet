const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const College = require('./models/College');
const Branch = require('./models/Branch');
const Semester = require('./models/Semester');
const Subject = require('./models/Subject');

dotenv.config();

const colleges = [
  // --- IITs (23) ---
  { name: 'Indian Institute of Technology Kharagpur', type: 'IIT', code: 'IITKGP' },
  { name: 'Indian Institute of Technology Bombay', type: 'IIT', code: 'IITB' },
  { name: 'Indian Institute of Technology Madras', type: 'IIT', code: 'IITM' },
  { name: 'Indian Institute of Technology Kanpur', type: 'IIT', code: 'IITK' },
  { name: 'Indian Institute of Technology Delhi', type: 'IIT', code: 'IITD' },
  { name: 'Indian Institute of Technology Guwahati', type: 'IIT', code: 'IITG' },
  { name: 'Indian Institute of Technology Roorkee', type: 'IIT', code: 'IITR' },
  { name: 'Indian Institute of Technology (BHU) Varanasi', type: 'IIT', code: 'IITBHU' },
  { name: 'Indian Institute of Technology Bhubaneswar', type: 'IIT', code: 'IITBBS' },
  { name: 'Indian Institute of Technology Gandhinagar', type: 'IIT', code: 'IITGN' },
  { name: 'Indian Institute of Technology Hyderabad', type: 'IIT', code: 'IITH' },
  { name: 'Indian Institute of Technology Jodhpur', type: 'IIT', code: 'IITJ' },
  { name: 'Indian Institute of Technology Patna', type: 'IIT', code: 'IITP' },
  { name: 'Indian Institute of Technology Ropar', type: 'IIT', code: 'IITRPR' },
  { name: 'Indian Institute of Technology Indore', type: 'IIT', code: 'IITI' },
  { name: 'Indian Institute of Technology Mandi', type: 'IIT', code: 'IITMandi' },
  { name: 'Indian Institute of Technology Palakkad', type: 'IIT', code: 'IITPKD' },
  { name: 'Indian Institute of Technology Tirupati', type: 'IIT', code: 'IITT' },
  { name: 'Indian Institute of Technology Bhilai', type: 'IIT', code: 'IITBH' },
  { name: 'Indian Institute of Technology Goa', type: 'IIT', code: 'IITGOA' },
  { name: 'Indian Institute of Technology Dharwad', type: 'IIT', code: 'IITDH' },
  { name: 'Indian Institute of Technology Jammu', type: 'IIT', code: 'IITJM' },
  { name: 'Indian Institute of Technology (ISM) Dhanbad', type: 'IIT', code: 'IITISM' },

  // --- NITs (31) ---
  { name: 'National Institute of Technology Warangal', type: 'NIT', code: 'NITW' },
  { name: 'National Institute of Technology Trichy', type: 'NIT', code: 'NITT' },
  { name: 'National Institute of Technology Surathkal', type: 'NIT', code: 'NITK' },
  { name: 'National Institute of Technology Calicut', type: 'NIT', code: 'NITC' },
  { name: 'National Institute of Technology Rourkela', type: 'NIT', code: 'NITRKL' },
  { name: 'National Institute of Technology Durgapur', type: 'NIT', code: 'NITDGP' },
  { name: 'National Institute of Technology Kurukshetra', type: 'NIT', code: 'NITKKR' },
  { name: 'National Institute of Technology Silchar', type: 'NIT', code: 'NITSIL' },
  { name: 'National Institute of Technology Nagpur', type: 'NIT', code: 'NITN' },
  { name: 'Malaviya National Institute of Technology Jaipur', type: 'NIT', code: 'MNITJ' },
  { name: 'Motilal Nehru National Institute of Technology Allahabad', type: 'NIT', code: 'MNNITA' },
  { name: 'Maulana Azad National Institute of Technology Bhopal', type: 'NIT', code: 'MANITB' },
  { name: 'National Institute of Technology Patna', type: 'NIT', code: 'NITP' },
  { name: 'National Institute of Technology Raipur', type: 'NIT', code: 'NITRR' },
  { name: 'National Institute of Technology Agartala', type: 'NIT', code: 'NITA' },
  { name: 'National Institute of Technology Srinagar', type: 'NIT', code: 'NITSRI' },
  { name: 'Sardar Vallabhbhai National Institute of Technology Surat', type: 'NIT', code: 'SVNITS' },
  { name: 'National Institute of Technology Hamirpur', type: 'NIT', code: 'NITH' },
  { name: 'National Institute of Technology Jamshedpur', type: 'NIT', code: 'NITJSR' },
  { name: 'National Institute of Technology Arunachal Pradesh', type: 'NIT', code: 'NITARP' },
  { name: 'National Institute of Technology Delhi', type: 'NIT', code: 'NITD' },
  { name: 'National Institute of Technology Goa', type: 'NIT', code: 'NITG' },
  { name: 'National Institute of Technology Meghalaya', type: 'NIT', code: 'NITM' },
  { name: 'National Institute of Technology Nagaland', type: 'NIT', code: 'NITNL' },
  { name: 'National Institute of Technology Puducherry', type: 'NIT', code: 'NITPY' },
  { name: 'National Institute of Technology Sikkim', type: 'NIT', code: 'NITSK' },
  { name: 'National Institute of Technology Uttarakhand', type: 'NIT', code: 'NITUK' },
  { name: 'National Institute of Technology Andhra Pradesh', type: 'NIT', code: 'NITANP' },

  // --- IIITs (25) ---
  { name: 'Indian Institute of Information Technology Allahabad', type: 'IIIT', code: 'IIITA' },
  { name: 'Indian Institute of Information Technology Gwalior', type: 'IIIT', code: 'IIITGWL' },
  { name: 'Indian Institute of Information Technology Jabalpur', type: 'IIIT', code: 'IIITJ' },
  { name: 'Indian Institute of Information Technology Kota', type: 'IIIT', code: 'IIITKTA' },
  { name: 'Indian Institute of Information Technology Manipur', type: 'IIIT', code: 'IIITMN' },
  { name: 'Indian Institute of Information Technology Sonepat', type: 'IIIT', code: 'IIITSN' },
  { name: 'Indian Institute of Information Technology Kalyani', type: 'IIIT', code: 'IIITKLY' },
  { name: 'Indian Institute of Information Technology Guwahati', type: 'IIIT', code: 'IIITGHY' },
  { name: 'Indian Institute of Information Technology Lucknow', type: 'IIIT', code: 'IIITL' },
  { name: 'Indian Institute of Information Technology Nagpur', type: 'IIIT', code: 'IIITN' },
  { name: 'Indian Institute of Information Technology Pune', type: 'IIIT', code: 'IIITP' },
  { name: 'Indian Institute of Information Technology Ranchi', type: 'IIIT', code: 'IIITR' },
  { name: 'Indian Institute of Information Technology Surat', type: 'IIIT', code: 'IIITSUR' },
  { name: 'Indian Institute of Information Technology Bhopal', type: 'IIIT', code: 'IIITBPL' },
  { name: 'Indian Institute of Information Technology Bhagalpur', type: 'IIIT', code: 'IIITBG' },
  { name: 'Indian Institute of Information Technology Agartala', type: 'IIIT', code: 'IIITAG' },
  { name: 'Indian Institute of Information Technology Sri City', type: 'IIIT', code: 'IIITSRC' },
  { name: 'Indian Institute of Information Technology Dharwad', type: 'IIIT', code: 'IIITDH' },
  { name: 'Indian Institute of Information Technology Kottayam', type: 'IIIT', code: 'IIITKTM' },
  { name: 'Indian Institute of Information Technology Vadodara', type: 'IIIT', code: 'IIITV' },
  { name: 'Indian Institute of Information Technology Una', type: 'IIIT', code: 'IIITU' },
  { name: 'Indian Institute of Information Technology Tiruchirappalli', type: 'IIIT', code: 'IIITT' },
  { name: 'Indian Institute of Information Technology Hyderabad', type: 'IIIT', code: 'IIITH' },
  { name: 'Indian Institute of Information Technology Bangalore', type: 'IIIT', code: 'IIITBLR' },
  { name: 'Indian Institute of Information Technology Delhi', type: 'IIIT', code: 'IIITD' },
];

const branchDefs = [
  { name: 'Computer Science & Engineering', code: 'CSE' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Electronics & Communication Engineering', code: 'ECE' },
  { name: 'Electrical Engineering', code: 'EE' },
  { name: 'Mechanical Engineering', code: 'ME' },
];

const semesterDefs = [
  { name: 'Semester I', code: 'SEM1', year: 1, displayOrder: 1 },
  { name: 'Semester II', code: 'SEM2', year: 1, displayOrder: 2 },
  { name: 'Semester III', code: 'SEM3', year: 2, displayOrder: 3 },
  { name: 'Semester IV', code: 'SEM4', year: 2, displayOrder: 4 },
  { name: 'Semester V', code: 'SEM5', year: 3, displayOrder: 5 },
  { name: 'Semester VI', code: 'SEM6', year: 3, displayOrder: 6 },
  { name: 'Semester VII', code: 'SEM7', year: 4, displayOrder: 7 },
  { name: 'Semester VIII', code: 'SEM8', year: 4, displayOrder: 8 },
];

// Common first-year subjects for ALL colleges (semesters 1-2)
const commonFirstYear = {
  'CSE': {
    1: ['Applied Mathematics-I', 'Engineering Physics', 'Engineering Chemistry', 'Programming & Problem Solving', 'English for Communication'],
    2: ['Applied Mathematics-II', 'Data Structures', 'Digital Electronics', 'Environmental Science', 'Engineering Drawing & Graphics'],
  },
  'IT': {
    1: ['Applied Mathematics-I', 'Engineering Physics', 'Engineering Chemistry', 'Programming & Problem Solving', 'English for Communication'],
    2: ['Applied Mathematics-II', 'Data Structures', 'Database Management Systems', 'Web Fundamentals', 'Engineering Drawing & Graphics'],
  },
  'ECE': {
    1: ['Applied Mathematics-I', 'Engineering Physics', 'Engineering Chemistry', 'Basic Electronics', 'English for Communication'],
    2: ['Applied Mathematics-II', 'Circuit Analysis', 'Digital Electronics', 'Network Theory', 'Engineering Drawing & Graphics'],
  },
  'EE': {
    1: ['Applied Mathematics-I', 'Engineering Physics', 'Engineering Chemistry', 'Basic Electrical Engineering', 'English for Communication'],
    2: ['Applied Mathematics-II', 'Circuit Analysis', 'Electrical Machines', 'Network Theory', 'Engineering Drawing & Graphics'],
  },
  'ME': {
    1: ['Applied Mathematics-I', 'Engineering Physics', 'Engineering Chemistry', 'Engineering Mechanics', 'English for Communication'],
    2: ['Applied Mathematics-II', 'Thermodynamics', 'Fluid Mechanics', 'Engineering Materials', 'Engineering Drawing & Graphics'],
  },
};

// Full subject data for IIT Bombay (all 8 semesters per branch)
const fullSubjects = {
  'CSE': {
    1: [
      'Applied Mathematics-I', 'Applied Chemistry', 'Environmental Science',
      'Basic Electronics Engineering', 'Computer Programming and Problem Solving',
      'Elementary Mechanical Engineering', 'Applied Chemistry Lab',
      'Basic Electronics Engineering Lab', 'Computer Programming Lab',
      'Mechanical Workshop', 'Sports-I (Audit)',
    ],
    2: [
      'Applied Mathematics-II', 'Engineering Drawing', 'Applied Physics',
      'Social Science', 'Elementary Electrical Engineering', 'Technical Communication',
      'Engineering Drawing Lab', 'Applied Physics Lab',
      'Elementary Electrical Engineering Lab', 'Sports-II (Audit)'
    ],
    3: [
      'Data Structures', 'Discrete Mathematics', 'Operating Systems',
      'Object Oriented Design', 'Data Communication', 'Digital Circuits',
      'Data Structures Lab', 'Operating Systems Lab', 'Programming Lab',
      'Digital Circuits Lab',
    ],
    4: [
      'Software Engineering', 'Design and Analysis of Algorithms',
      'Theory of Computation', 'Computer Organization',
      'Probability and Numerical Methods', 'Computer Networks',
      'Community Project', 'Software Lab', 'Algorithms Lab', 'Computer Networks Lab'
    ],
    5: [
      'Information Retrieval', 'Information and Network Security',
      'Neuro-Fuzzy Techniques', 'Interpreting Literature, Theater and Cinema',
      'Database Management Systems', 'Artificial Intelligence',
      'Database Management Systems Lab', 'Network Security Lab',
      'Artificial Intelligence Lab', 'Minor Project',
    ],
    6: [
      'Practical Training (Audit)',
      'Computer Graphics', 'Data Science', 'Compiler Design',
      'Real Time Systems', 'Social Demography',
      'Microcontroller and Interfacing', 'Compiler Design Lab',
      'Python Lab', 'Microcontroller and Interfacing Lab', 'Major Project'
    ],
    7: [
      'Machine Learning', 'Digital Image Processing',
      'Probability Theory and Statistics', 'Industry and Society',
    ],
    8: [
      'Screenwriting and Documentary Filmmaking', 'Linux Lab'
    ],
  },
  'IT': {
    1: ['Mathematics I', 'Physics', 'Chemistry', 'Programming Fundamentals', 'English'],
    2: ['Data Structures & Algorithms', 'Database Management Systems', 'Operating Systems', 'Computer Networks', 'Object-Oriented Programming'],
    3: ['Artificial Intelligence', 'Machine Learning', 'Cyber Security', 'Software Engineering', 'Web Technologies'],
    4: ['Cloud Computing', 'Blockchain Technology', 'Data Science', 'Distributed Systems', 'Major Project'],
  },
  'ECE': {
    1: ['Mathematics I', 'Physics', 'Basic Electronics', 'Programming Fundamentals', 'English'],
    2: ['Digital Circuits', 'Signals & Systems', 'Network Theory', 'Analog Electronics', 'Mathematics III'],
    3: ['Microprocessors', 'Communication Systems', 'Control Systems', 'Digital Signal Processing', 'VLSI Design'],
    4: ['Wireless Communication', 'Embedded Systems', 'IoT', 'Power Electronics', 'Major Project'],
  },
  'EE': {
    1: ['Mathematics I', 'Physics', 'Basic Electrical Engineering', 'Programming Fundamentals', 'English'],
    2: ['Circuit Analysis', 'Electrical Machines', 'Power Systems', 'Network Theory', 'Mathematics III'],
    3: ['Power Electronics', 'Control Systems', 'Electrical Instrumentation', 'Power System Protection', 'Renewable Energy'],
    4: ['Smart Grid', 'HVDC Transmission', 'Electrical Drives', 'Switchgear & Protection', 'Major Project'],
  },
  'ME': {
    1: ['Mathematics I', 'Physics', 'Engineering Mechanics', 'Programming Fundamentals', 'English'],
    2: ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Engineering Materials', 'Mathematics III'],
    3: ['Machine Design', 'Heat Transfer', 'Manufacturing Technology', 'Theory of Machines', 'CAD/CAM'],
    4: ['Automobile Engineering', 'Power Plant Engineering', 'Robotics', 'Finite Element Analysis', 'Major Project'],
  },
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await College.deleteMany({});
    await Branch.deleteMany({});
    await Semester.deleteMany({});
    await Subject.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    const createdColleges = await College.insertMany(colleges);
    console.log(`Seeded ${createdColleges.length} colleges`);
    const collegeMap = {};
    createdColleges.forEach((c) => { collegeMap[c.code] = c._id; });

    // Branches: 5 per college
    const branches = [];
    for (const c of Object.values(collegeMap)) {
      branchDefs.forEach((b) => {
        branches.push({ ...b, college: c, image: '' });
      });
    }
    const createdBranches = await Branch.insertMany(branches);
    console.log(`Seeded ${createdBranches.length} branches`);

    const branchMap = {};
    createdBranches.forEach((b) => {
      const key = `${b.college.toString()}-${b.code}`;
      branchMap[key] = b._id;
    });

    // Semesters: 8 per branch per college
    const semesters = [];
    for (const [collegeCode, collegeId] of Object.entries(collegeMap)) {
      for (const b of branchDefs) {
        const branchKey = `${collegeId.toString()}-${b.code}`;
        const branchId = branchMap[branchKey];
        semesterDefs.forEach((s) => {
          semesters.push({ ...s, college: collegeId, branch: branchId });
        });
      }
    }
    const createdSemesters = await Semester.insertMany(semesters);
    console.log(`Seeded ${createdSemesters.length} semesters`);

    const semMap = {};
    createdSemesters.forEach((s) => {
      const key = `${s.branch.toString()}-${s.displayOrder}`;
      semMap[key] = s._id;
    });

    // Subjects
    const subjects = [];
    const iitbId = collegeMap['IITB'];

    for (const [collegeCode, collegeId] of Object.entries(collegeMap)) {
      for (const b of branchDefs) {
        const branchKey = `${collegeId.toString()}-${b.code}`;
        const branchId = branchMap[branchKey];
        const subjectSource = collegeCode === 'IITB' ? fullSubjects : commonFirstYear;

        if (subjectSource[b.code]) {
          for (const [semOrder, names] of Object.entries(subjectSource[b.code])) {
            const semKey = `${branchId.toString()}-${semOrder}`;
            const semId = semMap[semKey];
            const semDef = semesterDefs[semOrder - 1];
            names.forEach((name) => {
              subjects.push({
                name,
                code: name.substring(0, 4).toUpperCase(),
                college: collegeId,
                branch: branchId,
                semester: semId,
                year: semDef ? semDef.year : undefined,
              });
            });
          }
        }
      }
    }
    await Subject.insertMany(subjects);
    console.log(`Seeded ${subjects.length} subjects`);

    // IITB data stats
    const iitbBranches = createdBranches.filter(b => b.college.toString() === iitbId.toString());
    const iitbSemCount = createdSemesters.filter(s => s.college.toString() === iitbId.toString()).length;
    console.log(`  IIT Bombay: ${iitbBranches.length} branches, ${iitbSemCount} semesters`);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@cheatsheet.com',
      password: 'admin123',
      college: iitbId,
      role: 'admin',
    });
    console.log(`Seeded admin: ${admin.email}`);

    const student = await User.create({
      name: 'Student',
      email: 'student@cheatsheet.com',
      password: 'student123',
      college: iitbId,
      role: 'student',
    });
    console.log(`Seeded student: ${student.email}`);

    console.log('\nSeed complete!');
    console.log('  Admin:   admin@cheatsheet.com / admin123');
    console.log('  Student: student@cheatsheet.com / student123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

const destroy = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await College.deleteMany({});
    await Branch.deleteMany({});
    await Semester.deleteMany({});
    await Subject.deleteMany({});
    await User.deleteMany({});
    console.log('All data destroyed');

    process.exit(0);
  } catch (error) {
    console.error('Destroy failed:', error.message);
    process.exit(1);
  }
};

const resetIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    for (const Model of [College, Branch, Semester, Subject, User]) {
      try { await Model.collection.dropIndexes(); } catch (e) {}
    }
    await Promise.all([
      College.syncIndexes(), Branch.syncIndexes(), Semester.syncIndexes(),
      Subject.syncIndexes(), User.syncIndexes(),
    ]);
    console.log('Indexes reset complete');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error.message);
    process.exit(1);
  }
};

const args = process.argv.slice(2);
if (args.includes('-d') || args.includes('--destroy')) {
  destroy();
} else if (args.includes('--reset')) {
  resetIndexes();
} else {
  seed();
}
