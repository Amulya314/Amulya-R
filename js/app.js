// Job Notification Tracker App Logic
let allJobs = [];
let filteredJobs = [];
let savedJobs = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadJobsData();
    loadSavedJobs();
    initializeNavigation();
    initializeFilters();
    renderJobs();
});

// Load jobs data
function loadJobsData() {
    // In production, this would come from an API
    allJobs = window.jobsData || [];
    filteredJobs = [...allJobs];
}

// Load saved jobs from localStorage
function loadSavedJobs() {
    const saved = localStorage.getItem('savedJobs');
    savedJobs = saved ? JSON.parse(saved) : [];
}

// Save jobs to localStorage
function saveToLocalStorage() {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
}

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNav');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            document.querySelectorAll(`[data-page="${targetPage}"]`).forEach(navLink => {
                navLink.classList.add('active');
            });
            
            // Show corresponding page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`${targetPage}-page`).classList.add('active');
            
            // Close mobile menu
            mobileNav.classList.remove('open');
            hamburgerMenu.classList.remove('open');
            
            // Render saved jobs if on saved page
            if (targetPage === 'saved') {
                renderSavedJobs();
            }
        });
    });

    // Hamburger menu toggle
    hamburgerMenu.addEventListener('click', function() {
        this.classList.toggle('open');
        mobileNav.classList.toggle('open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburgerMenu.contains(e.target) && !mobileNav.contains(e.target)) {
            hamburgerMenu.classList.remove('open');
            mobileNav.classList.remove('open');
        }
    });
}

// Initialize filters
function initializeFilters() {
    const filterInputs = document.querySelectorAll('.filter-input');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
        input.addEventListener('input', applyFilters);
    });
}

// Apply filters
function applyFilters() {
    const keyword = document.getElementById('keywordFilter').value.toLowerCase();
    const location = document.getElementById('locationFilter').value;
    const mode = document.getElementById('modeFilter').value;
    const experience = document.getElementById('experienceFilter').value;
    const source = document.getElementById('sourceFilter').value;
    const sort = document.getElementById('sortFilter').value;

    filteredJobs = allJobs.filter(job => {
        const matchesKeyword = !keyword || 
            job.title.toLowerCase().includes(keyword) || 
            job.company.toLowerCase().includes(keyword);
        const matchesLocation = !location || job.location === location;
        const matchesMode = !mode || job.mode === mode;
        const matchesExperience = !experience || job.experience === experience;
        const matchesSource = !source || job.source === source;

        return matchesKeyword && matchesLocation && matchesMode && matchesExperience && matchesSource;
    });

    // Apply sorting
    switch(sort) {
        case 'latest':
            filteredJobs.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
            break;
        case 'oldest':
            filteredJobs.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
            break;
        case 'salary-high':
            filteredJobs.sort((a, b) => parseSalary(b.salaryRange) - parseSalary(a.salaryRange));
            break;
        case 'salary-low':
            filteredJobs.sort((a, b) => parseSalary(a.salaryRange) - parseSalary(b.salaryRange));
            break;
    }

    renderJobs();
}

// Parse salary range for sorting
function parseSalary(salaryRange) {
    if (salaryRange.includes('LPA')) {
        const match = salaryRange.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    } else if (salaryRange.includes('₹')) {
        const match = salaryRange.match(/₹(\d+)k/);
        return match ? parseInt(match[1]) * 0.12 : 0; // Convert monthly to annual approximation
    }
    return 0;
}

