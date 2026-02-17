// Job Notification Tracker App Logic
let allJobs = [];
let filteredJobs = [];
let savedJobs = [];
let userPreferences = null;
let jobStatuses = {}; // Track job statuses

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadJobsData();
    loadSavedJobs();
    loadPreferences();
    loadJobStatuses(); // Load job statuses
    initializeNavigation();
    initializeFilters();
    initializeSettings();
    renderJobs();
});

// Load jobs data
function loadJobsData() {
    // In production, this would come from an API
    allJobs = window.jobsData || [];
    filteredJobs = [...allJobs];
}

// Load user preferences
function loadPreferences() {
    const saved = localStorage.getItem('jobTrackerPreferences');
    userPreferences = saved ? JSON.parse(saved) : null;
    
    if (userPreferences) {
        // Prefill settings form
        document.getElementById('roleKeywords').value = userPreferences.roleKeywords || '';
        document.getElementById('skills').value = userPreferences.skills || '';
        document.getElementById('experienceLevel').value = userPreferences.experienceLevel || '';
        document.getElementById('minMatchScore').value = userPreferences.minMatchScore || 40;
        document.getElementById('scoreValue').textContent = userPreferences.minMatchScore || 40;
        
        // Set multi-select locations
        const locationsSelect = document.getElementById('preferredLocations');
        Array.from(locationsSelect.options).forEach(option => {
            option.selected = userPreferences.preferredLocations && userPreferences.preferredLocations.includes(option.value);
        });
        
        // Set work mode checkboxes
        document.getElementById('modeRemote').checked = userPreferences.preferredMode && userPreferences.preferredMode.includes('Remote');
        document.getElementById('modeHybrid').checked = userPreferences.preferredMode && userPreferences.preferredMode.includes('Hybrid');
        document.getElementById('modeOnsite').checked = userPreferences.preferredMode && userPreferences.preferredMode.includes('Onsite');
        
        // Hide preferences banner
        document.getElementById('preferencesBanner').style.display = 'none';
    } else {
        // Show preferences banner
        document.getElementById('preferencesBanner').style.display = 'block';
    }
}

// Save user preferences
function savePreferences() {
    const preferredLocations = Array.from(document.getElementById('preferredLocations').selectedOptions)
        .map(option => option.value);
    
    const preferredMode = [];
    if (document.getElementById('modeRemote').checked) preferredMode.push('Remote');
    if (document.getElementById('modeHybrid').checked) preferredMode.push('Hybrid');
    if (document.getElementById('modeOnsite').checked) preferredMode.push('Onsite');
    
    userPreferences = {
        roleKeywords: document.getElementById('roleKeywords').value,
        preferredLocations: preferredLocations,
        preferredMode: preferredMode,
        experienceLevel: document.getElementById('experienceLevel').value,
        skills: document.getElementById('skills').value,
        minMatchScore: parseInt(document.getElementById('minMatchScore').value)
    };
    
    localStorage.setItem('jobTrackerPreferences', JSON.stringify(userPreferences));
    
    // Hide banner and re-render jobs
    document.getElementById('preferencesBanner').style.display = 'none';
    renderJobs();
    
    // Show success feedback
    const saveBtn = event.target;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved ✓';
    setTimeout(() => {
        saveBtn.textContent = originalText;
    }, 2000);
}

