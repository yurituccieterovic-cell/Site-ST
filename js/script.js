'use strict';

document.addEventListener('DOMContentLoaded', function() {

    // MENU MOBILE
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
            });
        });

        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
            }
        });
    }

    // CONSENTIMENTO VÍDEO YOUTUBE
    const videoConsent = document.getElementById('video-consent');
    const videoContainer = document.getElementById('video-container');

    if (videoConsent && videoContainer) {
        function loadVideo() {
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper';

            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube-nocookie.com/embed/tqQt99tkgzE?autoplay=1&rel=0';
            iframe.title = 'Vídeo institucional Sociedade Tucci';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';

            wrapper.appendChild(iframe);
            videoContainer.innerHTML = '';
            videoContainer.appendChild(wrapper);
        }

        videoConsent.addEventListener('click', loadVideo);

        videoConsent.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadVideo();
            }
        });
    }

    // HEADER SCROLL
    const header = document.querySelector('.main-header');

    if (header) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }
});
