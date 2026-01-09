document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const SUPABASE_URL = "https://ofeladmgzcsilvpmidss.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZWxhZG1nemNzaWx2cG1pZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDY5ODMsImV4cCI6MjA4MzM4Mjk4M30.CUMR5KJJ0IRRlvQ03F3gvpdZOokUB5bn4uC8dbOResw";

    let supabaseClient = null;
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.warn('Supabase SDK not loaded.');
    }

    // --- State ---
    const state = {
        screen: 'incoming-call', // 'incoming-call' | 'waitlist-chat'
        storyIndex: 0,
        isRinging: true
    };

    // --- DOM Elements ---
    const d = {
        iphone: document.querySelector('.iphone'),
        screens: {
            incoming: document.getElementById('incoming-call'),
            chat: document.getElementById('waitlist-chat')
        },
        buttons: {
            accept: document.getElementById('btn-accept'),
            decline: document.getElementById('btn-decline'),
            back: document.getElementById('btn-back'),
            send: document.getElementById('btn-send')
        },
        chatBody: document.getElementById('chat-body'),
        emailInput: document.getElementById('email-input'),
        suggestions: document.getElementById('suggestions-box'),
        partnerTrack: document.getElementById('partner-track')
    };

    // --- Initialization ---
    init();

    function init() {
        startRinging();
        setupEventListeners();
        setupFooter();
    }

    function startRinging() {
        d.iphone.classList.add('ringing');
    }

    function stopRinging() {
        d.iphone.classList.remove('ringing');
        state.isRinging = false;
    }

    function setupEventListeners() {
        // Call Actions
        d.buttons.accept.addEventListener('click', handleAccept);
        d.buttons.decline.addEventListener('click', handleDecline);

        // Navigation
        d.buttons.back.addEventListener('click', goBackToCall);

        // Chat / Email
        d.buttons.send.addEventListener('click', submitEmail);
        d.emailInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitEmail();
        });

        // Autocomplete
        d.emailInput.addEventListener('input', handleAutocomplete);
        d.suggestions.addEventListener('click', (e) => {
            const item = e.target.closest('.suggestion-item');
            if (item) {
                d.emailInput.value = item.dataset.val;
                d.suggestions.classList.remove('visible');
                d.emailInput.focus();
            }
        });

        // Close suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!d.emailInput.contains(e.target) && !d.suggestions.contains(e.target)) {
                d.suggestions.classList.remove('visible');
            }
        });
    }

    // --- Handlers ---

    function handleAccept() {
        stopRinging();
        switchScreen('waitlist-chat');
        // Initial generic greeting
        addMessage('received', "Hey! You made it. Join the 419 others on the waitlist?");
    }

    function handleDecline() {
        stopRinging();
        switchScreen('waitlist-chat');

        // Simulated User Message
        addMessage('sent', "Just exploring...");

        // Start Story Sequence
        setTimeout(() => startStoryFlow(), 800);
    }

    function switchScreen(screenName) {
        Object.values(d.screens).forEach(s => s.classList.remove('active'));
        if (screenName === 'incoming-call') {
            d.screens.incoming.classList.add('active');
        } else {
            d.screens.chat.classList.add('active');
        }
        state.screen = screenName;
    }

    function goBackToCall() {
        switchScreen('incoming-call');
        d.iphone.classList.add('ringing'); // Re-ring
        // Reset chat content slightly
        d.chatBody.innerHTML = `
            <div class="date-bubble">Today</div>
            <div class="message received">
                <img src="snaps/caller.jpg" class="msg-avatar">
                <div class="bubble">Type your email to join the waitlist</div>
            </div>
        `;
    }

    // --- Story Flow Logic ---
    const stories = [
        { text: "This is Simba before he got a girlfriend...", img: "snaps/problem_charlie.png" },
        { text: "Sarah during her midterms, overwhelmed...", img: "snaps/problem_sarah.png" },
        { text: "And Alex, facing another rejection without guidance...", img: "snaps/problem_alex.png" }
    ];

    function startStoryFlow() {
        state.storyIndex = 0;
        showNextStory();
    }

    function showNextStory() {
        if (state.storyIndex >= stories.length) return;

        const story = stories[state.storyIndex];

        // Text
        setTimeout(() => {
            addMessage('received', story.text);

            // Image
            setTimeout(() => {
                addMessage('received', `<img src="${story.img}" class="msg-image">`);

                state.storyIndex++;

                // Logic based on index
                if (state.storyIndex < stories.length) {
                    setTimeout(showNextStory, 2500);
                } else {
                    // End of stories
                    setTimeout(() => {
                        addMessage('received', "Ready to change your story?");
                        addOption("Join Waitlist", () => {
                            addMessage('sent', "I'm in.");
                            setTimeout(() => {
                                addMessage('received', "Enter your email below 👇");
                            }, 500);
                        });
                    }, 2000);
                }
            }, 1000);
        }, 500);
    }

    // --- Chat Utils ---

    function addMessage(type, content) {
        const msg = document.createElement('div');
        msg.className = `message ${type}`;

        let avatarHTML = '';
        if (type === 'received') {
            avatarHTML = `<img src="snaps/caller.jpg" class="msg-avatar">`;
        }

        msg.innerHTML = `
            ${avatarHTML}
            <div class="bubble">${content}</div>
        `;

        d.chatBody.appendChild(msg);
        d.chatBody.scrollTop = d.chatBody.scrollHeight;
    }

    function addOption(label, callback) {
        const btn = document.createElement('div');
        btn.className = 'chip';
        btn.innerText = label;
        btn.onclick = () => {
            btn.parentElement.remove();
            callback();
        };

        const wrapper = document.createElement('div');
        wrapper.className = 'story-options';
        wrapper.appendChild(btn);
        d.chatBody.appendChild(wrapper);
        d.chatBody.scrollTop = d.chatBody.scrollHeight;
    }

    // --- Email & Supabase ---

    async function submitEmail() {
        const email = d.emailInput.value.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|edu)$/i;

        if (!email) return;

        if (!emailRegex.test(email)) {
            d.emailInput.style.border = '1px solid ' + getComputedStyle(document.documentElement).getPropertyValue('--wa-red');
            setTimeout(() => d.emailInput.style.border = '', 1000);
            return;
        }

        addMessage('sent', email);
        d.emailInput.value = '';
        d.suggestions.classList.remove('visible');

        if (!supabaseClient) {
            addMessage('received', "Supabase not connected. (Check console)");
            return;
        }

        const { error } = await supabaseClient.from("waitlist").insert({ email });

        setTimeout(() => {
            if (error) {
                if (error.code === '23505') {
                    addMessage('received', "You're already on the list! 💚");
                } else {
                    addMessage('received', "Something went wrong. Try again?");
                }
            } else {
                addMessage('received', "You're in! 🎉 Welcome.");
            }
        }, 800);
    }

    function handleAutocomplete(e) {
        const val = e.target.value;
        if (!val.includes('@')) {
            d.suggestions.classList.remove('visible');
            return;
        }

        const [prefix, currentDomain] = val.split('@');
        if (!currentDomain && currentDomain !== '') return;

        const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'vanderbilt.edu'];
        const matches = domains.filter(dom => dom.startsWith(currentDomain));

        if (matches.length) {
            d.suggestions.innerHTML = matches.map(dom =>
                `<div class="suggestion-item" data-val="${prefix}@${dom}">${prefix}@<strong>${dom}</strong></div>`
            ).join('');
            d.suggestions.classList.add('visible');
        } else {
            d.suggestions.classList.remove('visible');
        }
    }

    // --- Footer Logic ---
    function setupFooter() {
        const footer = document.createElement('footer');
        footer.className = 'main-footer';

        const companyValues = [
            'Private by Design', 'Anonymous by Default', 'Purpose-First',
            'Identity Optional', 'Interest Graph', 'Context-Aware Search',
            'Smart Matching', 'Warm Introductions', 'Signal, Not Noise',
            'Always-On', 'Judgement-Free', 'Intent-Driven',
            'Name-Free', 'Meaningful Signals', 'Search With Context',
            'Intent Insights', 'Voice Signal Summaries', 'Audience Pulse'
        ];

        const socialLinks = [
            { name: 'LinkedIn', url: 'https://www.linkedin.com/company/multi-pole/', icon: `<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>` },
            { name: 'Contact', url: 'mailto:bandam@erocras.com', icon: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>` },
            { name: 'Instagram', url: 'https://www.instagram.com/the_bandabilt_pro/', icon: `<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>` }
        ];

        // Split values into batches of 3
        const batches = [];
        for (let i = 0; i < companyValues.length; i += 3) {
            batches.push(companyValues.slice(i, i + 3));
        }

        footer.innerHTML = `
            <div class="footer-top-row">
                <div class="footer-values">
                    ${batches.map((batch, index) => `
                        <div class="values-batch ${index === 0 ? 'active' : ''}" id="batch-${index}">
                            ${batch.map(value => `<span class="value-item">${value}</span>`).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="footer-bottom">
                <div>© 2025 All Rights Reserved</div>
                <div class="socials">
                    ${socialLinks.map(link => `
                        <a href="${link.url}" target="_blank" class="social-icon" title="${link.name}">${link.icon}</a>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(footer);

        // Batch rotation
        let currentBatch = 0;
        setInterval(() => {
            const currentEl = document.getElementById(`batch-${currentBatch}`);
            if (currentEl) currentEl.classList.remove('active');

            currentBatch = (currentBatch + 1) % batches.length;

            const nextEl = document.getElementById(`batch-${currentBatch}`);
            if (nextEl) nextEl.classList.add('active');
        }, 4500);
    }
});
