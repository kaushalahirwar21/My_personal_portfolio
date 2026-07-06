// ===================================== toggle icon navbar =========================
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// ==================================== scroll section active link =====================
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                let targetLink = document.querySelector(`header nav a[href*="${id}"]`);
                if(targetLink) targetLink.classList.add('active');
            });
        };
    });
// =============================== sticky navbar ========================================    
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 50);

// =============================== remove toggle icon navbar when click navbar link ====
   menuIcon.classList.remove('bx-x');
   navbar.classList.remove('active');
};

// ================================== scroll reveal =================================
ScrollReveal({
     reset: false,
     distance: '60px',
     duration: 2000,
     delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .contact form', { origin: 'bottom', interval: 200 });
ScrollReveal().reveal('.skills-box', { origin: 'bottom', interval: 150 });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

// ====================================== typed js ==========================================
if (document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: ['Backend Developer', 'Python Developer', 'Problem Solver', 'Tech Enthusiast'],
        typeSpeed: 80,
        backSpeed: 60,
        backDelay: 1500,
        loop: true,
    });
}

// ====================================== GitHub Projects ==========================================
const githubUsername = "kaushalahirwar21";

async function fetchProjectImage(repo, imgElement) {
    try {
        const branch = repo.default_branch || 'main';
        const owner = repo.owner.login;
        const repoName = repo.name;

        // Fetch README to find preview images
        const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/README.md`;
        const response = await fetch(readmeUrl);
        
        if (!response.ok) return;
            
        const markdown = await response.text();
        let imgUrl = null;
        
        // Regex to find all markdown and HTML images
        const mdRegex = /!\[.*?\]\((.*?)\)/g;
        const htmlRegex = /<img[^>]+src=["']([^"']+)["']/ig;
        
        let matches = [];
        let match;
        
        while ((match = mdRegex.exec(markdown)) !== null) {
            matches.push(match[1]);
        }
        while ((match = htmlRegex.exec(markdown)) !== null) {
            matches.push(match[1]);
        }
        
        // Find the first valid image link that isn't a badge
        for (const url of matches) {
            const lowerUrl = url.toLowerCase();
            // Skip common badge domains
            if (lowerUrl.includes('shields.io') || lowerUrl.includes('badge') || lowerUrl.includes('travis-ci') || lowerUrl.includes('sonar')) {
                continue; 
            }
            
            // If it ends with image extension or is a github user/asset image URL
            if (lowerUrl.match(/\.(png|jpg|jpeg|webp|gif)($|\?)/) || lowerUrl.includes('githubusercontent.com') || lowerUrl.includes('github.com')) {
                imgUrl = url;
                break;
            }
        }
        
        if (imgUrl) {
            // Handle relative paths for local images in repo
            if (!imgUrl.startsWith('http')) {
                imgUrl = imgUrl.replace(/^(\.\/|\/)/, '');
                imgUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${imgUrl}`;
            }
            
            // Convert github.com/blob to raw.githubusercontent.com for direct image rendering
            if (imgUrl.includes('github.com') && imgUrl.includes('/blob/')) {
                imgUrl = imgUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            }
            
            // Preload to ensure validity before applying
            const tempImg = new Image();
            tempImg.onload = () => {
                imgElement.src = imgUrl;
            };
            tempImg.src = imgUrl;
        }
    } catch (e) {
        // Silently fail, fallback is already active
    }
}

