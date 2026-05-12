'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const html = document.documentElement;
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = prefersDark ? 'dark' : 'light';

    function applyTheme(theme) {
        currentTheme = theme;
        html.setAttribute('data-theme', theme);

        if (themeToggle) {
            themeToggle.setAttribute(
                'aria-label',
                theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'
            );
            themeToggle.innerHTML = `<span class="theme-icon">${theme === 'dark' ? '◐' : '◑'}</span>`;
        }
    }

    applyTheme(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!isExpanded));
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function (event) {
            const clickedOutsideMenu = !menuToggle.contains(event.target) && !navLinks.contains(event.target);

            if (clickedOutsideMenu) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const videoConsent = document.getElementById('video-consent');
    const videoContainer = document.getElementById('video-container');

    if (videoConsent && videoContainer) {
        function loadVideo() {
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper';

            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube-nocookie.com/embed/tqQt99tkgzE?autoplay=1&rel=0';
            iframe.title = 'Vídeo institucional Pulse Headway';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';

            wrapper.appendChild(iframe);
            videoContainer.innerHTML = '';
            videoContainer.appendChild(wrapper);
        }

        videoConsent.addEventListener('click', loadVideo);

        videoConsent.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                loadVideo();
            }
        });
    }

    const header = document.querySelector('.main-header');

    if (header) {
        window.addEventListener(
            'scroll',
            function () {
                if (window.scrollY > 40) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            },
            { passive: true }
        );
    }

    const revealItems = document.querySelectorAll('.reveal, .reveal-delay');

    if ('IntersectionObserver' in window && revealItems.length) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.16
            }
        );

        revealItems.forEach(function (item) {
            observer.observe(item);
        });
    } else {
        revealItems.forEach(function (item) {
            item.classList.add('is-visible');
        });
    }
});
