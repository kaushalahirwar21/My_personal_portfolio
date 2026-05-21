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

// Custom Glow Cursor
const cursorGlow = document.createElement('div');
cursorGlow.classList.add('cursor-glow');
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
    // using requestAnimationFrame for 60fps performance
    requestAnimationFrame(() => {
        cursorGlow.style.top = e.clientY + 'px';
        cursorGlow.style.left = e.clientX + 'px';
    });
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
