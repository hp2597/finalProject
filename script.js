// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const themeIcon = document.querySelector('.theme-icon');
    
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (systemPrefersDark) {
        html.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }
    
    // Theme toggle event listener (DOM event requirement)
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    // Resource Filtering (DOM query requirement #1)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const resourceCards = document.querySelectorAll('.resource-card');

    // Utility: debounce to limit search handler frequency
    function debounce(fn, wait = 150) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // Ensure filter buttons have accessible pressed state
    filterButtons.forEach(btn => {
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    });

    function applyFilter(filterValue, searchTerm = '') {
        const normalizedSearch = (searchTerm || '').toLowerCase();

        resourceCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('h4');
            const description = card.querySelector('p');
            const tag = card.querySelector('.resource-tag');

            const matchesCategory = (filterValue === 'all' || category === filterValue);

            let matchesSearch = true;
            if (normalizedSearch && title && description) {
                const titleText = title.textContent.toLowerCase();
                const descText = description.textContent.toLowerCase();
                const tagText = tag ? tag.textContent.toLowerCase() : '';
                matchesSearch = titleText.includes(normalizedSearch) || descText.includes(normalizedSearch) || tagText.includes(normalizedSearch);
            }

            if (matchesCategory && matchesSearch) {
                // show via class, trigger CSS animation
                card.classList.remove('hidden');
                card.classList.remove('fade-in');
                // force reflow to restart animation
                void card.offsetWidth;
                card.classList.add('fade-in');
            } else {
                card.classList.add('hidden');
                card.classList.remove('fade-in');
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class and aria state from all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });

            // Add active class to clicked button + aria state
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');

            const filterValue = this.getAttribute('data-filter');
            const currentSearch = (document.getElementById('searchInput') || { value: '' }).value;
            applyFilter(filterValue, currentSearch);
        });
    });

    // Search Functionality (DOM query requirement #2)
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        const performSearch = function () {
            const searchTerm = searchInput.value || '';
            const activeBtn = document.querySelector('.filter-btn.active');
            const currentFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
            applyFilter(currentFilter, searchTerm);
        };

        // debounce the search handler for better performance
        searchInput.addEventListener('input', debounce(performSearch, 150));
    }
    
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only prevent default for actual anchor links (not empty # links)
            if (href && href !== '#') {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update focus for accessibility
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                }
            }
        });
    });
    
    // Keyboard Navigation Enhancement
    // Add visible focus indicators for keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Hamburger menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navElement = document.querySelector('nav');

    if (navToggle && navElement) {
        navToggle.addEventListener('click', function() {
            const isOpen = navElement.classList.toggle('nav-open');
            this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close menu when a nav link is clicked (improves UX on mobile)
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                if (navElement.classList.contains('nav-open')) {
                    navElement.classList.remove('nav-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Close menu when tapping outside (optional) — listens for clicks on document
        document.addEventListener('click', function(e) {
            if (!navElement.contains(e.target) && navElement.classList.contains('nav-open')) {
                navElement.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // animation keyframes and keyboard-navigation focus styles are defined in CSS (style.css)
    
    // Accessibility: Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--accent-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '0';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add id to main if it doesn't exist
    const mainElement = document.querySelector('main');
    if (mainElement && !mainElement.id) {
        mainElement.id = 'main';
    }
    
    // Console message for debugging
    console.log('Facts Against Rhetoric - JavaScript loaded successfully');
    console.log('Features active: Theme toggle, Resource filtering, Search, Smooth scrolling');
});