// Clear preferences
function clearPreferences() {
    if (confirm('Are you sure you want to clear all preferences?')) {
        localStorage.removeItem('jobTrackerPreferences');
        userPreferences = null;
        
        // Reset form
        document.getElementById('roleKeywords').value = '';
        document.getElementById('skills').value = '';
        document.getElementById('experienceLevel').value = '';
        document.getElementById('minMatchScore').value = 40;
        document.getElementById('scoreValue').textContent = '40';
        
        // Reset locations
        Array.from(document.getElementById('preferredLocations').options).forEach(option => {
            option.selected = false;
        });
        
        // Reset checkboxes
        document.getElementById('modeRemote').checked = false;
        document.getElementById('modeHybrid').checked = false;
        document.getElementById('modeOnsite').checked = false;
        
        // Show banner and re-render
        document.getElementById('preferencesBanner').style.display = 'block';
        renderJobs();
    }
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This will remove preferences, saved jobs, and job statuses.')) {
        localStorage.clear();
        userPreferences = null;
        savedJobs = [];
        jobStatuses = {};
        
        // Reset all forms
        document.getElementById('roleKeywords').value = '';
        document.getElementById('skills').value = '';
        document.getElementById('experienceLevel').value = '';
        document.getElementById('minMatchScore').value = 40;
        document.getElementById('scoreValue').textContent = '40';
        
        // Reset locations
        Array.from(document.getElementById('preferredLocations').options).forEach(option => {
            option.selected = false;
        });
        
        // Reset checkboxes
        document.getElementById('modeRemote').checked = false;
        document.getElementById('modeHybrid').checked = false;
        document.getElementById('modeOnsite').checked = false;
        
        // Show banner and re-render
        document.getElementById('preferencesBanner').style.display = 'block';
        renderJobs();
        
        showStatusToast('All data cleared');
    }
}

// Initialize settings
function initializeSettings() {
    const scoreSlider = document.getElementById('minMatchScore');
    const scoreValue = document.getElementById('scoreValue');
    
    scoreSlider.addEventListener('input', function() {
        scoreValue.textContent = this.value;
    });
}

// Load job statuses from localStorage
function loadJobStatuses() {
    const saved = localStorage.getItem('jobTrackerStatus');
    jobStatuses = saved ? JSON.parse(saved) : {};
}

// Save job statuses to localStorage
function saveJobStatuses() {
    localStorage.setItem('jobTrackerStatus', JSON.stringify(jobStatuses));
}

// Update job status
function updateJobStatus(jobId, status) {
    jobStatuses[jobId] = status;
    saveJobStatuses();
    showStatusToast(status);
    renderJobs(); // Re-render to reflect status change
}