async function loadGitHubProjects() {
  try {
    const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);
    const repos = await response.json();

    const container = document.getElementById("portfolio-container");
    if (!container) return;
    
    container.innerHTML = ""; // clear old content

    // Filter out forks if preferred
    const myRepos = repos.filter(repo => !repo.fork);

    myRepos.forEach((repo, index) => {
      const box = document.createElement("div");
      box.classList.add("portfolio-box");
      
      const language = repo.language || "Markdown";
      const hasDemo = repo.homepage && repo.homepage !== "" && repo.homepage !== repo.html_url;
      const fallbackImage = `https://opengraph.githubassets.com/1/${githubUsername}/${repo.name}`;
      
      box.innerHTML = `
          <div class="portfolio-img-container">
              <img src="${fallbackImage}" alt="${repo.name} preview" loading="lazy">
              <div class="img-overlay"></div>
          </div>
          <div class="portfolio-content">
              <div class="portfolio-header">
                  <h4>${repo.name.replace(/-/g, ' ')}</h4>
                  <div class="project-links">
                      ${hasDemo ? `<a href="${repo.homepage}" target="_blank" class="external-link" title="Live Demo"><i class='bx bx-link-external'></i></a>` : ''}
                      <a href="${repo.html_url}" target="_blank" class="github-link" title="View Source"><i class='bx bxl-github'></i></a>
                  </div>
              </div>
              <p>${repo.description || "A custom project developed to enhance my programming and problem-solving skills."}</p>
              <div class="tech-stack">
                  <span>${language}</span>
              </div>
          </div>
      `;

      // Make entire card clickable
      box.addEventListener('click', () => {
          window.open(hasDemo ? repo.homepage : repo.html_url, "_blank");
      });

      // Prevent link clicks from triggering card click multiple times
      const links = box.querySelectorAll('a');
      links.forEach(link => {
          link.addEventListener('click', (e) => {
              e.stopPropagation();
          });
      });

      container.appendChild(box);
      applyTilt(box);
      
      // Attempt to load the README or Repo image asynchronously without blocking UI
      fetchProjectImage(repo, box.querySelector('img'));
    });
    
    // Reveal newly added items with staggered effect
    ScrollReveal().reveal('.portfolio-box', { origin: 'bottom', interval: 150 });
    
  } catch (error) {
    console.error("Error loading GitHub repos:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadGitHubProjects);

// ========================================= whatsapp form ====================================================
const form = document.getElementById('contactForm');

if (form) {
    form.addEventListener('submit', function(e){
        e.preventDefault(); 

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value || '';
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        if(firstName === "" || phone === "" || message === ""){
            alert("Please fill the required fields!");
            return;
        }

        const fullName = lastName ? firstName + " " + lastName : firstName;
        const whatsappNumber = "+919977949032"; 
        const text = `Hello Kaushal! My name is ${fullName}. My phone number is ${phone}. ${message}`;
        const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(text)}`;

        window.open(url, "_blank");
    });
}

// ===================================== Interactive Mouse Effects =====================================

// Global Parallax Variables
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    
    document.documentElement.style.setProperty('--mouse-x', x);
    document.documentElement.style.setProperty('--mouse-y', y);
});



// 3D Glass Card Tilt Effect
function applyTilt(element) {
    element.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate light reflection position
            element.style.setProperty('--light-x', `${x}px`);
            element.style.setProperty('--light-y', `${y}px`);
            
            // Calculate 3D tilt (-4 to 4 degrees)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px) scale(1.01)`;
            element.style.boxShadow = `0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(139, 92, 246, 0.15)`;
            element.style.borderColor = `rgba(255, 255, 255, 0.15)`;
        });
    });
    
    element.addEventListener('mouseleave', () => {
        requestAnimationFrame(() => {
            element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)`;
            element.style.setProperty('--light-x', `-500px`);
            element.style.setProperty('--light-y', `-500px`);
            element.style.boxShadow = `0 10px 30px rgba(0,0,0,0.3)`;
            element.style.borderColor = `var(--glass-border)`;
        });
    });
}

// Apply tilt to existing elements on DOM load
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.skills-box').forEach(applyTilt);
});

// ===================================== tsParticles Interactive Background =====================================
function initTSParticles() {
    if (typeof tsParticles === 'undefined') {
        console.error("tsParticles library not loaded yet.");
        return;
    }
    
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    tsParticles.load("tsparticles", {
        fpsLimit: 60,
        particles: {
            number: {
                value: window.innerWidth < 768 ? 40 : (reducedMotion ? 35 : 130), // More stars
                density: {
                    enable: true,
                    area: 800
                }
            },
            color: {
                value: ["#8b5cf6", "#0ea5e9", "#ffffff"] // Purple, Blue, White stars
            },
            shape: {
                type: ["circle", "star"], // Mix of circular and star-shaped stars
                options: {
                    star: {
                        sides: 4 // 4-pointed stars for a realistic sparkle look
                    }
                }
            },
            opacity: {
                value: { min: 0.05, max: reducedMotion ? 0.35 : 0.9 }, // Higher contrast twinkling limits
                animation: {
                    enable: !reducedMotion,
                    speed: 2.2, // Faster organic twinkling cycle
                    sync: false
                }
            },
            size: {
                value: { min: 0.8, max: 3.0 } // Increased slightly so star points are visible
            },
            links: {
                enable: false
            },
            move: {
                enable: true, // Always enable automatic motion
                speed: 0.6, // Elegant, visible drift speed
                direction: "bottom-right", // Diagonal star movement
                random: false, // Drift in a unified space-travel path
                straight: true, // Direct straight path loops
                outModes: {
                    default: "out"
                }
            }
        },
        interactivity: {
            detectsOn: "window",
            events: {
                onHover: {
                    enable: !reducedMotion,
                    mode: ["grab", "bubble"] // Grab connections and Bubble highlights
                },
                onClick: {
                    enable: !reducedMotion,
                    mode: "push" // Click to spawn stars
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 180,
                    links: {
                        opacity: 0.25,
                        color: "#8b5cf6"
                    }
                },
                bubble: {
                    distance: 180,
                    size: 4.5,
                    duration: 2,
                    opacity: 0.8
                },
                push: {
                    quantity: 4
                }
            }
        },
        detectRetina: true
    });
}

// ===================================== Refined Particle Cursor Effect =====================================
class ParticleCursor {
    constructor() {
        this.container = null;
        this.particles = [];
        this.lastX = null;
        this.lastY = null;
        this.colors = ['#8b5cf6', '#0ea5e9', '#ffffff']; // Purple, Blue, White
        
        // Detect media query for reduced motion
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Set limits based on device capability
        this.isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
        this.maxParticles = this.isMobile ? 10 : 25; // Capped at 25 on desktop
        this.spawnThreshold = this.isMobile ? 16 : 8; // pixels pointer must move before spawning another particle
        
        // If reduced motion is requested, scale back properties instead of disabling
        if (this.reducedMotion) {
            this.maxParticles = 5;
            this.spawnThreshold = 24;
            console.log("Particle Cursor: prefers-reduced-motion is active. Running in minimized fallback mode.");
        }
        
        // Safe DOM loading check
        if (document.body) {
            this.init();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
    }
    
    init() {
        // Create particle container
        this.container = document.createElement('div');
        this.container.id = 'particle-container';
        document.body.appendChild(this.container);
        
        // Mouse and touch event listeners
        window.addEventListener('mousemove', (e) => this.onMove(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.onMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        
        // Animation loop
        this.tick();
    }
    
    onMove(x, y) {
        if (this.lastX === null || this.lastY === null) {
            this.lastX = x;
            this.lastY = y;
            return;
        }
        
        const dist = Math.hypot(x - this.lastX, y - this.lastY);
        if (dist >= this.spawnThreshold) {
            // Calculate spawn direction/velocity based on cursor movement
            const angle = Math.atan2(y - this.lastY, x - this.lastX);
            const speed = Math.min(dist * 0.04, 1.2); // Cap velocity for elegance
            
            // Random offset speed perpendicular/opposite to movement direction
            const vx = -Math.cos(angle) * speed + (Math.random() - 0.5) * 0.3;
            const vy = -Math.sin(angle) * speed + (Math.random() - 0.5) * 0.3;
            
            this.spawnParticle(x, y, vx, vy);
            this.lastX = x;
            this.lastY = y;
        }
    }
    
    spawnParticle(x, y, vx, vy) {
        // Check hard particle count limit
        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle immediately to keep pool small
            const oldest = this.particles.shift();
            if (oldest && oldest.el.parentNode) {
                oldest.el.remove();
            }
        }
        
        const el = document.createElement('div');
        el.className = 'cursor-particle';
        
        // Random size between 2px and 6px
        const size = Math.floor(Math.random() * 5) + 2; 
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        
        // Random color
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        el.style.color = color; // Uses currentColor in CSS
        
        // Initial transform
        el.style.transform = `translate3d(${x - size/2}px, ${y - size/2}px, 0) scale(1)`;
        el.style.opacity = '0.8';
        
        this.container.appendChild(el);
        
        this.particles.push({
            el,
            x: x - size/2,
            y: y - size/2,
            vx,
            vy,
            size,
            scale: 1,
            opacity: 0.8,
            life: 1.0, // progress 1.0 down to 0.0
            decay: 0.02 + Math.random() * 0.02 // random life duration
        });
    }
    
    tick() {
        const nextParticles = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            p.life -= p.decay;
            
            if (p.life <= 0) {
                if (p.el.parentNode) {
                    p.el.remove();
                }
                continue; // Skip adding to nextParticles list (deletes it)
            }
            
            // Update physics (drift upwards slowly and add friction/drag)
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.vy -= 0.04; // slight float upward
            p.x += p.vx;
            p.y += p.vy;
            p.scale = p.life;
            p.opacity = p.life * 0.8;
            
            // Apply updates
            p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${p.scale})`;
            p.el.style.opacity = p.opacity;
            
            nextParticles.push(p);
        }
        
        this.particles = nextParticles;
        
        requestAnimationFrame(() => this.tick());
    }
}

// Instantiate background and cursor safely
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initTSParticles();
    new ParticleCursor();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initTSParticles();
        new ParticleCursor();
    });
}


