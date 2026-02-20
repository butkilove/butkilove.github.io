/* ============================================
   ROMANTIC MEMORY SLIDESHOW - JAVASCRIPT
   ============================================ */

(function () {
    'use strict';

    // ── SLIDE DATA ──
    // Replace the `image` paths below with your own photo paths.
    // Put your photos in the "photos/" folder and update the filenames.
    const slides = [
        {
            image: 'photos/photo1.jpg',
            caption: 'Miles away. But still together.'
        },
        {
            image: 'photos/photo2.jpg',
            caption: 'How can I forget the smile on your face at that moment?'
        },
        {
            image: 'photos/photo3.jpg',
            caption: 'How can I forget my prayers to keep me closer to you, ALWAYS?'
        },
        {
            image: 'photos/photo4.jpg',
            caption: 'How can I forget the efforts I always put to make you happy?'
        },
        {
            image: 'photos/photo5.jpg',
            caption: 'You have always been like my kid, Butki'
        },
        {
            image: 'photos/photo6.jpg',
            caption: 'I can never be apart from you, my Butki.'
        },
        {
            image: 'photos/photo7.jpg',
            caption: 'I am ready to change for you and be with you always.'
        }
    ];

    const FINAL_NOTE = 'Please give me one last chance to love you the true way, value you, grow old with you, and protect you. Just one last chance Butki.';

    const SLIDE_INTERVAL = 6000; // 6 seconds per slide
    const TYPING_SPEED = 40;    // ms per character for final note

    // ── DOM ELEMENTS ──
    const introScreen = document.getElementById('introScreen');
    const startBtn = document.getElementById('startBtn');
    const slideshowContainer = document.getElementById('slideshowContainer');
    const slidesWrapper = document.getElementById('slidesWrapper');
    const progressBar = document.getElementById('progressBar');
    const slideCounter = document.getElementById('slideCounter');
    const dotsContainer = document.getElementById('dotsContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finalNoteScreen = document.getElementById('finalNoteScreen');
    const letterText = document.getElementById('letterText');
    const particlesContainer = document.getElementById('particles');
    const noteBgHearts = document.getElementById('noteBgHearts');

    let currentSlide = 0;
    let autoPlayTimer = null;
    let progressTimer = null;
    let isTransitioning = false;
    let slideshowComplete = false;

    // ── INITIALIZATION ──
    function init() {
        createParticles();
        createSlides();
        createDots();

        startBtn.addEventListener('click', startSlideshow);

        prevBtn.addEventListener('click', () => {
            if (!isTransitioning) goToSlide(currentSlide - 1);
        });
        nextBtn.addEventListener('click', () => {
            if (!isTransitioning) goToSlide(currentSlide + 1);
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        slideshowContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slideshowContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50 && !isTransitioning) {
                if (diff > 0) {
                    goToSlide(currentSlide + 1); // swipe left → next
                } else {
                    goToSlide(currentSlide - 1); // swipe right → prev
                }
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (slideshowContainer.classList.contains('active') && !isTransitioning) {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    e.preventDefault();
                    goToSlide(currentSlide + 1);
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    goToSlide(currentSlide - 1);
                }
            }
        });
    }

    // ── PARTICLES ──
    function createParticles() {
        const colors = ['#F48FB1', '#FFD700', '#E91E63', '#FF80AB', '#FFE082'];
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 6 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 15) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // ── CREATE SLIDES ──
    function createSlides() {
        slides.forEach((slide, index) => {
            const slideEl = document.createElement('div');
            slideEl.className = 'slide' + (index === 0 ? ' active' : '');
            slideEl.dataset.index = index;

            slideEl.innerHTML = `
                <div class="slide-inner">
                    <div class="slide-image-container">
                        <img
                            class="slide-image"
                            src="${slide.image}"
                            alt="Memory ${index + 1}"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                        />
                        <div class="slide-image-placeholder" style="display:none;">
                            <span class="placeholder-number">${index + 1}</span>
                        </div>
                    </div>
                    <div class="slide-caption">
                        <p class="caption-text">${slide.caption}</p>
                    </div>
                </div>
            `;

            slidesWrapper.appendChild(slideEl);
        });
    }

    // ── CREATE DOTS ──
    function createDots() {
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => {
                if (!isTransitioning) goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });
    }

    // ── START SLIDESHOW ──
    function startSlideshow() {
        introScreen.classList.add('hidden');
        setTimeout(() => {
            slideshowContainer.classList.add('active');
            startAutoPlay();
        }, 800);
    }

    // ── GO TO SLIDE ──
    function goToSlide(index) {
        if (isTransitioning) return;

        // If going past the last slide, show final note
        if (index >= slides.length) {
            showFinalNote();
            return;
        }

        // Don't go before first slide
        if (index < 0) return;

        isTransitioning = true;
        stopAutoPlay();

        const allSlides = document.querySelectorAll('.slide');
        const allDots = document.querySelectorAll('.dot');

        // Deactivate current
        allSlides[currentSlide].classList.remove('active');
        allDots[currentSlide].classList.remove('active');

        // Reset Ken Burns on old slide
        const oldImg = allSlides[currentSlide].querySelector('.slide-image');
        if (oldImg) oldImg.style.transform = 'scale(1)';

        currentSlide = index;

        // Activate new
        allSlides[currentSlide].classList.add('active');
        allDots[currentSlide].classList.add('active');

        // Update counter
        slideCounter.textContent = `${currentSlide + 1} / ${slides.length}`;

        // Allow transition to complete
        setTimeout(() => {
            isTransitioning = false;
            startAutoPlay();
        }, 1200);
    }

    // ── AUTO PLAY ──
    function startAutoPlay() {
        stopAutoPlay();
        startProgress();

        autoPlayTimer = setTimeout(() => {
            goToSlide(currentSlide + 1);
        }, SLIDE_INTERVAL);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }
        stopProgress();
    }

    // ── PROGRESS BAR ──
    function startProgress() {
        let start = null;
        const duration = SLIDE_INTERVAL;

        function animateProgress(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min((elapsed / duration) * 100, 100);

            // Overall progress across all slides
            const overallProgress = ((currentSlide / slides.length) + (progress / 100 / slides.length)) * 100;
            progressBar.style.width = overallProgress + '%';

            if (elapsed < duration) {
                progressTimer = requestAnimationFrame(animateProgress);
            }
        }

        progressTimer = requestAnimationFrame(animateProgress);
    }

    function stopProgress() {
        if (progressTimer) {
            cancelAnimationFrame(progressTimer);
            progressTimer = null;
        }
    }

    // ── FINAL NOTE ──
    function showFinalNote() {
        slideshowComplete = true;
        stopAutoPlay();

        // Fade out slideshow
        slideshowContainer.classList.remove('active');

        setTimeout(() => {
            // Show final note
            finalNoteScreen.classList.add('active');
            createFloatingHearts();

            // Type out the final note after envelope opens
            setTimeout(() => {
                typeText(letterText, FINAL_NOTE, TYPING_SPEED);
            }, 2500);
        }, 1500);
    }

    // ── TYPING EFFECT ──
    function typeText(element, text, speed) {
        element.textContent = '';
        let i = 0;

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // ── FLOATING HEARTS FOR FINAL NOTE ──
    function createFloatingHearts() {
        const hearts = ['❤️', '💕', '💗', '💖', '💝', '🌸', '✨'];

        for (let i = 0; i < 20; i++) {
            const heart = document.createElement('div');
            heart.className = 'bg-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = (Math.random() * 12 + 8) + 's';
            heart.style.animationDelay = (Math.random() * 8) + 's';
            heart.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
            noteBgHearts.appendChild(heart);
        }
    }

    // ── MUSIC TOGGLE (placeholder) ──
    const musicToggle = document.getElementById('musicToggle');
    let isMusicPlaying = false;

    musicToggle.addEventListener('click', () => {
        isMusicPlaying = !isMusicPlaying;
        const onIcon = musicToggle.querySelector('.music-on');
        const offIcon = musicToggle.querySelector('.music-off');

        if (isMusicPlaying) {
            onIcon.style.display = 'block';
            offIcon.style.display = 'none';
            // If you want to add background music, create an Audio element:
            const audio = new Audio('song.mp3');
            audio.loop = false; audio.play();
        } else {
            onIcon.style.display = 'none';
            offIcon.style.display = 'block';
        }
    });

    // ── LAUNCH ──
    init();

})();