// Show status toast notification
function showStatusToast(status) {
    const toast = document.createElement('div');
    toast.className = 'status-toast';
    toast.textContent = `Status updated: ${status}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Calculate match score for a job
function calculateMatchScore(job) {
    if (!userPreferences) return 0;
    
    let score = 0;
    
    // +25 if any roleKeyword appears in job.title (case-insensitive)
    const roleKeywords = userPreferences.roleKeywords.split(',').map(k => k.trim().toLowerCase());
    const titleLower = job.title.toLowerCase();
    if (roleKeywords.some(keyword => keyword && titleLower.includes(keyword))) {
        score += 25;
    }
    
    // +15 if any roleKeyword appears in job.description
    const descriptionLower = job.description.toLowerCase();
    if (roleKeywords.some(keyword => keyword && descriptionLower.includes(keyword))) {
        score += 15;
    }
    
    // +15 if job.location matches preferredLocations
    if (userPreferences.preferredLocations && userPreferences.preferredLocations.includes(job.location)) {
        score += 15;
    }
    
    // +10 if job.mode matches preferredMode
    if (userPreferences.preferredMode && userPreferences.preferredMode.includes(job.mode)) {
        score += 10;
    }
    
    // +10 if job.experience matches experienceLevel
    if (userPreferences.experienceLevel && job.experience === userPreferences.experienceLevel) {
        score += 10;
    }
    
    // +15 if overlap between job.skills and user.skills
    const userSkills = userPreferences.skills.split(',').map(s => s.trim().toLowerCase());
    const jobSkills = job.skills.map(s => s.toLowerCase());
    if (userSkills.some(skill => skill && jobSkills.includes(skill))) {
        score += 15;
    }
    
    // +5 if postedDaysAgo <= 2
    if (job.postedDaysAgo <= 2) {
        score += 5;
    }
    
    // +5 if source is LinkedIn
    if (job.source === 'LinkedIn') {
        score += 5;
    }
    
    // Cap score at 100
    return Math.min(score, 100);
}

// Get match score badge color
function getMatchScoreColor(score) {
    if (score >= 80) return 'match-high';
    if (score >= 60) return 'match-medium';
    if (score >= 40) return 'match-low';
    return 'match-very-low';
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

// Load saved jobs from localStorage
function loadSavedJobs() {
    const saved = localStorage.getItem('savedJobs');
    savedJobs = saved ? JSON.parse(saved) : [];
}

// Initialize filters
function initializeFilters() {
    const filterInputs = document.querySelectorAll('.filter-input');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
        input.addEventListener('input', applyFilters);
    });
    
    // Add match toggle listener
    const showOnlyMatches = document.getElementById('showOnlyMatches');
    if (showOnlyMatches) {
        showOnlyMatches.addEventListener('change', applyFilters);
    }
}

// Apply filters
function applyFilters() {
    const keyword = document.getElementById('keywordFilter').value.toLowerCase();
    const location = document.getElementById('locationFilter').value;
    const mode = document.getElementById('modeFilter').value;
    const experience = document.getElementById('experienceFilter').value;
    const source = document.getElementById('sourceFilter').value;
    const sort = document.getElementById('sortFilter').value;
    const showOnlyMatches = document.getElementById('showOnlyMatches').checked;
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    // Start with all jobs and calculate match scores
    filteredJobs = allJobs.map(job => ({
        ...job,
        matchScore: calculateMatchScore(job)
    }));
    
    // Apply filters
    filteredJobs = filteredJobs.filter(job => {
        const matchesKeyword = !keyword || 
            job.title.toLowerCase().includes(keyword) || 
            job.company.toLowerCase().includes(keyword);
        const matchesLocation = !location || job.location === location;
        const matchesMode = !mode || job.mode === mode;
        const matchesExperience = !experience || job.experience === experience;
        const matchesSource = !source || job.source === source;
        const matchesThreshold = !showOnlyMatches || job.matchScore >= (userPreferences?.minMatchScore || 40);
        const jobStatus = jobStatuses[job.id] || 'Not Applied';
        const matchesStatus = !statusFilter || jobStatus === statusFilter;

        return matchesKeyword && matchesLocation && matchesMode && matchesExperience && matchesSource && matchesThreshold && matchesStatus;
    });

    // Apply sorting
    switch(sort) {
        case 'latest':
            filteredJobs.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
            break;
        case 'oldest':
            filteredJobs.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
            break;
        case 'match-score':
            filteredJobs.sort((a, b) => b.matchScore - a.matchScore);
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

    // Show preferences banner if no preferences set
    if (!userPreferences) {
        jobsContainer.innerHTML = `
            <div class="preferences-banner">
                <h3>Set your preferences to activate intelligent matching.</h3>
                <p>Go to Settings to configure your job preferences and see personalized match scores.</p>
                <button class="btn btn-primary" onclick="navigateToSettings()">Set Preferences</button>
            </div>
        `;
        return;
    }

    if (filteredJobs.length === 0) {
        jobsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No roles match your criteria</h3>
                <p>Adjust filters or lower threshold to see more opportunities.</p>
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
    
    const matchScore = job.matchScore || 0;
    const matchColorClass = getMatchScoreColor(matchScore);
    const matchScoreDisplay = userPreferences ? `<span class="match-score ${matchColorClass}">${matchScore}%</span>` : '';
    
    // Get job status and determine button color
    const jobStatus = jobStatuses[job.id] || 'Not Applied';
    const statusColorClass = getStatusColorClass(jobStatus);
    const statusButtons = createStatusButtons(job.id, jobStatus);

    return `
        <div class="job-card">
            <div class="job-header">
                <div class="job-title">${job.title}</div>
                <div class="job-company">${job.company}</div>
                ${matchScoreDisplay}
                <span class="job-status-badge ${statusColorClass}">${jobStatus}</span>
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
                ${statusButtons}
                <button class="btn btn-secondary" onclick="viewJob(${job.id})">View</button>
                <button class="btn ${isSaved ? 'btn-success' : 'btn-secondary'}" onclick="toggleSaveJob(${job.id})">
                    ${isSaved ? 'Saved ✓' : 'Save'}
                </button>
                <button class="btn btn-primary" onclick="applyForJob('${job.applyUrl}')">Apply</button>
            </div>
        </div>
    `;
}

// Get status color class
function getStatusColorClass(status) {
    switch(status) {
        case 'Not Applied': return 'status-neutral';
        case 'Applied': return 'status-applied';
        case 'Rejected': return 'status-rejected';
        case 'Selected': return 'status-selected';
        default: return 'status-neutral';
    }
}

// Create status buttons
function createStatusButtons(jobId, currentStatus) {
    const statuses = ['Not Applied', 'Applied', 'Rejected', 'Selected'];
    
    return `
        <div class="status-buttons">
            ${statuses.map(status => {
                const isActive = status === currentStatus;
                const colorClass = getStatusColorClass(status);
                return `<button class="status-btn ${isActive ? 'active' : ''} ${colorClass}" onclick="updateJobStatus(${jobId}, '${status}')">${status}</button>`;
            }).join('')}
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

// Generate daily digest
function generateDigest() {
    if (!userPreferences) {
        document.getElementById('digestContent').innerHTML = `
            <div class="digest-blocking">
                <h3>Set preferences to generate a personalized digest.</h3>
                <p>Go to Settings to configure your job preferences first.</p>
                <button class="btn btn-primary" onclick="navigateToSettings()">Set Preferences</button>
            </div>
        `;
        return;
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const digestKey = `jobTrackerDigest_${today}`;
    
    // Check if digest already exists for today
    const existingDigest = localStorage.getItem(digestKey);
    if (existingDigest) {
        renderDigest(JSON.parse(existingDigest));
        return;
    }
    
    // Calculate match scores and get top 10 jobs
    const jobsWithScores = allJobs.map(job => ({
        ...job,
        matchScore: calculateMatchScore(job)
    }));
    
    // Sort by matchScore descending, then postedDaysAgo ascending
    jobsWithScores.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
        }
        return a.postedDaysAgo - b.postedDaysAgo;
    });
    
    const topJobs = jobsWithScores.slice(0, 10);
    
    if (topJobs.length === 0) {
        document.getElementById('digestContent').innerHTML = `
            <div class="digest-empty">
                <h3>No matching roles today</h3>
                <p>Check again tomorrow for new opportunities.</p>
            </div>
        `;
        return;
    }
    
    // Create digest object
    const digest = {
        date: today,
        jobs: topJobs,
        generatedAt: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(digestKey, JSON.stringify(digest));
    
    // Render digest
    renderDigest(digest);
}

