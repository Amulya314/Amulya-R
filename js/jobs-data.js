// Realistic Indian Tech Jobs Dataset
const jobsData = [
    {
        id: 1,
        title: "SDE Intern",
        company: "Amazon",
        location: "Bangalore",
        mode: "Hybrid",
        experience: "Fresher",
        skills: ["Java", "Python", "AWS", "Data Structures"],
        source: "LinkedIn",
        postedDaysAgo: 2,
        salaryRange: "₹15k–₹40k/month Internship",
        applyUrl: "https://amazon.jobs/apply/sde-intern-1",
        description: "Join Amazon's SDE internship program. Work on real-world projects, learn from senior engineers, and contribute to customer-obsessed solutions. Strong foundation in data structures and algorithms required."
    },
    {
        id: 2,
        title: "Graduate Engineer Trainee",
        company: "Infosys",
        location: "Pune",
        mode: "Onsite",
        experience: "Fresher",
        skills: ["Java", "SQL", "JavaScript", "React"],
        source: "Naukri",
        postedDaysAgo: 5,
        salaryRange: "3–5 LPA",
        applyUrl: "https://infosys.jobs/apply/get-1",
        description: "Infosys Graduate Engineer Trainee program. Comprehensive training in cutting-edge technologies, opportunity to work on global projects. Strong academic background and problem-solving skills essential."
    },
    {
        id: 3,
        title: "Junior Backend Developer",
        company: "Flipkart",
        location: "Bangalore",
        mode: "Remote",
        experience: "1-3",
        skills: ["Node.js", "MongoDB", "Redis", "Docker"],
        source: "Indeed",
        postedDaysAgo: 1,
        salaryRange: "10–18 LPA",
        applyUrl: "https://flipkart.jobs/apply/backend-1",
        description: "Build scalable backend systems for India's largest e-commerce platform. Work with high-traffic systems, microservices architecture. Experience with distributed systems preferred."
    },
    {
        id: 4,
        title: "Frontend Intern",
        company: "Swiggy",
        location: "Mumbai",
        mode: "Hybrid",
        experience: "Fresher",
        skills: ["React", "TypeScript", "CSS", "HTML5"],
        source: "LinkedIn",
        postedDaysAgo: 3,
        salaryRange: "₹20k–₹35k/month Internship",
        applyUrl: "https://swiggy.jobs/apply/frontend-intern-1",
        description: "Create amazing user experiences for food delivery platform. Work with modern React patterns, component libraries. Strong understanding of web standards and responsive design required."
    },
    {
        id: 5,
        title: "QA Intern",
        company: "TCS",
        location: "Hyderabad",
        mode: "Onsite",
        experience: "Fresher",
        skills: ["Selenium", "Java", "TestNG", "API Testing"],
        source: "Naukri",
        postedDaysAgo: 7,
        salaryRange: "₹12k–₹25k/month Internship",
        applyUrl: "https://tcs.jobs/apply/qa-intern-1",
        description: "Learn quality assurance processes at India's leading IT services company. Work on automation testing frameworks, manual testing methodologies. Attention to detail and analytical thinking crucial."
    },
    {
        id: 6,
        title: "Data Analyst Intern",
        company: "Razorpay",
        location: "Bangalore",
        mode: "Remote",
        experience: "Fresher",
        skills: ["Python", "SQL", "Excel", "Tableau"],
        source: "LinkedIn",
        postedDaysAgo: 0,
        salaryRange: "₹18k–₹30k/month Internship",
        applyUrl: "https://razorpay.jobs/apply/data-analyst-1",
        description: "Analyze payment data to derive business insights. Work with large datasets, create dashboards, support data-driven decision making. Strong analytical skills and SQL proficiency required."
    },
    {
        id: 7,
        title: "Java Developer (0-1)",
        company: "Wipro",
        location: "Chennai",
        mode: "Onsite",
        experience: "0-1",
        skills: ["Java", "Spring Boot", "MySQL", "REST APIs"],
        source: "Indeed",
        postedDaysAgo: 4,
        salaryRange: "4–7 LPA",
        applyUrl: "https://wipro.jobs/apply/java-dev-1",
        description: "Develop enterprise applications using Java ecosystem. Work with Spring Boot, microservices, database design. Understanding of software development lifecycle essential."
    },
    {
        id: 8,
        title: "Python Developer (Fresher)",
        company: "Zoho",
        location: "Chennai",
        mode: "Hybrid",
        experience: "Fresher",
        skills: ["Python", "Django", "PostgreSQL", "JavaScript"],
        source: "Naukri",
        postedDaysAgo: 6,
        salaryRange: "3–6 LPA",
        applyUrl: "https://zoho.jobs/apply/python-dev-1",
        description: "Join Zoho's product development team. Build SaaS applications using Python and Django. Strong problem-solving skills and understanding of web frameworks required."
    },
    {
        id: 9,
        title: "React Developer (1-3)",
        company: "PhonePe",
        location: "Bangalore",
        mode: "Hybrid",
        experience: "1-3",
        skills: ["React", "Redux", "TypeScript", "Node.js"],
        source: "LinkedIn",
        postedDaysAgo: 2,
        salaryRange: "12–20 LPA",
        applyUrl: "https://phonepe.jobs/apply/react-dev-1",
        description: "Build user interfaces for digital payments platform. Work with modern React patterns, state management, component architecture. Experience with large-scale applications preferred."
    },
    {
        id: 10,
        title: "SDE Intern",
        company: "Microsoft",
        location: "Hyderabad",
        mode: "Hybrid",
        experience: "Fresher",
        skills: ["C#", ".NET", "Azure", "Algorithms"],
        source: "LinkedIn",
        postedDaysAgo: 1,
        salaryRange: "₹25k–₹45k/month Internship",
        applyUrl: "https://microsoft.jobs/apply/sde-intern-2",
        description: "Microsoft India Development Center internship. Work on cloud services, enterprise software. Strong foundation in computer science fundamentals required."
    }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = jobsData;
} else {
    window.jobsData = jobsData;
}
