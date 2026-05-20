document.addEventListener('DOMContentLoaded', () => {

    // 1. SMOOTH SCROLL REVEAL (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.1, rootMargin: "0px 0px -30px 0px" };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // 2. FAQ DATA (Clean & Professional)
    const faqData = [
        {
            q: "Is the NIOS mark sheet valid for government jobs and visas?",
            a: "Yes, NIOS is established by the Ministry of Education, Government of India. It is 100% valid for government jobs, private sector jobs, passports, and international visas."
        },
        {
            q: "Can I appear for NEET or JEE after passing from NIOS?",
            a: "Absolutely! NIOS students are fully eligible to appear for NEET, JEE, and all other national-level competitive entrance examinations."
        },
        {
            q: "What is TOC (Transfer of Credit)?",
            a: "If you failed in GSEB or CBSE, you can directly transfer the marks of up to two subjects you passed into your NIOS mark sheet. You only have to give exams for the remaining subjects."
        },
        {
            q: "Do I need to attend classes every day?",
            a: "No. NIOS is designed for flexible learning. You study from home without the burden of daily school attendance."
        },
        {
            q: "Where will my exam center be?",
            a: "Your exam center will typically be allotted at a Kendriya Vidyalaya or a government-recognized school close to your residential address."
        }
    ];

    // Render FAQs
    const accordionContainer = document.getElementById('faqAccordion');
    faqData.forEach((faq, index) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
            <button class="accordion-header" id="faq-${index}">
                ${faq.q} <i class="fa-solid fa-chevron-down accordion-icon"></i>
            </button>
            <div class="accordion-body"><p>${faq.a}</p></div>
        `;
        accordionContainer.appendChild(item);
    });

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const isActive = header.classList.contains('active');

            // Close all
            accordionHeaders.forEach(btn => {
                btn.classList.remove('active');
                btn.nextElementSibling.style.maxHeight = null;
            });

            // Open clicked
            if (!isActive) {
                header.classList.add('active');
                body.style.maxHeight = body.scrollHeight + "px";
            }
        });
    });

    // Open first FAQ by default for better UX
    if (accordionHeaders.length > 0) accordionHeaders[0].click();


    // 3. WHATSAPP LEAD FORM SUBMISSION
    const leadForm = document.getElementById('leadForm');
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('fullName').value;
        const mobile = document.getElementById('mobileNum').value;
        const className = document.getElementById('classSelect').value;

        let message = `*🔥 NEW LEAD FROM FUNNEL 🔥*\n\n`;
        message += `*Name:* ${name}\n*Mobile:* ${mobile}\n*Class:* ${className}\n`;
        message += `\nI am requesting a free consultation regarding NIOS admission.`;

        const encodedMessage = encodeURIComponent(message);
        const targetPhone = "919876543210"; // Replace with your actual number
        window.open(`https://wa.me/${targetPhone}?text=${encodedMessage}`, '_blank');

        leadForm.reset();
    });

    // 4. MINI EVERGREEN COUNTDOWN TIMER (In Form)
    // Always shows approx ~14 hours to create scarcity typical in funnels
    let countDownDate = new Date().getTime() + (14 * 60 * 60 * 1000) + (45 * 60 * 1000);

    setInterval(function () {
        let now = new Date().getTime();
        let distance = countDownDate - now;

        if (distance < 0) {
            // Reset if it hits zero
            countDownDate = new Date().getTime() + (14 * 60 * 60 * 1000);
            distance = countDownDate - now;
        }

        document.getElementById("hours").innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById("minutes").innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById("seconds").innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    }, 1000);
});