// Render jobs on dashboard
function renderJobs() {
    const jobsContainer = document.getElementById('jobsContainer');
    if (!jobsContainer) return;

    if (filteredJobs.length === 0) {
        jobsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No jobs found</h3>
                <p>Try adjusting your filters to see more opportunities.</p>
            </div>
        `;
        return;
    }

    jobsContainer.innerHTML = filteredJobs.map(job => createJobCard(job)).join('');
}

// Create job card HTML
function createJobCard(job) {
    const isSaved = savedJobs.includes(job.id);
    const postedText = job.postedDaysAgo === 0 ? 'Today' : 
                      job.postedDaysAgo === 1 ? '1 day ago' : 
                      `${job.postedDaysAgo} days ago`;

    return `
        <div class="job-card">
            <div class="job-header">
                <div class="job-title">${job.title}</div>
                <div class="job-company">${job.company}</div>
            </div>
            
            <div class="job-details">
                <div class="job-location-mode">
                    <span class="job-location">📍 ${job.location}</span>
                    <span class="job-mode">${job.mode}</span>
                </div>
                <div class="job-experience">💼 ${job.experience}</div>
                <div class="job-salary">💰 ${job.salaryRange}</div>
            </div>
            
            <div class="job-meta">
                <span class="source-badge source-${job.source.toLowerCase()}">${job.source}</span>
                <span class="posted-time">${postedText}</span>
            </div>
            
            <div class="job-actions">
                <button class="btn btn-secondary" onclick="viewJob(${job.id})">View</button>
                <button class="btn ${isSaved ? 'btn-success' : 'btn-secondary'}" onclick="toggleSaveJob(${job.id})">
                    ${isSaved ? 'Saved ✓' : 'Save'}
                </button>
                <button class="btn btn-primary" onclick="applyForJob('${job.applyUrl}')">Apply</button>
            </div>
        </div>
    `;
}

// View job details in modal
function viewJob(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;

    const modal = document.getElementById('jobModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${job.title}</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="job-detail-company">${job.company}</div>
            
            <div class="job-detail-grid">
                <div class="detail-item">
                    <strong>Location:</strong> ${job.location}
                </div>
                <div class="detail-item">
                    <strong>Mode:</strong> ${job.mode}
                </div>
                <div class="detail-item">
                    <strong>Experience:</strong> ${job.experience}
                </div>
                <div class="detail-item">
                    <strong>Salary:</strong> ${job.salaryRange}
                </div>
                <div class="detail-item">
                    <strong>Source:</strong> ${job.source}
                </div>
                <div class="detail-item">
                    <strong>Posted:</strong> ${job.postedDaysAgo === 0 ? 'Today' : `${job.postedDaysAgo} days ago`}
                </div>
            </div>
            
            <div class="job-detail-section">
                <h3>Description</h3>
                <p>${job.description}</p>
            </div>
            
            <div class="job-detail-section">
                <h3>Required Skills</h3>
                <div class="skills-container">
                    ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="applyForJob('${job.applyUrl}')">Apply Now</button>
                <button class="btn btn-secondary" onclick="toggleSaveJob(${job.id}); closeModal();">Save Job</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('jobModal').style.display = 'none';
}

// Toggle save job
function toggleSaveJob(jobId) {
    const index = savedJobs.indexOf(jobId);
    if (index > -1) {
        savedJobs.splice(index, 1);
    } else {
        savedJobs.push(jobId);
    }
    saveToLocalStorage();
    renderJobs();
}

// Apply for job
function applyForJob(url) {
    window.open(url, '_blank');
}

// Render saved jobs
function renderSavedJobs() {
    const savedContainer = document.getElementById('savedJobsContainer');
    if (!savedContainer) return;

    const savedJobObjects = allJobs.filter(job => savedJobs.includes(job.id));

    if (savedJobObjects.length === 0) {
        savedContainer.innerHTML = `
            <div class="empty-state">
                <h3>No saved jobs yet</h3>
                <p>Jobs you save will appear here for easy access.</p>
            </div>
        `;
        return;
    }

    savedContainer.innerHTML = savedJobObjects.map(job => createJobCard(job)).join('');
}

// Navigate to settings
function navigateToSettings() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    document.querySelectorAll('[data-page="settings"]').forEach(navLink => {
        navLink.classList.add('active');
    });
    
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById('settings-page').classList.add('active');
}
