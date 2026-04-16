// ===== THEME TOGGLE =====
(function() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
  if (savedTheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    updateThemeIcons('dark');
  } else {
    html.setAttribute('data-theme', 'light');
    updateThemeIcons('light');
  }

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateThemeIcons(next);
  });

  function updateThemeIcons(theme) {
    const sunIcons = document.querySelectorAll('.sun-icon');
    const moonIcons = document.querySelectorAll('.moon-icon');
    sunIcons.forEach(icon => icon.style.display = theme === 'dark' ? 'none' : 'block');
    moonIcons.forEach(icon => icon.style.display = theme === 'dark' ? 'block' : 'none');
  }

  // Keyboard shortcut: D to toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA') {
      themeToggle.click();
    }
  });
})();

// ===== MORE DROPDOWN =====
(function() {
  const dropdown = document.getElementById('moreDropdown');
  const moreBtn = document.getElementById('moreBtn');

  if (!dropdown || !moreBtn) return;

  moreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dropdown.classList.remove('open');
  });
})();

// ===== GITHUB CONTRIBUTION CALENDAR =====
(function() {
  const calendarContainer = document.getElementById('githubCalendar');
  if (!calendarContainer) return;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Generate mock data - more activity in recent months
  function getLevel(weekIdx) {
    if (weekIdx > 40) return 0; // future weeks empty
    const rand = Math.random();
    const recentBoost = weekIdx < 15 ? 0.3 : 0;

    if (rand < 0.35 - recentBoost) return 0;
    if (rand < 0.55 - recentBoost) return 1;
    if (rand < 0.75) return 2;
    if (rand < 0.9) return 3;
    return 4;
  }

  // Month labels
  const monthRow = document.createElement('div');
  monthRow.className = 'github-month-labels';
  months.forEach(m => {
    const span = document.createElement('span');
    span.textContent = m;
    monthRow.appendChild(span);
  });
  calendarContainer.appendChild(monthRow);

  // Calendar wrapper (day labels + grid)
  const wrapper = document.createElement('div');
  wrapper.className = 'calendar-wrapper';

  // Day labels
  const dayLabels = document.createElement('div');
  dayLabels.className = 'github-day-labels';
  days.forEach(d => {
    const span = document.createElement('span');
    span.textContent = d;
    dayLabels.appendChild(span);
  });
  wrapper.appendChild(dayLabels);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'github-grid';
  let totalActivities = 0;

  for (let week = 0; week < 52; week++) {
    const weekCol = document.createElement('div');
    weekCol.className = 'github-week';
    for (let day = 0; day < 7; day++) {
      const cell = document.createElement('div');
      cell.className = 'github-cell';
      const level = getLevel(week);
      if (level > 0) {
        cell.classList.add('l' + level);
        totalActivities += level;
      }
      weekCol.appendChild(cell);
    }
    grid.appendChild(weekCol);
  }

  wrapper.appendChild(grid);
  calendarContainer.appendChild(wrapper);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'github-footer';
  footer.innerHTML = `
    <span class="github-activity-count">${totalActivities} activities in 2026</span>
    <div class="github-legend">
      <span>Less</span>
      <div class="github-cell"></div>
      <div class="github-cell l1"></div>
      <div class="github-cell l2"></div>
      <div class="github-cell l3"></div>
      <div class="github-cell l4"></div>
      <span>More</span>
    </div>
  `;
  calendarContainer.appendChild(footer);
})();



// ===== SECTION FADE-IN ON SCROLL =====
(function() {
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => {
    section.style.animationPlayState = 'paused';
    observer.observe(section);
  });
})();

// ===== PROJECT CARD STAGGER ANIMATION =====
(function() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
})();

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== PROJECT FILTERING =====
(function() {
  const tabsContainer = document.getElementById('filterTabs');
  const projectsGrid = document.getElementById('projectsGrid');
  
  if (!tabsContainer || !projectsGrid) return;
  
  const tabs = tabsContainer.querySelectorAll('.filter-tab');
  const projects = projectsGrid.querySelectorAll('.project-card');
  const emptyState = document.getElementById('projectsEmptyState');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      const selectedCategory = tab.getAttribute('data-category');
      let visibleCount = 0;
      
      // Filter projects
      projects.forEach(project => {
        const categoriesData = project.getAttribute('data-categories');
        if (!categoriesData) return;
        
        const categories = categoriesData.split(',');
        
        if (selectedCategory === 'all' || categories.includes(selectedCategory)) {
          project.style.display = 'block';
          visibleCount++;
          // Briefly reset animation on newly visible items
          project.style.animation = 'none';
          project.offsetHeight; // trigger reflow
          project.style.animation = 'fadeInUp 0.5s ease forwards';
          project.style.opacity = '1';
          project.style.transform = 'translateY(0)';
        } else {
          project.style.display = 'none';
        }
      });

      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.style.display = 'block';
          emptyState.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
          emptyState.style.display = 'none';
        }
      }
    });
  });
})();

// ===== BOOK FILTERING =====
(function() {
  const tabsContainer = document.getElementById('bookFilterTabs');
  const booksGrid = document.getElementById('booksGrid');
  
  if (!tabsContainer || !booksGrid) return;
  
  const tabs = tabsContainer.querySelectorAll('.filter-tab');
  const books = booksGrid.querySelectorAll('.book-card');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      const selectedCategory = tab.getAttribute('data-category');
      
      // Filter books
      books.forEach(book => {
        const categoriesData = book.getAttribute('data-categories');
        if (!categoriesData) return;
        
        const categories = categoriesData.split(',');
        
        if (selectedCategory === 'all' || categories.includes(selectedCategory)) {
          book.style.display = 'block';
          book.style.animation = 'none';
          book.offsetHeight; // trigger reflow
          book.style.animation = 'fadeInUp 0.5s ease forwards';
          book.style.opacity = '1';
          book.style.transform = 'translateY(0)';
        } else {
          book.style.display = 'none';
        }
      });
    });
  });
})();