// Render digest UI
function renderDigest(digest) {
    const digestDate = new Date(digest.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const digestHTML = `
        <div class="digest-email">
            <div class="digest-header">
                <h2>Top 10 Jobs For You — 9AM Digest</h2>
                <p class="digest-date">${digestDate}</p>
            </div>
            
            <div class="digest-jobs">
                ${digest.jobs.map((job, index) => createDigestJob(job, index + 1)).join('')}
            </div>
            
            <div class="digest-footer">
                <p>This digest was generated based on your preferences.</p>
                <div class="digest-actions">
                    <button class="btn btn-secondary" onclick="copyDigestToClipboard()">Copy Digest to Clipboard</button>
                    <button class="btn btn-primary" onclick="createEmailDraft()">Create Email Draft</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('digestContent').innerHTML = digestHTML;
    
    // Add recent status updates
    setTimeout(() => addRecentStatusUpdatesToDigest(), 100);
}

// Create digest job item
function createDigestJob(job, index) {
    const matchColorClass = getMatchScoreColor(job.matchScore);
    
    return `
        <div class="digest-job">
            <div class="digest-job-number">${index}</div>
            <div class="digest-job-content">
                <div class="digest-job-title">${job.title}</div>
                <div class="digest-job-company">${job.company}</div>
                <div class="digest-job-details">
                    <span class="digest-location">📍 ${job.location}</span>
                    <span class="digest-experience">💼 ${job.experience}</span>
                    <span class="digest-match-score ${matchColorClass}">${job.matchScore}% Match</span>
                </div>
            </div>
            <div class="digest-job-action">
                <button class="btn btn-primary" onclick="applyForJob('${job.applyUrl}')">Apply</button>
            </div>
        </div>
    `;
}

// Copy digest to clipboard
function copyDigestToClipboard() {
    const today = new Date().toISOString().split('T')[0];
    const digestKey = `jobTrackerDigest_${today}`;
    const digest = JSON.parse(localStorage.getItem(digestKey));
    
    if (!digest) return;
    
    const digestText = `Top 10 Jobs For You — 9AM Digest\n\n${digest.jobs.map((job, index) => 
        `${index + 1}. ${job.title}\n   ${job.company} | ${job.location} | ${job.experience} | ${job.matchScore}% Match\n   Apply: ${job.applyUrl}`
    ).join('\n\n')}\n\nThis digest was generated based on your preferences.`;
    
    navigator.clipboard.writeText(digestText).then(() => {
        // Show success feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied ✓';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Create email draft
function createEmailDraft() {
    const today = new Date().toISOString().split('T')[0];
    const digestKey = `jobTrackerDigest_${today}`;
    const digest = JSON.parse(localStorage.getItem(digestKey));
    
    if (!digest) return;
    
    const digestText = `Top 10 Jobs For You — 9AM Digest\n\n${digest.jobs.map((job, index) => 
        `${index + 1}. ${job.title}\n   ${job.company} | ${job.location} | ${job.experience} | ${job.matchScore}% Match\n   Apply: ${job.applyUrl}`
    ).join('\n\n')}\n\nThis digest was generated based on your preferences.`;
    
    const subject = encodeURIComponent('My 9AM Job Digest');
    const body = encodeURIComponent(digestText);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    
    window.open(mailtoUrl, '_blank');
}

// Add recent status updates to digest
function addRecentStatusUpdatesToDigest() {
    const today = new Date().toISOString().split('T')[0];
    const digestKey = `jobTrackerDigest_${today}`;
    const digest = JSON.parse(localStorage.getItem(digestKey));
    
    if (!digest) return;
    
    // Get recent status changes
    const recentStatuses = [];
    const statusKeys = Object.keys(jobStatuses);
    
    statusKeys.forEach(jobId => {
        const job = allJobs.find(j => j.id === parseInt(jobId));
        if (job && jobStatuses[jobId]) {
            recentStatuses.push({
                title: job.title,
                company: job.company,
                status: jobStatuses[jobId],
                date: new Date().toLocaleDateString()
            });
        }
    });
    
    // Add status updates section to digest
    if (recentStatuses.length > 0) {
        const statusUpdatesHTML = `
            <div class="digest-status-updates">
                <h3>Recent Status Updates</h3>
                <div class="status-list">
                    ${recentStatuses.map(update => `
                        <div class="status-item">
                            <div class="status-job-info">
                                <div class="status-job-title">${update.title}</div>
                                <div class="status-job-company">${update.company}</div>
                            </div>
                            <div class="status-job-status ${getStatusColorClass(update.status)}">${update.status}</div>
                            <div class="status-date">${update.date}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Insert status updates after digest jobs
        const digestJobsElement = document.querySelector('.digest-jobs');
        if (digestJobsElement) {
            digestJobsElement.insertAdjacentHTML('afterend', statusUpdatesHTML);
        }
    }
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
